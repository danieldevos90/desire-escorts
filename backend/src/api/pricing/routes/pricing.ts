export default {
  routes: [
    { method: 'GET', path: '/pricings', handler: 'api::pricing.pricing.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/pricings/:id', handler: 'api::pricing.pricing.findOne', config: { policies: ['global::site-scope'] } },
    { method: 'POST', path: '/pricings', handler: 'api::pricing.pricing.create', config: { policies: [] } },
    { method: 'PUT', path: '/pricings/:id', handler: 'api::pricing.pricing.update', config: { policies: [] } },
    { method: 'DELETE', path: '/pricings/:id', handler: 'api::pricing.pricing.delete', config: { policies: [] } },
  ],
};


