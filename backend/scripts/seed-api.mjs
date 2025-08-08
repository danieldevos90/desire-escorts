/* eslint-disable no-console */
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : def;
};

const BASE = getArg('--base', process.env.BASE_URL || 'http://localhost:1337/api').replace(/\/$/, '');
const TOKEN = getArg('--token', process.env.STRAPI_API_TOKEN || '');

if (!TOKEN) {
  console.error('Missing token. Pass with --token or STRAPI_API_TOKEN');
  process.exit(1);
}

const commonHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  // propagate host for site-scope on GET if needed
  'x-forwarded-host': 'localhost:3001',
};

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: commonHeaders, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${path} -> ${res.status} ${res.statusText} ${text}`);
  }
  try { return JSON.parse(text); } catch { return {}; }
}

async function putJson(path, body) {
  const res = await fetch(`${BASE}${path}`, { method: 'PUT', headers: commonHeaders, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PUT ${path} -> ${res.status} ${res.statusText} ${text}`);
  }
  try { return JSON.parse(text); } catch { return {}; }
}

async function seed() {
  console.log('Seeding via Content API →', BASE);

  // Site
  let siteId = 0;
  try {
    const site = await postJson('/sites', { data: { name: 'Local', domain: 'localhost:3001' } });
    siteId = site?.data?.id || site?.id || 0;
  } catch (e) {
    console.warn('Site create warning:', e.message);
  }

  // Cities
  let cityA = 0, cityR = 0;
  try {
    const c1 = await postJson('/cities', { data: { name: 'Amsterdam', slug: 'amsterdam', sites: siteId ? [siteId] : [] } });
    cityA = c1?.data?.id || c1?.id || 0;
  } catch (e) { console.warn('City amsterdam warn:', e.message); }
  try {
    const c2 = await postJson('/cities', { data: { name: 'Rotterdam', slug: 'rotterdam', sites: siteId ? [siteId] : [] } });
    cityR = c2?.data?.id || c2?.id || 0;
  } catch (e) { console.warn('City rotterdam warn:', e.message); }

  // Services
  let svcM = 0, svcC = 0;
  try {
    const s1 = await postJson('/services', { data: { name: 'Massage', slug: 'massage', sites: siteId ? [siteId] : [] } });
    svcM = s1?.data?.id || s1?.id || 0;
  } catch (e) { console.warn('Service massage warn:', e.message); }
  try {
    const s2 = await postJson('/services', { data: { name: 'Companionship', slug: 'companionship', sites: siteId ? [siteId] : [] } });
    svcC = s2?.data?.id || s2?.id || 0;
  } catch (e) { console.warn('Service companionship warn:', e.message); }

  // Languages
  let langE = 0, langD = 0;
  try {
    const l1 = await postJson('/languages', { data: { name: 'English', slug: 'english' } });
    langE = l1?.data?.id || l1?.id || 0;
  } catch (e) { console.warn('Language english warn:', e.message); }
  try {
    const l2 = await postJson('/languages', { data: { name: 'Dutch', slug: 'dutch' } });
    langD = l2?.data?.id || l2?.id || 0;
  } catch (e) { console.warn('Language dutch warn:', e.message); }

  // Profiles
  let anna = 0, sofia = 0;
  try {
    const p1 = await postJson('/profiles', { data: {
      name: 'Anna', slug: 'anna', shortBio: 'Sample profile', verified: true, featured: true,
      city: cityA || undefined,
      services: [svcM].filter(Boolean),
      languages: [langE].filter(Boolean),
      sites: [siteId].filter(Boolean),
      rates: [{ label: '1 hour', price: 200, currency: 'EUR', includes: 'Intro meeting' }],
      availability: [{ dayOfWeek: 'Fri', startTime: '18:00', endTime: '23:00' }],
    } });
    anna = p1?.data?.id || p1?.id || 0;
  } catch (e) { console.warn('Profile anna warn:', e.message); }
  try {
    const p2 = await postJson('/profiles', { data: {
      name: 'Sofia', slug: 'sofia', shortBio: 'Sample profile', verified: true, featured: true,
      city: cityR || undefined,
      services: [svcC].filter(Boolean),
      languages: [langD].filter(Boolean),
      sites: [siteId].filter(Boolean),
    } });
    sofia = p2?.data?.id || p2?.id || 0;
  } catch (e) { console.warn('Profile sofia warn:', e.message); }

  // Homepage single type
  try {
    await postJson('/homepage', { data: {
      hero: '<p>Welcome to Desire Escorts (local)</p>',
      featuredProfiles: [anna, sofia].filter(Boolean),
      featuredCities: [cityA, cityR].filter(Boolean),
    } });
  } catch (e) {
    console.warn('Homepage POST warn (trying PUT):', e.message);
    await putJson('/homepage', { data: {
      hero: '<p>Welcome to Desire Escorts (local)</p>',
      featuredProfiles: [anna, sofia].filter(Boolean),
      featuredCities: [cityA, cityR].filter(Boolean),
    } });
  }

  console.log('Seed via Content API complete');
}

seed().catch((e) => {
  console.error('Seed failed:', e?.message || e);
  process.exit(1);
});


