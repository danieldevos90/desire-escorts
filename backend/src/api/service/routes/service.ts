export default {
  routes: [
    { method: 'GET', path: '/services', handler: 'api::service.service.find', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'GET', path: '/services/:id', handler: 'api::service.service.findOne', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'POST', path: '/services', handler: 'api::service.service.create', config: { policies: [] } },
    { method: 'PUT', path: '/services/:id', handler: 'api::service.service.update', config: { policies: [] } },
    { method: 'DELETE', path: '/services/:id', handler: 'api::service.service.delete', config: { policies: [] } },
  ],
};


