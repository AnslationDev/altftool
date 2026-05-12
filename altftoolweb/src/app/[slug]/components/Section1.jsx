"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionCard from "./SectionCard";
import { useFirebaseData } from "../hooks/data.service";

export function Section1({ title, brands = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const containerRef = useRef(null);
  const autoScrollRef = useRef(null);
  const trackRef = useRef(null);

  /* ── Responsive visible count ── */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w >= 1024 ? 3 : w >= 768 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, brands.length - visibleCount);

  /* ── Navigation ── */
  const goTo = useCallback(
    (index) => {
      if (isTransitioning) return;
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 450);
    },
    [isTransitioning, maxIndex]
  );

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(
    () => goTo(currentIndex === maxIndex ? 0 : currentIndex + 1),
    [currentIndex, maxIndex, goTo]
  );

  /* ── Auto-scroll ── */
  const resetAutoScroll = useCallback(() => {
    clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(next, 3500);
  }, [next]);

  useEffect(() => {
    resetAutoScroll();
    return () => clearInterval(autoScrollRef.current);
  }, [resetAutoScroll]);

  /* ── Touch / drag swipe ── */
  const touchStartX = useRef(null);
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? next() : prev();
      resetAutoScroll();
    }
    touchStartX.current = null;
  };

  const handleManualNav = (fn) => {
    fn();
    resetAutoScroll();
  };

  /* ── Card width as percentage ── */
  const cardWidthPct = 100 / visibleCount;
  const translatePct = currentIndex * cardWidthPct;

  return (
    <section className="w-full py-10 section">
      {/* Section header */}
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-(--foreground) uppercase">
            {title}
          </h2>
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleManualNav(() => goTo(i))}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-gray-900 w-6 h-2"
                    : "bg-gray-300 hover:bg-gray-400 w-2 h-2"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Carousel shell */}
      <div className="relative flex items-center" ref={containerRef}>
        {/* LEFT button */}
        <button
          onClick={() => handleManualNav(prev)}
          disabled={currentIndex === 0}
          aria-label="Previous"
          className="
            flex-shrink-0 z-10 mr-3
            w-10 h-10 rounded-full
            bg-white border border-gray-200 shadow-md
            flex items-center justify-center
            text-gray-600 hover:text-gray-900
            hover:shadow-lg hover:scale-105
            disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
            transition-all duration-200
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Track viewport — clips overflow */}
        <div
          className="flex-1 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Sliding track */}
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(-${translatePct}%)`,
              transition: "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${cardWidthPct}%` }}
              >
                {/* Card wrapper: full height, centered content */}
                <div className="h-full">
                  <SectionCard {...brand} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT button */}
        <button
          onClick={() => handleManualNav(next)}
          disabled={currentIndex === maxIndex}
          aria-label="Next"
          className="
            flex-shrink-0 z-10 ml-3
            w-10 h-10 rounded-full
            bg-white border border-gray-200 shadow-md
            flex items-center justify-center
            text-gray-600 hover:text-gray-900
            hover:shadow-lg hover:scale-105
            disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
            transition-all duration-200
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom progress bar */}
      {brands.length > visibleCount && (
        <div className="mt-6 mx-12 h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-420"
            style={{
              width: `${((currentIndex + visibleCount) / brands.length) * 100}%`,
            }}
          />
        </div>
      )}
    </section>
  );
}

export default function Section1Wrapper() {
  const { sections, brands } = useFirebaseData();
  const section = sections?.[0];
  return <Section1 title={section?.title} brands={brands ?? []} />;
}