/* eslint-disable no-console */
const { createStrapi } = require('@strapi/strapi');

async function ensureOne(es, uid, where, data) {
  const found = await es.findMany(uid, { filters: where, limit: 1 });
  if (found && found.length) return found[0];
  return es.create(uid, { data });
}

(async () => {
  const app = await createStrapi();
  await app.load();
  const es = strapi.entityService;

  console.log('Seeding data...');

  // Site
  const site = await ensureOne(es, 'api::site.site', { domain: { $eq: 'localhost:3001' } }, {
    name: 'Local',
    domain: 'localhost:3001',
  });

  // Cities
  const cities = await Promise.all([
    ensureOne(es, 'api::city.city', { slug: { $eq: 'amsterdam' } }, { name: 'Amsterdam', slug: 'amsterdam' }),
    ensureOne(es, 'api::city.city', { slug: { $eq: 'rotterdam' } }, { name: 'Rotterdam', slug: 'rotterdam' }),
  ]);

  // Services
  const services = await Promise.all([
    ensureOne(es, 'api::service.service', { slug: { $eq: 'massage' } }, { name: 'Massage', slug: 'massage' }),
    ensureOne(es, 'api::service.service', { slug: { $eq: 'companionship' } }, { name: 'Companionship', slug: 'companionship' }),
  ]);

  // Languages
  const languages = await Promise.all([
    ensureOne(es, 'api::language.language', { slug: { $eq: 'english' } }, { name: 'English', slug: 'english' }),
    ensureOne(es, 'api::language.language', { slug: { $eq: 'dutch' } }, { name: 'Dutch', slug: 'dutch' }),
  ]);

  // Profiles
  const profiles = [];
  for (const p of [
    { name: 'Anna', slug: 'anna', city: cities[0], services: [services[0]], languages: [languages[0]], featured: true },
    { name: 'Sofia', slug: 'sofia', city: cities[1], services: [services[1]], languages: [languages[1]], featured: true },
  ]) {
    const created = await ensureOne(es, 'api::profile.profile', { slug: { $eq: p.slug } }, {
      name: p.name,
      slug: p.slug,
      shortBio: 'Sample profile for local development',
      verified: true,
      featured: !!p.featured,
      city: p.city?.id,
      services: p.services.map((s) => s.id),
      languages: p.languages.map((l) => l.id),
      sites: [site.id],
      rates: [
        { __component: 'rate-item.rate-item', label: '1 hour', price: 200, currency: 'EUR', includes: 'Intro meeting' },
      ],
      availability: [
        { __component: 'availability.availability', dayOfWeek: 'Fri', startTime: '18:00', endTime: '23:00' },
      ],
    });
    profiles.push(created);
  }

  // Homepage (single type)
  try {
    const existing = await es.findMany('api::homepage.homepage', { limit: 1 });
    if (existing && existing.length) {
      await es.update('api::homepage.homepage', existing[0].id, {
        data: {
          hero: '<p>Welcome to Desire Escorts (local)</p>',
          featuredProfiles: profiles.map((p) => p.id),
          featuredCities: cities.map((c) => c.id),
        },
      });
    } else {
      await es.create('api::homepage.homepage', {
        data: {
          hero: '<p>Welcome to Desire Escorts (local)</p>',
          featuredProfiles: profiles.map((p) => p.id),
          featuredCities: cities.map((c) => c.id),
        },
      });
    }
  } catch (e) {
    console.error('Failed to seed Homepage:', e?.message || e);
  }

  console.log('Seeding done.');
  process.exit(0);
})();


