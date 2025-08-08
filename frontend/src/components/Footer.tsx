import Link from "next/link";
import { fetchFromStrapi } from "@/lib/api";
import { headers } from "next/headers";

type BrandLink = { label: string; href: string };
type Brand = { footerLinks?: BrandLink[] };
type Site = { id: number; attributes: { domain: string; brand?: Brand } };
type SitesResponse = { data: Site[] };

export default async function Footer() {
  let links: BrandLink[] = [];
  try {
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const res = await fetchFromStrapi<SitesResponse>({ path: "/sites", searchParams: { populate: "brand", "filters[domain][$eq]": host } });
    const site = res.data?.[0];
    links = site?.attributes?.brand?.footerLinks || [];
  } catch {}
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-columns">
          <div>
            <h4>Desire</h4>
            <p className="muted">Discover verified escorts, browse cities and services.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul style={{ display: "grid", gap: "var(--space-2)" }}>
              <li><Link href="/escorts">Escorts</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/cities">Cities</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul style={{ display: "grid", gap: "var(--space-2)" }}>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><a href="#" aria-disabled>Terms</a></li>
              <li><a href="#" aria-disabled>Cookie policy</a></li>
            </ul>
          </div>
          {links?.length ? (
            <div>
              <h4>More</h4>
              <ul style={{ display: "grid", gap: "var(--space-2)" }}>
                {links.map((l, i) => (
                  <li key={`${l.href}-${i}`}><Link href={l.href}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="footer-bottom">
          <div className="container" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>© {year} Desire</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


