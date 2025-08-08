import type { Schema, Struct } from '@strapi/strapi';

export interface AvailabilityAvailability extends Struct.ComponentSchema {
  collectionName: 'components_availability_availabilities';
  info: {
    displayName: 'Availability';
  };
  attributes: {
    dayOfWeek: Schema.Attribute.Enumeration<
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    >;
    endTime: Schema.Attribute.String;
    startTime: Schema.Attribute.String;
  };
}

export interface BrandBrand extends Struct.ComponentSchema {
  collectionName: 'components_brand_brands';
  info: {
    displayName: 'Brand';
  };
  attributes: {
    fontFamily: Schema.Attribute.String;
    logo: Schema.Attribute.Media;
    primaryColor: Schema.Attribute.String;
    secondaryColor: Schema.Attribute.String;
  };
}

export interface ContactContact extends Struct.ComponentSchema {
  collectionName: 'components_contact_contacts';
  info: {
    displayName: 'Contact';
  };
  attributes: {
    phone: Schema.Attribute.String;
    telegram: Schema.Attribute.String;
    whatsapp: Schema.Attribute.String;
  };
}

export interface RateItemRateItem extends Struct.ComponentSchema {
  collectionName: 'components_rate_item_rate_items';
  info: {
    displayName: 'RateItem';
  };
  attributes: {
    currency: Schema.Attribute.String;
    includes: Schema.Attribute.Text;
    label: Schema.Attribute.String;
    price: Schema.Attribute.Decimal;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'SEO';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    ogImage: Schema.Attribute.Media;
  };
}

export interface SiteOverridesSiteOverrides extends Struct.ComponentSchema {
  collectionName: 'components_site_overrides';
  info: {
    displayName: 'SiteOverrides';
  };
  attributes: {
    customSEO: Schema.Attribute.Component<'seo.seo', false>;
    customSlug: Schema.Attribute.String;
    isFeatured: Schema.Attribute.Boolean;
    site: Schema.Attribute.Relation<'oneToOne', 'api::site.site'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'availability.availability': AvailabilityAvailability;
      'brand.brand': BrandBrand;
      'contact.contact': ContactContact;
      'rate-item.rate-item': RateItemRateItem;
      'seo.seo': SeoSeo;
      'site-overrides.site-overrides': SiteOverridesSiteOverrides;
    }
  }
}
