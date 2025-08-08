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
