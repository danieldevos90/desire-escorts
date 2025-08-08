# Deployment Guide

- **Strapi**: Deploy (Strapi Cloud/Render/DO). Configure env vars and provider for S3
- **DB**: Managed Postgres, daily backups, PITR if possible
- **Frontend**: Vercel with ISR; set `SITE_URL` for sitemap
- **CDN**: connect domain, enable HTTPS, caching rules

### Launch Steps
1. Deploy backend (prod)
2. Import content
3. Deploy frontend (point to prod API)
4. Enable redirects
5. Submit sitemaps to GSC/Bing
