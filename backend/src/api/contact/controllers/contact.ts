import { factories } from '@strapi/strapi';

// Cast UID to any to avoid TS errors before Strapi type generation
export default factories.createCoreController('api::contact.contact' as any);


