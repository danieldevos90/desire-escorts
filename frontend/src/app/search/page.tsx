"use client";
import { useEffect, useState } from "react";

type Profile = { id: number; attributes: { name: string; slug: string } };
type Item = { id: number; attributes: { name: string; slug: string } };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [cities, setCities] = useState<Item[]>([]);
  const [services, setServices] = useState<Item[]>([]);
  const [languages, setLanguages] = useState<Item[]>([]);
  const [filters, setFilters] = useState<{ city?: string; service?: string; language?: string; minPrice?: string; maxPrice?: string; page?: number }>({ page: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      if (!q) {
        setResults([]);
        // still allow filtered search without text
      }
      setLoading(true);
      try {
        const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const params = new URLSearchParams();
        if (q) params.set("filters[name][$containsi]", q);
        if (filters.city) params.set("filters[city][slug][$eq]", filters.city);
        if (filters.service) params.set("filters[services][slug][$eq]", filters.service);
        if (filters.language) params.set("filters[languages][slug][$eq]", filters.language);
        if (filters.minPrice) params.set("filters[rates][price][$gte]", filters.minPrice);
        if (filters.maxPrice) params.set("filters[rates][price][$lte]", filters.maxPrice);
        params.set("pagination[page]", String(filters.page || 1));
        params.set("pagination[pageSize]", "20");
        const url = `${api}/profiles?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q, filters]);

  useEffect(() => {
    // load filter options
    (async () => {
      const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const [c, s, l] = await Promise.all([
        fetch(`${api}/cities?pagination[pageSize]=100`).then((r) => r.json()),
        fetch(`${api}/services?pagination[pageSize]=100`).then((r) => r.json()),
        fetch(`${api}/languages?pagination[pageSize]=100`).then((r) => r.json()),
      ]);
      setCities(c.data || []);
      setServices(s.data || []);
      setLanguages(l.data || []);
    })();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Search Profiles</h1>
      <input
        className="mt-4 w-full border rounded px-3 py-2"
        placeholder="Search by name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select className="border rounded px-3 py-2" value={filters.city || ""} onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined, page: 1 })}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.attributes.slug}>{c.attributes.name}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={filters.service || ""} onChange={(e) => setFilters({ ...filters, service: e.target.value || undefined, page: 1 })}>
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.attributes.slug}>{s.attributes.name}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={filters.language || ""} onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined, page: 1 })}>
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l.id} value={l.attributes.slug}>{l.attributes.name}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Min price" value={filters.minPrice || ""} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value || undefined, page: 1 })} />
        <input className="border rounded px-3 py-2" placeholder="Max price" value={filters.maxPrice || ""} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value || undefined, page: 1 })} />
      </div>
      {loading && <p className="mt-2 text-gray-500">Searching…</p>}
      <ul className="mt-4 list-disc pl-6">
        {results.map((p) => (
          <li key={p.id}>{p.attributes.name}</li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}>Prev</button>
        <button className="px-3 py-1 border rounded" onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
      </div>
    </main>
  );
}


