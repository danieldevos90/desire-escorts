# Deployment for Multi-site

### Strapi
- Single prod instance (HA if needed). Add **CORS** for all site domains.
- Environment: Postgres + S3; CloudFront/Cloudflare CDN.

### Vercel
- If one app per site: one Vercel project per domain, own env vars.
- If single multi-tenant: one Vercel project + multiple domains mapped; middleware switches site.

### DNS & Domains
- Point each domain to the correct Vercel project.
- Maintain `SITE` entries in Strapi with canonical domain & alternates.

### Webhooks
- Strapi → Vercel build hooks per site, or **on-demand revalidation** endpoint with `site` param.
