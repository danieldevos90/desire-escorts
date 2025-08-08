import type { Core } from '@strapi/strapi';

export default (policyCtx: any, _config: any, { strapi }: { strapi: Core.Strapi }) => {
  const host = policyCtx.request?.header['x-forwarded-host'] || policyCtx.request?.host;
  policyCtx.request.query = policyCtx.request.query || {};
  const q = policyCtx.request.query;
  q.filters = {
    ...(q.filters || {}),
    sites: { domain: { $eq: host } },
  };
  return true;
};


