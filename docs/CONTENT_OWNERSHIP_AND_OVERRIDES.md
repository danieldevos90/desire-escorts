# Content Ownership & Per-site Overrides

### Patterns
1. **Shared base + override**: Keep a global record (e.g., a Profile) with default fields and attach `siteOverrides[]` for per-site tweaks (slug/SEO/featured copy).
2. **Site-scoped duplication**: For content that diverges heavily (e.g., blog), keep it site-scoped (`site` relation) and duplicate when needed.

### Slug strategy
- Default: `profile.slug`
- Override: if `siteOverrides.customSlug` present for the active site, use that.

### Search
- Always filter indices by site. If using Meilisearch/Elastic, include `siteIds` in the document and index per site.
