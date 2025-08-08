import { fetchFromStrapi } from "@/lib/api";
import EscortGrid from "@/components/EscortGrid";
import type { Escort } from "@/types/strapi";

type StrapiItem<T> = { id: number; attributes: T };

type Service = { name: string; slug: string };

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Service</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  const { slug } = await params;
  // Fetch the service by slug (for title)
  const svcRes = await fetchFromStrapi<{ data: StrapiItem<Service>[] }>({
    path: "/services",
    searchParams: { "filters[slug][$eq]": slug },
  });
  const service = svcRes.data?.[0];
  // Fetch profiles filtered by this service
  const profRes = await fetchFromStrapi<{ data: Escort[] }>({
    path: "/profiles",
    searchParams: {
      "filters[services][slug][$eq]": slug,
      "populate[city]": "*",
      "populate[photos]": "*",
      "populate[rates]": "*",
      "pagination[page]": 1,
      "pagination[pageSize]": 24,
    },
  });
  const profiles: Escort[] = (profRes.data as unknown as Escort[]) || [];
  if (!service) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Service not found</h1>
      </main>
    );
  }
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{service.attributes.name}</h1>
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


