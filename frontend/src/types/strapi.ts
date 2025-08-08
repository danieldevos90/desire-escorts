export type StrapiMedia = {
  url: string;
  formats?: { thumbnail?: { url: string } };
};

export type BrandLink = { label: string; href: string };

export type SEOBlock = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: { data?: { attributes?: StrapiMedia } };
};

export type Brand = {
  brandName?: string;
  logoAlt?: string;
  logo?: { data?: { attributes?: StrapiMedia } };
  headerLinks?: BrandLink[];
  footerLinks?: BrandLink[];
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
};

export type Site = {
  id: number;
  attributes: {
    name: string;
    domain: string;
    brand?: Brand;
    seoDefaults?: SEOBlock;
  };
};

export type Escort = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    shortBio?: string;
    bio?: string;
    age?: number;
    height?: number;
    nationality?: string;
    city?: { data?: { attributes?: { name: string } } };
    rates?: Array<{ price?: number; duration?: string }>;
    photos?: { data?: Array<{ id?: number; attributes: StrapiMedia }> };
    tags?: Array<{ label?: string; slug?: string }>;
    attributesList?: Array<{ key?: string; value?: string }>;
    verified?: boolean;
    featured?: boolean;
  };
};

export type StrapiItem<T> = { id: number; attributes: T };


