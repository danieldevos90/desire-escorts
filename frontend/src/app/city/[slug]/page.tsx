import { fetchFromStrapi } from "@/lib/api";
import EscortGrid from "@/components/EscortGrid";
import type { Escort } from "@/types/strapi";

type StrapiItem<T> = { id: number; attributes: T };

type City = { name: string; slug: string };

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>City</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const { slug } = await params;
  const cityRes = await fetchFromStrapi<{ data: StrapiItem<City>[] }>({
    path: "/cities",
    searchParams: { "filters[slug][$eq]": slug },
  });
  const city = cityRes.data?.[0];
  const profRes = await fetchFromStrapi<{ data: Escort[] }>({
    path: "/profiles",
    searchParams: {
      "filters[city][slug][$eq]": slug,
      "populate[city]": "*",
      "populate[photos]": "*",
      "populate[rates]": "*",
      "pagination[page]": 1,
      "pagination[pageSize]": 24,
    },
  });
  const profiles: Escort[] = (profRes.data as unknown as Escort[]) || [];
  if (!city) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">City not found</h1>
      </main>
    );
  }
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{city.attributes.name}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <EscortGrid escorts={profiles} />
        </div>
      </section>
    </main>
  );
}


