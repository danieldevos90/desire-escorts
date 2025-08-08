import { factories } from '@strapi/strapi';

// Custom controller to avoid relying on the default single-type service
// which may not be registered correctly in some dev scenarios.
export default factories.createCoreController('api::homepage.homepage', ({ strapi }) => ({
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Fetch the single document directly. Using documents API if available,
    // otherwise fallback to entityService.
    let entity: any = null;
    if (typeof (strapi as any).documents === 'function') {
      entity = await (strapi as any)
        .documents('api::homepage.homepage')
        .findFirst(sanitizedQuery as any);
    } else {
      const results = await strapi.entityService.findMany('api::homepage.homepage', {
        ...(sanitizedQuery as any),
        limit: 1,
      });
      entity = Array.isArray(results) ? results[0] : results;
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));


