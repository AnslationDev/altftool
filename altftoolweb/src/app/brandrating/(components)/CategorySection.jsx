"use client";

import React, { useSyncExternalStore, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const getVisibleCountSnapshot = () => {
  if (typeof window === "undefined") return 5;

  const width = window.innerWidth;
  if (width < 480) return 1;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
};

const subscribeToViewport = (callback) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

function CategorySection({ data }) {
  const CategoryData = data?.categories || [];

  const [start, setStart] = useState(0);
  const visibleCount = useSyncExternalStore(
    subscribeToViewport,
    getVisibleCountSnapshot,
    () => 5
  );
  const maxStart = Math.max(0, CategoryData.length - visibleCount);
  const clampedStart = Math.min(start, maxStart);

  const nextSlide = () => {
    if (clampedStart + visibleCount < CategoryData.length) {
      setStart((prev) => Math.min(prev + 1, maxStart));
    }
  };

  const prevSlide = () => {
    if (clampedStart > 0) {
      setStart((prev) => Math.max(prev - 1, 0));
    }
  };

  function getURlLink(category) {
    return category
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-");
  }

  const slidePercent = 100 / visibleCount;

  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl bg-(--background) mx-auto px-4 sm:px-6 lg:px-8">

      {/* Slider Wrapper */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: `-${clampedStart * slidePercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="flex"
          style={{ gap: 0 }}
        >
          {CategoryData.map((c, index) => {
            const brands = c.brands || c.brandname || [];

            return (
              <div
                key={index}
                className="flex-shrink-0 px-3 sm:px-4 lg:px-5"
                style={{ width: `${slidePercent}%` }}
              >
                <h3 className="font-semibold text-(--foreground) text-base sm:text-lg mb-3 sm:mb-4  truncate">
                  {c.category}
                </h3>

                <ul className="space-y-2 sm:space-y-3">
                  {brands.slice(0, 5).map((brand, i) => (
                    <Link
                      key={i}
                      href={`/brandrating/categories/${getURlLink(c.category)}/${getURlLink(brand.name)}`}
                    >
                      <li className="text-sm sm:text-base text-(--muted-foreground) hover:text-black cursor-pointer transition-colors duration-150 truncate py-0.5">
                        {brand.name}
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 sm:gap-4 mt-10 sm:mt-14 lg:mt-16">
        <button
          onClick={prevSlide}
          disabled={clampedStart === 0}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 disabled:opacity-40 transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          disabled={clampedStart + visibleCount >= CategoryData.length}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 disabled:opacity-40 transition-colors duration-200 cursor-pointer"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

    </section>
  );
}

export default CategorySection;
