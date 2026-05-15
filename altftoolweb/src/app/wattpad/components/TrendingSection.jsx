"use client";

import React, { useRef, useState, useEffect } from "react";
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
    <section className="section bg-(--background)">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <h2 className="section-title text-left mb-2">
          {trendingData?.title || "Trending Now"}
        </h2>

        <p className="text-(--muted-foreground) text-sm md:text-lg">
          {trendingData?.subtitle || "Popular stories people are loving"}
        </p>
      </div>

      {/* WRAPPER */}
      <div className="relative group">
        
        {/* LEFT BUTTON */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 
           h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 
            items-center justify-center cursor-pointer
            opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* RIGHT BUTTON */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 
            h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 
            items-center justify-center cursor-pointer
            opacity-0 group-hover:opacity-100 transition-all duration-300 "
          >
            <ChevronRight className="h-5 w-5 " />
          </button>
        )}

      
              {/* SCROLL AREA */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-1"
        >
          {stories.map((item, index) => (
            <StoryCard key={item.id || index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}