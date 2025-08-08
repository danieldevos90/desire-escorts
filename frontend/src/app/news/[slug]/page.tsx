import { fetchFromStrapi } from "@/lib/api";

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container p-6">
        <h1 className="text-xl font-semibold">News</h1>
        <p className="muted">Set env to load from Strapi.</p>
      </main>
    );
  }
  const { slug } = params;
  try {
    const res = await fetchFromStrapi<{ data: Array<{ id: number; attributes: { title: string; body?: string } }> }>({
      path: "/news",
      searchParams: { "filters[slug][$eq]": slug, "pagination[pageSize]": 1 },
    });
    const item = res.data?.[0];
    if (!item) return <main className="container p-6">Not found</main>;
    return (
      <main className="container p-6">
        <h1 className="text-2xl font-semibold">{item.attributes.title}</h1>
        {item.attributes.body && (
          <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: item.attributes.body }} />
        )}
      </main>
    );
  } catch {
    return <main className="container p-6">Error loading news</main>;
  }
}


