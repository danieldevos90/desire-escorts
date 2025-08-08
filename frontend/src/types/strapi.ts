export type StrapiMedia = {
  url: string;
  formats?: { thumbnail?: { url: string } };
};

export type Escort = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    shortBio?: string;
    bio?: string;
    city?: { data?: { attributes?: { name: string } } };
    rates?: Array<{ price?: number; duration?: string }>;
    photos?: { data?: Array<{ id?: number; attributes: StrapiMedia }> };
    tags?: Array<{ label?: string }>;
    attributesList?: Array<{ key?: string; value?: string }>;
    verified?: boolean;
    featured?: boolean;
  };
};

export type StrapiItem<T> = { id: number; attributes: T };


