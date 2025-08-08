import { getAssetUrl } from "@/lib/env";
import type { Escort } from "@/types/strapi";

function getImageUrl(photo?: { url: string; formats?: { thumbnail?: { url: string } } }): string | undefined {
  if (!photo) return undefined;
  return getAssetUrl(photo.formats?.thumbnail?.url || photo.url);
}

export default function EscortCard({ escort }: { escort: Escort }) {
  if (!escort || !escort.attributes) return null;
  const photo = escort.attributes.photos?.data?.[0]?.attributes;
  const img = getImageUrl(photo);
  const city = escort.attributes.city?.data?.attributes?.name;
  const rate = escort.attributes.rates?.[0]?.price;
  const slug = escort.attributes.slug || "";
  return (
    <a href={slug ? `/profiles/${slug}` : '#'} className="card" style={{ display: 'block' }}>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={escort.attributes.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
      )}
      <div className="card-body">
        <div className="card-title">{escort.attributes.name}</div>
        <div className="card-subtitle" style={{ marginTop: 'var(--space-1)' }}>
          {city ? city : '—'} {rate ? `• €${rate}` : ''}
        </div>
        {escort.attributes.shortBio && (
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text)' }}>
            {escort.attributes.shortBio}
          </p>
        )}
      </div>
    </a>
  );
}


