export default {
  routes: [
    { method: 'GET', path: '/cities', handler: 'api::city.city.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/cities/:id', handler: 'api::city.city.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


