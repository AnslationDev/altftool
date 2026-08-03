"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 1, name: "Animals", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80" },
  { id: 2, name: "Art", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80" },
  { id: 3, name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80" },
  { id: 4, name: "Design", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80" },
  { id: 5, name: "DIY and Crafts", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80" },
  { id: 6, name: "Food and Drink", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80" },
  { id: 7, name: "Home Decor", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80" },
  { id: 8, name: "Men's Fashion", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80" },
  { id: 9, name: "Quotes", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },
  { id: 10, name: "Tattoos", image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&auto=format&fit=crop&q=80" },
];

export default function BrowseByCategory({ onSelectCategory }) {
  return (
    <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 max-w-[1560px] mx-auto w-full">

      {/* Left-Aligned Section Heading */}
      <div className="mb-4 sm:mb-6 text-left">
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
            className="group relative h-[140px] sm:h-[155px] lg:h-[165px] w-full rounded-[22px] overflow-hidden border border-transparent dark:border-white/10 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform-gpu"
          >
            {/* Full-bleed background image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108 group-hover:brightness-105"
              loading="lazy"
            />

            {/* Subtle dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 group-hover:from-black/65 transition-colors duration-300" />

            {/* Category Name Centered Vertically & Horizontally */}
            <div className="relative h-full w-full px-3 flex items-center justify-center text-center z-10">
              <span className="text-sm xs:text-base sm:text-[19px] lg:text-[20px] font-bold text-white leading-tight drop-shadow-md line-clamp-2 px-1 text-center">
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