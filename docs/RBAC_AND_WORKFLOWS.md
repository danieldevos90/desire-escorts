# RBAC & Editorial Workflows

- **Roles**: Multi-site Admin, Site Editor (scoped), Author, Reviewer.
- **Permissions**: Site Editor can only CRUD content for their site via admin query filters and lifecycles.
- **Workflow**: Draft → Review → Publish; publish triggers per-site revalidation webhook.
