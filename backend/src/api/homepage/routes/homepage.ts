export default {
  routes: [
    { method: 'GET', path: '/homepages', handler: 'api::homepage.homepage.find', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'GET', path: '/homepages/:id', handler: 'api::homepage.homepage.findOne', config: { policies: ['global::site-scope'], auth: false } },
    { method: 'POST', path: '/homepages', handler: 'api::homepage.homepage.create', config: { policies: [] } },
    { method: 'PUT', path: '/homepages/:id', handler: 'api::homepage.homepage.update', config: { policies: [] } },
    { method: 'DELETE', path: '/homepages/:id', handler: 'api::homepage.homepage.delete', config: { policies: [] } },
  ],
};


