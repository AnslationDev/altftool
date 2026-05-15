"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Aarav Mehta",
    handle: "@aaravbuilds",
    rating: 5,
    text: "Top11 helped me discover AI tools I never knew existed. The clean categories and detailed listings saved me hours of research every week.",
    avatarSrc: "/personality/testimonials/image1.jpg",
  },

  {
    name: "Nilesh Yadav",
    handle: "@sophiacreates",
    rating: 5,
    text: "I use Top11 almost daily for finding design and productivity tools. The UI feels premium and the recommendations are genuinely useful.",
    avatarSrc: "/personality/testimonials/image2.jpg",
  },

  {
    name: "Rohan Sharma",
    handle: "@rohanxdev",
    rating: 4,
    text: "As a developer, I loved how easy it was to explore developer tools, AI products, and automation platforms all in one place.",
    avatarSrc: "/personality/testimonials/image3.jpg",
  },

  {
    name: "Ankit Mishra",
    handle: "@emilydigital",
    rating: 5,
    text: "The curated tool collections on Top11 are amazing. I found multiple tools for content creation and marketing that improved my workflow instantly.",
    avatarSrc: "/personality/testimonials/image2.jpg",
  },

  {
    name: "Neha Kapoor",
    handle: "@nehakapoor",
    rating: 5,
    text: "Top11 feels like Product Hunt but much cleaner and easier to browse. I especially loved the modern card design and fast navigation.",
    avatarSrc: "/personality/testimonials/image3.jpg",
  },

  {
    name: "Daniel Lee",
    handle: "@danlee",
    rating: 5,
    text: "The platform makes discovering trending AI tools effortless. Everything is organized beautifully, and the user experience is top-notch.",
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
      <div>
        {/* Heading */}
        <div className="mb-10 text-center md:mb-14">
          <h2 className="section-title mx-auto max-w-200">
            Trusted by Thousands of Tool Explorers
          </h2>

          <p className="section-subtitle mx-auto max-w-145">
            Discover why creators, developers,
            marketers, and startups use Top11 to
            find the best AI tools and digital
            products faster.
          </p>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
            no-scrollbar
            flex
            snap-x
            snap-mandatory
            overflow-x-auto
            scroll-smooth
            pb-4
          "
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="
                flex
                flex-shrink-0
                snap-start
                px-2
                pt-10
              "
              style={{
                width: `${100 / visibleCards}%`,
              }}
            >
              <div
                className="
                  relative
                  flex
                  w-full
                  flex-col
                  rounded-[30px]
                  border
                  border-(--border)
                  bg-(--background)
                  px-6
                  pb-7
                  pt-16
                  shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0px_18px_40px_0px_rgba(15,23,42,0.08)]
                  sm:px-7
                "
              >
                {/* Avatar */}
                <div className="absolute -top-9 left-6 sm:left-7">
                  <div
                    className="
                      relative
                      h-[72px]
                      w-[72px]
                      overflow-hidden
                      rounded-full
                      border-4
                      border-white
                      shadow-[0px_18px_40px_0px_rgba(15,23,42,0.10)]
                      sm:h-[78px]
                      sm:w-[78px]
                    "
                  >
                    <Image
                      src={t.avatarSrc}
                      alt={t.name}
                      fill
                      sizes="78px"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                {/* Text */}
                <p
                  className="
                    mb-5
                    flex-1
                    text-[14px]
                    leading-[24px]
                    text-(--muted-foreground)
                    sm:text-[15px]
                  "
                >
                  {t.text}
                </p>

                {/* Divider */}
                <div className="mb-4 h-px bg-(--border)" />

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-4">
                  <div>
                    <h4
                      className="
                        text-[17px]
                        font-semibold
                        leading-[24px]
                        text-(--foreground)
                      "
                    >
                      {t.name}
                    </h4>

                    <p
                      className="
                        text-[12px]
                        leading-[16px]
                        text-(--muted-foreground)
                      "
                    >
                      {t.handle}
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {Array.from({
                      length: 5,
                    }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx <
                          Math.round(t.rating)
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

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({
            length: totalDots,
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;

                const cardWidth =
                  scrollRef.current
                    .clientWidth / visibleCards;

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
                    : "w-2 bg-(--border)"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}