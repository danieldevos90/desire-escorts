export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (!data.sites || data.sites.length === 0) {
      throw new Error('At least one Site must be selected.');
    }
  },
};


