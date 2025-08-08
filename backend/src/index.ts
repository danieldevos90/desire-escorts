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

      let ams = await ensureOne('api::city.city', { slug: { $eq: 'amsterdam' } }, { name: 'Amsterdam', slug: 'amsterdam', sites: [site.id] });
      let rtd = await ensureOne('api::city.city', { slug: { $eq: 'rotterdam' } }, { name: 'Rotterdam', slug: 'rotterdam', sites: [site.id] });
      ams = await publishIfUnpublished('api::city.city', ams);
      rtd = await publishIfUnpublished('api::city.city', rtd);

      let massage = await ensureOne('api::service.service', { slug: { $eq: 'massage' } }, { name: 'Massage', slug: 'massage' });
      let companion = await ensureOne('api::service.service', { slug: { $eq: 'companionship' } }, { name: 'Companionship', slug: 'companionship' });
      let dinner = await ensureOne('api::service.service', { slug: { $eq: 'dinner-date' } }, { name: 'Dinner Date', slug: 'dinner-date' });
      let gfe = await ensureOne('api::service.service', { slug: { $eq: 'girlfriend-experience' } }, { name: 'Girlfriend Experience', slug: 'girlfriend-experience' });
      massage = await publishIfUnpublished('api::service.service', massage);
      companion = await publishIfUnpublished('api::service.service', companion);
      dinner = await publishIfUnpublished('api::service.service', dinner);
      gfe = await publishIfUnpublished('api::service.service', gfe);

      let english = await ensureOne('api::language.language', { slug: { $eq: 'english' } }, { name: 'English', slug: 'english' });
      let dutch = await ensureOne('api::language.language', { slug: { $eq: 'dutch' } }, { name: 'Dutch', slug: 'dutch' });
      english = await publishIfUnpublished('api::language.language', english);
      dutch = await publishIfUnpublished('api::language.language', dutch);

      let anna = await ensureOne('api::profile.profile', { slug: { $eq: 'anna' } }, {
        name: 'Anna', slug: 'anna', shortBio: 'Sample profile', verified: true, featured: true,
        city: ams.id,
        services: [massage.id, gfe.id],
        languages: [english.id],
        sites: [site.id],
        rates: [{ __component: 'rate-item.rate-item', label: '1 hour', price: 200, currency: 'EUR', includes: 'Intro meeting' }],
        availability: [{ __component: 'availability.availability', dayOfWeek: 'Fri', startTime: '18:00', endTime: '23:00' }],
      });
      anna = await publishIfUnpublished('api::profile.profile', anna);

      let sofia = await ensureOne('api::profile.profile', { slug: { $eq: 'sofia' } }, {
        name: 'Sofia', slug: 'sofia', shortBio: 'Sample profile', verified: true, featured: true,
        city: rtd.id,
        services: [companion.id, dinner.id],
        languages: [dutch.id],
        sites: [site.id],
      });
      sofia = await publishIfUnpublished('api::profile.profile', sofia);

      // News
      const news1 = await ensureOne('api::news.news', { slug: { $eq: 'grand-opening' } }, { title: 'Grand opening', slug: 'grand-opening', excerpt: 'We are live with a curated selection of companions.', body: '<p>We are thrilled to launch our local site.</p>', site: site.id });
      const news2 = await ensureOne('api::news.news', { slug: { $eq: 'new-profiles-added' } }, { title: 'New profiles added', slug: 'new-profiles-added', excerpt: 'Fresh companions now available in Amsterdam and Rotterdam.', body: '<p>Discover newly verified profiles this week.</p>', site: site.id });
      await publishIfUnpublished('api::news.news', news1);
      await publishIfUnpublished('api::news.news', news2);
      sofia = await publishIfUnpublished('api::profile.profile', sofia);

      // Pages: contact, about, services-info
      const contactPage = await ensureOne('api::page.page', { slug: { $eq: 'contact' } }, {
        title: 'Contact', slug: 'contact', body: '<p>For enquiries, please email <a href="mailto:info@example.com">info@example.com</a> or call +31 20 123 4567.</p>' , site: site.id,
      });
      await publishIfUnpublished('api::page.page', contactPage);
      const aboutPage = await ensureOne('api::page.page', { slug: { $eq: 'about' } }, {
        title: 'About Us', slug: 'about', body: '<p>We are a curated escort directory focused on verified profiles and discretion.</p>', site: site.id,
      });
      await publishIfUnpublished('api::page.page', aboutPage);
      const servicesInfo = await ensureOne('api::page.page', { slug: { $eq: 'services-info' } }, {
        title: 'Services & Etiquette', slug: 'services-info', body: '<p>Learn about available services, etiquette, and booking process.</p>', site: site.id,
      });
      await publishIfUnpublished('api::page.page', servicesInfo);

      const existingHomepage = await es.findMany('api::homepage.homepage', { limit: 1 });
      if (existingHomepage && existingHomepage.length) {
        await es.update('api::homepage.homepage', existingHomepage[0].id, {
          data: {
            hero: '<p>Welcome to Desire Escorts (local)</p>',
            intro: '<p>Explore a curated selection of verified companions. Book with confidence and discretion.</p>',
            whyUs: '<ul><li>Verified profiles</li><li>Discreet communication</li><li>Transparent rates</li></ul>',
            benefits: [
              { __component: 'tag.tag', label: 'Verified Escorts' },
              { __component: 'tag.tag', label: 'Discreet Booking' },
              { __component: 'tag.tag', label: 'Fast Response' }
            ],
            cta: { __component: 'contact.contact', phone: '+31 20 123 4567', whatsapp: '+31 612345678', telegram: 'desire_support' },
            featuredProfiles: [anna.id, sofia.id],
            featuredCities: [ams.id, rtd.id],
            publishedAt: new Date().toISOString(),
          },
        });
      } else {
        await es.create('api::homepage.homepage', {
          data: {
            hero: '<p>Welcome to Desire Escorts (local)</p>',
            intro: '<p>Explore a curated selection of verified companions. Book with confidence and discretion.</p>',
            whyUs: '<ul><li>Verified profiles</li><li>Discreet communication</li><li>Transparent rates</li></ul>',
            benefits: [
              { __component: 'tag.tag', label: 'Verified Escorts' },
              { __component: 'tag.tag', label: 'Discreet Booking' },
              { __component: 'tag.tag', label: 'Fast Response' }
            ],
            cta: { __component: 'contact.contact', phone: '+31 20 123 4567', whatsapp: '+31 612345678', telegram: 'desire_support' },
            featuredProfiles: [anna.id, sofia.id],
            featuredCities: [ams.id, rtd.id],
            publishedAt: new Date().toISOString(),
          },
        });
      }
      // Footer links in brand
      try {
        const currentSite = await es.findOne('api::site.site', site.id, { populate: ['brand'] });
        const brand = currentSite?.brand || {};
        const footerLinks = [
          { __component: 'navigation.link', label: 'About', href: '/pages/about' },
          { __component: 'navigation.link', label: 'Contact', href: '/pages/contact' },
          { __component: 'navigation.link', label: 'Services Info', href: '/pages/services-info' },
        ];
        await es.update('api::site.site', site.id, { data: { brand: { ...(brand || {}), footerLinks } } as any });
      } catch {}

      strapi.log.info('Local seed completed');
    } catch (err: any) {
      strapi.log.warn(`Local seed skipped/failed: ${err?.message || err}`);
    }
  },
};
