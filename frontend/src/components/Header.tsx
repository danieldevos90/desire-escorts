import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="text-primary" style={{ fontWeight: 800 }}>Desire</Link>
        <nav className="nav">
          <Link href="/escorts" className="text-secondary">Escorts</Link>
          <Link href="/services" className="text-secondary">Services</Link>
          <Link href="/cities" className="text-secondary">Cities</Link>
          <Link href="/faq" className="text-secondary">FAQ</Link>
        </nav>
      </div>
    </header>
  );
}


