export default {
  routes: [
    { method: 'GET', path: '/services', handler: 'service.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/services/:id', handler: 'service.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


