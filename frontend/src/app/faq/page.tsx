import { fetchFromStrapi } from "@/lib/api";
import FAQ from "@/components/FAQ";

type FAQItem = { id: number; attributes: { title?: string; content?: string } };

export default async function FAQPage() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>FAQ</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  let faq: FAQItem | undefined;
  try {
    const res = await fetchFromStrapi<{ data: FAQItem[] }>({ path: "/faqs", searchParams: { populate: "*", "pagination[page]": 1, "pagination[pageSize]": 1 } });
    faq = res.data?.[0];
  } catch {
    faq = undefined;
  }
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{faq?.attributes?.title || "FAQ"}</h1>
          <p className="hero-subtitle">Answers to common questions.</p>
        </div>
      </section>
      <FAQ title={faq?.attributes?.title} html={faq?.attributes?.content} />
    </main>
  );
}


