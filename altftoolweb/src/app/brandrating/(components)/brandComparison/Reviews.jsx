"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Star } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const REVIEW_VIEWPORTS = {
  mobile: { visibleCards: 1, wordLimit: 20 },
  tablet: { visibleCards: 2, wordLimit: 25 },
  desktop: { visibleCards: 3, wordLimit: 35 },
};

const getReviewViewportSnapshot = () => {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const subscribeToReviewViewport = (callback) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

export default function Reviews({ reviews = [] }) {
  const [index, setIndex] = useState(0);
  const [scrollRef, setScrollRef] = useState(null);
  const viewport = useSyncExternalStore(
    subscribeToReviewViewport,
    getReviewViewportSnapshot,
    () => "desktop"
  );
  const { visibleCards, wordLimit } = REVIEW_VIEWPORTS[viewport];
  const maxIndex = Math.max(0, reviews.length - visibleCards);
  const clampedIndex = Math.min(index, maxIndex);

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
      let nextIndex = clampedIndex + 1;
      if (nextIndex + visibleCards > reviews.length) nextIndex = 0;
      scrollRef.scrollTo({ left: nextIndex * cardWidth, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(interval);
  }, [clampedIndex, visibleCards, reviews.length, scrollRef]);

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
                  <ManagedImage
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
                ${clampedIndex === i
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
