export default {
  routes: [
    { method: 'GET', path: '/cities', handler: 'api::city.city.find', config: { policies: [] } },
    { method: 'GET', path: '/cities/:id', handler: 'api::city.city.findOne', config: { policies: [] } },
    { method: 'POST', path: '/cities', handler: 'api::city.city.create', config: { policies: [] } },
    { method: 'PUT', path: '/cities/:id', handler: 'api::city.city.update', config: { policies: [] } },
    { method: 'DELETE', path: '/cities/:id', handler: 'api::city.city.delete', config: { policies: [] } },
  ],
};


