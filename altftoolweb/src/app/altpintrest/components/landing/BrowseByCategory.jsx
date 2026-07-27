"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 1, name: "Animals", image: "/pins/2040762329177782.webp" },
  { id: 2, name: "Art", image: "/pins/422281212308384.jpg" },
  { id: 3, name: "Beauty", image: "/pins/Skintific New Launch Cushion💙.webp" },
  { id: 4, name: "Design", image: "/pins/1050464681855394612.webp" },
  { id: 5, name: "DIY and Crafts", image: "/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg" },
  { id: 6, name: "Food and Drink", image: "/pins/Campfire comfort.webp" },
  { id: 7, name: "Home Decor", image: "/pins/2744449769477436.webp" },
  { id: 8, name: "Men's Fashion", image: "/pins/1407443628414407.webp" },
  { id: 9, name: "Quotes", image: "/pins/create-a-life.avif" },
  { id: 10, name: "Tattoos", image: "/pins/604889793746585636.webp" },
];

export default function BrowseByCategory({ onSelectCategory }) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Left-Aligned Section Heading */}
      <div className="mb-8 sm:mb-12 text-left">
        <h2 className="text-3xl sm:text-[42px] lg:text-[44px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
          Browse by category
        </h2>
      </div>

      {/* Responsive Grid: Desktop 5 columns x 2 rows (10 category cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelectCategory?.(cat.name)}
            className="group relative h-[115px] sm:h-[120px] lg:h-[125px] w-full rounded-[20px] overflow-hidden border-0 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu"
          >
            {/* Full-bleed background image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-105"
              loading="lazy"
            />

            {/* Subtle dark overlay */}
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors duration-300" />

            {/* Category Name Centered Vertically & Horizontally */}
            <div className="relative h-full w-full px-3 flex items-center justify-center text-center z-10">
              <span className="text-base sm:text-[19px] lg:text-[20px] font-bold text-white leading-tight drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
                {cat.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Centered Pill Button */}
      <div className="mt-10 sm:mt-12 text-center">
        <button
          onClick={() => onSelectCategory?.("All Categories")}
          className="px-7 py-3.5 rounded-full bg-[#E9E9E9] hover:bg-[#E2E2E2] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#111111] dark:text-white font-semibold text-base border-0 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          See more
        </button>
      </div>

    </section>
  );
}