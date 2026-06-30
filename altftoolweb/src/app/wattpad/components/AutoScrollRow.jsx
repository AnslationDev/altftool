"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FanficCard from "./FanficCard";

export default function AutoScrollRow({ items, reverse = false }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const duration = Math.max(safeItems.length * 3, 12);

  const handleScrollBtn = (dir) => {
    if (!trackRef.current) return;
    setPaused(true);
    trackRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
    setTimeout(() => setPaused(false), 1200);
  };

  return (
    <div
      className="wp-group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        onClick={() => handleScrollBtn("left")}
        className="wp-scroll-btn wp-scroll-btn-left"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => handleScrollBtn("right")}
        className="wp-scroll-btn wp-scroll-btn-right"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div ref={trackRef} className="overflow-x-auto wp-no-scrollbar scroll-smooth">
        <div
          className={`wp-marquee-track ${reverse ? "wp-marquee-track-reverse" : "wp-marquee-track-forward"} ${paused ? "wp-marquee-paused" : ""}`}
          style={{ animationDuration: `${duration}s` }}
        >
          {safeItems.map((item) => (
            <div key={`orig-${item.id}`} className="shrink-0">
              <FanficCard item={item} />
            </div>
          ))}
          {safeItems.map((item) => (
            <div key={`clone-${item.id}`} className="shrink-0" aria-hidden="true">
              <FanficCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
