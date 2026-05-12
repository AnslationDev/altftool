"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import { Star } from "lucide-react";

const UserReview = ({ feedback = [] }) => {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [maxIndicators, setMaxIndicators] = useState(feedback.length);

  const scrollRef = useRef(null);

  // ── Handle scroll sync ──
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const cardWidth =
      scrollRef.current.clientWidth / visibleCards;

    const newIndex = Math.round(
      scrollRef.current.scrollLeft / cardWidth
    );

    setIndex(newIndex);
  };

  // ── Responsive cards ──
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;

      if (w < 640) {
        setVisibleCards(1);
        setMaxIndicators(feedback.length);
      } else if (w < 1024) {
        setVisibleCards(2);
        setMaxIndicators(feedback.length);
      } else {
        setVisibleCards(3);
        setMaxIndicators(feedback.length);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [feedback.length]);

  // ── Auto scroll ──
  useEffect(() => {
    if (!scrollRef.current) return;

    const interval = setInterval(() => {
      const cardWidth =
        scrollRef.current.clientWidth / visibleCards;

      let nextIndex = index + 1;

      if (nextIndex + visibleCards > feedback.length) {
        nextIndex = 0;
      }

      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth",
      });

      setIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [index, visibleCards, feedback.length]);

  const totalDots = feedback.length - visibleCards + 1;
  const visibleDots = Math.min(totalDots, maxIndicators);

  return (
    <section className="section animate-slide-up">
      
      {/* HEADER */}
      <div className="flex flex-col mb-8 animate-slide-right">
        <h2 className="section-title">
          Loved by Smart Readers
        </h2>
        <p className="section-subtitle mx-0! font-secondary">
          See How Users Are Enjoying With Us.
        </p>
      </div>

      {/* CAROUSEL */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4  bg-(--background)"
      >
        <div className="flex">
          {feedback.map((item, i) => (
            <div
              key={item.id}
              className="pr-5 mt-7 animate-slide-up ml-0.5"
              style={{
                minWidth: `${100 / visibleCards}%`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <div className="relative rounded-[20px] p-6  shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]   transition h-full flex flex-col">

                {/* Avatar */}
                <div className="absolute -top-7 left-6">
                  <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-(--border)">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                <div className="mt-6" />

                {/* TEXT */}
                <p className="text-(--muted-foreground) text-[13.5px] leading-relaxed line-clamp-4 ">
                  {item.message}
                </p>

                {/* Divider */}
                <div className="h-px bg-(--muted-foreground)/40 my-5" />

                {/* FOOTER */}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <h4 className="font-semibold text-(--muted-foreground)">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      @{item.name?.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>

                  {/* STARS */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < Math.round(item.rating || 5)
                            ? "fill-(--primary) text-(--primary)"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: visibleDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!scrollRef.current) return;

              const cardWidth =
                scrollRef.current.clientWidth / visibleCards;

              scrollRef.current.scrollTo({
                left: i * cardWidth,
                behavior: "smooth",
              });

              setIndex(i);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === i
                ? "w-8 bg-(--primary)"
                : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default UserReview;