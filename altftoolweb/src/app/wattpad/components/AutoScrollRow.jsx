"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FanficCard from "./FanficCard";

export default function AutoScrollRow({ items, reverse = false }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0); // from button clicks
  const [dragOffset, setDragOffset] = useState(0);     // live drag delta
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(null);

  // --- Drag support ---
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onDown = (e) => {
      setIsDragging(true);
      setPaused(true);
      dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
      setDragOffset(0);
    };

    const onMove = (e) => {
      if (dragStartX.current === null) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setDragOffset(x - dragStartX.current);
    };

    const onUp = () => {
      // Absorb drag delta into manual offset so card position doesn't snap back
      setManualOffset((prev) => prev + dragOffset);
      setDragOffset(0);
      setIsDragging(false);
      setPaused(false);
      dragStartX.current = null;
    };

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    return () => {
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      track.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragOffset]);

  // ~3s per card — adjust to taste
  const duration = items.length * 3;
  const totalOffset = manualOffset + dragOffset;

  const handleScrollBtn = (dir) => {
    setPaused(true);
    setManualOffset((prev) => prev + (dir === "left" ? 300 : -300));
    // Resume auto-scroll after user has had a moment to browse
    setTimeout(() => setPaused(false), 1200);
  };

  const trackStyle = {
    display: "flex",
    gap: "1rem",
    animation: `${reverse ? "marquee-left" : "marquee-right"} ${duration}s linear infinite`,
    animationPlayState: paused ? "paused" : "running",
    cursor: isDragging ? "grabbing" : "grab",
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
        onMouseLeave={() => !isDragging && setPaused(false)}
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
          style={{
            transform: `translateX(${totalOffset}px)`,
            transition: isDragging ? "none" : "transform 0.4s ease",
          }}
        >
          <div ref={trackRef} style={trackStyle}>
            {/* Original set */}
            {items.map((item) => (
              <div key={`orig-${item.id}`} className="shrink-0">
                <FanficCard item={item} />
              </div>
            ))}
            {/* Clone set — purely for seamless loop; hidden from assistive tech */}
            {items.map((item) => (
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