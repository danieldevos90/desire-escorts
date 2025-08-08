import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "https://example.com";
  return [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
    },
  ];
}


