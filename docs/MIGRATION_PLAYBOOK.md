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
