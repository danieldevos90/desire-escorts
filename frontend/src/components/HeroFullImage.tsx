import Button from "./Button";

type HeroFullImageProps = {
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  overlay?: boolean;
};

export default function HeroFullImage({
  imageUrl,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  overlay = true,
}: HeroFullImageProps) {
  return (
    <section className="hero-full">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden
      />
      {overlay && <div className="hero-overlay" aria-hidden />}
      <div className="hero-content">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
          {ctaHref && ctaLabel && (
            <div style={{ marginTop: "var(--space-6)" }}>
              <Button href={ctaHref} variant="secondary" size="lg">
                {ctaLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


