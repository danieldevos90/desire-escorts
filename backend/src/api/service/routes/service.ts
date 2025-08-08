export default {
  routes: [
    { method: 'GET', path: '/services', handler: 'api::service.service.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/services/:id', handler: 'api::service.service.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


