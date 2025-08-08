import type { Escort } from "@/types/strapi";
import Carousel from "./Carousel";
import EscortCard from "./EscortCard";

type Props = {
  escorts: Escort[];
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
};

export default function EscortCarousel({ escorts, title, subtitle, className = "", id }: Props) {
  if (!escorts || escorts.length === 0) return null;
  return (
    <section className={["section", className].filter(Boolean).join(" ")} id={id}>      
      <div className="container">
        {(title || subtitle) && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
        )}
        <Carousel ariaLabel="Escort carousel" itemWidth={300}>
          {escorts.map((e) => (
            <div className="carousel-item" key={e.id}>
              <EscortCard escort={e} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}


