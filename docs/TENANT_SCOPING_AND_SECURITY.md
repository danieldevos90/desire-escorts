# Tenant Scoping & Security

### API policy (server-side enforcement)
- Require a **Site key** per request (derived from domain header) and auto-inject a filter:
  - `?filters[sites][domain][$eq]=<host>` or `filters[site][id]=...`
- Implement a **global policy** in `src/policies/site-scope.ts` and attach to collection routes.
- Block access if no matching site is found.

### Admin UX
- Create **saved views** filtered by Site
- Add a custom **admin extension**: a site switcher that sets default filters
- RBAC roles per site: Editors only see content where `sites` contains their site (enforced with admin query hooks)

### Webhooks
- Webhook per site on publish/update to trigger frontend revalidation for that domain only.
