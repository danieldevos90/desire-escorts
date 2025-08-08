import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
  async findOne(ctx) {
    // Support lookup by slug, including site-specific overrides
    const idOrSlug = ctx.params.id;
    const host = ctx.request?.header['x-forwarded-host'] || ctx.request?.host;

    // Try direct id first
    if (/^\d+$/.test(idOrSlug)) {
      return await super.findOne(ctx);
    }

    // Resolve by slug or siteOverrides.customSlug for this site
    const entity = await strapi.entityService.findMany('api::profile.profile', {
      filters: {
        $or: [
          { slug: { $eq: idOrSlug } },
          { siteOverrides: { customSlug: { $eq: idOrSlug }, site: { domain: { $eq: host } } } },
        ],
      },
      populate: ['photos', 'rates', 'availability', 'contact', 'seo', 'sites', 'city', 'services', 'siteOverrides.site'],
      limit: 1,
    });

    if (!entity || entity.length === 0) {
      ctx.notFound('Profile not found');
      return;
    }

    const data = entity[0];
    return { data };
  },
}));


