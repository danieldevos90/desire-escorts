## Scalable, multi-frontend architecture – compact overview

### What we built

This project is a multi‑tenant Strapi + Next.js system where one Strapi instance powers multiple frontends/sites. Content is automatically scoped per domain, so each site sees only its own escorts, services, pages, and homepage content.

### Core ideas

- **Site entity (tenant)**: Content is partitioned by `api::site.site` with a unique `domain` (e.g., `localhost:3000`, `brand-a.com`).
- **Automatic scoping**: A global Strapi policy (`global::site-scope`) adds a site filter to every read request based on the `x-forwarded-host` header.
- **Ownership model**:
  - **Many-to-many to sites**: `profiles` (escorts) and `services` relate via `sites: manyToMany`. One escort can appear on multiple sites.
  - **Single site**: `pages`, `homepage`, `site-settings` relate via `site: manyToOne`.
  - **Per-site overrides**: `site-overrides` component on `profile` allows custom slug/SEO/featured per site.
- **Simple, cached reads**: The frontend does SSR requests through a small API helper and relies on Next’s caching/revalidate.

### How scoping works (request flow)

1. Frontend fetches data with `fetchFromStrapi` and sets `x-forwarded-host` from the incoming request:
   - Strapi middleware/policy resolves the current `site` by `domain`.
   - The `global::site-scope` policy injects `filters[sites]` or `filters[site]` automatically.
2. Controllers return REST‑shaped responses (`{ data: [{ id, attributes }], meta }`) for consistency across content types.

### Frontend structure (Next.js App Router)

- **Shared helper**: `frontend/src/lib/api.ts` builds absolute URLs, propagates `x-forwarded-host`, and applies a Bearer token if set.
- **Homepage**: Always loads “featured” escorts for the current site (ignores stored featured lists) and renders sections from `homepage` if present.
- **Escorts (/escorts)**:
  - Server component fetches escorts with site scope and supports deep filtering via query params.
  - Client filter UI (`EscortFilters`) provides sliders (price/age/height), dropdowns (city/service/language), and checkboxes (tags/attributes).
  - A Strapi endpoint (`GET /profiles/filters`) aggregates available filter options per site.
- **Services (/services)** and other lists are site-scoped; only entities linked to the current site appear.

### Multi‑frontend options

- **Single Next.js app, many domains**: Point multiple domains to the same app. The domain drives scoping; branding comes from the `site.brand` component.
- **Multiple Next.js apps**: Each app can target the same Strapi, with its own theming/behavior. Scoping still prevents data leakage.

### Adding a new site/front‑end quickly

1. Create a `Site` in Strapi with `domain` set to the frontend’s host.
2. Link content to the site:
   - Escorts/services: add the site in their `sites` relation.
   - Pages/homepage/site‑settings: set the `site` relation.
3. Configure branding/SEO in `site.brand` and `site.seoDefaults`.
4. Deploy the frontend and set environment:
   - `NEXT_PUBLIC_API_URL` (absolute API path, e.g. `https://api.example.com/api`)
   - Optional `NEXT_PUBLIC_STRAPI_URL` (host root for media)
   - Optional `STRAPI_API_TOKEN` (if private content is needed)

### Seeding and local testing

- Set `SEED_LOCAL=true` for the backend. On startup, it creates a `localhost:3000` site, several cities/services/languages, and ~12 sample escorts linked to the site. Some are `featured` for the homepage.

### Security model

- **Public reads**: Key GET endpoints are `auth: false` but site‑scoped by policy, so visitors only see content tied to their domain.
- **Writes**: Restricted to authenticated roles. Adjust roles/permissions as needed.
- **CORS**: Currently permissive for dev; tighten in `backend/config/middlewares.ts` for production.

### Extending the system

- **New content types**: Decide if it’s site‑owned (single `site`) or shared (many `sites`). Add to routes with `global::site-scope`.
- **More filters**: Expand `profiles/filters` aggregation or add new endpoints. Frontend filter UI reads from that endpoint.
- **Overrides per site**: Add fields to `site-overrides` and read them in controllers/frontend as needed.

### Common pitfalls

- **Empty lists**: Usually means content isn’t linked to the current site or the site `domain` doesn’t match the frontend host.
- **403s**: Endpoint missing `auth: false` for public content or token misconfig; update the route config.
- **Media URLs**: Ensure `NEXT_PUBLIC_STRAPI_URL` is set so relative media paths resolve correctly on the frontend.

### Pointers to deeper docs

- `docs/MULTI_TENANCY_ARCHITECTURE.md` – deeper multi‑tenant concepts
- `docs/FRONTEND_MULTI_SITE_GUIDE.md` – frontend details per site
- `docs/CONTENT_OWNERSHIP_AND_OVERRIDES.md` – ownership and overrides

This design keeps Strapi single‑sourced, adds strict per‑site visibility, and lets you run one or many frontends with minimal configuration.


