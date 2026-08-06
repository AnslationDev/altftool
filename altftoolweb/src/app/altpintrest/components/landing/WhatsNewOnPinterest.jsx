"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Download } from 'lucide-react';
import { downloadPinImage } from '../../service/downloadHelper';
import { useSavedPins } from '../../service/useSavedPins';

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

export default function WhatsNewOnPinterest({ onExplorePin, onSelectPin, pinsData = [] }) {
  const { isSaved, toggleSave } = useSavedPins();

  const displayPins = (pinsData && pinsData.length > 0 ? pinsData : WHATS_NEW_PINS).slice(0, 100);

  const handleToggleSave = (e, pin) => {
    if (e && e.stopPropagation) e.stopPropagation();
    toggleSave(pin);
  };

  const handlePinClick = (pin) => {
    const normalizedPin = {
      id: pin.id || `pin-${Math.random()}`,
      title: pin.title || "Untitled Inspiration",
      image: pin.image || pin.img || pin.logo || pin.url,
      category: pin.category || pin.author || "Design",
      gallery: pin.gallery || [],
      originalData: pin.originalData || pin
    };

    if (onSelectPin) {
      onSelectPin(normalizedPin);
    } else if (onExplorePin) {
      onExplorePin(normalizedPin.title);
    }
  };

  return (
    <section className="pt-16 sm:pt-20 pb-16 px-2 sm:px-4 lg:px-6 max-w-[1560px] mx-auto w-full">

      {/* Left-Aligned Section Title */}
      <div className="mb-6 sm:mb-8 text-left flex items-center justify-between">
        <div>
          <h2 className="text-4xl sm:text-[44px] lg:text-[48px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
            Visual ideas to explore
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse this board&rsquo;s available pins and save the ones worth revisiting.
          </p>
        </div>
      </div>

      {/* Responsive Staggered Masonry Grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3.5 sm:gap-4 space-y-3.5 sm:space-y-4">
        {displayPins.map((pin, idx) => {
          const pinSaved = isSaved(pin.id);
          const pinImage = pin.image || pin.img || pin.logo || pin.url;
          const pinTitle = pin.title || "Untitled";
          const pinAuthor = pin.author || pin.originalData?.author || pin.category || "AltPinterest";

          return (
            <motion.div
              key={pin.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              onClick={() => handlePinClick(pin)}
              className="break-inside-avoid group relative rounded-[20px] overflow-hidden bg-transparent border-0 cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative rounded-[20px] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img
                  src={pinImage}
                  alt={pinTitle}
                  className="w-full h-auto block object-cover group-hover:brightness-95 transition-all duration-300"
                  loading="lazy"
                />

                {/* Video Duration Badge (Top-Left) */}
                {pin.isVideo && pin.duration && (
                  <div className="absolute top-3 left-3 bg-white text-black text-[11px] font-medium px-2 py-0.5 rounded-full shadow-xs pointer-events-none z-10">
                    {pin.duration}
                  </div>
                )}

                {/* Floating Action Buttons on Hover (Top-Right) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      downloadPinImage(pinImage, pinTitle);
                    }}
                    className="p-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full shadow-md border border-gray-200/80 dark:border-zinc-700 transition-colors cursor-pointer"
                    title="Download Image"
                  >
                    <Download size={16} className="text-gray-900 dark:text-white" />
                  </button>
                  <button
                    onClick={(e) => handleToggleSave(e, pin)}
                    aria-label={pinSaved ? "Unsave Pin" : "Save Pin"}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${pinSaved
                      ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-gray-200'
                      : 'bg-[#0D9488] text-white hover:bg-teal-700'
                      }`}
                  >
                    {pinSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Title, Author & Overflow Menu */}
              <div className="flex items-start justify-between pt-2 px-1 gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-[15px] leading-snug truncate">
                    {pinTitle}
                  </h4>
                  {pinAuthor && (
                    <p className="text-gray-500 dark:text-gray-400 text-[13px] line-clamp-1 mt-0.5 capitalize font-medium">
                      {pinAuthor}
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
