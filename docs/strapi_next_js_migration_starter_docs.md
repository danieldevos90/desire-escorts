# Project: Desire Escorts — Headless Migration Starter Docs

> Everything below is intended as ready‑to‑drop **English .md** files for your repo. Copy the sections into separate files with the indicated filenames.

---

## Folder Tree (suggested)

```
.
├─ README.md
├─ PROJECT_STRUCTURE.md
├─ ENVIRONMENT_SETUP.md
├─ CONTENT_MODEL.md
├─ DATA_MAPPING_TEMPLATE.md
├─ WORDPRESS_EXPORT_GUIDE.md
├─ MIGRATION_PLAYBOOK.md
├─ STRAPI_IMPORT_GUIDE.md
├─ NEXTJS_STARTER_GUIDE.md
├─ SEO_CHECKLIST.md
├─ REDIRECTS_AND_SITEMAP.md
├─ AGE_GATE_AND_COMPLIANCE.md
├─ SEARCH_AND_FILTERS.md
├─ MEDIA_HANDLING.md
├─ DEPLOYMENT_GUIDE.md
└─ QA_CHECKLIST.md
```

---

## `README.md`

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

---

## `PROJECT_STRUCTURE.md`

# Project Structure

Recommended monorepo or two-repo layout. Example two-repo layout:

```
backend/      # Strapi project
  .env
  src/
  config/
  database/
  public/
frontend/     # Next.js project
  .env.local
  app/
  lib/
  components/
  public/
```

Keep CI/CD separate for backend and frontend. Use shared `.editorconfig` and Prettier configs.

---

## `ENVIRONMENT_SETUP.md`

# Environment Setup

## Requirements

- Node.js LTS (≥18)
- Yarn or PNPM
- PostgreSQL 14+
- S3-compatible bucket

## Strapi (v5)

```bash
npx create-strapi-app@latest backend --template starter --no-run
cd backend
cp .env.example .env
# configure: DATABASE_URL, S3 credentials, APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET
```

### Example `.env`

```
DATABASE_URL=postgres://user:pass@host:5432/strapi
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=desire-escorts-media
S3_REGION=eu-central-1
S3_ENDPOINT= # optional for R2/Wasabi
APP_KEYS=key1,key2,key3
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
URL=https://cms.example.com
```

## Next.js

```bash
npx create-next-app@latest frontend --ts
cd frontend
npm i cross-fetch zod next-sitemap next-seo
cp .env.example .env.local
```

### Example `.env.local`

```
NEXT_PUBLIC_API_URL=https://cms.example.com/api
STRAPI_API_TOKEN=...
SITE_URL=https://desire-escorts.nl
```

---

## `CONTENT_MODEL.md`

# Content Model (Strapi)

## Single Types

- **Site Settings**: siteName, defaultSEO, socialLinks, legalPagesRefs
- **Homepage**: hero, featuredProfiles[], featuredCities[], seo

## Collection Types

- **Escort (Profile)**

  - name, slug, shortBio (text), bio (richtext)
  - age (int), height (int), nationality (enum/text), languages (relation many to Language)
  - services (many to Service)
  - availability (component: dayOfWeek, start, end)
  - rates (component: duration, price, currency, inCall/outCall)
  - photos (media multiple)
  - city (relation to City)
  - contact (component: phone, whatsapp, telegram)
  - verified (boolean), featured (boolean)
  - seo (component)

- **City**: name, slug, description, seo

- **Service**: name, slug, description, category

- **Review** (optional, moderated): author, rating, comment, profile (relation)

- **Page**: title, slug, body, heroImage, seo, noindex

## Components

- **SEO**: metaTitle, metaDescription, ogImage
- **Availability**: dayOfWeek, startTime, endTime
- **RateItem**: label/duration, price, currency, includes
- **Contact**: phone, whatsapp, telegram

---

## `DATA_MAPPING_TEMPLATE.md`

# Data Mapping Template

Use this as a CSV/Sheet to track WP → Strapi mapping.

| WP Source          | Field/Meta        | Example   | Strapi Type     | Strapi Path          |
| ------------------ | ----------------- | --------- | --------------- | -------------------- |
| post type `escort` | post\_title       | "Anna"    | string          | Escort.name          |
| post type `escort` | post\_name (slug) | "anna"    | uid             | Escort.slug          |
| ACF: short\_bio    | text              | ...       | text            | Escort.shortBio      |
| ACF: bio           | wysiwyg           | ...       | richtext        | Escort.bio           |
| Taxonomy: city     | term              | Amsterdam | relation        | Escort.city          |
| Taxonomy: service  | terms[]           | …         | relation (many) | Escort.services      |
| ACF: photos        | gallery[]         | urls      | media[]         | Escort.photos        |
| ACF: phone         | text              | +316…     | component       | Escort.contact.phone |

Add **old URL** and **new URL** columns to auto-generate redirects.

---

## `WORDPRESS_EXPORT_GUIDE.md`

# WordPress Export Guide

Options:

1. **WP REST API**: `/wp-json/wp/v2/...` for posts, media, taxonomies, ACF endpoints.
2. **Tools → Export (XML)** for all content.
3. **WP-CLI** for custom exports.

Export **media URLs** and **term relationships**. Keep a snapshot of permalink settings for redirect mapping.

---

## `MIGRATION_PLAYBOOK.md`

# Migration Playbook

1. **Inventory**: list post types, taxonomies, ACF fields, media volume, URLs.
2. **Model**: build Strapi types/components (see `CONTENT_MODEL.md`).
3. **Export**: pull data & media (see `WORDPRESS_EXPORT_GUIDE.md`).
4. **Transform**: normalize fields, slugs, HTML → richtext, image refs.
5. **Import**: push to Strapi via Admin/API (see `STRAPI_IMPORT_GUIDE.md`).
6. **Verify**: spot-check 20 records per type + media links.
7. **Frontend**: implement pages, filters, SEO.
8. **SEO**: redirects, sitemap, structured data.
9. **Go-Live**: DNS cutover, cache warm-up, 404 monitor.

---

## `STRAPI_IMPORT_GUIDE.md`

# Strapi Import Guide

### Create API Token

Settings → API Tokens → Read/Write token (scoped to needed types).

### Batch Import Script (outline)

- Read exported JSON/XML
- For each entity:
  - Upload images to S3 (or POST `/upload` if using Strapi provider)
  - Create relations by resolving IDs/slugs
  - POST to `/api/{collection}`

Handle throttling and retries. Keep an **id map** to avoid duplicates.

---

## `NEXTJS_STARTER_GUIDE.md`

# Next.js Starter Guide (App Router)

## Routing

- `/profiles/[slug]` → Profile detail
- `/city/[slug]` → City listing
- `/services/[slug]` → Service listing
- `/search` → Faceted search (SSR)

## Data Fetching

- Use `fetch(`\${API}/profiles?populate=\*`, { next: { revalidate: 60 } })` for ISR
- Server actions for forms (contact)

## SEO

- `next-seo` per route; `generateSitemap` via `next-sitemap`
- Structured data: `Person` or `LocalBusiness` (where appropriate)

---

## `SEO_CHECKLIST.md`

# SEO Checklist

- Preserve slugs & create **301 redirects**
- Meta titles/descriptions per page (length OK)
- OG/Twitter cards with valid image sizes
- Canonicals, hreflang (if multi-language later)
- Schema.org for profiles and listings
- XML sitemap + robots.txt
- Clean HTML, no duplicate content
- Core Web Vitals (LCP/CLS/INP) targets

---

## `REDIRECTS_AND_SITEMAP.md`

# Redirects & Sitemap

- Build a `redirects.csv` with `source_url,new_url,status=301`.
- Verify with a crawler (e.g., Screaming Frog) before launch.
- Generate sitemap with Next (`next-sitemap`) and submit to GSC.

---

## `AGE_GATE_AND_COMPLIANCE.md`

# Age Gate & Compliance

- Implement 18+ age gate (cookie-based remember)
- Cookie consent per GDPR (NL: Telecommunicatiewet)
- Clear terms, privacy, contact and content policy pages
- Avoid storing sensitive data; secure contact info

---

## `SEARCH_AND_FILTERS.md`

# Search & Filters

### MVP

- Strapi REST with query params for facets: city, services, languages, price, availability
- Index essential fields; add pagination; cache on edge

### Scale

- Meilisearch/Elastic for typo-tolerance, sorting, and highlighting
- Incremental sync via webhooks

---

## `MEDIA_HANDLING.md`

# Media Handling

- Use S3-compatible storage with CDN
- Optimize images on frontend with `next/image`
- Keep alt text and captions in Strapi
- Enforce upload guidelines (min size, aspect ratios)

---

## `DEPLOYMENT_GUIDE.md`

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

---

## `QA_CHECKLIST.md`

# QA Checklist

-



---

## `MULTI_TENANCY_ARCHITECTURE.md`

# Multi‑site Architecture (1 CMS → many frontends)

**Goal:** One central Strapi managing multiple websites/domains with per‑site content, per‑site profile selection, and separate Vercel frontends.

## High‑level

- **Strapi (single instance)** with a first‑class **Site** model.
- All content types reference **Site** (single or many‑to‑many) to scope visibility.
- **Multiple Next.js frontends** (one per domain) or a single multi‑tenant frontend with domain‑based routing.
- **S3 folder strategy** per site for media, or media → Site relation.
- **RBAC** to restrict editors to specific sites.

## Data flow

1. Editor creates/edits content in Strapi and assigns it to one or more **Site** entries.
2. Frontends fetch content filtered by `site.domain` (server‑side enforced).
3. ISR/Tag revalidation per site on publish/update via webhooks.

---

## `STRAPI_MULTI_SITE_MODEL.md`

# Strapi Data Model for Multi‑site

### Site (collection type)

- `name` (string)
- `domain` (string, unique) e.g., `desire-escorts.nl`, `city-escorts.com`
- `brand` (component): logo, colors, fonts
- `seoDefaults` (component): metaTitle, metaDescription, ogImage
- `settings` (component): ageGateEnabled, contactChannels, legalPages

### Profile (Escort)

- add **many‑to‑many** relation: `sites` → Site[]
- optional: per‑site overrides via component `siteOverrides[]` (repeatable) with fields:
  - `site` (relation → Site
