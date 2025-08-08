import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/general.css";
import AgeGate from "@/components/AgeGate";
import CookieConsent from "@/components/CookieConsent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Desire Escorts",
    template: "%s | Desire Escorts",
  },
  description: "Headless migration starter",
};

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
