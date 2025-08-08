export default {
  routes: [
    { method: 'GET', path: '/pricing', handler: 'api::pricing.pricing.find', config: { policies: ['global::site-scope'] } },
    { method: 'PUT', path: '/pricing', handler: 'api::pricing.pricing.update', config: { policies: [] } },
  ],
};


