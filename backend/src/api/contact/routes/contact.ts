export default {
  routes: [
    { method: 'GET', path: '/contacts', handler: 'api::contact.contact.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/contacts/:id', handler: 'api::contact.contact.findOne', config: { policies: ['global::site-scope'] } },
    { method: 'POST', path: '/contacts', handler: 'api::contact.contact.create', config: { policies: [] } },
    { method: 'PUT', path: '/contacts/:id', handler: 'api::contact.contact.update', config: { policies: [] } },
    { method: 'DELETE', path: '/contacts/:id', handler: 'api::contact.contact.delete', config: { policies: [] } },
  ],
};


