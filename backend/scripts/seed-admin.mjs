/* eslint-disable no-console */
const BASE = process.env.BASE_URL || 'http://localhost:1337';
const EMAIL = process.env.ADMIN_EMAIL || 'dev@local.test';
const PASS = process.env.ADMIN_PASS || 'Passw0rd!';

async function json(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function tryRegister() {
  try {
    await fetch(`${BASE}/admin/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASS, firstname: 'Dev', lastname: 'Local' }),
    });
  } catch {}
}

async function login() {
  const res = await fetch(`${BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const data = await json(res);
  return data?.data?.token || data?.token;
}

async function upsert(token, uid, field, value, data) {
  const q = new URL(`${BASE}/admin/content-manager/collection-types/${uid}`);
  q.searchParams.set(`filters[${field}][$eq]`, value);
  const existing = await json(await fetch(q, { headers: { Authorization: `Bearer ${token}` } }));
  const id = existing?.results?.[0]?.id;
  if (id) {
    await fetch(`${BASE}/admin/content-manager/collection-types/${uid}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return id;
  }
  const created = await json(
    await fetch(`${BASE}/admin/content-manager/collection-types/${uid}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
  );
  return created?.id || created?.data?.id;
}

async function getId(token, uid, field, value) {
  const q = new URL(`${BASE}/admin/content-manager/collection-types/${uid}`);
  q.searchParams.set(`filters[${field}][$eq]`, value);
  const existing = await json(await fetch(q, { headers: { Authorization: `Bearer ${token}` } }));
  return existing?.results?.[0]?.id;
}

async function upsertHomepage(token, payload) {
  const res = await fetch(`${BASE}/admin/content-manager/single-types/api::homepage.homepage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    await fetch(`${BASE}/admin/content-manager/single-types/api::homepage.homepage`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload }),
    });
  } else {
    await fetch(`${BASE}/admin/content-manager/single-types/api::homepage.homepage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload }),
    });
  }
}

async function main() {
  console.log('Seeding (admin API) →', BASE);
  await tryRegister();
  const token = await login();
  if (!token) throw new Error('Admin login failed');

  const siteId = await upsert(token, 'api::site.site', 'domain', 'localhost:3001', {
    name: 'Local',
    domain: 'localhost:3001',
  });

  const cityA = await upsert(token, 'api::city.city', 'slug', 'amsterdam', { name: 'Amsterdam', slug: 'amsterdam' });
  const cityR = await upsert(token, 'api::city.city', 'slug', 'rotterdam', { name: 'Rotterdam', slug: 'rotterdam' });

  const svcM = await upsert(token, 'api::service.service', 'slug', 'massage', { name: 'Massage', slug: 'massage' });
  const svcC = await upsert(token, 'api::service.service', 'slug', 'companionship', { name: 'Companionship', slug: 'companionship' });

  const langE = await upsert(token, 'api::language.language', 'slug', 'english', { name: 'English', slug: 'english' });
  const langD = await upsert(token, 'api::language.language', 'slug', 'dutch', { name: 'Dutch', slug: 'dutch' });

  const anna = await upsert(token, 'api::profile.profile', 'slug', 'anna', {
    name: 'Anna',
    slug: 'anna',
    shortBio: 'Sample profile for local development',
    verified: true,
    featured: true,
    city: cityA,
    services: [svcM],
    languages: [langE],
    sites: [siteId],
    rates: [{ __component: 'rate-item.rate-item', label: '1 hour', price: 200, currency: 'EUR', includes: 'Intro meeting' }],
    availability: [{ __component: 'availability.availability', dayOfWeek: 'Fri', startTime: '18:00', endTime: '23:00' }],
  });
  const sofia = await upsert(token, 'api::profile.profile', 'slug', 'sofia', {
    name: 'Sofia',
    slug: 'sofia',
    shortBio: 'Sample profile for local development',
    verified: true,
    featured: true,
    city: cityR,
    services: [svcC],
    languages: [langD],
    sites: [siteId],
  });

  await upsertHomepage(token, {
    hero: '<p>Welcome to Desire Escorts (local)</p>',
    featuredProfiles: [anna, sofia],
    featuredCities: [cityA, cityR],
  });

  console.log('Seeding complete');
}

main().catch((e) => {
  console.error('Seed failed:', e?.message || e);
  process.exit(1);
});


