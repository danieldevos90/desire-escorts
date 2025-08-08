export default {
  routes: [
    { method: 'GET', path: '/contact', handler: 'api::contact.contact.find', config: { policies: ['global::site-scope'] } },
    { method: 'PUT', path: '/contact', handler: 'api::contact.contact.update', config: { policies: [] } },
  ],
};


