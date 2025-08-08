import { fetchFromStrapi } from "@/lib/api";

type Service = { id: number; attributes: { name: string; slug: string } };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Services</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const { page = "1" } = await searchParams;
  const res = await fetchFromStrapi<{ data: Service[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } }>({
    path: "/services",
    searchParams: { "pagination[page]": page, "pagination[pageSize]": 20 },
  });
  const { data, meta } = res;
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Services</h1>
      <ul className="mt-4 list-disc pl-6">
        {data.map((s) => (
          <li key={s.id}>
            <a className="text-secondary" href={`/services/${s.attributes.slug}`}>{s.attributes.name}</a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <a className="px-3 py-1 border rounded" href={`?page=${Math.max(1, meta.pagination.page - 1)}`}>Prev</a>
        <a className="px-3 py-1 border rounded" href={`?page=${Math.min(meta.pagination.pageCount, meta.pagination.page + 1)}`}>Next</a>
      </div>
    </main>
  );
}


