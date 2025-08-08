type ComponentList<T> = { data?: Array<{ id?: number; attributes?: T }> } | Array<T> | undefined;

import { getAssetUrl } from "@/lib/env";
import type { Escort, StrapiMedia } from "@/types/strapi";

type Photo = StrapiMedia;

export default function ProfileDetails({ profile }: { profile: Escort }) {
  const photos: ComponentList<Photo> = profile.attributes.photos;
  const tags: ComponentList<{ label?: string }> = profile.attributes.tags;
  const attributesList: ComponentList<{ key?: string; value?: string }> = profile.attributes.attributesList;
  const rates: ComponentList<{ duration?: string; price?: number }> = profile.attributes.rates;
  const city = profile.attributes.city?.data?.attributes?.name;

  function normalizeComponentList<T>(input: ComponentList<T>): Array<{ id?: number; attributes: T }> {
    if (!input) return [];
    const maybeRel = input as { data?: Array<{ id?: number; attributes: T }> };
    if (Array.isArray(maybeRel.data)) return maybeRel.data as Array<{ id?: number; attributes: T }>;
    if (Array.isArray(input)) return (input as Array<T>).map((item) => ({ attributes: item }));
    return [];
  }

  const photoItems = normalizeComponentList<Photo>(photos);
  const tagItems = normalizeComponentList<{ label?: string }>(tags);
  const attributeItems = normalizeComponentList<{ key?: string; value?: string }>(attributesList);
  const rateItems = normalizeComponentList<{ duration?: string; price?: number }>(rates);

  return (
    <div className="container section" style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: '1fr', alignItems: 'start' }}>
      <div>
        <h1>{profile.attributes.name}</h1>
        {city && <div className="muted" style={{ marginTop: 'var(--space-1)' }}>{city}</div>}
        {profile.attributes.shortBio && <p style={{ marginTop: 'var(--space-3)' }}>{profile.attributes.shortBio}</p>}

        {/* Photos */}
        {photoItems.length > 0 && (
          <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            {photoItems.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={getAssetUrl(p.attributes?.url)} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.attributes.bio && (
          <div className="prose" style={{ marginTop: 'var(--space-8)' }} dangerouslySetInnerHTML={{ __html: profile.attributes.bio }} />
        )}
      </div>

      <aside style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <h3>Details</h3>
        <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-2)' }}>
          {attributeItems.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">{a.attributes.key}</span>
              <span>{a.attributes.value}</span>
            </div>
          ))}
        </div>

        {tagItems.length > 0 && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3>Tags</h3>
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {tagItems.map((t, i) => (
                <span key={i} className="bordered" style={{ padding: 'var(--space-1) var(--space-2)', borderRadius: '999px' }}>{t.attributes.label}</span>
              ))}
            </div>
          </div>
        )}

        {rateItems.length > 0 && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3>Rates</h3>
            <div style={{ marginTop: 'var(--space-2)', display: 'grid', gap: 'var(--space-2)' }}>
              {rateItems.map((r, i) => (
                <div key={i} className="bordered" style={{ borderRadius: 'var(--radius)', padding: 'var(--space-2) var(--space-3)', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">{r.attributes.duration}</span>
                  <span>€{r.attributes.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}


