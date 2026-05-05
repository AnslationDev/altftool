"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SaleCard from "./SaleCard";

export default function TrendingSales({ trendingSales }) {
  const scrollRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const products = trendingSales?.products || [];

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

  // Optional: avoid rendering empty section
  if (!products.length) return null;

  return (
    <section className="section bg-(--background)">
      {/* Heading */}
      <div className="mb-6 md:mb-8">
        <h2 className="section-title text-left! mb-2">
          {trendingSales?.title || "Trending Deals"}
        </h2>

        <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary">
          {trendingSales?.subtitle ||
            "Discover today’s top trending sales"}
        </p>
      </div>

      {/* Wrapper */}
      <div
        className="relative rounded-3xl p-5 md:p-6"
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* LEFT BTN */}
        {isHovered && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 items-center justify-center group cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 group-hover:scale-115" />
          </button>
        )}

        {/* RIGHT BTN */}
        {isHovered && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg text-gray-800 items-center justify-center  group cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 group-hover:scale-115" />
          </button>
        )}

        {/* CARDS */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar overflow-y-hidden scroll-smooth"
        >
          {products.map((item, index) => (
            <SaleCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}