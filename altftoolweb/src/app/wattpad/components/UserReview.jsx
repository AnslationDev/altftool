"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import { Star } from "lucide-react";

const UserReview = ({ feedback = [] }) => {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [maxIndicators, setMaxIndicators] = useState(feedback.length);

  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth / visibleCards;
    const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setIndex(newIndex);
  };

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setVisibleCards(1);
      } else if (w < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
      setMaxIndicators(feedback.length);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [feedback.length]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const interval = setInterval(() => {
      const cardWidth = scrollRef.current.clientWidth / visibleCards;
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

  if (!feedback.length) return null;

  return (
    <section className="wp-section">
      <div className="wp-section-header wp-anim-fade-right">
        <h2 className="wp-section-title">Loved by Smart Readers</h2>
        <p className="wp-section-subtitle">See How Users Are Enjoying With Us.</p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto wp-no-scrollbar scroll-smooth snap-x snap-mandatory py-4"
      >
        <div className="flex">
          {feedback.map((item, i) => (
            <div
              key={item.id}
              className="pr-5 ml-0.5"
              style={{
                minWidth: `${100 / visibleCards}%`,
              }}
            >
              <div className="wp-review-card wp-anim-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="wp-review-avatar">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <p className="wp-review-text">{item.message}</p>

                <div className="wp-review-divider" />

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <h4 className="wp-review-name">{item.name}</h4>
                    <p className="wp-review-handle">
                      @{item.name?.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < Math.round(item.rating || 5)
                            ? "fill-(--primary) text-(--primary)"
                            : "text-(--muted-foreground)/40"
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

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: visibleDots }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!scrollRef.current) return;
              const cardWidth = scrollRef.current.clientWidth / visibleCards;
              scrollRef.current.scrollTo({
                left: i * cardWidth,
                behavior: "smooth",
              });
              setIndex(i);
            }}
            className={`wp-review-dot ${index === i ? "wp-review-dot-active" : "wp-review-dot-inactive"}`}
            aria-label={`Go to review ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default UserReview;
