"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {trendingfirebase} from "../service/firebasetrendingdeals"
import Link from "next/link";
import { TrendingPriceSkeleton } from "../DealsPageSkeleton";

function TrendingPrice() {

    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = trendingfirebase((data) => {
        setTrending(data);
  
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);

  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);

    // check if reached end
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    setCanScrollRight(!isAtEnd);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);

    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <TrendingPriceSkeleton />;

  return (
    <div className="section animate-slide-up">
      <div className="mb-8">
        <h2 className="section-title">Trending Deals Right Now</h2>
        <p className="section-subtitle !mx-0 text-left">
          Popular offers people are grabbing today
        </p>
      </div>

      {/* Wrapper with hover detection — desktop only */}
      <div
        className="relative h-full"
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Chevron — hidden on mobile/tablet */}
        {isHovered && window.innerWidth >= 1024 && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className={`
            hidden lg:flex
            absolute left-5 top-[38%] -translate-y-1/2 -translate-x-4 z-10
            items-center justify-center
            w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100
            text-gray-700 hover:bg-gray-50 active:scale-95
            transition-all duration-200 cursor-pointer
            ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
            ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 active:scale-95"}
          `}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
        )}

        {/* Scrollable Row */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }} // smooth momentum scroll on iOS
          >
            {trending.map((item, i) => (
              <div key={i} className="flex-shrink-0 animate-slide-right">
                <PriceCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Chevron — hidden on mobile/tablet */}
        {isHovered && window.innerWidth >= 1024 && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className={`
            hidden lg:flex
            absolute right-5 top-[38%] -translate-y-1/2 translate-x-4 z-10
            items-center justify-center
            w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100
            text-gray-700 hover:bg-gray-50 active:scale-95
            transition-all duration-200 cursor-pointer
            ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
          `}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TrendingPrice;

function PriceCard({ item }) {
  return (
    <Link href={item.link} target="_blank">
      <div className="sm:w-60 w-44 cursor-pointer">
        <div className="sm:h-60 h-40 relative overflow-hidden sm:rounded-3xl rounded-2xl">
          <Image
            src={item.image}
            alt="deal"
            fill
            sizes="(max-width: 640px) 176px, 240px"
            className="object-cover"
          />
        </div>
        <div className="py-1 text-center">
          <div className="text-lg sm:text-xl font-bold">
            {item.title} ₹{item.price}
          </div>
          <div className="sm:text-lg text-md break-words">
            {item.description}
          </div>
        </div>
      </div>
    </Link>
  );
}
