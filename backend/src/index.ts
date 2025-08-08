// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: any) {
    try {
      const es = strapi.entityService;

      // Grant Public role read permissions for key APIs
      try {
        const up = strapi.plugin('users-permissions');
        if (up) {
          const roleService = up.service('role');
          const permissionService = up.service('permission');
          const publicRole = await roleService.findOne(2);
          if (publicRole) {
            const models = [
              'api::homepage.homepage',
              'api::profile.profile',
              'api::city.city',
              'api::service.service',
              'api::page.page',
              'api::faq.faq',
              'api::pricing.pricing',
              'api::contact.contact',
              'api::news.news',
              'api::location.location',
              'api::site.site',
            ];
            for (const uid of models) {
              await permissionService.updatePermissions(publicRole.id, [
                { action: 'plugin::users-permissions.controllers.content-types.find', subject: uid },
                { action: 'plugin::users-permissions.controllers.content-types.findOne', subject: uid },
              ]);
            }
          }
        }
      } catch {}

      // Import dataset for a production-like site if requested
      if (process.env.IMPORT_DESIRE === 'true') {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const dataPath = path.resolve(__dirname, '../data/desire-escorts.nl.json');
        const raw = await fs.readFile(dataPath, 'utf-8');
        const dataset = JSON.parse(raw);

        const ensureOne = async (uid: string, where: any, data: any) => {
          const found = await es.findMany(uid, { filters: where, limit: 1 });
          if (found && found.length) return found[0];
          return es.create(uid, { data });
        };
        const publishIfUnpublished = async (uid: string, entity: any) => {
          if (!entity) return entity;
          const id = entity.id || entity?.data?.id;
          if (!id) return entity;
          if (!entity.publishedAt) {
            await es.update(uid, id, { data: { publishedAt: new Date().toISOString() } });
            return await es.findOne(uid, id);
          }
          return entity;
        };

        // Site
        let site = await ensureOne('api::site.site', { domain: { $eq: dataset.site.domain } }, dataset.site);
        site = await publishIfUnpublished('api::site.site', site);

        // Languages
        const langIds: Record<string, number> = {};
        for (const langName of dataset.languages || []) {
          const slug = langName.toLowerCase();
          let lang = await ensureOne('api::language.language', { slug: { $eq: slug } }, { name: langName, slug });
          lang = await publishIfUnpublished('api::language.language', lang);
          langIds[langName] = lang.id;
        }

        // Cities
        const cityIds: Record<string, number> = {};
        for (const cityName of dataset.cities || []) {
          const slug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|--+/g, '').trim();
          let city = await ensureOne('api::city.city', { slug: { $eq: slug } }, { name: cityName, slug, sites: [site.id] });
          city = await publishIfUnpublished('api::city.city', city);
          cityIds[cityName] = city.id;
        }

        // Services
        const serviceIds: Record<string, number> = {};
        for (const svc of dataset.services || []) {
          let service = await ensureOne('api::service.service', { slug: { $eq: svc.slug } }, { name: svc.name, slug: svc.slug, sites: [site.id] });
          service = await publishIfUnpublished('api::service.service', service);
          serviceIds[svc.name] = service.id;
        }

        // Profiles
        const profileIds: Record<string, number> = {};
        for (const p of dataset.profiles || []) {
          const cityId = p.cities?.length ? cityIds[p.cities[0]] : undefined;
          const languageIds = (p.languages || []).map((ln: string) => langIds[ln]).filter(Boolean);
          const svcIds = (p.services || []).map((sn: string) => serviceIds[sn]).filter(Boolean);
          let profile = await ensureOne('api::profile.profile', { slug: { $eq: p.slug } }, {
            name: p.name,
            slug: p.slug,
            shortBio: p.shortBio,
            sites: [site.id],
            city: cityId,
            languages: languageIds,
            services: svcIds,
            rates: (p.rates || []).map((r: any) => ({ __component: 'rate-item.rate-item', label: r.label, price: r.price, currency: r.currency })),
          });
          profile = await publishIfUnpublished('api::profile.profile', profile);
          profileIds[p.slug] = profile.id;
        }

        // Pages
        for (const page of dataset.pages || []) {
          const slug = page.key;
          let pg = await ensureOne('api::page.page', { slug: { $eq: slug } }, {
            title: page.title || page.key,
            slug,
            body: page.content,
            site: site.id,
          });
          await publishIfUnpublished('api::page.page', pg);
        }

        // Homepage
        const featuredProfileIds = (dataset.homepage?.featuredProfiles || []).map((s: string) => profileIds[s]).filter(Boolean);
        const featuredCityIds = (dataset.homepage?.featuredCities || []).map((n: string) => cityIds[n]).filter(Boolean);
        const existingHomepage = await es.findMany('api::homepage.homepage', { limit: 1 });
        if (existingHomepage && existingHomepage.length) {
          await es.update('api::homepage.homepage', existingHomepage[0].id, {
            data: { hero: dataset.homepage?.hero || '<p>Welkom</p>', featuredProfiles: featuredProfileIds, featuredCities: featuredCityIds, publishedAt: new Date().toISOString() },
          });
        } else {
          await es.create('api::homepage.homepage', {
            data: { hero: dataset.homepage?.hero || '<p>Welkom</p>', featuredProfiles: featuredProfileIds, featuredCities: featuredCityIds, publishedAt: new Date().toISOString() },
          });
        }
        strapi.log.info('Desire import completed');
        return;
      }

      if (process.env.SEED_LOCAL !== 'true') return;

      const ensureOne = async (uid: string, where: any, data: any) => {
        const found = await es.findMany(uid, { filters: where, limit: 1 });
        if (found && found.length) return found[0];
        return es.create(uid, { data });
      };

      const publishIfUnpublished = async (uid: string, entity: any) => {
        if (!entity) return entity;
        const id = entity.id || entity?.data?.id;
        if (!id) return entity;
        if (!entity.publishedAt) {
          await es.update(uid, id, { data: { publishedAt: new Date().toISOString() } });
          return await es.findOne(uid, id);
        }
        return entity;
      };

      let site = await ensureOne('api::site.site', { domain: { $eq: 'localhost:3000' } }, {
        name: 'Local',
        domain: 'localhost:3000',
      });
      site = await publishIfUnpublished('api::site.site', site);

      let ams = await ensureOne('api::city.city', { slug: { $eq: 'amsterdam' } }, { name: 'Amsterdam', slug: 'amsterdam' });
      let rtd = await ensureOne('api::city.city', { slug: { $eq: 'rotterdam' } }, { name: 'Rotterdam', slug: 'rotterdam' });
      ams = await publishIfUnpublished('api::city.city', ams);
      rtd = await publishIfUnpublished('api::city.city', rtd);

      let massage = await ensureOne('api::service.service', { slug: { $eq: 'massage' } }, { name: 'Massage', slug: 'massage' });
      let companion = await ensureOne('api::service.service', { slug: { $eq: 'companionship' } }, { name: 'Companionship', slug: 'companionship' });
      massage = await publishIfUnpublished('api::service.service', massage);
      companion = await publishIfUnpublished('api::service.service', companion);

      let english = await ensureOne('api::language.language', { slug: { $eq: 'english' } }, { name: 'English', slug: 'english' });
      let dutch = await ensureOne('api::language.language', { slug: { $eq: 'dutch' } }, { name: 'Dutch', slug: 'dutch' });
      english = await publishIfUnpublished('api::language.language', english);
      dutch = await publishIfUnpublished('api::language.language', dutch);

      let anna = await ensureOne('api::profile.profile', { slug: { $eq: 'anna' } }, {
        name: 'Anna', slug: 'anna', shortBio: 'Sample profile', verified: true, featured: true,
        city: ams.id,
        services: [massage.id],
        languages: [english.id],
        sites: [site.id],
        rates: [{ __component: 'rate-item.rate-item', label: '1 hour', price: 200, currency: 'EUR', includes: 'Intro meeting' }],
        availability: [{ __component: 'availability.availability', dayOfWeek: 'Fri', startTime: '18:00', endTime: '23:00' }],
      });
      anna = await publishIfUnpublished('api::profile.profile', anna);

      let sofia = await ensureOne('api::profile.profile', { slug: { $eq: 'sofia' } }, {
        name: 'Sofia', slug: 'sofia', shortBio: 'Sample profile', verified: true, featured: true,
        city: rtd.id,
        services: [companion.id],
        languages: [dutch.id],
        sites: [site.id],
      });
      sofia = await publishIfUnpublished('api::profile.profile', sofia);

      const existingHomepage = await es.findMany('api::homepage.homepage', { limit: 1 });
      if (existingHomepage && existingHomepage.length) {
        await es.update('api::homepage.homepage', existingHomepage[0].id, {
          data: {
            hero: '<p>Welcome to Desire Escorts (local)</p>',
            featuredProfiles: [anna.id, sofia.id],
            featuredCities: [ams.id, rtd.id],
            publishedAt: new Date().toISOString(),
          },
        });
      } else {
        await es.create('api::homepage.homepage', {
          data: {
            hero: '<p>Welcome to Desire Escorts (local)</p>',
            featuredProfiles: [anna.id, sofia.id],
            featuredCities: [ams.id, rtd.id],
            publishedAt: new Date().toISOString(),
          },
        });
      }
      strapi.log.info('Local seed completed');
    } catch (err: any) {
      strapi.log.warn(`Local seed skipped/failed: ${err?.message || err}`);
    }
  },
};
