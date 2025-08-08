import { fetchFromStrapi } from "@/lib/api";
import ProfileDetails from "@/components/ProfileDetails";
import type { Escort } from "@/types/strapi";

type StrapiResponse<T> = { data: T };

type Profile = Escort;

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Profile</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
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
  return <ProfileDetails profile={profile} />;
}


