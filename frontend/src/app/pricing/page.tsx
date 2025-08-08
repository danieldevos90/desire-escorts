import { fetchFromStrapi } from "@/lib/api";

type RateItem = { label?: string; price?: number; currency?: string; includes?: string };
type Pricing = { id: number; attributes: { title?: string; rates?: RateItem[] } };

export default async function PricingPage() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Pricing</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  let pricing: Pricing | undefined;
  try {
    const res = await fetchFromStrapi<{ data: Pricing[] }>({ path: "/pricings", searchParams: { populate: "*", "pagination[page]": 1, "pagination[pageSize]": 1 } });
    pricing = res.data?.[0];
  } catch {
    pricing = undefined;
  }
  const items = pricing?.attributes?.rates || [];
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{pricing?.attributes?.title || "Pricing"}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {items.length ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              {items.map((r, i) => (
                <div key={i} className="card bordered">
                  <div className="card-title" style={{ fontWeight: 700 }}>{r.label || `Option ${i + 1}`}</div>
                  <div className="card-subtitle" style={{ marginTop: 'var(--space-1)' }}>
                    {r.price ? `${r.currency || 'EUR'} ${r.price}` : '—'}
                  </div>
                  {r.includes && <p className="muted" style={{ marginTop: 'var(--space-2)' }}>{r.includes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No pricing available.</p>
          )}
        </div>
      </section>
    </main>
  );
}


