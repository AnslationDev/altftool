"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

export default function Socials() {
  const brands = [
    {
      name: "coinbase",
      image: "/personality/socials/coinbase.png",
      width: 170,
      height: 50,
    },
    {
      name: "spotify",
      image: "/personality/socials/spotify.png",
      width: 170,
      height: 50,
    },
    {
      name: "slack",
      image: "/personality/socials/slack.png",
      width: 150,
      height: 50,
    },
    {
      name: "dropbox",
      image: "/personality/socials/dropbox.png",
      width: 190,
      height: 50,
    },
    {
      name: "webflow",
      image: "/personality/socials/webflow.png",
      width: 170,
      height: 50,
    },
    {
      name: "zoom",
      image: "/personality/socials/zoom.png",
      width: 120,
      height: 50,
    },
  ];

  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 1.2; 

    const step = () => {
      const halfWidth = track.scrollWidth / 2;

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

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const list = [...brands, ...brands];

  return (
    <section className="section overflow-hidden">
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => (pausedRef.current = false)}
      >
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 md:w-16 lg:w-24 z-10 bg-gradient-to-r from-(--background) to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 md:w-16 lg:w-24 z-10 bg-gradient-to-l from-(--background) to-transparent" />

        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ width: "max-content" }}
        >
          {list.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex items-center justify-center shrink-0
              px-4 sm:px-6 md:px-10 lg:px-14
              py-2
               mx-2 sm:mx-3 md:mx-4 lg:mx-5
             transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <Image
                src={brand.image}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
