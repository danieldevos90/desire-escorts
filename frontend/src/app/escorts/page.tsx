import { fetchFromStrapi } from "@/lib/api";
import EscortGrid from "@/components/EscortGrid";
import type { Escort } from "@/types/strapi";

type StrapiPagination = { page: number; pageSize: number; pageCount: number; total: number };
type StrapiListResponse<T> = { data: T[]; meta?: { pagination?: StrapiPagination } };

export default async function EscortsOverview({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Find an Escort</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const { page = "1" } = await searchParams;
  const res = await fetchFromStrapi<StrapiListResponse<Escort>>({
    path: "/profiles",
    searchParams: {
      "pagination[page]": page,
      "pagination[pageSize]": 24,
      "populate[city]": "*",
      "populate[photos]": "*",
      "populate[rates]": "*",
    },
  });
  const { data, meta } = res;
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Find an Escort</h1>
          <p className="hero-subtitle">Browse verified profiles in your city.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <EscortGrid escorts={data} />
          {meta?.pagination ? (
            <div style={{ marginTop: "var(--space-6)", display: 'flex', gap: 'var(--space-2)' }}>
              <a className="btn bordered" href={`?page=${Math.max(1, meta.pagination.page - 1)}`}>Prev</a>
              <a className="btn bordered" href={`?page=${Math.min(meta.pagination.pageCount, meta.pagination.page + 1)}`}>Next</a>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}


