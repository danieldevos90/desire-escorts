import { fetchFromStrapi } from "@/lib/api";

type City = { id: number; attributes: { name: string; slug: string } };

export default async function CitiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page = "1" } = await searchParams;
  const res = await fetchFromStrapi<{ data: City[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } }>({
    path: "/cities",
    searchParams: { "pagination[page]": page, "pagination[pageSize]": 20 },
  });
  const { data, meta } = res;
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Cities</h1>
      <ul className="mt-4 list-disc pl-6">
        {data.map((c) => (
          <li key={c.id}>{c.attributes.name}</li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <a className="px-3 py-1 border rounded" href={`?page=${Math.max(1, meta.pagination.page - 1)}`}>Prev</a>
        <a className="px-3 py-1 border rounded" href={`?page=${Math.min(meta.pagination.pageCount, meta.pagination.page + 1)}`}>Next</a>
      </div>
    </main>
  );
}


