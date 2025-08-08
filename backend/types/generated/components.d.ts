import type { Schema, Struct } from '@strapi/strapi';

export interface AttributeAttribute extends Struct.ComponentSchema {
  collectionName: 'components_profile_attributes';
  info: {
    displayName: 'Attribute';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

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
    footerLinks: Schema.Attribute.Component<'navigation.link', true>;
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

export interface NavigationLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface TagTag extends Struct.ComponentSchema {
  collectionName: 'components_common_tags';
  info: {
    displayName: 'Tag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.UID<'label'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'attribute.attribute': AttributeAttribute;
      'availability.availability': AvailabilityAvailability;
      'brand.brand': BrandBrand;
      'contact.contact': ContactContact;
      'navigation.link': NavigationLink;
      'rate-item.rate-item': RateItemRateItem;
      'seo.seo': SeoSeo;
      'site-overrides.site-overrides': SiteOverridesSiteOverrides;
      'tag.tag': TagTag;
    }
  }
}
