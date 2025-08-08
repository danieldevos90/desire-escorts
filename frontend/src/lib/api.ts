import { headers as nextHeaders } from "next/headers";
export type FetchOptions = {
  path: string;
  searchParams?: Record<string, string | number | boolean | undefined>;
  init?: RequestInit;
};

export async function fetchFromStrapi<T>({ path, searchParams, init }: FetchOptions): Promise<T> {
  const rawBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  let baseUrl = rawBase;
  // If base is not absolute (e.g. "/api"), try to prepend NEXT_PUBLIC_STRAPI_URL
  if (!/^https?:\/\//i.test(baseUrl)) {
    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
    if (strapiBase) {
      baseUrl = `${strapiBase}${baseUrl.startsWith("/") ? "" : "/"}${baseUrl}`;
    }
  }
  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error("Invalid NEXT_PUBLIC_API_URL. Provide an absolute URL, or set NEXT_PUBLIC_STRAPI_URL as the host.");
  }
  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers = new Headers(init?.headers as HeadersInit);
  // Propagate the site host to Strapi so server-side policy can scope by site
  if (typeof window === "undefined") {
    const incoming = await nextHeaders();
    const host = incoming.get("host");
    if (host) headers.set("x-forwarded-host", host);
  }

  const token = process.env.STRAPI_API_TOKEN;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url.toString(), {
    ...init,
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
      details = details.slice(0, 500);
    } catch {}
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText}${details ? ` - ${details}` : ''}`);
  }

  return res.json();
}


