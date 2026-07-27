"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

const WHATS_NEW_PINS = [
  {
    id: 1,
    title: "Coraline nails design",
    author: "Coraline Studio",
    image: "/pins/2040762329177782.webp",
    isVideo: false,
    duration: null,
  },
  {
    id: 2,
    title: "Tutorial de Velas artesanal",
    author: "Diego Rodrigues",
    image: "/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg",
    isVideo: true,
    duration: "0:29",
  },
  {
    id: 3,
    title: "Deer costume & makeup inspo",
    author: "DIY Home",
    image: "/pins/422281212308384.jpg",
    isVideo: false,
    duration: null,
  },
  {
    id: 4,
    title: "Generative portrait prompt setup",
    author: "Vaidazen",
    image: "/pins/MIDJOURNEY promt Eye.webp",
    isVideo: true,
    duration: "0:06",
  },
  {
    id: 5,
    title: "Viral Red Cushion Foundation test",
    author: "Beauty Daily",
    image: "/pins/How TIRTIR’s Viral Red Cushion Foundation Went From 3 to 40 Shades in Less Than a Year.webp",
    isVideo: false,
    duration: null,
  },
  {
    id: 6,
    title: "Cozy campfire aesthetic & recipes",
    author: "Outdoor Vibes",
    image: "/pins/Campfire comfort.webp",
    isVideo: true,
    duration: "0:15",
  },
  {
    id: 7,
    title: "African American canvas art piece",
    author: "Matte Print Lab",
    image: "/pins/Elegant Together – Black Women Sitting Print - 29_7x42 cm _ Museum Quality Matte Paper.webp",
    isVideo: false,
    duration: null,
  },
  {
    id: 8,
    title: "Handmade ceramic mug inspo",
    author: "Pottery World",
    image: "/pins/2251868558904023.jpg",
    isVideo: false,
    duration: null,
  },
  {
    id: 9,
    title: "Minimalist living room decor",
    author: "Interior Nest",
    image: "/pins/2744449769477436.webp",
    isVideo: true,
    duration: "0:45",
  },
  {
    id: 10,
    title: "Graphic streetwear jacket design",
    author: "Urban Thread",
    image: "/pins/1407443628414407.webp",
    isVideo: false,
    duration: null,
  },
  {
    id: 11,
    title: "Create a life you love quote art",
    author: "InspireDaily",
    image: "/pins/create-a-life.avif",
    isVideo: false,
    duration: null,
  },
  {
    id: 12,
    title: "Fine line tattoo placement ideas",
    author: "Ink & Needle",
    image: "/pins/604889793746585636.webp",
    isVideo: false,
    duration: null,
  },
  {
    id: 13,
    title: "Modern Afro Editorial Photography",
    author: "Studio Afro",
    image: "/pins/Afro.jpg",
    isVideo: false,
    duration: null,
  },
  {
    id: 14,
    title: "Skintific Cushion Launch Review",
    author: "Glow Journal",
    image: "/pins/Skintific New Launch Cushion💙.webp",
    isVideo: true,
    duration: "0:18",
  },
];

export default function WhatsNewOnPinterest({ onExplorePin }) {
  const [savedPins, setSavedPins] = useState(new Set([2, 5, 8]));

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSavedPins(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="pt-16 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Left-Aligned Section Title */}
      <div className="mb-6 sm:mb-8 text-left">
        <h2 className="text-4xl sm:text-[44px] lg:text-[48px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
          What's new on Pinterest
        </h2>
      </div>

      {/* Responsive Staggered Masonry Grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3.5 sm:gap-4 space-y-3.5 sm:space-y-4">
        {WHATS_NEW_PINS.map((pin, idx) => {
          const isSaved = savedPins.has(pin.id);
          return (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              onClick={() => onExplorePin?.(pin.title)}
              className="break-inside-avoid group relative rounded-[20px] overflow-hidden bg-transparent border-0 cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative rounded-[20px] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img
                  src={pin.image}
                  alt={pin.title}
                  className="w-full h-auto block object-cover group-hover:brightness-95 transition-all duration-300"
                  loading="lazy"
                />

                {/* Video Duration Badge (Top-Left) */}
                {pin.isVideo && pin.duration && (
                  <div className="absolute top-3 left-3 bg-white text-black text-[11px] font-medium px-2 py-0.5 rounded-full shadow-xs pointer-events-none z-10">
                    {pin.duration}
                  </div>
                )}

                {/* Floating Save Button on Hover (Top-Right) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <button
                    onClick={(e) => toggleSave(e, pin.id)}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-[#E60023] text-white hover:bg-red-700'
                    }`}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Title, Author & Overflow Menu */}
              <div className="flex items-start justify-between pt-2 px-1 gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#111111] dark:text-white font-medium text-[15px] leading-snug line-clamp-2">
                    {pin.title}
                  </h4>
                  {pin.author && (
                    <p className="text-[#666666] dark:text-gray-400 text-[13px] line-clamp-1 mt-0.5">
                      {pin.author}
                    </p>
                  )}
                </div>

                {/* Neutral Circular 3-Dot Overflow Menu */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer text-[#666666] dark:text-gray-400 shrink-0 transition-colors mt-0.5"
                >
                  <MoreHorizontal size={18} />
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Centered Pill Button to Explore All Pins */}
      <div className="mt-10 sm:mt-12 text-center">
        <button
          onClick={() => onExplorePin?.("")}
          className="px-8 py-3.5 rounded-full bg-[#E9E9E9] hover:bg-[#E2E2E2] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#111111] dark:text-white font-semibold text-base border-0 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
        >
          Explore more pins
        </button>
      </div>

    </section>
  );
}
