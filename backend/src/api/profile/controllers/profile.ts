import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
  async find(ctx) {
    // Return list in REST format: { data: [{ id, attributes }], meta }
    const q = (ctx.query || {}) as any;

    // Friendly aliases to simplify frontend query building
    // location -> city.slug
    if (q.location && typeof q.location === 'string') {
      q.filters = q.filters || {};
      q.filters.city = q.filters.city || {};
      q.filters.city.slug = { $eq: q.location };
      delete q.location;
    }
    // city -> city.slug (when provided as a top-level alias)
    if (q.city && typeof q.city === 'string') {
      q.filters = q.filters || {};
      q.filters.city = q.filters.city || {};
      q.filters.city.slug = { $eq: q.city };
      delete q.city;
    }
    // service -> services.slug
    if (q.service && typeof q.service === 'string') {
      q.filters = q.filters || {};
      q.filters.services = { slug: { $eq: q.service } };
      delete q.service;
    }
    // tag(s) -> OR over tags.slug
    const tagCsv = q.tag || q.tags;
    if (tagCsv) {
      const tags = String(tagCsv)
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
      if (tags.length) {
        q.filters = q.filters || {};
        const orArr = (q.filters.$or = Array.isArray(q.filters.$or) ? q.filters.$or : []);
        for (const slug of tags) {
          orArr.push({ tags: { slug: { $eq: slug } } });
        }
      }
      delete q.tag;
      delete q.tags;
    }
    // attributes alias: attr[Key]=csv -> OR for each Key=Value pair
    if (q.attr && typeof q.attr === 'object') {
      q.filters = q.filters || {};
      const orArr = (q.filters.$or = Array.isArray(q.filters.$or) ? q.filters.$or : []);
      for (const [key, raw] of Object.entries(q.attr as Record<string, unknown>)) {
        const values = String(raw ?? '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        for (const v of values) {
          orArr.push({ attributesList: { key: { $eq: key }, value: { $eq: v } } } as any);
        }
      }
      delete q.attr;
    }
    const page = Number(q?.pagination?.page ?? 1);
    const pageSize = Number(q?.pagination?.pageSize ?? 24);
    const start = (page - 1) * pageSize;
    const limit = pageSize;
    const [items, total] = await Promise.all([
      strapi.entityService.findMany('api::profile.profile', { ...q, start, limit } as any),
      strapi.entityService.count('api::profile.profile', q as any),
    ]);
    const wrapped = (items as any[]).map((item) => {
      const { id, ...attrs } = item;
      return { id, attributes: attrs };
    });
    const pageCount = Math.max(1, Math.ceil((Number(total) || wrapped.length) / pageSize));
    return { data: wrapped, meta: { pagination: { page, pageSize, pageCount, total: Number(total) || wrapped.length } } } as any;
  },
  async findOne(ctx) {
    // Support lookup by slug, including site-specific overrides
    const idOrSlug = ctx.params.id;
    const rawHost = ctx.request?.header['x-forwarded-host'] || ctx.request?.host || '';
    const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;

    // Try direct id first
    if (/^\d+$/.test(idOrSlug)) {
      return await super.findOne(ctx);
    }

    // Resolve by slug or siteOverrides.customSlug for this site
    const entity = await strapi.entityService.findMany('api::profile.profile', {
      filters: {
        $and: [
          {
            $or: [
              { slug: { $eq: idOrSlug } },
              { siteOverrides: { customSlug: { $eq: idOrSlug }, site: { domain: { $eq: host } } } },
            ],
          },
          { sites: { domain: { $eq: host } } },
        ],
      },
      populate: ['photos', 'rates', 'availability', 'contact', 'seo', 'sites', 'city', 'services', 'siteOverrides.site'],
      limit: 1,
    });

    if (!entity || entity.length === 0) {
      ctx.notFound('Profile not found');
      return;
    }

    const data = entity[0];
    return { data };
  },
  async filters(ctx) {
    // Aggregate available filter options (site-scoped)
    const rawHost = ctx.request?.header['x-forwarded-host'] || ctx.request?.host || '';
    const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;

    // Resolve site id if possible
    let siteId: number | undefined;
    try {
      const site = await strapi.entityService.findMany('api::site.site', {
        filters: { domain: { $eq: host } },
        fields: ['id'],
        limit: 1,
      } as any);
      const found = Array.isArray(site) ? site[0] : (site as any);
      siteId = (found as any)?.id as number | undefined;
    } catch {}

    const profileFilters: any = {};
    if (siteId) {
      profileFilters.sites = { id: { $in: [siteId] } };
    }

    const profiles = await strapi.entityService.findMany('api::profile.profile', {
      filters: profileFilters,
      fields: ['age', 'height', 'nationality', 'verified', 'featured'],
      populate: {
        city: { fields: ['name', 'slug'] },
        services: { fields: ['name', 'slug'] },
        languages: { fields: ['name', 'slug'] },
        tags: { fields: ['label', 'slug'] },
        attributesList: { fields: ['key', 'value'] },
        rates: { fields: ['price'] },
      },
      limit: 1000,
    } as any);

    const citiesMap = new Map<string, { name: string; slug: string }>();
    const servicesMap = new Map<string, { name: string; slug: string }>();
    const languagesMap = new Map<string, { name: string; slug: string }>();
    const tagsMap = new Map<string, { label: string; slug: string }>();
    const attributesMap = new Map<string, Set<string>>();

    let ageMin = Number.POSITIVE_INFINITY;
    let ageMax = 0;
    let heightMin = Number.POSITIVE_INFINITY;
    let heightMax = 0;
    let priceMin = Number.POSITIVE_INFINITY;
    let priceMax = 0;

    for (const p of profiles as any[]) {
      const age = p.age as number | undefined;
      if (typeof age === 'number') {
        ageMin = Math.min(ageMin, age);
        ageMax = Math.max(ageMax, age);
      }
      const height = p.height as number | undefined;
      if (typeof height === 'number') {
        heightMin = Math.min(heightMin, height);
        heightMax = Math.max(heightMax, height);
      }
      const rates = (p.rates || []) as Array<{ price?: number }>;
      for (const r of rates) {
        if (typeof r.price === 'number') {
          priceMin = Math.min(priceMin, r.price);
          priceMax = Math.max(priceMax, r.price);
        }
      }

      const city = p.city;
      if (city && city.slug) {
        citiesMap.set(city.slug, { name: city.name, slug: city.slug });
      } else if (city?.data?.attributes?.slug) {
        const c = city.data.attributes;
        citiesMap.set(c.slug, { name: c.name, slug: c.slug });
      }

      for (const s of (p.services || [])) {
        if (s?.slug) servicesMap.set(s.slug, { name: s.name, slug: s.slug });
        else if (s?.data?.attributes?.slug) {
          const sv = s.data.attributes;
          servicesMap.set(sv.slug, { name: sv.name, slug: sv.slug });
        }
      }
      for (const l of (p.languages || [])) {
        if (l?.slug) languagesMap.set(l.slug, { name: l.name, slug: l.slug });
        else if (l?.data?.attributes?.slug) {
          const ln = l.data.attributes;
          languagesMap.set(ln.slug, { name: ln.name, slug: ln.slug });
        }
      }
      for (const t of (p.tags || [])) {
        if (!t) continue;
        const slug = t.slug || t.label?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|--+/g, '').trim();
        if (!slug) continue;
        tagsMap.set(slug, { label: t.label || slug, slug });
      }
      for (const a of (p.attributesList || [])) {
        if (!a?.key || a.value == null) continue;
        const key = String(a.key);
        const value = String(a.value);
        if (!attributesMap.has(key)) attributesMap.set(key, new Set());
        attributesMap.get(key)!.add(value);
      }
    }

    const attributes: Record<string, string[]> = {};
    for (const [k, set] of attributesMap) {
      attributes[k] = Array.from(set).sort((a, b) => a.localeCompare(b));
    }

    const body = {
      cities: Array.from(citiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      services: Array.from(servicesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      languages: Array.from(languagesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      tags: Array.from(tagsMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
      attributes,
      ranges: {
        age: { min: isFinite(ageMin) ? ageMin : 18, max: ageMax || 80 },
        height: { min: isFinite(heightMin) ? heightMin : 140, max: heightMax || 210 },
        price: { min: isFinite(priceMin) ? priceMin : 0, max: priceMax || 1000 },
      },
    };

    ctx.body = body;
  },
}));


