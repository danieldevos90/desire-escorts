import { fetchFromStrapi } from "@/lib/api";

type Contact = { id: number; attributes: { title?: string; content?: string; phone?: string; email?: string; whatsapp?: string; address?: string } };

export default async function ContactPage() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="container section">
        <h1>Contact</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>Set NEXT_PUBLIC_API_URL to load data from Strapi.</p>
      </main>
    );
  }
  let contact: Contact | undefined;
  try {
    const res = await fetchFromStrapi<{ data: Contact[] }>({ path: "/contacts", searchParams: { populate: "*", "pagination[page]": 1, "pagination[pageSize]": 1 } });
    contact = res.data?.[0];
  } catch {
    contact = undefined;
  }
  const c = contact?.attributes || {};
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{c.title || "Contact"}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {c.content ? <div className="prose" dangerouslySetInnerHTML={{ __html: c.content }} /> : <p className="muted">No details available.</p>}
          <div style={{ marginTop: 'var(--space-4)' }}>
            {c.phone && <div>Phone: {c.phone}</div>}
            {c.email && <div>Email: {c.email}</div>}
            {c.whatsapp && <div>WhatsApp: {c.whatsapp}</div>}
            {c.address && <div>Address: {c.address}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}


