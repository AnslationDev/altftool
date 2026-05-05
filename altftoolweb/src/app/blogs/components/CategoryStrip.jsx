"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryStrip({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const handleClick = (name) => {
    setActiveCategory(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (!scrollRef.current) return;

      const isMobile = window.innerWidth < 768;
      const hasOverflow =
        scrollRef.current.scrollWidth >
        scrollRef.current.clientWidth + 4;

      setShowArrows(isMobile && hasOverflow);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        direction === "right"
          ? scrollRef.current.clientWidth * 0.7
          : -scrollRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  return (
    <section className="my-6">
      <div className="relative mx-auto max-w-7xl px-4">

        {/* LEFT ARROW */}
        {showArrows && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="
              absolute left-1 top-1/2 -translate-y-1/2 z-20
              md:hidden
              bg-[var(--card)] border border-[var(--border)]
              rounded-full p-2 shadow-md
            "
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* CATEGORY STRIP */}
        <div
          ref={scrollRef}
          className="
            flex gap-4
            px-8 md:px-0
            overflow-x-auto md:overflow-x-visible
            scroll-smooth no-scrollbar
          "
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleClick(cat.name)}
                className={`
                  group flex-shrink-0 md:flex-shrink
                  rounded-xl border
                  cursor-pointer
                  transition-all duration-300 ease-out
                  focus:outline-none

                  ${
                    isActive
                      ? "border-[var(--primary)] shadow-md"
                      : "border-[var(--border)]"
                  }

                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:border-[var(--primary)]

                  w-[160px]
                  sm:w-[180px]
                  md:w-[200px]
                `}
              >
                {/* IMAGE */}
                <div
                  className="
                    relative w-full
                    h-[120px]        
                    sm:h-[140px]
                    md:h-[160px]
                    overflow-hidden
                    rounded-t-xl
                  "
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="
                      object-cover object-center
                      transition-transform duration-500 ease-out
                      group-hover:scale-[1.04] /* ⬅ safer scale */
                    "
                  />
                </div>

                {/* TEXT */}
                <div className="bg-[var(--card)] px-3 py-2 text-center rounded-b-xl">
                  <p
                    className="
                      text-xs sm:text-sm font-semibold
                      transition-colors duration-300
                      group-hover:text-[var(--primary)]
                    "
                  >
                    {cat.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT ARROW */}
        {showArrows && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="
              absolute right-1 top-1/2 -translate-y-1/2 z-20
              md:hidden
              bg-[var(--card)] border border-[var(--border)]
              rounded-full p-2 shadow-md
            "
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
