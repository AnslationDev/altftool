"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function Reviews({ reviews = [] }) {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [scrollRef, setScrollRef] = useState(null);
  const [wordLimit, setWordLimit] = useState(30);

  const truncateText = (text, limit) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
  };

  const handleScroll = () => {
    if (!scrollRef) return;
    const cardWidth = scrollRef.clientWidth / visibleCards;
    setIndex(Math.round(scrollRef.scrollLeft / cardWidth));
  };

  useEffect(() => {
    if (!scrollRef) return;
    if (reviews.length <= visibleCards) return;

    const interval = setInterval(() => {
      const cardWidth = scrollRef.clientWidth / visibleCards;
      let nextIndex = index + 1;
      if (nextIndex + visibleCards > reviews.length) nextIndex = 0;
      scrollRef.scrollTo({ left: nextIndex * cardWidth, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(interval);
  }, [index, visibleCards, reviews.length, scrollRef]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCards(1);
        setWordLimit(20); // mobile 
      } else if (width < 1024) {
        setVisibleCards(2);
        setWordLimit(25); // tablet
      } else {
        setVisibleCards(3);
        setWordLimit(35); // desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (index + visibleCards > reviews.length) {
      setIndex(Math.max(0, reviews.length - visibleCards));
    }
  }, [visibleCards, reviews.length]);

  const totalDots = Math.max(0, reviews.length - visibleCards + 1);
  const showControls = reviews.length > visibleCards;

  return (
    <section id="reviews" className="section animate-slide-up overflow-hidden">

      <div className="mb-8">
        <h2 className="section-title">Reviews & Ratings</h2>
        <p className="section-subtitle !mx-0 text-left">
          What Users Say & How It Scores
        </p>
      </div>

      <div
        ref={setScrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        <div
          className="flex"
          style={{ width: `${(reviews.length / visibleCards) * 100}%` }}
        >
          {reviews.map((item, i) => (
            <div
              key={i}
              className="pr-4 sm:pr-6 mt-7 snap-start shrink-0"
              style={{
                width: `${100 / reviews.length}%`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <div className="rounded-2xl p-6 sm:p-7 lg:p-8 border border-(--border) shadow-sm hover:shadow-lg transition h-full flex flex-col relative animate-slide-up">

                <div className="absolute -top-7 left-6">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-(--border)"
                  />
                </div>

                <div className="mt-6" />

                {/* Fixed height text box — no overflow, truncate by word limit */}
                <p className="text-(--muted-foreground) text-sm sm:text-base leading-relaxed overflow-hidden h-[80px] sm:h-[90px] lg:h-[100px]">
                  {truncateText(item.text, wordLimit)}
                </p>

                <div className="bg-(--border) h-[1px] w-full my-5"></div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-base font-semibold text-(--muted-foreground) truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-(--muted-foreground) truncate">
                      @{item.name?.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < Math.round(item.rating)
                            ? "fill-(--primary) text-(--primary)"
                            : "text-(--muted-foreground)"
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

      {showControls && (
        <div className="flex justify-center sm:gap-3 gap-2 mt-6">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              onClick={() => {
                if (!scrollRef) return;
                const cardWidth = scrollRef.clientWidth / visibleCards;
                scrollRef.scrollTo({ left: i * cardWidth, behavior: "smooth" });
              }}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300
                ${index === i
                  ? "bg-(--primary) w-8 opacity-100"
                  : "bg-[#1e3a8a] w-2 opacity-40"
                }`}
            />
          ))}
        </div>
      )}

    </section>
  );
}