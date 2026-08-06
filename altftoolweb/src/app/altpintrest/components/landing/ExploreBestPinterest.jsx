"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EDITORIAL_SLIDES = [
  // Slide Set 1
  [
    {
      id: "1a",
      label: "Zodiac spotlight",
      title: "Leo season vibe",
      image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Zodiac spotlight",
    },
    {
      id: "2a",
      label: "Thoughtful DIYs",
      title: "Gifts to make your friends",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Thoughtful DIYs",
    },
    {
      id: "3a",
      label: "Make your own",
      title: "Handmade mug inspo",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Make your own",
    },
    {
      id: "4a",
      label: "Editorial Visuals",
      title: "High-fashion moodboards",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Editorial",
    },
  ],

  // Slide Set 2
  [
    {
      id: "1b",
      label: "Minimalist Spaces",
      title: "Scandinavian interiors",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Interior Design",
    },
    {
      id: "2b",
      label: "Streetwear Culture",
      title: "Bold graphic outerwear",
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Streetwear",
    },
    {
      id: "3b",
      label: "Midjourney Prompts",
      title: "AI portrait generation",
      image: "/pins/MIDJOURNEY promt Eye.webp",
      categoryQuery: "AI Prompts",
    },
    {
      id: "4b",
      label: "3D Motion Graphics",
      title: "Abstract 3D renders",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "3D Art",
    },
  ],

  // Slide Set 3
  [
    {
      id: "1c",
      label: "Cyberpunk Art",
      title: "Futuristic neon city",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Cyberpunk",
    },
    {
      id: "2c",
      label: "Botanical Wonders",
      title: "Lush indoor gardens",
      image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Plants",
    },
    {
      id: "3c",
      label: "Dark Fantasy",
      title: "Mythological concept art",
      image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Dark Fantasy",
    },
    {
      id: "4c",
      label: "Cozy Aesthetic",
      title: "Warm campfire vibes",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=90",
      categoryQuery: "Cozy Aesthetic",
    },
  ]
];

export default function ExploreBestPinterest({ onExplore }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Auto-change card content every 6 seconds with smooth transition
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % EDITORIAL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentCards = EDITORIAL_SLIDES[activeSlideIndex];

  return (
    <section className="pt-16 sm:pt-24 pb-14 sm:pb-20 px-2 sm:px-4 lg:px-6 max-w-[1560px] mx-auto w-full select-none">

      {/* Header */}
      <div className="mb-6 sm:mb-10 text-left flex items-center justify-between">
        <h2 className="text-3xl sm:text-[42px] lg:text-[48px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
          Explore visual collections
        </h2>
        {/* Animated Slide Dots Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {EDITORIAL_SLIDES.map((_, i) => (
            <span
              key={i}
              onClick={() => setActiveSlideIndex(i)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-500 ${
                i === activeSlideIndex ? "w-6 bg-[#0D9488]" : "w-2 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400"
              }`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Responsive Feature Cards Grid:
          - Mobile (< 768px): 2 Columns (2 cards shown)
          - iPad / Medium screens (768px - 1279px): 3 Columns (3 cards shown)
          - Desktop Large screens (1280px+): 4 Columns (4 cards shown)
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full">
        {currentCards.map((card, idx) => {
          // Precise Responsive Visibility Control for iPad / Medium screens:
          // idx 0, 1: Always visible (2 cards on mobile)
          // idx 2: Visible from md (768px) onwards (3 cards on iPad/medium)
          // idx 3: Visible only from xl (1280px) onwards (4 cards on desktop)
          let visibilityClass = "block";
          if (idx === 2) visibilityClass = "hidden md:block";
          else if (idx === 3) visibilityClass = "hidden xl:block";

          return (
            <div
              key={idx}
              onClick={() => onExplore?.(card.categoryQuery)}
              className={`group relative aspect-[3/4] sm:aspect-[3/4] lg:h-[460px] w-full rounded-[28px] overflow-hidden border border-transparent dark:border-white/10 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform-gpu ${visibilityClass}`}
            >
              {/* Cross-fading Background Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={card.image}
                  src={card.image}
                  alt={card.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </AnimatePresence>

              {/* Permanent Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

              {/* Permanent Card Content Matching Reference Screenshot */}
              <div className="relative h-full w-full p-6 sm:p-8 flex flex-col justify-end items-center text-center z-20 pointer-events-none">
                <span className="text-sm sm:text-base font-semibold text-white/95 mb-1 tracking-tight drop-shadow-sm">
                  {card.label}
                </span>
                <h3 className="text-2xl sm:text-[32px] lg:text-[36px] font-bold text-white leading-[1.15] tracking-tight max-w-[300px] drop-shadow-md">
                  {card.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pill-Shaped Centered See More Button */}
      <div className="mt-8 sm:mt-10 text-center">
        <button
          onClick={() => onExplore?.("")}
          className="px-7 py-3.5 rounded-full bg-[#E9E9E9] hover:bg-[#E2E2E2] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#111111] dark:text-white font-semibold text-base border-0 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          Browse more collections
        </button>
      </div>

    </section>
  );
}
