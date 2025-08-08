import { fetchFromStrapi } from "@/lib/api";

type StrapiItem<T> = { id: number; attributes: T };

type City = {
  name: string;
  slug: string;
  profiles?: { data: StrapiItem<{ name: string; slug: string }>[] };
};

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetchFromStrapi<{ data: StrapiItem<City>[] }>({
    path: "/cities",
    searchParams: { "filters[slug][$eq]": slug, populate: "profiles" },
  });
  const city = res.data?.[0];
  if (!city) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">City not found</h1>
      </main>
    );
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">{city.attributes.name}</h1>
      <ul className="mt-4 list-disc pl-6">
        {city.attributes.profiles?.data?.map((p) => (
          <li key={p.id}>{p.attributes.name}</li>
        ))}
      </ul>
    </main>
  );
}


