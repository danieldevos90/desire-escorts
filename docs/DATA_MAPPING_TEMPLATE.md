# Data Mapping Template

Use this as a CSV/Sheet to track WP → Strapi mapping.

| WP Source          | Field/Meta        | Example   | Strapi Type     | Strapi Path          |
| ------------------ | ----------------- | --------- | --------------- | -------------------- |
| post type `escort` | post_title        | "Anna"    | string          | Escort.name          |
| post type `escort` | post_name (slug)  | "anna"    | uid             | Escort.slug          |
| ACF: short_bio     | text              | ...       | text            | Escort.shortBio      |
| ACF: bio           | wysiwyg           | ...       | richtext        | Escort.bio           |
| Taxonomy: city     | term              | Amsterdam | relation        | Escort.city          |
| Taxonomy: service  | terms[]           | …         | relation (many) | Escort.services      |
| ACF: photos        | gallery[]         | urls      | media[]         | Escort.photos        |
| ACF: phone         | text              | +316…     | component       | Escort.contact.phone |

Add **old URL** and **new URL** columns to auto-generate redirects.
