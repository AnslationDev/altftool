"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [

  {
    name: "Alex Johnson",
    handle: "@alexj",
    rating: 5,
    text: "This personality test gave me clarity about my career path that I'd been searching for years. The AI analysis was incredibly accurate and insightful.",
    avatarSrc: "/personality/testimonials/image2.jpg",
  },
  {
    name: "Maria Garcia",
    handle: "@mariagarcia",
    rating: 4,
    text: "I've taken many personality tests before but this one truly stood out. The depth of insights I received helped me understand my communication style better.",
    avatarSrc: "/personality/testimonials/image3.jpg",
  },
  {
    name: "David Kim",
    handle: "@davidkim",
    rating: 5,
    text: "Absolutely loved the experience. Quick, accurate, and deeply insightful. I shared it with my entire team and everyone found value in their results.",
    avatarSrc: "/personality/testimonials/image1.jpg",
  },
];

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  const scrollRef = useRef(null);

  // Responsive cards
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
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  // Auto scroll
  useEffect(() => {
    if (!scrollRef.current) return;

    const interval = setInterval(() => {
      const cardWidth =
        scrollRef.current.clientWidth /
        visibleCards;

      let nextIndex = page + 1;

      if (
        nextIndex + visibleCards >
        testimonials.length
      ) {
        nextIndex = 0;
      }

      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth",
      });

      setPage(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [page, visibleCards]);

  // Handle scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const cardWidth =
      scrollRef.current.clientWidth /
      visibleCards;

    const currentIndex = Math.round(
      scrollRef.current.scrollLeft /
        cardWidth
    );

    setPage(currentIndex);
  };

  const totalDots = Math.max(
    testimonials.length - visibleCards + 1,
    1
  );

  return (
    <section className="section">
      <div className="">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="section-title max-w-[760px] mx-auto ">
            Real Stories. Real Self-Discovery.
          </h2>

          <p className="section-subtitle max-w-[548px] mx-auto">
            Thousands of users have uncovered
            strengths, communication styles, and
            career insights through our personality
            tests.
          </p>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
            flex
            overflow-x-auto
            scroll-smooth
            snap-x snap-mandatory
            no-scrollbar
            pb-4
          "
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="
                flex-shrink-0
                snap-start
                px-2
                pt-10
                flex
              "
              style={{
                width: `${100 / visibleCards}%`,
              }}
            >
              <div
                className="
                  relative
                  flex flex-col
                  w-full
                  rounded-[30px]
                  border border-(--border)
                  bg-(--background)
                  pt-16
                  px-6 sm:px-7
                  pb-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0px_18px_40px_0px_rgba(15,23,42,0.08)]
                  shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)]
                "
              >
                {/* Avatar */}
                <div className="absolute -top-9 left-6 sm:left-7">
                  <div
                    className="
                      relative
                      w-[72px] h-[72px]
                      sm:w-[78px] sm:h-[78px]
                      rounded-full
                      overflow-hidden
                      border-4 border-white
                      shadow-[0px_18px_40px_0px_rgba(15,23,42,0.10)]
                    "
                  >
                    <Image
                      src={t.avatarSrc}
                      alt={t.name}
                      fill
                      sizes="78px"
                      className="object-cover object-center"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Text */}
                <p
                  className="
                    text-(--muted-foreground)
                    text-[14px] sm:text-[15px]
                    leading-[24px]
                    mb-5
                    flex-1
                  "
                >
                  {t.text}
                </p>

                {/* Divider */}
                <div className="h-px bg-(--border) mb-4" />

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <h4
                      className="
                        text-(--foreground)
                        font-semibold
                        text-[17px]
                        leading-[24px]
                      "
                    >
                      {t.name}
                    </h4>

                    <p
                      className="
                        text-(--muted-foreground)
                        text-[12px]
                        leading-[16px]
                      "
                    >
                      {t.handle}
                    </p>
                  </div>

                  {/* Dynamic Stars */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {Array.from({
                      length: 5,
                    }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx <
                          Math.round(t.rating)
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

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({
            length: totalDots,
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;

                const cardWidth =
                  scrollRef.current.clientWidth /
                  visibleCards;

                scrollRef.current.scrollTo({
                  left: i * cardWidth,
                  behavior: "smooth",
                });

                setPage(i);
              }}
              className={`
                h-2 rounded-full transition-all duration-300
                ${
                  page === i
                    ? "w-8 bg-(--primary)"
                    : "w-2 bg-gray-300"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
