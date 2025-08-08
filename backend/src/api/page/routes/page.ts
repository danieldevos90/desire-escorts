export default {
  routes: [
    { method: 'GET', path: '/pages', handler: 'page.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/pages/:id', handler: 'page.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


