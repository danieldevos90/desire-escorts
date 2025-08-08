export default {
  routes: [
    { method: 'GET', path: '/faq', handler: 'api::faq.faq.find', config: { policies: ['global::site-scope'] } },
    { method: 'PUT', path: '/faq', handler: 'api::faq.faq.update', config: { policies: [] } },
  ],
};


