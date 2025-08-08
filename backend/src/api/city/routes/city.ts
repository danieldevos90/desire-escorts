export default {
  routes: [
    { method: 'GET', path: '/cities', handler: 'city.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/cities/:id', handler: 'city.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


