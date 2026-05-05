"use client";

import { useRef, useEffect, useState } from "react";

export default function CategoryFilter({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Scroll active pill into view (natural behavior)
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeCategory]);

  // Check overflow
  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollWidth > el.clientWidth);
  };

  // Fade indicators
  const updateFades = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 8
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkOverflow();
    updateFades();

    const handleResize = () => {
      checkOverflow();
      updateFades();
    };

    el.addEventListener("scroll", updateFades);
    window.addEventListener("resize", handleResize);

    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories]);

  return (
    <div className="relative w-full mt-4 mb-6">
      {/* Left fade */}
      {showLeftFade && (
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10"
          
        />
      )}

      {/* Right fade */}
      {showRightFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10"
          style={{
            background:
              "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={`flex gap-1.5 overflow-x-auto no-scrollbar px-3
          ${isOverflowing ? "justify-start" : "justify-center"}
          snap-x snap-mandatory scroll-smooth`}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              ref={isActive ? activeRef : null}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border first:ml-1 last:mr-1"
              style={{
                backgroundColor: isActive
                  ? "var(--primary)"
                  : "transparent",
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                borderColor: isActive
                  ? "var(--primary)"
                  : "var(--border)",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}