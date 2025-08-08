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
