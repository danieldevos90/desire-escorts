import { fetchFromStrapi } from "@/lib/api";

export const dynamic = "force-dynamic";

type Brand = { primaryColor?: string; secondaryColor?: string; fontFamily?: string };
type Site = { id: number; attributes: { domain: string; brand?: Brand } };
type SitesResponse = { data: Site[] };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;

  let primary = "#000000"; // black
  let secondary = "#666666"; // gray
  let fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"";

  try {
    const res = await fetchFromStrapi<SitesResponse>({
      path: "/sites",
      searchParams: {
        "filters[domain][$eq]": host,
        populate: "brand",
      },
    });
    const site = res.data?.[0];
    const brand = site?.attributes?.brand || {};
    if (brand.primaryColor) primary = brand.primaryColor;
    if (brand.secondaryColor) secondary = brand.secondaryColor;
    if (brand.fontFamily) fontFamily = brand.fontFamily;
  } catch {
    // fall back to defaults
  }

  const css = `:root{--color-primary:${primary};--color-secondary:${secondary};--font-family:${fontFamily}}`;
  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}


