import { fetchFromStrapi } from "@/lib/api";

type StrapiItem<T> = { id: number; attributes: T };

type Service = {
  name: string;
  slug: string;
  profiles?: { data: StrapiItem<{ name: string; slug: string }>[] };
};

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetchFromStrapi<{ data: StrapiItem<Service>[] }>({
    path: "/services",
    searchParams: { "filters[slug][$eq]": slug, populate: "profiles" },
  });
  const service = res.data?.[0];
  if (!service) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Service not found</h1>
      </main>
    );
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">{service.attributes.name}</h1>
      <ul className="mt-4 list-disc pl-6">
        {service.attributes.profiles?.data?.map((p) => (
          <li key={p.id}>{p.attributes.name}</li>
        ))}
      </ul>
    </main>
  );
}


