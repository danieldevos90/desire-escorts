import Link from "next/link";
import { fetchFromStrapi } from "@/lib/api";

export default async function HomeNews() {
  try {
    const res = await fetchFromStrapi<{ data: Array<{ id: number; attributes: { title: string; slug: string; excerpt?: string } }> }>({
      path: "/news",
      searchParams: { "pagination[page]": 1, "pagination[pageSize]": 3, sort: "createdAt:desc" },
    });
    const items = res.data || [];
    if (!items.length) return null;
    return (
      <section className="section">
        <div className="container">
          <h2>Latest News</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            {items.map((n) => (
              <article key={n.id} className="card bordered">
                <h3 style={{ fontWeight: 700 }}><Link href={`/news/${n.attributes.slug}`}>{n.attributes.title}</Link></h3>
                {n.attributes.excerpt && <p className="muted" style={{ marginTop: 'var(--space-2)' }}>{n.attributes.excerpt}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}


