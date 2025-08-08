import { headers as nextHeaders } from "next/headers";
export type FetchOptions = {
  path: string;
  searchParams?: Record<string, string | number | boolean | undefined>;
  init?: RequestInit;
};

export async function fetchFromStrapi<T>({ path, searchParams, init }: FetchOptions): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
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
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}


