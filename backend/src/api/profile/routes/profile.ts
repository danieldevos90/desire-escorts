export default {
  routes: [
    {
      method: 'GET',
      path: '/profiles',
      handler: 'api::profile.profile.find',
      config: { policies: ['global::site-scope'], auth: false },
    },
    {
      method: 'GET',
      path: '/profiles/filters',
      handler: 'api::profile.profile.filters',
      config: { policies: ['global::site-scope'], auth: false },
    },
    {
      method: 'GET',
      path: '/profiles/health',
      handler: async (ctx: any) => {
        try {
          ctx.body = { ok: true };
        } catch (e) {
          ctx.status = 500;
          ctx.body = { ok: false, error: (e as any)?.message };
        }
      },
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/profiles/:id', // supports slug or id
      handler: 'api::profile.profile.findOne',
      config: { policies: ['global::site-scope'], auth: false },
    },
    { method: 'POST', path: '/profiles', handler: 'api::profile.profile.create', config: { policies: [] } },
    { method: 'PUT', path: '/profiles/:id', handler: 'api::profile.profile.update', config: { policies: [] } },
    { method: 'DELETE', path: '/profiles/:id', handler: 'api::profile.profile.delete', config: { policies: [] } },
  ],
};


