import { fetchFromStrapi } from "@/lib/api";

type Home = {
  hero?: string;
  featuredProfiles?: { data: { id: number; attributes: { name: string; slug: string } }[] };
  featuredCities?: { data: { id: number; attributes: { name: string; slug: string } }[] };
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
    const res = await fetchFromStrapi<{ data: { id: number; attributes: Home } }>({
      path: "/homepage",
      searchParams: { populate: "featuredProfiles,featuredCities" },
    });
    home = res.data?.attributes;
  } catch {
    home = undefined;
  }
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold">Desire Escorts</h1>
      {home?.hero ? (
        <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: home.hero }} />
      ) : (
        <p className="text-gray-500 mt-2">Homepage content not available yet. Create the single type in Strapi.</p>
      )}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Featured Profiles</h2>
        <ul className="mt-3 list-disc pl-6">
          {home?.featuredProfiles?.data?.map((p) => (
            <li key={p.id}>{p.attributes.name}</li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Featured Cities</h2>
        <ul className="mt-3 list-disc pl-6">
          {home?.featuredCities?.data?.map((c) => (
            <li key={c.id}>{c.attributes.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
