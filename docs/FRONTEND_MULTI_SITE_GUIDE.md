# Frontend Strategy (Vercel)

### Option 1 — One Next.js per site (simple)
- Separate apps: `frontend-desire/`, `frontend-cityX/` …
- Each app uses `SITE_DOMAIN` env and queries Strapi with that filter.
- Pros: full design freedom per site. Cons: code duplication (mitigate with a shared UI package).

### Option 2 — Single multi-tenant Next.js (advanced)
- One app, **middleware** reads `hostname` and resolves `site`. Theme via brand tokens.
- Dynamic routes include `site` context; cache/ISR **tagged by site**.
- Pros: shared code & infra; Cons: more routing/theming complexity.

### Revalidation
- Use **Next 14/15 cache tags**: `revalidateTag('site:${siteDomain}')` on publish.
- Each site’s pages subscribe to their tag.

### Theming
- Provide a **Design Token** object from `Site.brand` to Tailwind via CSS variables.
- Per-site components/slots for hero, nav, footer.
