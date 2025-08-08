# Migration Notes for Multi-site

- During migration, populate **Site** first, then map profiles/pages to sites.
- If a profile appears on multiple sites, set `sites` M2M accordingly; apply overrides where needed.
- Generate **redirect maps per site** based on each domain’s legacy URLs.
