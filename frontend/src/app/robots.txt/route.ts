import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || "https://example.com";
  return {
    rules: [{ userAgent: "*" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}


