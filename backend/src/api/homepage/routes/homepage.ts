export default {
  routes: [
    { method: 'GET', path: '/homepage', handler: 'api::homepage.homepage.find', config: { policies: [] } },
    { method: 'PUT', path: '/homepage', handler: 'api::homepage.homepage.update', config: { policies: [] } },
  ],
};


