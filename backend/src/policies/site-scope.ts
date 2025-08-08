import type { Core } from '@strapi/strapi';

export default (policyCtx: any, _config: any, { strapi }: { strapi: Core.Strapi }) => {
  const host = policyCtx.request?.header['x-forwarded-host'] || policyCtx.request?.host;
  policyCtx.request.query = policyCtx.request.query || {};
  const q = policyCtx.request.query;
  q.filters = {
    ...(q.filters || {}),
    $or: [
      { sites: { domain: { $eq: host } } }, // many-to-many
      { site: { domain: { $eq: host } } },  // single relation
    ],
  };
  return true;
};


