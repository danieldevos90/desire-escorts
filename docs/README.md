# Desire Escorts — Headless Migration (WordPress → Strapi + Next.js)

This repository contains the plan and guides to migrate the current WordPress site to a headless stack:

- **CMS**: Strapi v5 (PostgreSQL)
- **Frontend**: Next.js (App Router), SSG/ISR + SSR for search
- **Media**: S3-compatible storage (AWS S3, Cloudflare R2, or Wasabi) behind CDN
- **Hosting**: Strapi Cloud/Render/DO + Vercel/Netlify

## Quick Start

1. Read `ENVIRONMENT_SETUP.md` and provision Strapi + DB + S3 + Next.js.
2. Model content per `CONTENT_MODEL.md`.
3. Export WordPress data per `WORDPRESS_EXPORT_GUIDE.md`.
4. Map data with `DATA_MAPPING_TEMPLATE.md`.
5. Run migration steps in `MIGRATION_PLAYBOOK.md` & `STRAPI_IMPORT_GUIDE.md`.
6. Build the frontend using `NEXTJS_STARTER_GUIDE.md`.
7. Finalize SEO, redirects, and QA.

## Goals

- Preserve rankings via **1:1 redirects** and content parity.
- Improve performance (Core Web Vitals), security, and editorial UX.
- Enable scalable search, filtering, and media handling for profiles.
