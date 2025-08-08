export default {
  routes: [
    { method: 'GET', path: '/news', handler: 'news.find', config: { policies: [] } },
    { method: 'GET', path: '/news/:id', handler: 'news.findOne', config: { policies: [] } },
  ],
};

export default {
  routes: [
    { method: 'GET', path: '/news', handler: 'api::news.news.find', config: { policies: ['global::site-scope'] } },
    { method: 'GET', path: '/news/:id', handler: 'api::news.news.findOne', config: { policies: ['global::site-scope'] } },
  ],
};


