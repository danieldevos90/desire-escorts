function stripTrailingSlash(input: string): string {
  return input.replace(/\/$/, "");
}

export const API_BASE_URL: string = stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL || "");

export const STRAPI_BASE_URL: string = stripTrailingSlash(
  process.env.NEXT_PUBLIC_STRAPI_URL || API_BASE_URL.replace(/\/api$/, "") || ""
);

export function getAssetUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!STRAPI_BASE_URL) return pathOrUrl; // best effort
  return `${STRAPI_BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}


