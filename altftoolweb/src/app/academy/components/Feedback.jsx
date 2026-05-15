"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { feedbacks } from "../data/feedback";
import { useEffect, useState, useRef } from "react";
import { Star } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function FeedbackSection() {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [wordLimit, setWordLimit] = useState(30);
  const [maxIndicators, setMaxIndicators] = useState(5);

  const scrollRef = useRef(null);
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const cardWidth =
      scrollRef.current.clientWidth / visibleCards;

    const newIndex = Math.round(
      scrollRef.current.scrollLeft / cardWidth
    );

    setIndex(newIndex);
  };
  const truncateText = (text, limit = 30) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > limit
      ? words.slice(0, limit).join(" ") + "..."
      : text;
  };


  // responsive cards 
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;

      if (w < 640) {
        setVisibleCards(1);
        setMaxIndicators(5);
      } else if (w < 1024) {
        setVisibleCards(2);
        setMaxIndicators(7);
      } else {
        setVisibleCards(3);
        setMaxIndicators(feedbacks.length);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const interval = setInterval(() => {
      const cardWidth =
        scrollRef.current.clientWidth / visibleCards;

      let nextIndex = index + 1;

      if (nextIndex + visibleCards > feedbacks.length) {
        nextIndex = 0;
      }

      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth",

      });
      setIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [index, visibleCards]);

  const next = () => {
    if (index + visibleCards < feedbacks.length) {
      setIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };
  const totalDots = feedbacks.length - visibleCards + 1;
  const visibleDots = Math.min(totalDots, maxIndicators);

  return (
    <section id="reviews" className="section animate-slide-up">
      {/* HEADER */}
      <div className="flex flex-col mb-8 animate-slide-right">
        <h2 className="section-title">
          Learner Feedback
        </h2>

        <p className="section-subtitle !mx-0">
          People are finding the right platforms faster with altF — here’s what they say.
        </p>
      </div>

      {/* CAROUSEL */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        <div
          className="flex"

        >
          {feedbacks.map((item, i) => (
            <div
              key={i}
              className="pr-4 mt-7 animate-slide-up"
              style={{
                minWidth: `${100 / visibleCards}%`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <div className="relative  rounded-2xl p-6 border border-(--border) shadow-sm hover:shadow-lg transition h-full flex flex-col">

                {/* Avatar */}
                <div className="absolute -top-7 left-6">
                  <div className="w-14 h-14 relative rounded-full overflow-hidden border-2 border-[#E6E6E6]">
                    <ManagedImage
                      src={item.img}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                <div className="mt-6" />

                {/* TEXT */}
                <p className="
                       text-(--muted-foreground) 
                        text-sm leading-relaxed 
                        line-clamp-3 sm:line-clamp-4 lg:line-clamp-5
                   ">
                  {item.text}
                </p>
                {/* Divider */}
                <div className="h-[1px] bg-(--muted-foreground)/40 my-5" />

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
s
           
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < Math.round(item.rating || 5)
                          ? "fill-blue-500 text-blue-500"
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

      {/* CONTROLS */}
      {/* DOT INDICATORS */}
      <div className="flex justify-center gap-2 mt-6">

        {Array.from({ length: visibleDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!scrollRef.current) return;
              const cardWidth = scrollRef.current.clientWidth / visibleCards;
              const newIndex = Math.round(
                scrollRef.current.scrollLeft / cardWidth
              );

              setIndex(newIndex);

              scrollRef.current.scrollTo({
                left: i * cardWidth,
                behavior: "smooth",
              });
              setIndex(i);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${index === i
              ? "w-8 bg-[var(--primary)]"
              : "w-2 bg-gray-300"
              }`}
          />
        ))}
      </div>
    </section>

  );
}
