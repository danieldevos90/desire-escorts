# Strapi Data Model for Multi-site

### Site (collection type)
- `name` (string)
- `domain` (string, unique) e.g., `desire-escorts.nl`, `city-escorts.com`
- `brand` (component): logo, colors, fonts
- `seoDefaults` (component): metaTitle, metaDescription, ogImage
- `settings` (component): ageGateEnabled, contactChannels, legalPages

### Profile (Escort)
- add **many-to-many** relation: `sites` → Site[]
- optional: per-site overrides via component `siteOverrides[]` (repeatable) with fields:
  - `site` (relation → Site)
  - `customSlug` (uid)
  - `customSEO` (seo component)
  - `isFeatured` (boolean)

### Page
- relation: `site` (single) → Site (each page belongs to one site)
- optional overrides for shared pages using the same `siteOverrides` pattern.

### City, Service
- either global (shared across sites) **or** scoped per site:
  - Option A (shared): relation `sites` many-to-many, filter at query time.
  - Option B (per-site): single relation `site` → Site.

### Media
- Option A: S3 key prefix per site (e.g., `site/{domain}/...`).
- Option B: Add `site` relation on the **File** schema (requires extending upload plugin). Keep a lifecycle to set prefix.
