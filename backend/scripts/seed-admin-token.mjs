/* eslint-disable no-console */
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : def;
};

const BASE = getArg('--base', process.env.ADMIN_BASE_URL || 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = getArg('--token', process.env.STRAPI_ADMIN_TOKEN || '');

if (!TOKEN) {
  console.error('Missing admin token. Pass with --token or STRAPI_ADMIN_TOKEN');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function json(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
  try { return JSON.parse(text); } catch { return {}; }
}

async function upsert(uid, field, value, data) {
  const q = new URL(`${BASE}/content-manager/collection-types/${uid}`);
  q.searchParams.set(`filters[${field}][$eq]`, value);
  const existing = await json(await fetch(q, { headers }));
  const id = existing?.results?.[0]?.id;
  if (id) {
    await json(await fetch(`${BASE}/content-manager/collection-types/${uid}/${id}`, { method: 'PUT', headers, body: JSON.stringify({ data }) }));
    return id;
  }
  const created = await json(await fetch(`${BASE}/content-manager/collection-types/${uid}`, { method: 'POST', headers, body: JSON.stringify({ data }) }));
  return created?.id || created?.data?.id;
}

async function setHomepage(payload) {
  const res = await fetch(`${BASE}/content-manager/single-types/api::homepage.homepage`, { headers });
  if (res.ok) {
    await json(await fetch(`${BASE}/content-manager/single-types/api::homepage.homepage`, { method: 'PUT', headers, body: JSON.stringify({ data: payload }) }));
  } else {
    await json(await fetch(`${BASE}/content-manager/single-types/api::homepage.homepage`, { method: 'POST', headers, body: JSON.stringify({ data: payload }) }));
  }
}

async function main() {
  console.log('Seeding via Admin API →', BASE);
  const siteId = await upsert('api::site.site', 'domain', 'localhost:3001', { name: 'Local', domain: 'localhost:3001' });

  const cityA = await upsert('api::city.city', 'slug', 'amsterdam', { name: 'Amsterdam', slug: 'amsterdam' });
  const cityR = await upsert('api::city.city', 'slug', 'rotterdam', { name: 'Rotterdam', slug: 'rotterdam' });

  const svcM = await upsert('api::service.service', 'slug', 'massage', { name: 'Massage', slug: 'massage' });
  const svcC = await upsert('api::service.service', 'slug', 'companionship', { name: 'Companionship', slug: 'companionship' });

  const langE = await upsert('api::language.language', 'slug', 'english', { name: 'English', slug: 'english' });
  const langD = await upsert('api::language.language', 'slug', 'dutch', { name: 'Dutch', slug: 'dutch' });

  const anna = await upsert('api::profile.profile', 'slug', 'anna', {
    name: 'Anna', slug: 'anna', shortBio: 'Sample profile', verified: true, featured: true,
    city: cityA, services: [svcM], languages: [langE], sites: [siteId],
  });
  const sofia = await upsert('api::profile.profile', 'slug', 'sofia', {
    name: 'Sofia', slug: 'sofia', shortBio: 'Sample profile', verified: true, featured: true,
    city: cityR, services: [svcC], languages: [langD], sites: [siteId],
  });

  await setHomepage({
    hero: '<p>Welcome to Desire Escorts (local)</p>',
    featuredProfiles: [anna, sofia],
    featuredCities: [cityA, cityR],
  });

  console.log('Seeding complete');
}

main().catch((e) => { console.error('Seed failed:', e?.message || e); process.exit(1); });


