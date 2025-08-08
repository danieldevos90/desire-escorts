"use client";
import { useEffect, useState } from "react";

type Profile = { id: number; attributes: { name: string; slug: string } };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const url = `${api}/profiles?filters[name][$containsi]=${encodeURIComponent(q)}`;
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
  }, [q]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Search Profiles</h1>
      <input
        className="mt-4 w-full border rounded px-3 py-2"
        placeholder="Search by name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <p className="mt-2 text-gray-500">Searching…</p>}
      <ul className="mt-4 list-disc pl-6">
        {results.map((p) => (
          <li key={p.id}>{p.attributes.name}</li>
        ))}
      </ul>
    </main>
  );
}


