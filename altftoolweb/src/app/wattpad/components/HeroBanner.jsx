"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const heroImages = [
  "/wattpad/hero/banner-watt2.png",
  "/wattpad/hero/banner-wattpad.png",
  "/wattpad/hero/banner-wattpad3.png",
];

export default function HeroBanner({ loading = false }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prev = useCallback(
    () => setIndex((p) => (p - 1 + heroImages.length) % heroImages.length),
    [],
  );

  const next = useCallback(
    () => setIndex((p) => (p + 1) % heroImages.length),
    [],
  );

  useEffect(() => {
    const interval = setInterval(next, isHovered ? 2000 : 3500);
    return () => clearInterval(interval);
  }, [isHovered, next]);

  return (
    <section className="wp-section">
      <div className="wp-hero wp-hero-group">
        <div
          className="wp-hero-slide"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full h-full">
            {heroImages.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`Hero banner ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover object-[center_top] sm:object-[center_20%] md:object-[center_30%] lg:object-[center_40%] xl:object-center transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="wp-hero-overlay" />
          </div>

          <div className="absolute left-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-start pl-2 sm:pl-3 lg:pl-5">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="wp-hero-btn"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="absolute right-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-end pr-2 sm:pr-3 lg:pr-5">
            <button
              onClick={next}
              aria-label="Next slide"
              className="wp-hero-btn"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-2.5">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`wp-hero-dot ${i === index ? "wp-hero-dot-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
