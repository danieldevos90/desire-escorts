export async function revalidateByDomains(domains: string[], tagPrefix: string = 'site:') {
  const url = process.env.NEXT_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    return;
  }
  await Promise.all(
    domains.map(async (domain) => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: `${tagPrefix}${domain}`, secret }),
        });
      } catch (err) {
        // swallow errors to not block content ops
      }
    })
  );
}


