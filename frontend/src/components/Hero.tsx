type HeroProps = {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function Hero({ title, subtitle, ctaHref, ctaLabel }: HeroProps) {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {ctaHref && ctaLabel && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <a href={ctaHref} className="btn btn-secondary">{ctaLabel}</a>
          </div>
        )}
      </div>
    </section>
  );
}


