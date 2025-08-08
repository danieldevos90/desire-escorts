"use client";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type FilterOptions = {
  cities: Array<{ name: string; slug: string }>;
  services: Array<{ name: string; slug: string }>;
  languages: Array<{ name: string; slug: string }>;
  tags: Array<{ label: string; slug: string }>;
  attributes: Record<string, string[]>;
  ranges: {
    age: { min: number; max: number };
    height: { min: number; max: number };
    price: { min: number; max: number };
  };
};

export type InitialFilters = {
  city?: string;
  service?: string;
  language?: string;
  tags?: string[];
  attr?: Record<string, string[]>;
  age?: { min?: number; max?: number };
  height?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
};

function toCsv(values?: string[]): string | undefined {
  if (!values || !values.length) return undefined;
  return values.join(",");
}

export default function EscortFilters({ options, initial }: { options: FilterOptions; initial?: InitialFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [city, setCity] = useState(initial?.city || "");
  const [service, setService] = useState(initial?.service || "");
  const [language, setLanguage] = useState(initial?.language || "");
  const [tagSet, setTagSet] = useState<Set<string>>(new Set(initial?.tags || []));
  const [attr, setAttr] = useState<Record<string, Set<string>>>(() => {
    const next: Record<string, Set<string>> = {};
    for (const [k, values] of Object.entries(initial?.attr || {})) {
      next[k] = new Set(values);
    }
    return next;
  });

  const [age, setAge] = useState<{ min: number; max: number }>(() => ({
    min: initial?.age?.min ?? options.ranges.age.min,
    max: initial?.age?.max ?? options.ranges.age.max,
  }));
  const [height, setHeight] = useState<{ min: number; max: number }>(() => ({
    min: initial?.height?.min ?? options.ranges.height.min,
    max: initial?.height?.max ?? options.ranges.height.max,
  }));
  const [price, setPrice] = useState<{ min: number; max: number }>(() => ({
    min: initial?.price?.min ?? options.ranges.price.min,
    max: initial?.price?.max ?? options.ranges.price.max,
  }));

  const appliedCount = useMemo(() => {
    let c = 0;
    if (city) c++;
    if (service) c++;
    if (language) c++;
    c += tagSet.size;
    for (const values of Object.values(attr)) c += values.size;
    if (age.min !== options.ranges.age.min || age.max !== options.ranges.age.max) c++;
    if (height.min !== options.ranges.height.min || height.max !== options.ranges.height.max) c++;
    if (price.min !== options.ranges.price.min || price.max !== options.ranges.price.max) c++;
    return c;
  }, [city, service, language, tagSet, attr, age, height, price, options.ranges]);

  function updateUrl() {
    const params = new URLSearchParams(sp.toString());
    // reset page when filters change
    params.set("page", "1");

    if (city) params.set("city", city); else params.delete("city");
    if (service) params.set("service", service); else params.delete("service");
    if (language) params.set("language", language); else params.delete("language");

    const tagsCsv = toCsv(Array.from(tagSet));
    if (tagsCsv) params.set("tag", tagsCsv); else params.delete("tag");

    // attributes
    // clear previous attr[] keys
    for (const [key] of Array.from(params.entries())) {
      if (key.startsWith("attr[")) params.delete(key);
    }
    for (const [k, values] of Object.entries(attr)) {
      if (values.size) params.set(`attr[${k}]`, toCsv(Array.from(values))!);
    }

    // ranges
    const setNum = (k: string, v: number | undefined) => {
      if (typeof v === "number" && !Number.isNaN(v)) params.set(k, String(v)); else params.delete(k);
    };
    setNum("ageMin", age.min);
    setNum("ageMax", age.max);
    setNum("heightMin", height.min);
    setNum("heightMax", height.max);
    setNum("priceMin", price.min);
    setNum("priceMax", price.max);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function toggleTag(slug: string) {
    const next = new Set(tagSet);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    setTagSet(next);
  }

  function toggleAttr(key: string, value: string) {
    const set = new Set(attr[key] || []);
    if (set.has(value)) set.delete(value); else set.add(value);
    setAttr({ ...attr, [key]: set });
  }

  function clearAll() {
    setCity("");
    setService("");
    setLanguage("");
    setTagSet(new Set());
    setAttr({});
    setAge({ min: options.ranges.age.min, max: options.ranges.age.max });
    setHeight({ min: options.ranges.height.min, max: options.ranges.height.max });
    setPrice({ min: options.ranges.price.min, max: options.ranges.price.max });
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <div className="card-title">Filters {appliedCount ? <span className="muted">({appliedCount} applied)</span> : null}</div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button className="btn btn-outline btn-sm" onClick={clearAll} type="button">Clear</button>
          <button className="btn btn-primary btn-sm" onClick={updateUrl} type="button" disabled={isPending}>Apply</button>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--space-4)" }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gap: "var(--space-3)", gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
            <select className="bordered" style={{ padding: "8px", borderRadius: "8px" }} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {options.cities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select className="bordered" style={{ padding: "8px", borderRadius: "8px" }} value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">All services</option>
              {options.services.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <select className="bordered" style={{ padding: "8px", borderRadius: "8px" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All languages</option>
              {options.languages.map((l) => (
                <option key={l.slug} value={l.slug}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--space-4)" }}>
          <div>
            <div className="card-subtitle">Age: {age.min} - {age.max}</div>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "8px" }}>
              <input type="range" min={options.ranges.age.min} max={options.ranges.age.max} value={age.min} onChange={(e) => setAge((p) => ({ ...p, min: Math.min(Number(e.target.value), p.max) }))} />
              <input type="range" min={options.ranges.age.min} max={options.ranges.age.max} value={age.max} onChange={(e) => setAge((p) => ({ ...p, max: Math.max(Number(e.target.value), p.min) }))} />
            </div>
          </div>
          <div>
            <div className="card-subtitle">Height (cm): {height.min} - {height.max}</div>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "8px" }}>
              <input type="range" min={options.ranges.height.min} max={options.ranges.height.max} value={height.min} onChange={(e) => setHeight((p) => ({ ...p, min: Math.min(Number(e.target.value), p.max) }))} />
              <input type="range" min={options.ranges.height.min} max={options.ranges.height.max} value={height.max} onChange={(e) => setHeight((p) => ({ ...p, max: Math.max(Number(e.target.value), p.min) }))} />
            </div>
          </div>
          <div>
            <div className="card-subtitle">Price (€): {price.min} - {price.max}</div>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "8px" }}>
              <input type="range" min={options.ranges.price.min} max={options.ranges.price.max} value={price.min} onChange={(e) => setPrice((p) => ({ ...p, min: Math.min(Number(e.target.value), p.max) }))} />
              <input type="range" min={options.ranges.price.min} max={options.ranges.price.max} value={price.max} onChange={(e) => setPrice((p) => ({ ...p, max: Math.max(Number(e.target.value), p.min) }))} />
            </div>
          </div>
        </div>

        {!!options.tags.length && (
          <div>
            <div className="card-subtitle" style={{ marginBottom: "8px" }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {options.tags.map((t) => (
                <label key={t.slug} className="bordered" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", cursor: "pointer" }}>
                  <input type="checkbox" checked={tagSet.has(t.slug)} onChange={() => toggleTag(t.slug)} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {Object.keys(options.attributes).length > 0 && (
          <div>
            <div className="card-subtitle" style={{ marginBottom: "8px" }}>Attributes</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "var(--space-3)" }}>
              {Object.entries(options.attributes).map(([key, values]) => (
                <div key={key}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{key}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {values.map((v) => (
                      <label key={v} className="bordered" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", cursor: "pointer" }}>
                        <input type="checkbox" checked={!!attr[key]?.has(v)} onChange={() => toggleAttr(key, v)} />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


