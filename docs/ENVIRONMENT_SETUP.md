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
