export default {
  routes: [
    { method: 'GET', path: '/pages', handler: 'api::page.page.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/pages/:id', handler: 'api::page.page.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


