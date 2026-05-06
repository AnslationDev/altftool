"use client";
import React from "react";
import cr1 from "../(assets)/cr1.png";
import cr2 from "../(assets)/cr2.png";
import cr3 from "../(assets)/cr3.png";
import cr4 from "../(assets)/cr4.png";
import cr5 from "../(assets)/cr5.png";
import { useState, useRef } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

function ConsumerRating() {
  const cards = [cr1, cr2, cr3, cr4, cr5];
  const [mobileIndex, setMobileIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(() =>
    cards.map(() => false)
  );
  const scrollRef = useRef(null);

  const markImageLoaded = (index) => {
    setLoadedImages((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  return (
    <section className="w-full section pb-10 sm:pb-14 md:pb-20 animate-slide-up">
      <div className='flex flex-col items-center gap-2 '>
        <div className="max-w-[1000px] mx-auto text-center mb-4 sm:pb-10 lg:mb-20 gap-2 pb-8 sm:pb-10 animate-slide-right">
          <h2 className='section-title text-center mb-4'>
            Get The Best Products With Help
            From The Experts At Consumer Rating
          </h2>

          <p className='section-subtitle text-center'>
            Find top products or specific reviews in one place—no need to browse multiple sites. Get expert insights, comparisons, and rankings across categories like mattresses, air purifiers, dog food, and more.
          </p>
        </div>
        <div className="relative">
          <div className="
          flex items-end gap-3 md:gap-8 
          w-screen md:w-full lg:w-auto
-mx-4 md:mx-0 lg:mx-0
          px-4 md:px-6 lg:px-0
          overflow-x-auto md:overflow-x-hidden lg:overflow-visible
          scrollbar-hide no-scrollbar
         justify-start lg:justify-center
          snap-x snap-mandatory snap-always scroll-smooth"
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const visibleCards = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : cards.length;
              const cardWidth = el.scrollWidth / cards.length;
              setMobileIndex(Math.min(Math.round(el.scrollLeft / cardWidth), cards.length - visibleCards));
            }}
          >

            {cards.map((img, index) => (
              <div
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`
                flex-shrink-0
                snap-center
                rounded-2xl overflow-hidden shadow-lg
               animate-slide-up
               transition-all duration-500 ease-out
               w-full h-[360px]
               sm:w-[45vw] sm:h-[380px]
               md:w-[48%] md:h-[410px]
               lg:w-[calc((100%-32px)/5)] lg:h-[300px]
               xl:w-[230px] xl:h-[350px]
              2xl:w-[240px] 2xl:h-[360px]


               ${index % 2 === 1
                    ? "lg:-translate-y-11 z-10"
                    : "lg:translate-y-0  opacity-90"
                  }
                   hover:scale-105 hover:z-20 hover:shadow-2xl
                  
              `}
              >
                <div className="relative w-full h-full overflow-hidden bg-[var(--muted)]">
                  {!loadedImages[index] && (
                    <div className="absolute inset-0 animate-pulse bg-[var(--muted)]" />
                  )}
                  <ManagedImage
                    src={img.src}
                    alt="category"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      loadedImages[index] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => markImageLoaded(index)}
                    onError={() => markImageLoaded(index)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex lg:hidden justify-center mt-4 gap-2">
            {Array.from({
              length: Math.min(
                typeof window !== "undefined" && window.innerWidth < 640
                  ? cards.length
                  : cards.length - 1,
                5
              )
            }, (_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300
      ${mobileIndex === i
                    ? "bg-[var(--primary)] scale-110"
                    : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>

      </div>


    </section>

  );
}

export default ConsumerRating;
