import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::city.city', ({ strapi }) => ({
  async find(ctx) {
    // Return list in REST format: { data: [{ id, attributes }], meta }
    const q = (ctx.query || {}) as any;
    const page = Number(q?.pagination?.page ?? 1);
    const pageSize = Number(q?.pagination?.pageSize ?? 24);
    const start = (page - 1) * pageSize;
    const limit = pageSize;
    const [items, total] = await Promise.all([
      strapi.entityService.findMany('api::city.city', { ...q, start, limit }),
      strapi.entityService.count('api::city.city', q),
    ]);
    const wrapped = (items as any[]).map((item) => {
      const { id, ...attrs } = item;
      return { id, attributes: attrs };
    });
    const pageCount = Math.max(1, Math.ceil((Number(total) || wrapped.length) / pageSize));
    return { data: wrapped, meta: { pagination: { page, pageSize, pageCount, total: Number(total) || wrapped.length } } } as any;
  },
}));



