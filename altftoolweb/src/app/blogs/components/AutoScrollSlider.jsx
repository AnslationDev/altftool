"use client";

import { useEffect, useRef } from "react";

export default function AutoScrollSlider({ children, className = "" }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let intervalId;
    const startScroll = () => {
      intervalId = setInterval(() => {
        // If we are near the end, reset to start
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll by one full viewport width of the container
          el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
        }
      }, 4000);
    };

    startScroll();

    // Pause auto-scroll on hover or touch
    const pauseScroll = () => clearInterval(intervalId);
    const resumeScroll = () => startScroll();

    el.addEventListener("mouseenter", pauseScroll);
    el.addEventListener("mouseleave", resumeScroll);
    el.addEventListener("touchstart", pauseScroll);
    el.addEventListener("touchend", resumeScroll);

    return () => {
      clearInterval(intervalId);
      if (el) {
        el.removeEventListener("mouseenter", pauseScroll);
        el.removeEventListener("mouseleave", resumeScroll);
        el.removeEventListener("touchstart", pauseScroll);
        el.removeEventListener("touchend", resumeScroll);
      }
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide ${className}`}
    >
      {children}
    </div>
  );
}
