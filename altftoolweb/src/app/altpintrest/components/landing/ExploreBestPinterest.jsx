"use client";

import React from 'react';
import { motion } from 'framer-motion';

const EDITORIAL_CARDS = [
  {
    id: 1,
    label: "Zodiac spotlight",
    title: "Leo season vibe",
    image: "/pins/Afro.jpg",
    categoryQuery: "Zodiac spotlight",
  },
  {
    id: 2,
    label: "Thoughtful DIYs",
    title: "Gifts to make your friends",
    image: "/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg",
    categoryQuery: "Thoughtful DIYs",
  },
  {
    id: 3,
    label: "Make your own",
    title: "Handmade mug inspo",
    image: "/pins/2251868558904023.jpg",
    categoryQuery: "Make your own",
  },
];

export default function ExploreBestPinterest({ onExplore }) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Left-Aligned Heading */}
      <div className="mb-10 sm:mb-14 text-left">
        <h2 className="text-4xl sm:text-[46px] lg:text-[50px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
          Explore the Best of Pinterest
        </h2>
      </div>

      {/* 3 Large Feature Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
        {EDITORIAL_CARDS.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onExplore?.(card.categoryQuery)}
            className="group relative h-[280px] sm:h-[310px] md:h-[300px] lg:h-[320px] w-full rounded-[26px] overflow-hidden border-0 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform-gpu"
          >
            {/* Full Background Image */}
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Gradient Overlay (Transparent to Black) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Text Position: Bottom Aligned & Horizontally Centered */}
            <div className="relative h-full w-full p-6 sm:p-8 flex flex-col justify-end items-center text-center z-10">
              <span className="text-sm sm:text-base font-medium text-white mb-1.5 sm:mb-2 tracking-wide drop-shadow-sm">
                {card.label}
              </span>
              <h3 className="text-2xl sm:text-[34px] lg:text-[36px] font-bold text-white leading-tight line-clamp-2 max-w-[320px] drop-shadow-md">
                {card.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pill-Shaped Centered See More Button */}
      <div className="mt-10 sm:mt-12 text-center">
        <button
          onClick={() => onExplore?.("Featured Editorial")}
          className="px-7 py-3.5 rounded-full bg-[#E9E9E9] hover:bg-[#E2E2E2] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#111111] dark:text-white font-semibold text-base border-0 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          See more
        </button>
      </div>

    </section>
  );
}
