"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function CategorySection({ data }) {
  const CategoryData = data?.categories || [];

  const [start, setStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);


  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      if (width < 480) setVisibleCount(1);
      else if (width < 768) setVisibleCount(2);
      else if (width < 1024) setVisibleCount(3);
      else if (width < 1280) setVisibleCount(4);
      else setVisibleCount(5);
    };

    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);


  useEffect(() => {
    setStart((prev) =>
      prev + visibleCount > CategoryData.length
        ? Math.max(0, CategoryData.length - visibleCount)
        : prev
    );
  }, [visibleCount, CategoryData.length]);

  const nextSlide = () => {
    if (start + visibleCount < CategoryData.length) {
      setStart((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (start > 0) {
      setStart((prev) => prev - 1);
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
          animate={{ x: `-${start * slidePercent}%` }}
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
          disabled={start === 0}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 disabled:opacity-40 transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          disabled={start + visibleCount >= CategoryData.length}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 disabled:opacity-40 transition-colors duration-200 cursor-pointer"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

    </section>
  );
}

export default CategorySection;