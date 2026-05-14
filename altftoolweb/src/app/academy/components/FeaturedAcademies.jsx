"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

export default function FeaturedAcademies({ items }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const raf = requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      const speed = 0.5;

      const step = () => {
        if (!pausedRef.current) {
          posRef.current += speed;
          if (posRef.current >= halfWidth) {
            posRef.current -= halfWidth;
          }
          track.style.transform = `translateX(-${posRef.current}px)`;
        }
        animRef.current = requestAnimationFrame(step);
      };

      animRef.current = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(animRef.current);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  const list = [...items, ...items];

  return (
    <section className="section bg-white overflow-hidden">
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => (pausedRef.current = false)}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 lg:w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 lg:w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ width: "max-content" }}
        >
          {list.map((academy, index) => (
            <a
              key={`${academy.name}-${index}`}
              href={academy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center shrink-0 
              px-3 py-2 sm:px-5 sm:py-3 lg:px-8 lg:py-4 
              mx-1 sm:mx-2 lg:mx-3
              transition-transform duration-300 hover:scale-110"
            >
              <div
                className="
                relative flex items-center justify-center
                w-[100px] h-9 
                sm:w-[140px] sm:h-12 
                lg:w-[200px] lg:h-16
              "
              >
                <Image
                  src={academy.image}
                  alt={academy.name}
                  fill
                  sizes="(max-width: 640px) 100px, (max-width: 1024px) 140px, 200px"
                  className="object-contain"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
