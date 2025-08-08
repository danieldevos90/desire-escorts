import { fetchFromStrapi } from "@/lib/api";
import EscortGrid from "@/components/EscortGrid";
import EscortFilters, { type FilterOptions, type InitialFilters } from "@/components/EscortFilters";
import type { Escort } from "@/types/strapi";

type StrapiPagination = { page: number; pageSize: number; pageCount: number; total: number };
type StrapiListResponse<T> = { data: T[]; meta?: { pagination?: StrapiPagination } };

export default async function EscortsOverview({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Find an Escort</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const s = await searchParams;
  const page = (Array.isArray(s.page) ? s.page[0] : s.page) || "1";

  // Build filters for Strapi
  const query: Record<string, string | number> = {
    "pagination[page]": page,
    "pagination[pageSize]": 24,
    "populate[city]": "*",
    "populate[photos]": "*",
    "populate[rates]": "*",
  };
  const set = (k: string, v?: string | string[]) => {
    if (!v) return;
    if (Array.isArray(v)) query[k] = v[0]; else query[k] = v;
  };
  set("filters[city][slug][$eq]", s.city as string | string[] | undefined);
  set("filters[services][slug][$eq]", s.service as string | string[] | undefined);
  set("filters[languages][slug][$eq]", s.language as string | string[] | undefined);
  // price range based on rates.price
  set("filters[rates][price][$gte]", s.priceMin as string | string[] | undefined);
  set("filters[rates][price][$lte]", s.priceMax as string | string[] | undefined);
  // numeric ranges: age, height
  set("filters[age][$gte]", s.ageMin as string | string[] | undefined);
  set("filters[age][$lte]", s.ageMax as string | string[] | undefined);
  set("filters[height][$gte]", s.heightMin as string | string[] | undefined);
  set("filters[height][$lte]", s.heightMax as string | string[] | undefined);

  // tags: comma separated -> group OR
  const tagCsv = Array.isArray(s.tag) ? s.tag[0] : s.tag;
  let andGroupIndex = 0;
  if (tagCsv) {
    const tags = String(tagCsv).split(',').map((t) => t.trim()).filter(Boolean);
    tags.forEach((slug, idx) => {
      query[`filters[$and][${andGroupIndex}][$or][${idx}][tags][slug][$eq]`] = slug;
    });
    andGroupIndex++;
  }
  // attributes: attr[key]=csv values -> AND across keys, OR within values of same key
  const attrEntries = Object.entries(s).filter(([k]) => k.startsWith("attr["));
  if (attrEntries.length) {
    for (const [k, raw] of attrEntries) {
      const key = k.slice(5, -1); // attr[Key] -> Key
      const csv = Array.isArray(raw) ? raw[0] : raw;
      if (!csv) continue;
      const values = String(csv).split(',').map((v) => v.trim()).filter(Boolean);
      let orIndex = 0;
      for (const v of values) {
        query[`filters[$and][${andGroupIndex}][$or][${orIndex}][attributesList][key][$eq]`] = key;
        query[`filters[$and][${andGroupIndex}][$or][${orIndex}][attributesList][value][$eq]`] = v;
        orIndex++;
      }
      andGroupIndex++;
    }
  }

  const res = await fetchFromStrapi<StrapiListResponse<Escort>>({
    path: "/profiles",
    searchParams: query,
  });
  const { data, meta } = res;

  // Fetch filter options
  const filterOptions = await fetchFromStrapi<FilterOptions>({ path: "/profiles/filters" });
  const initialFilters: InitialFilters = {
    city: (Array.isArray(s.city) ? s.city[0] : s.city) || undefined,
    service: (Array.isArray(s.service) ? s.service[0] : s.service) || undefined,
    language: (Array.isArray(s.language) ? s.language[0] : s.language) || undefined,
    tags: tagCsv ? tagCsv.split(',').filter(Boolean) : undefined,
    attr: Object.fromEntries(
      attrEntries.map(([k, raw]) => [k.slice(5, -1), String(Array.isArray(raw) ? raw[0] : raw).split(',').filter(Boolean)])
    ),
    age: { min: s.ageMin ? Number(Array.isArray(s.ageMin) ? s.ageMin[0] : s.ageMin) : undefined, max: s.ageMax ? Number(Array.isArray(s.ageMax) ? s.ageMax[0] : s.ageMax) : undefined },
    height: { min: s.heightMin ? Number(Array.isArray(s.heightMin) ? s.heightMin[0] : s.heightMin) : undefined, max: s.heightMax ? Number(Array.isArray(s.heightMax) ? s.heightMax[0] : s.heightMax) : undefined },
    price: { min: s.priceMin ? Number(Array.isArray(s.priceMin) ? s.priceMin[0] : s.priceMin) : undefined, max: s.priceMax ? Number(Array.isArray(s.priceMax) ? s.priceMax[0] : s.priceMax) : undefined },
  };
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
          <EscortFilters options={filterOptions} initial={initialFilters} />
          <EscortGrid escorts={data} />
          {meta?.pagination ? (
            <div style={{ marginTop: "var(--space-6)", display: 'flex', gap: 'var(--space-2)' }}>
              {(() => {
                const buildHref = (p: number) => {
                  const params = new URLSearchParams();
                  for (const [k, v] of Object.entries(s)) {
                    if (v == null) continue;
                    if (Array.isArray(v)) { v.forEach((vv) => params.append(k, vv)); }
                    else params.set(k, v);
                  }
                  params.set('page', String(p));
                  return `?${params.toString()}`;
                };
                return (
                  <>
                    <a className="btn bordered" href={buildHref(Math.max(1, meta.pagination.page - 1))}>Prev</a>
                    <a className="btn bordered" href={buildHref(Math.min(meta.pagination.pageCount, meta.pagination.page + 1))}>Next</a>
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}


