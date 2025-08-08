import { fetchFromStrapi } from "@/lib/api";
import Hero from "@/components/Hero";
import EscortGrid from "@/components/EscortGrid";
import Link from "next/link";
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
  featuredProfiles?: ProfileItem[];
  featuredCities?: CityItem[];
  intro?: string;
  whyUs?: string;
  benefits?: Array<{ label?: string }>;
  cta?: { phone?: string; whatsapp?: string; telegram?: string };
};

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
    const res = await fetchFromStrapi<{ data: Home }>({
      path: "/homepage",
      searchParams: { populate: "*" },
    });
    home = res.data;
  } catch {
    home = undefined;
  }
  // Normalize featured profiles to EscortGrid shape
  const featured: Escort[] = Array.isArray(home?.featuredProfiles)
    ? (home!.featuredProfiles as unknown as Escort[])
    : [];

  return (
    <main>
      <Hero title="Desire Escorts" subtitle="Premium escort directory" ctaHref="/escorts" ctaLabel="Browse Escorts" />
      {/* Intro */}
      <HomeIntro html={home?.intro} />
      {/* Why Us */}
      <HomeWhyUs html={home?.whyUs} />
      <section className="section">
        <div className="container">
          <h2>Featured Escorts</h2>
          <div style={{ marginTop: "var(--space-4)" }}>
            {featured.length > 0 ? (
              <EscortGrid escorts={featured} />
            ) : (
              <p className="muted">Add featured profiles in Strapi to see them here.</p>
            )}
          </div>
        </div>
      </section>
      {/* Benefits */}
      <HomeBenefits items={home?.benefits} />
      {/* CTA */}
      <HomeCTA cta={home?.cta} />
      {/* News */}
      <HomeNews />
    </main>
  );
}

// moved to component
