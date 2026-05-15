"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FanficCard from "./FanficCard";

export default function AutoScrollRow({ items, reverse = false }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const duration = Math.max(safeItems.length * 3, 12);
  // const totalOffset = manualOffset + dragOffset;

  const handleScrollBtn = (dir) => {

  if (!trackRef.current) return;

  setPaused(true);

  trackRef.current.scrollBy({
    left: dir === "left" ? -320 : 320,
    behavior: "smooth",
  });

  setTimeout(() => {
    setPaused(false);
  }, 1200);

};

 const trackStyle = {
  display: "flex",
  gap: "0.75rem",

  animationName: reverse
    ? "marquee-left"
    : "marquee-right",

  animationDuration: `${duration}s`,
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",

  animationPlayState: paused
    ? "paused"
    : "running",

  cursor: "grab",
  userSelect: "none",
  willChange: "transform",
};

  return (
    <>
      <style>{`
        @keyframes marquee-right {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-left {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div
        className="relative group overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* LEFT BUTTON */}
        <button
          onClick={() => handleScrollBtn("left")}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 items-center justify-center
            opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
          
          </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => handleScrollBtn("right")}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20
           h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 items-center justify-center cursor-pointer
            opacity-0 group-hover:opacity-100 transition "
        >
          <ChevronRight className="h-5 w-5 " />
        </button>

        {/*
          Outer wrapper handles the manual/drag nudge with a smooth CSS transition.
          Inner track handles the infinite CSS marquee animation.
          Keeping them separate means neither interferes with the other.
        */}
        <div
           ref={trackRef}
  className="overflow-x-auto no-scrollbar scroll-smooth"
        >
          <div style={trackStyle}>
            {/* Original set */}
            {safeItems.map((item) => (
              <div key={`orig-${item.id}`} className="shrink-0">
                <FanficCard item={item} />
              </div>
            ))}
            {/* Clone set — purely for seamless loop; hidden from assistive tech */}
            {safeItems.map((item) => (
              <div key={`clone-${item.id}`} className="shrink-0" aria-hidden="true">
                <FanficCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
