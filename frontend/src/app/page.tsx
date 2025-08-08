import { fetchFromStrapi } from "@/lib/api";
import Hero from "@/components/Hero";
import EscortCarousel from "@/components/EscortCarousel";
import HomeIntro from "@/components/HomeIntro";
import HomeWhyUs from "@/components/HomeWhyUs";
import HomeBenefits from "@/components/HomeBenefits";
import HomeCTA from "@/components/HomeCTA";
import HomeNews from "@/components/HomeNews";
import type { Escort } from "@/types/strapi";

type ProfileItem = Escort;
type CityItem = { id: number; name: string; slug: string };
type Home = {
  hero?: string;
  featuredProfiles?: ProfileItem[] | { data?: ProfileItem[] };
  featuredCities?: CityItem[] | { data?: CityItem[] };
  intro?: string;
  whyUs?: string;
  benefits?: Array<{ label?: string }>;
  cta?: { phone?: string; whatsapp?: string; telegram?: string };
};

type StrapiSingleResponse<T> = { data?: { id?: number; attributes?: T } | T };

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-semibold">Desire Escorts</h1>
        <p className="text-gray-500 mt-2">Set NEXT_PUBLIC_API_URL to render homepage content from Strapi.</p>
      </main>
    );
  }

  let home: Home | undefined;
  try {
    // Prefer single-type endpoint
    const single = await fetchFromStrapi<{ data?: { id?: number; attributes?: Home } | Home }>({
      path: "/homepage",
      searchParams: { populate: "*" },
    });
    const data = single?.data as { id?: number; attributes?: Home } | Home | undefined;
    const hasAttributes = !!(data && typeof data === 'object' && 'attributes' in (data as object));
    home = hasAttributes ? ((data as { attributes?: Home }).attributes || undefined) : (data as Home | undefined);
  } catch {
    // Fallback: plural endpoint if single not available
    try {
      const list = await fetchFromStrapi<{ data?: Array<{ id: number; attributes: Home }> }>({
        path: "/homepages",
        searchParams: { populate: "*", "pagination[page]": 1, "pagination[pageSize]": 1 },
      });
      const raw = list?.data?.[0];
      home = raw ? (raw.attributes as Home) : undefined;
    } catch {
      home = undefined;
    }
  }
  // Always load featured escorts dynamically for the current site (ignore homepage.featuredProfiles)
  let featured: Escort[] = [];
  try {
    const resp = await fetchFromStrapi<{ data: Escort[] }>({
      path: "/profiles",
      searchParams: {
        "filters[featured][$eq]": true,
        "populate[photos]": "*",
        "populate[city]": "*",
        "populate[rates]": "*",
        "pagination[page]": 1,
        "pagination[pageSize]": 12,
      },
    });
    featured = (resp?.data as unknown as Escort[]) || [];
  } catch {}

  return (
    <main>
      <Hero id="hero" title="Desire Escorts" subtitle="Premium escort directory" ctaHref="/escorts" ctaLabel="Browse Escorts" />
      {/* Intro */}
      <HomeIntro id="introduction" html={home?.intro} />
      {/* Why Us */}
      <HomeWhyUs id="why-us" html={home?.whyUs} />
      {featured.length > 0 ? (
        <EscortCarousel id="featured-escorts" escorts={featured} title="Featured Escorts" />
      ) : (
        <section className="section" id="featured-escorts">
          <div className="container">
            <h2>Featured Escorts</h2>
            <p className="muted" style={{ marginTop: "var(--space-4)" }}>Add featured profiles in Strapi to see them here.</p>
          </div>
        </section>
      )}
      {/* Benefits */}
      <HomeBenefits id="benefits" items={home?.benefits} />
      {/* CTA */}
      <HomeCTA id="contact" cta={home?.cta} />
      {/* News */}
      <HomeNews />
    </main>
  );
}

// moved to component
