"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PopularSalesSkeleton } from "../DealsPageSkeleton";
import { upcomingfirebase } from "../service/firebasebrand";

import Link from "next/link";

function UpcomingDeals() {
  const [upcoming , setUpcoming] = useState([])
  const [loading, setLoading] = useState(true);

  const items = upcoming ;
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const scrollRef = useRef(null);


  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) next(); // swipe left
    if (diff < -50) prev(); // swipe right
  };
  
useEffect(() => {
  const unsub = upcomingfirebase((data) => {
    setUpcoming(data);
    setLoading(false); // ✅ IMPORTANT
  });

  return () => unsub();
}, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setVisibleCards(1);
        setIsMobileOrTablet(true);
      } else if (width < 1024) {
        setVisibleCards(2);
        setIsMobileOrTablet(true);
      } else {
        setVisibleCards(3);
        setIsMobileOrTablet(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!items.length || isPaused || isMobileOrTablet) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        const maxIndex = items.length - visibleCards;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length, visibleCards, isPaused, isMobileOrTablet]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isMobileOrTablet) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / items.length;
      const newIndex = Math.round(el.scrollLeft / cardWidth);
      setIndex(newIndex);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobileOrTablet, items.length]);

  /* ---------- Controls (same as Feedback) ---------- */
  const next = () => {
    if (index + visibleCards < items.length) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

   if (loading) return <PopularSalesSkeleton />;

  return (
    <>
      <style>{`
  .shine-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      120deg,
      transparent 0%,
      transparent 28%,
      rgba(255,255,255,0.08) 30%,
      rgba(255,255,255,0.13) 32%,
      rgba(255,255,255,0.08) 34%,
      transparent 36%,
      transparent 61%,
      rgba(255,255,255,0.08) 63%,
      rgba(255,255,255,0.13) 65%,
      rgba(255,255,255,0.08) 67%,
      transparent 69%,
      transparent 86%,
      rgba(255,255,255,0.08) 88%,
      rgba(255,255,255,0.13) 90%,
      rgba(255,255,255,0.08) 92%,
      transparent 94%
    );
    filter: blur(2px);
    transition: none;
    pointer-events: none;
  }
  .shine-card:hover::after {
    left: 100%;
    transition: left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
`}</style>

      <section className="overflow-hidden section animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <h2 className="section-title">
            Don’t miss the next big upcoming deals
          </h2>
          <p className="section-subtitle !mx-0 text-left">
            Browse Categories Explore deals across every category from fashion
            to travel
          </p>
        </div>

        {/* Slider wrapper */}
        <div
          className="relative group/slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Chevron */}
          {!isMobileOrTablet && (
            <button
              onClick={prev}
              disabled={index === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10
  w-10 h-10 flex items-center justify-center
  rounded-full bg-white shadow-md border border-gray-200
  opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300
  disabled:opacity-0 hover:bg-gray-50"
            >
              <ChevronLeft
                size={20}
                strokeWidth={3}
                className="text-gray-700 cursor-pointer bg-white/90 backdrop-blur"
              />
            </button>
          )}

          {/* Right Chevron */}
          {!isMobileOrTablet && (
            <button
              onClick={next}
              disabled={index + visibleCards >= items.length}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10
  w-10 h-10 flex items-center justify-center
  rounded-full bg-white shadow-md border border-gray-200
  opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300
  disabled:opacity-0 hover:bg-gray-50"
            >
              <ChevronRight
                size={20}
                strokeWidth={3}
                className="text-gray-700 cursor-pointer bg-white/90 backdrop-blur"
              />
            </button>
          )}

          {/* Slider track */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={scrollRef}
              className={`flex ${
                isMobileOrTablet
                  ? "overflow-x-auto scroll-smooth no-scrollbar"
                  : "transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
              }`}
              style={
                isMobileOrTablet
                  ? { scrollSnapType: "x mandatory" }
                  : {
                      transform: `translateX(-${index * (100 / visibleCards)}%)`,
                    }
              }
            >
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  style={{
                    minWidth: `${100 / visibleCards}%`,
                    maxWidth: "420px",
                  }}
                  className="px-2 shrink-0 animate-slide-right"
                >
                  <Link href={item.link} target="_blank" >
                    {/* shine-card class triggers the diagonal sweep, overflow-hidden clips it */}
                    <div className="shine-card h-48 md:h-56 rounded-2xl overflow-hidden relative cursor-pointer  ${!isMobileOrTablet ? 'shine-card' : ''}`">
                      <Image
                        src={item.bannerImg}
                        fill
                        alt="popular-sale" // no hover scale — clean
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isMobileOrTablet && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
            }}
          >
            {upcoming.map((_, i) => (
              <div
                key={i}
                style={{
                  height: "6px",
                  width: i === index ? "18px" : "6px",
                  borderRadius: "3px",
                  background: i === index ? "#2563EB" : "#D1D5DB",
                  transition:"width 0.4s cubic-bezier(0.33,1,0.68,1), background 0.3s ease"
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default UpcomingDeals;
