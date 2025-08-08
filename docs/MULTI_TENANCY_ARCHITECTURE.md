# Multi-site Architecture (1 CMS → many frontends)

**Goal:** One central Strapi managing multiple websites/domains with per-site content, per-site profile selection, and separate Vercel frontends.

## High-level
- **Strapi (single instance)** with a first-class **Site** model.
- All content types reference **Site** (single or many-to-many) to scope visibility.
- **Multiple Next.js frontends** (one per domain) or a single multi-tenant frontend with domain-based routing.
- **S3 folder strategy** per site for media, or media → Site relation.
- **RBAC** to restrict editors to specific sites.

## Data flow
1. Editor creates/edits content in Strapi and assigns it to one or more **Site** entries.
2. Frontends fetch content filtered by `site.domain` (server-side enforced).
3. ISR/Tag revalidation per site on publish/update via webhooks.
