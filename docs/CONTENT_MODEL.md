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
