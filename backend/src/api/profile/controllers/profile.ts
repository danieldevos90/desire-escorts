import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
  async find(ctx) {
    // Return list in REST format: { data: [{ id, attributes }], meta }
    const q = (ctx.query || {}) as any;
    const page = Number(q?.pagination?.page ?? 1);
    const pageSize = Number(q?.pagination?.pageSize ?? 24);
    const start = (page - 1) * pageSize;
    const limit = pageSize;
    const [items, total] = await Promise.all([
      strapi.entityService.findMany('api::profile.profile', { ...q, start, limit }),
      strapi.entityService.count('api::profile.profile', q),
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
        $or: [
          { slug: { $eq: idOrSlug } },
          { siteOverrides: { customSlug: { $eq: idOrSlug }, site: { domain: { $eq: host } } } },
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
}));


