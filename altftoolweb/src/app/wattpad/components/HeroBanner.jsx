"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { 
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AcademyHeroSkeleton } from "@/components/ui/skeleton";

const heroImages = [

   "/wattpad/hero/banner-watt2.png",
   "/wattpad/hero/banner-wattpad.png",
   "/wattpad/hero/banner-wattpad3.png",
];


export default function HeroBanner({ loading = false }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prev = useCallback(
    () => setIndex((p) => (p - 1 + heroImages.length) % heroImages.length),
    [],
  );

  const next = useCallback(
    () => setIndex((p) => (p + 1) % heroImages.length),
    [],
  );

  useEffect(() => {
    const interval = setInterval(next, isHovered ? 2000 : 3500);
    return () => clearInterval(interval);
  }, [isHovered, next]);


  return (
    <section className="section relative w-full">

      {/* HERO IMAGES */}
      <div
        className="relative w-full aspect-video  xl:aspect-21/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="group relative w-full h-full rounded-xl overflow-hidden">

          {/* Images */}
          {heroImages.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Hero banner ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover object-[center_top] sm:object-[center_20%] md:object-[center_30%] lg:object-[center_40%] xl:object-center transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}

          {/* LEFT */}
          <div className="absolute left-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-start pl-2 sm:pl-3 lg:pl-5">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="
                w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                rounded-full bg-(--background)/85 hover:bg-(--background)
                flex items-center justify-center
                shadow-md
                transition-all duration-300 ease-out
                opacity-0 group-hover:opacity-100
                -translate-x-3 group-hover:translate-x-0 cursor-pointer
              "
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-(--muted-foreground)" />
            </button>
          </div>

          {/* RIGHT */}
          <div className="absolute right-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-end pr-2 sm:pr-3 lg:pr-5">
            <button
              onClick={next}
              aria-label="Next slide"
              className="
                w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                rounded-full bg-(--background)/85 hover:bg-(--background)
                flex items-center justify-center
                shadow-md
                transition-all duration-300 ease-out
                opacity-0 group-hover:opacity-100
                translate-x-3 group-hover:translate-x-0 cursor-pointer
              "
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-(--muted-foreground)" />
            </button>
          </div>

          {/* DOTS */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all duration-500 ${i === index
                  ? "bg-(--primary) w-7 h-2 "
                  : "bg-white/50 w-2 h-2"
                  }`}
              />
            ))}
          </div>

        </div>
      </div>
    
    </section>
  );
}
