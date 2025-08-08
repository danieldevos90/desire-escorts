# Implementation Snippets

### 1) Global policy (site scope)
```ts
// src/policies/site-scope.ts
export default (policyCtx, config, { strapi }) => {
  const host = policyCtx.request.header['x-forwarded-host'] || policyCtx.request.host;
  policyCtx.request.query = policyCtx.request.query || {};
  const q = policyCtx.request.query;
  // Force filter by site domain
  q.filters = {
    ...(q.filters || {}),
    sites: { domain: { $eq: host } },
  };
  return true;
};
```
Attach to read routes for Profile/Page/etc.

### 2) Lifecycle to auto-assign site on create (admin)
```ts
// src/api/profile/content-types/profile/lifecycles.ts
export default {
  async beforeCreate(event) {
    const { data, state } = event.params;
    if (!data.sites || data.sites.length === 0) {
      // Optionally infer a default site or block
      throw new Error('At least one Site must be selected.');
    }
  },
};
```

### 3) Next.js middleware (single app)
```ts
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
export function middleware(req) {
  const host = req.headers.get('host') || '';
  // make host available downstream
  const res = NextResponse.next();
  res.headers.set('x-site-host', host);
  return res;
}
```
Use this header in your fetch wrapper to add `filters[sites][domain][$eq]=host`.

### 4) Tag-based revalidation per site
```ts
// on publish webhook handler
await fetch(`${NEXT_URL}/api/revalidate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tag: `site:${siteDomain}`, secret: REVALIDATE_SECRET }),
});
```
