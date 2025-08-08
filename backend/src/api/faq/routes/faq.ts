export default {
  routes: [
    { method: 'GET', path: '/faqs', handler: 'api::faq.faq.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/faqs/:id', handler: 'api::faq.faq.findOne', config: { policies: ['global::site-scope'] } },
    { method: 'POST', path: '/faqs', handler: 'api::faq.faq.create', config: { policies: [] } },
    { method: 'PUT', path: '/faqs/:id', handler: 'api::faq.faq.update', config: { policies: [] } },
    { method: 'DELETE', path: '/faqs/:id', handler: 'api::faq.faq.delete', config: { policies: [] } },
  ],
};


