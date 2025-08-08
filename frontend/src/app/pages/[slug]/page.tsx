import { fetchFromStrapi } from "@/lib/api";

type PageSection = Record<string, unknown>;
type Page = { id: number; attributes: { title: string; slug: string; sections?: PageSection[]; heroImage?: { data?: { attributes?: { url: string } } } } };

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Page</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const { slug } = await params;
  const res = await fetchFromStrapi<{ data: Page[] }>({
    path: "/pages",
    searchParams: { "filters[slug][$eq]": slug, populate: "heroImage,sections" },
  });
  const page = res.data?.[0];
  if (!page) {
    return (
      <main className="container section">
        <h1>Page not found</h1>
      </main>
    );
  }
  const img = page.attributes.heroImage?.data?.attributes?.url;
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{page.attributes.title}</h1>
        </div>
      </section>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }} />
      )}
      <section className="section">
        <div className="container">
          {Array.isArray(page.attributes.sections) && page.attributes.sections.length > 0 ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(page.attributes.sections, null, 2)}</pre>
          ) : (
            <p className="muted">No content.</p>
          )}
        </div>
      </section>
    </main>
  );
}


