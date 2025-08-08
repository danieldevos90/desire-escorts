import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { fetchFromStrapi, resolveMediaUrl } from "@/lib/api";
import type { Brand, Site } from "@/types/strapi";

type SitesResponse = { data: Site[] };

export default async function Header() {
  let brand: Brand | undefined;
  try {
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const res = await fetchFromStrapi<SitesResponse>({
      path: "/sites",
      searchParams: { populate: "brand.logo,brand.headerLinks", "filters[domain][$eq]": host },
    });
    brand = res.data?.[0]?.attributes?.brand;
  } catch {}

  const links = brand?.headerLinks?.length ? brand.headerLinks : [
    { label: "Escorts", href: "/escorts" },
    { label: "Services", href: "/services" },
    { label: "Cities", href: "/cities" },
    { label: "FAQ", href: "/faq" },
  ];

  const logoUrl = resolveMediaUrl(brand?.logo?.data?.attributes?.url);
  const logoAlt = brand?.logoAlt || brand?.brandName || "Logo";

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="text-primary" style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={120} height={40} style={{ height: 40, width: "auto" }} />
          ) : (
            <span>{brand?.brandName || "Desire"}</span>
          )}
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-secondary">{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}


