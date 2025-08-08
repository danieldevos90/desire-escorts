import type { Core } from '@strapi/strapi';

export default async (policyCtx: any, _config: any, { strapi }: { strapi: Core.Strapi }) => {
  const host = policyCtx.request?.header['x-forwarded-host'] || policyCtx.request?.host;
  policyCtx.request.query = policyCtx.request.query || {};
  const q = policyCtx.request.query;

  // Resolve site id by domain to avoid querying nested relation attribute in filters
  let siteId: string | number | undefined;
  try {
    const found = await strapi.entityService.findMany('api::site.site', {
      filters: { domain: { $eq: host } },
      fields: ['id'],
      limit: 1,
    } as any);
    const site = Array.isArray(found) ? found[0] : (found as any);
    siteId = (site as any)?.id as string | number | undefined;
  } catch {}

  const handler: string = policyCtx?.state?.route?.handler || '';
  const useSingle = /(api::page\.|api::faq\.|api::homepage\.|api::site-settings\.)/.test(handler);
  const relationKey = useSingle ? 'site' : 'sites';

  // If we cannot resolve a site id, ensure no results by applying an impossible filter
  const siteFilter = useSingle
    ? { id: (siteId ?? -1) as any }
    : { id: { $in: (siteId ? [siteId] : [-1]) as any } };

  q.filters = {
    ...(q.filters || {}),
    [relationKey]: siteFilter,
  };

  return true;
};


