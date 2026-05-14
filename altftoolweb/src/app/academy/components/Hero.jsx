"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  BookOpen,
  GraduationCap,
  Landmark,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AcademyHeroSkeleton } from "@/components/ui/skeleton";

const heroImages = [
  {
    src: "/academy/hero/banner-academy.jpg",
    alt: "Find the right course and build your future with AltFTool Academy",
  },
  {
    src: "/academy/hero/banner-acad2.jpg",
    alt: "Unlock your future with the Academy of Innovation and Learning",
  },
];

const stats = [
  { icon: GraduationCap, value: "50,000+", label: "Active Learners" },
  { icon: BookOpen, value: "1,200+", label: "Courses Compared" },
  { icon: Landmark, value: "100+", label: "Top Platform Partners" },
  { icon: Star, value: "4.8/5", label: "Average Learner Rating" },
];

export default function Hero({ loading = false }) {
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
    const interval = setInterval(next, isHovered ? 1500 : 4000);
    return () => clearInterval(interval);
  }, [isHovered, next]);

  if (loading) {
    return <AcademyHeroSkeleton />;
  }

  return (
    <section className="section relative w-full">

      {/* HERO IMAGES */}
      <div
        className="relative w-full aspect-[16/9]  xl:aspect-[21/10]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="group relative w-full h-full rounded-xl overflow-hidden">

          {/* Images */}
          {heroImages.map((img, i) => (
            <Image
              key={i}
              src={img.src}
              alt={img.alt}
              aria-hidden={i !== index}
              fill
              priority={i === 0}
              quality={78}
              sizes="100vw"
              className={`object-cover object-[center_top] sm:object-[center_20%] md:object-[center_30%] lg:object-[center_40%] xl:object-center transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}

          {/* LEFT */}
          <div className="absolute left-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-start pl-2 sm:pl-3 lg:pl-5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="
                w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                rounded-full bg-(--background)/85 hover:bg-(--background)
                flex items-center justify-center
                shadow-md
                transition-all duration-300 ease-out
                opacity-0 group-hover:opacity-100
                -translate-x-3 group-hover:translate-x-0
              "
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-(--muted-foreground)" />
            </button>
          </div>

          {/* RIGHT */}
          <div className="absolute right-0 top-0 h-full w-[15%] sm:w-[12%] z-10 flex items-center justify-end pr-2 sm:pr-3 lg:pr-5">
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="
                w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                rounded-full bg-(--background)/85 hover:bg-(--background)
                flex items-center justify-center
                shadow-md
                transition-all duration-300 ease-out
                opacity-0 group-hover:opacity-100
                translate-x-3 group-hover:translate-x-0
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
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show academy banner ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`rounded-full transition-all duration-500 ${i === index
                  ? "bg-white w-5 sm:w-6 lg:w-7 h-1.5 sm:h-2"
                  : "bg-white/50 w-1.5 sm:w-2 lg:w-2.5 h-1.5 sm:h-2"
                  }`}
              />
            ))}
          </div>

        </div>
      </div>


      {/* STATS */}
      <div className="
 hidden lg:block relative z-20
  -mt-6 sm:-mt-10 md:-mt-14 lg:-mt-18 xl:-mt-22
  mx-auto
  w-[99%] sm:w-[97%] md:w-[95%] lg:w-[90%] xl:w-[86%] 2xl:w-[88%]
  bg-gradient-to-r from-blue-600 to-blue-700
  text-white rounded-xl
  px-4 sm:px-8 md:px-12 lg:px-10 xl:px-12
  py-5 sm:py-6 md:py-7 lg:py-7 xl:py-8
  shadow-lg shadow-black/10
">
        <div className="
    grid grid-cols-2 lg:grid-cols-4
    gap-x-3 sm:gap-x-4 lg:gap-x-5 2xl:gap-x-6
    gap-y-5 sm:gap-y-6
  ">

          {stats.map((item, i) => {
            const Icon = item.icon;

            return (
              <div key={i} className="
          flex items-center
          gap-3 sm:gap-4 lg:gap-3 xl:gap-x-5 2xl:gap-5
        ">

                {/* divider */}
                {i !== 0 && (
                  <div className="hidden lg:block h-10 w-px bg-white/20 shrink-0" />
                )}


                <div className="
            w-10 h-10 sm:w-12 sm:h-12
            lg:w-11 lg:h-11 xl:w-12 xl:h-12
            2xl:w-14 2xl:h-14
            rounded-full border border-white/30
            flex items-center justify-center shrink-0
          ">
                  <Icon className="
              text-white
              w-5 h-5 sm:w-6 sm:h-6
              lg:w-5 lg:h-5
              2xl:w-7 xl:h-7
            " />
                </div>


                <div className="min-w-0">
                  <p className="
              font-semibold leading-tight truncate
              text-sm sm:text-base
              lg:text-base xl:text-lg
              2xl:text-xl
            ">
                    {item.value}
                  </p>

                  <p className="
              opacity-90 leading-tight
              text-xs sm:text-sm
              lg:text-xs xl:text-sm
              2xl:text-base
            ">
                    {item.label}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </section>
  );
}
