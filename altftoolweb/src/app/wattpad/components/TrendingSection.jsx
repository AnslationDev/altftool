"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StoryCard from "./StoryCard";

export default function TrendingSection({ trendingData }) {
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const stories = trendingData?.products || [];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    setCanScrollRight(!end);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (!stories.length) return null;

  return (
    <section className="wp-section">
      <div className="wp-section-header">
        <h2 className="wp-section-title">
          {trendingData?.title || "Trending Now"}
        </h2>
        <p className="wp-section-subtitle">
          {trendingData?.subtitle || "Popular stories people are loving"}
        </p>
      </div>

      <div className="wp-group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="wp-scroll-btn wp-scroll-btn-left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="wp-scroll-btn wp-scroll-btn-right"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto wp-no-scrollbar scroll-smooth px-1"
        >
          {stories.map((item, index) => (
            <StoryCard key={item.id || index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
