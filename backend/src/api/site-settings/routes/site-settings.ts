export default {
  routes: [
    { method: 'GET', path: '/site-settings', handler: 'api::site-settings.site-settings.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/site-settings/:id', handler: 'api::site-settings.site-settings.findOne', config: { policies: ['global::site-scope'] } },
    { method: 'POST', path: '/site-settings', handler: 'api::site-settings.site-settings.create', config: { policies: [] } },
    { method: 'PUT', path: '/site-settings/:id', handler: 'api::site-settings.site-settings.update', config: { policies: [] } },
    { method: 'DELETE', path: '/site-settings/:id', handler: 'api::site-settings.site-settings.delete', config: { policies: [] } },
  ],
};

