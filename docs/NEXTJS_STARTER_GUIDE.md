# Next.js Starter Guide (App Router)

## Routing
- `/profiles/[slug]` → Profile detail
- `/city/[slug]` → City listing
- `/services/[slug]` → Service listing
- `/search` → Faceted search (SSR)

## Data Fetching
- Use `fetch(${API}/profiles?populate=*`, { next: { revalidate: 60 } }) for ISR
- Server actions for forms (contact)

## SEO
- `next-seo` per route; `generateSitemap` via `next-sitemap`
- Structured data: `Person` or `LocalBusiness` (where appropriate)
