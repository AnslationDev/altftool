"use client";

import TopPickCard from "./TopPickCard";
import { useState, useRef, useEffect } from "react";

export default function TopPicks({ brands = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

 const topBrands = [...brands]
  .filter((b) => b && b.name)
  .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
  .slice(0, 3);


  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const centerSlot = el.children[1]; // #1 card slot
      centerSlot?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
      setActiveIndex(0);
    });
    
  }, [topBrands.length]);

  return (
    <section className="section w-full py-10 sm:py-20 animate-slide-up">
      <div className="text-center px-4 pb-6 animate-slide-right">
        <h2 className="section-title">Our Top 3 Premium Picks</h2>
        <p className="section-subtitle max-w-4xl mx-auto">
          Carefully selected based on comfort, performance, and real customer ratings.
        </p>
      </div>
      <div className="mt-6 md:mt-10 lg:mt-14 w-full lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:px-6">
        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const slotWidth = el.firstElementChild?.offsetWidth ?? el.offsetWidth;
            const index = Math.round(el.scrollLeft / slotWidth);
            setActiveIndex(Math.min(topBrands.length - 1, Math.max(0, index)));
          }}
          className="
            flex flex-nowrap
            items-stretch lg:items-end
            overflow-x-auto lg:overflow-visible
            snap-x snap-mandatory lg:snap-none
            scroll-smooth no-scrollbar
            gap-0 lg:gap-5 xl:gap-8
          "
        >

          {topBrands[1] && (

            <div style={{ animationDelay: "100ms" }} className="
                 w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] 
                md:w-[68vw] md:min-w-[68vw] md:max-w-[640px]
                p-3 sm:p-5 lg:p-6 
                flex-shrink-0 snap-center
                lg:min-w-0 lg:w-auto lg:flex-1 lg:px-0 lg:justify-stretch
                order-2 lg:order-1
                animate-slide-up
              ">
              <TopPickCard  rank={topBrands[1]?.rank || 2} isActive={false} brand={topBrands[1]} />
            </div>
          )}

          {/* CENTER → #1 */}
          {topBrands[0] && (
            <div style={{ animationDelay: "180ms" }} className="
                 w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] 
                md:w-[72vw] md:min-w-[72vw] md:max-w-[680px]
              p-3 sm:p-5 lg:p-6 
                flex-shrink-0 snap-center
                lg:min-w-0 lg:w-auto lg:flex-1 lg:px-0 lg:justify-stretch
                order-1 lg:order-2
                lg:-translate-y-5 xl:-translate-y-7
                lg:scale-[1.04] xl:scale-[1.07]
                z-10
                animate-slide-up
              ">
              <TopPickCard rank={topBrands[0]?.rank || 1} isActive={true} brand={topBrands[0]} />
            </div>
          )}

          {/* RIGHT → #3 */}
          {topBrands[2] && (
            <div style={{ animationDelay: "260ms" }} className="
               w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] 
                md:w-[68vw] md:min-w-[68vw] md:max-w-[640px]
              flex justify-center items-start
               p-3 sm:p-5 lg:p-6 
                flex-shrink-0 snap-center
                lg:min-w-0 lg:w-auto lg:flex-1 lg:px-0 lg:justify-stretch
                order-3
                animate-slide-up
              ">
              <TopPickCard  rank={topBrands[2]?.rank || 3} isActive={false} brand={topBrands[2]} />
            </div>
          )}
        </div>
      </div>

      {/* DOTS  */}
      <div className="flex lg:hidden justify-center mt-5 gap-2">
        {topBrands.map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-[var(--primary)] scale-110" : "bg-(--muted-foreground)/20"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
