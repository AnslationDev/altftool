"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { trending } from "@/app/top9/data2/trending";

const Hero = () => {
  const scrollRef = useRef(null);
  const categoryRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);

    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  const scrollCategories = (dir) => {
    categoryRef.current?.scrollBy({
      left: dir === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#E0A028] py-8 overflow-hidden w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8">

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl md:text-4xl font-light text-center text-(--primary) mb-10">
          227,193 top nine lists for everything under (& including) the sun.
        </h1>

        {/* Trending Slider (same as before) */}
        <div className="relative mb-10">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center bg-[#c58b1e] text-white rounded-full"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
          >
            {trending.map((item) => (
              <Link
                key={item.slug}
                href={`/top9/${item.slug}`}
                className="relative flex-shrink-0 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[240px] lg:h-[240px] overflow-hidden group"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <span className="text-white/80 text-xs uppercase">
                    {item.prefix}
                  </span>
                  <p className="text-white font-bold uppercase">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center bg-[#c58b1e] text-white rounded-full"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto relative mb-8 px-2">
          <input
            type="text"
            placeholder="What's your passion?"
            className="w-full py-5 pl-6 pr-16 bg-white rounded-sm text-grey-600"
          />
          <Search className="absolute right-7 top-1/2 -translate-y-1/2" />
        </div>

        {/* CATEGORY BAR (UPDATED LIKE IMAGE) */}
        <div className="flex items-center max-w-6xl mx-auto bg-[#c58b1e] rounded-full px-2 py-2 shadow-inner">

          <button
            onClick={() => scrollCategories("left")}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <ChevronLeft />
          </button>

          <div
            ref={categoryRef}
            className="flex-1 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-3 whitespace-nowrap px-2">
              {["TV","Anime","Music","Movies","Countries","2024","Disney","Food","Football","Rap","Games","Metal","Singers","Sports"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2  text-white text-sm bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <ChevronRight />
          </button>

        </div>

      </div>
    </section>
  );
};

export default Hero;