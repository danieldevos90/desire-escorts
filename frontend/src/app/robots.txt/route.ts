export const GET = () => new Response("User-agent: *\nSitemap: " + (process.env.SITE_URL || "https://example.com") + "/sitemap.xml\n", { headers: { "Content-Type": "text/plain" } });


