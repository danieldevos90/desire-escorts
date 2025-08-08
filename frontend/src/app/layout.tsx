import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "../styles/general.css";
import AgeGate from "@/components/AgeGate";
import CookieConsent from "@/components/CookieConsent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchFromStrapi, resolveMediaUrl } from "@/lib/api";
import type { SEOBlock, Site } from "@/types/strapi";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  let seo: SEOBlock | undefined;
  try {
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const res = await fetchFromStrapi<{ data: Site[] }>({
      path: "/sites",
      searchParams: { populate: "seoDefaults", "filters[domain][$eq]": host },
    });
    seo = res.data?.[0]?.attributes?.seoDefaults;
  } catch {}

  const meta: Metadata = {
    title: {
      default: seo?.metaTitle || "Desire Escorts",
      template: `%s | ${seo?.metaTitle || "Desire Escorts"}`,
    },
    description: seo?.metaDescription || "Headless migration starter",
    openGraph: (() => {
      const og = resolveMediaUrl(seo?.ogImage?.data?.attributes?.url);
      return og ? { images: [{ url: og }] } : undefined;
    })(),
  };
  return meta;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/theme.css" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AgeGate>
          <Header />
          {children}
        </AgeGate>
        <CookieConsent />
        <Footer />
      </body>
    </html>
  );
}
