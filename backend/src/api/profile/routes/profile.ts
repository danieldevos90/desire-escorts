export default {
  routes: [
    {
      method: 'GET',
      path: '/profiles',
      handler: 'profile.find',
      config: { policies: ['global::site-scope'] },
    },
    {
      method: 'GET',
      path: '/profiles/:id',
      handler: 'profile.findOne',
      config: { policies: ['global::site-scope'] },
    },
  ],
};


