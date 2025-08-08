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
      let dhg = await ensureOne('api::city.city', { slug: { $eq: 'the-hague' } }, { name: 'The Hague', slug: 'the-hague', sites: [site.id] });
      let utr = await ensureOne('api::city.city', { slug: { $eq: 'utrecht' } }, { name: 'Utrecht', slug: 'utrecht', sites: [site.id] });
      let ehd = await ensureOne('api::city.city', { slug: { $eq: 'eindhoven' } }, { name: 'Eindhoven', slug: 'eindhoven', sites: [site.id] });
      let grn = await ensureOne('api::city.city', { slug: { $eq: 'groningen' } }, { name: 'Groningen', slug: 'groningen', sites: [site.id] });
      let hrl = await ensureOne('api::city.city', { slug: { $eq: 'haarlem' } }, { name: 'Haarlem', slug: 'haarlem', sites: [site.id] });
      ams = await publishIfUnpublished('api::city.city', ams);
      rtd = await publishIfUnpublished('api::city.city', rtd);
      dhg = await publishIfUnpublished('api::city.city', dhg);
      utr = await publishIfUnpublished('api::city.city', utr);
      ehd = await publishIfUnpublished('api::city.city', ehd);
      grn = await publishIfUnpublished('api::city.city', grn);
      hrl = await publishIfUnpublished('api::city.city', hrl);

      let massage = await ensureOne('api::service.service', { slug: { $eq: 'massage' } }, { name: 'Massage', slug: 'massage' });
      let companion = await ensureOne('api::service.service', { slug: { $eq: 'companionship' } }, { name: 'Companionship', slug: 'companionship' });
      let dinner = await ensureOne('api::service.service', { slug: { $eq: 'dinner-date' } }, { name: 'Dinner Date', slug: 'dinner-date' });
      let gfe = await ensureOne('api::service.service', { slug: { $eq: 'girlfriend-experience' } }, { name: 'Girlfriend Experience', slug: 'girlfriend-experience' });
      let nuru = await ensureOne('api::service.service', { slug: { $eq: 'nuru-massage' } }, { name: 'Nuru Massage', slug: 'nuru-massage' });
      let roleplay = await ensureOne('api::service.service', { slug: { $eq: 'roleplay' } }, { name: 'Roleplay', slug: 'roleplay' });
      let bdsm = await ensureOne('api::service.service', { slug: { $eq: 'bdsm' } }, { name: 'BDSM', slug: 'bdsm' });
      let duo = await ensureOne('api::service.service', { slug: { $eq: 'duo' } }, { name: 'Duo', slug: 'duo' });
      massage = await publishIfUnpublished('api::service.service', massage);
      companion = await publishIfUnpublished('api::service.service', companion);
      dinner = await publishIfUnpublished('api::service.service', dinner);
      gfe = await publishIfUnpublished('api::service.service', gfe);
      nuru = await publishIfUnpublished('api::service.service', nuru);
      roleplay = await publishIfUnpublished('api::service.service', roleplay);
      bdsm = await publishIfUnpublished('api::service.service', bdsm);
      duo = await publishIfUnpublished('api::service.service', duo);

      let english = await ensureOne('api::language.language', { slug: { $eq: 'english' } }, { name: 'English', slug: 'english' });
      let dutch = await ensureOne('api::language.language', { slug: { $eq: 'dutch' } }, { name: 'Dutch', slug: 'dutch' });
      let german = await ensureOne('api::language.language', { slug: { $eq: 'german' } }, { name: 'German', slug: 'german' });
      let french = await ensureOne('api::language.language', { slug: { $eq: 'french' } }, { name: 'French', slug: 'french' });
      let spanish = await ensureOne('api::language.language', { slug: { $eq: 'spanish' } }, { name: 'Spanish', slug: 'spanish' });
      english = await publishIfUnpublished('api::language.language', english);
      dutch = await publishIfUnpublished('api::language.language', dutch);
      german = await publishIfUnpublished('api::language.language', german);
      french = await publishIfUnpublished('api::language.language', french);
      spanish = await publishIfUnpublished('api::language.language', spanish);

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

      // Additional sample profiles
      const sampleProfiles = [
        { name: 'Luna', slug: 'luna', city: 'amsterdam', age: 24, height: 168, services: [gfe.id, nuru.id], languages: [english.id, dutch.id], price: 250, tags: ['brunette', 'petite', 'gfe'], attrs: { Hair: 'Brown', Eyes: 'Green', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: false },
        { name: 'Mila', slug: 'mila', city: 'amsterdam', age: 28, height: 170, services: [massage.id, roleplay.id], languages: [english.id, german.id], price: 220, tags: ['blonde', 'natural'], attrs: { Hair: 'Blonde', Eyes: 'Blue', Tattoos: 'Yes', Smoker: 'No' }, verified: false, featured: true },
        { name: 'Zara', slug: 'zara', city: 'rotterdam', age: 26, height: 172, services: [bdsm.id, duo.id], languages: [english.id, french.id], price: 300, tags: ['curvy', 'pse'], attrs: { Hair: 'Black', Eyes: 'Brown', Tattoos: 'No', Smoker: 'Occasional' }, verified: true, featured: false },
        { name: 'Eva', slug: 'eva', city: 'the-hague', age: 22, height: 165, services: [gfe.id, dinner.id], languages: [english.id, dutch.id], price: 210, tags: ['petite', 'gfe'], attrs: { Hair: 'Brown', Eyes: 'Hazel', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: false },
        { name: 'Noor', slug: 'noor', city: 'utrecht', age: 30, height: 175, services: [companion.id, roleplay.id], languages: [english.id, dutch.id], price: 260, tags: ['brunette', 'natural'], attrs: { Hair: 'Brown', Eyes: 'Brown', Tattoos: 'Yes', Smoker: 'No' }, verified: false, featured: false },
        { name: 'Sasha', slug: 'sasha', city: 'eindhoven', age: 27, height: 169, services: [massage.id, nuru.id], languages: [english.id, russianId()], price: 230, tags: ['blonde', 'busty'], attrs: { Hair: 'Blonde', Eyes: 'Green', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: true },
        { name: 'Lara', slug: 'lara', city: 'groningen', age: 25, height: 167, services: [gfe.id, companion.id], languages: [english.id, german.id], price: 240, tags: ['brunette', 'gfe'], attrs: { Hair: 'Brown', Eyes: 'Blue', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: false },
        { name: 'Chloe', slug: 'chloe', city: 'haarlem', age: 29, height: 173, services: [dinner.id, roleplay.id], languages: [english.id, french.id], price: 280, tags: ['curvy', 'natural'], attrs: { Hair: 'Auburn', Eyes: 'Hazel', Tattoos: 'Yes', Smoker: 'No' }, verified: false, featured: false },
        { name: 'Maya', slug: 'maya', city: 'amsterdam', age: 23, height: 166, services: [nuru.id, gfe.id], languages: [english.id, spanish.id], price: 225, tags: ['petite', 'natural'], attrs: { Hair: 'Black', Eyes: 'Brown', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: false },
        { name: 'Isla', slug: 'isla', city: 'rotterdam', age: 31, height: 176, services: [bdsm.id, roleplay.id], languages: [english.id], price: 320, tags: ['pse', 'tattoos'], attrs: { Hair: 'Red', Eyes: 'Green', Tattoos: 'Yes', Smoker: 'No' }, verified: true, featured: true },
        { name: 'Nina', slug: 'nina', city: 'utrecht', age: 24, height: 168, services: [companion.id, dinner.id], languages: [english.id, dutch.id], price: 210, tags: ['brunette'], attrs: { Hair: 'Brown', Eyes: 'Blue', Tattoos: 'No', Smoker: 'No' }, verified: false, featured: false },
        { name: 'Elena', slug: 'elena', city: 'the-hague', age: 27, height: 171, services: [massage.id, duo.id], languages: [english.id, spanish.id], price: 250, tags: ['blonde', 'busty'], attrs: { Hair: 'Blonde', Eyes: 'Brown', Tattoos: 'No', Smoker: 'No' }, verified: true, featured: false },
      ];

      // Ensure a Russian language id if not existing helper
      function russianId(): number {
        return (global as any).__ru_id || 0;
      }
      try {
        const ru = await ensureOne('api::language.language', { slug: { $eq: 'russian' } }, { name: 'Russian', slug: 'russian' });
        const ruPub = await publishIfUnpublished('api::language.language', ru);
        (global as any).__ru_id = ruPub.id;
      } catch {}

      const cityBySlug: Record<string, number> = {
        'amsterdam': ams.id,
        'rotterdam': rtd.id,
        'the-hague': dhg.id,
        'utrecht': utr.id,
        'eindhoven': ehd.id,
        'groningen': grn.id,
        'haarlem': hrl.id,
      };

      for (const p of sampleProfiles) {
        let existing = await es.findMany('api::profile.profile', { filters: { slug: { $eq: p.slug } }, limit: 1 });
        const data = {
          name: p.name,
          slug: p.slug,
          shortBio: 'Discreet and friendly',
          age: p.age,
          height: p.height,
          verified: p.verified,
          featured: p.featured,
          city: cityBySlug[p.city],
          languages: p.languages,
          services: p.services,
          sites: [site.id],
          tags: (p.tags || []).map((t: string) => ({ __component: 'tag.tag', label: t, slug: t })),
          attributesList: Object.entries(p.attrs || {}).map(([key, value]) => ({ __component: 'attribute.attribute', key, value })),
          rates: [{ __component: 'rate-item.rate-item', label: '1 hour', price: p.price, currency: 'EUR' }],
        } as any;
        if (existing && Array.isArray(existing) && existing.length) {
          existing = existing[0];
          await es.update('api::profile.profile', (existing as any).id, { data });
        } else {
          await es.create('api::profile.profile', { data });
        }
      }

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

      const homepageData = {
        hero: '<p>Welcome to Desire Escorts (local)</p>',
        intro: '<p>Explore a curated selection of verified companions. Book with confidence and discretion.</p>',
        whyUs: '<ul><li>Verified profiles</li><li>Discreet communication</li><li>Transparent rates</li></ul>',
        benefits: [
          { __component: 'tag.tag', label: 'Verified Escorts' },
          { __component: 'tag.tag', label: 'Discreet Booking' },
          { __component: 'tag.tag', label: 'Fast Response' },
        ],
        cta: { phone: '+31 20 123 4567', whatsapp: '+31 612345678', telegram: 'desire_support' },
        featuredProfiles: [anna.id, sofia.id],
        featuredCities: [ams.id, rtd.id],
        site: site.id,
        publishedAt: new Date().toISOString(),
      } as any;

      try {
        const docSvc = (strapi as any).documents?.bind(strapi);
        if (docSvc) {
          const api = docSvc('api::homepage.homepage');
          const current = await api.findFirst();
          if (current?.documentId) {
            await api.update({ documentId: current.documentId, data: homepageData });
          } else {
            await api.create({ data: homepageData });
          }
        } else {
          const existingHomepage = await es.findMany('api::homepage.homepage', { limit: 1 });
          if (existingHomepage && existingHomepage.length) {
            await es.update('api::homepage.homepage', existingHomepage[0].id, { data: homepageData });
          } else {
            await es.create('api::homepage.homepage', { data: homepageData });
          }
        }
      } catch (e) {
        strapi.log.warn(`Homepage seed update failed: ${(e as any)?.message || e}`);
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
