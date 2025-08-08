export default {
  routes: [
    { method: 'GET', path: '/sites', handler: 'api::site.site.find', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'GET', path: '/sites/:id', handler: 'api::site.site.findOne', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'POST', path: '/sites', handler: 'api::site.site.create', config: { policies: [] } },
    { method: 'PUT', path: '/sites/:id', handler: 'api::site.site.update', config: { policies: [] } },
    { method: 'DELETE', path: '/sites/:id', handler: 'api::site.site.delete', config: { policies: [] } },
  ],
};


