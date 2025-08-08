import { fetchFromStrapi } from "@/lib/api";

type StrapiResponse<T> = { data: T };

type Profile = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    shortBio?: string;
  };
};

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetchFromStrapi<StrapiResponse<Profile[]>>({
    path: "/profiles",
    searchParams: {
      "filters[slug][$eq]": slug,
      "populate": "*",
    },
  });
  const profile = res.data?.[0];
  if (!profile) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Profile not found</h1>
      </main>
    );
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">{profile.attributes.name}</h1>
      {profile.attributes.shortBio && (
        <p className="text-gray-600 mt-2">{profile.attributes.shortBio}</p>
      )}
    </main>
  );
}


