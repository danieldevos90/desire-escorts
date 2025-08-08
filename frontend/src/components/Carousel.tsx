"use client";

import { PropsWithChildren, useRef } from "react";
import Button from "./Button";

type CarouselProps = {
  ariaLabel?: string;
  itemWidth?: number; // px, for scroll amount
  className?: string;
  showNav?: boolean;
};

export default function Carousel({
  ariaLabel = "carousel",
  itemWidth = 300,
  className = "",
  showNav = true,
  children,
}: PropsWithChildren<CarouselProps>) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollByAmount(amount: number): void {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className={["carousel", className].filter(Boolean).join(" ")}>
      {showNav && (
        <div className="carousel-nav">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous"
            onClick={() => scrollByAmount(-itemWidth)}
          >
            ◀
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next"
            onClick={() => scrollByAmount(itemWidth)}
          >
            ▶
          </Button>
        </div>
      )}
      <div
        aria-label={ariaLabel}
        className="carousel-track"
        ref={trackRef}
      >
        {children}
      </div>
    </div>
  );
}


