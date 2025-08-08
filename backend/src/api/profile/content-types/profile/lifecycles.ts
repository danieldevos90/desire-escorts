export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (!data.sites || data.sites.length === 0) {
      throw new Error('At least one Site must be selected.');
    }
  },
  async afterCreate(event: any) {
    const { result } = event;
    const domains = (result.sites || []).map((s: any) => s.domain).filter(Boolean);
    const { revalidateByDomains } = await import('../../../../utils/revalidate');
    await revalidateByDomains(domains);
  },
  async afterUpdate(event: any) {
    const { result } = event;
    const domains = (result.sites || []).map((s: any) => s.domain).filter(Boolean);
    const { revalidateByDomains } = await import('../../../../utils/revalidate');
    await revalidateByDomains(domains);
  },
};


