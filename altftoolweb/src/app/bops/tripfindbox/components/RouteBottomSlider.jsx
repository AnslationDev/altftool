"use client";

import Link from "next/link";
import { useRef } from "react";
import { tfbPath } from "@/app/bops/tripfindbox/lib/tfbLink";

export default function RouteBottomSlider({ title, items }) {
  const rowRef = useRef(null);

  function scrollRow(direction) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({
      left: direction === "next" ? row.clientWidth * 0.82 : -row.clientWidth * 0.82,
      behavior: "smooth",
    });
  }

  return (
    <section className="route-bottom-slider" aria-label={title}>
      <div className="route-bottom-slider-inner">
        <h2>{title}</h2>
        <div className="route-bottom-slider-shell">
          <button
            className="route-bottom-slider-nav is-prev"
            type="button"
            aria-label="Previous routes"
            onClick={() => scrollRow("prev")}
          >
            ‹
          </button>
          <div ref={rowRef} className="route-bottom-slider-row">
            {items.map((item) => (
              <Link key={item.slug} className="route-bottom-slider-card" href={tfbPath(`/${item.slug}`)}>
                <img src={item.image} alt="" loading="lazy" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
          <button
            className="route-bottom-slider-nav is-next"
            type="button"
            aria-label="Next routes"
            onClick={() => scrollRow("next")}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
