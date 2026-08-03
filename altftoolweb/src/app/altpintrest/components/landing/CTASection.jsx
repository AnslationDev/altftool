"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Authentic AltPintrest Pin Images from local public/pins folder
const GALLERY_IMAGES = {
  col1: [
    { src: "/pins/Campfire comfort.webp", label: "Home Decor" },
    { src: "/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg", label: "DIY Craft" },
  ],
  col2: [
    { src: "/pins/2251868558904023.jpg", label: "Interior Design" },
    { src: "/pins/422281212308384.jpg", label: "Aesthetic Space" },
    { src: "/pins/2744449769477436.webp", label: "Art" },
  ],
  col3: [
    { src: "/pins/How TIRTIR’s Viral Red Cushion Foundation Went From 3 to 40 Shades in Less Than a Year.webp", label: "Beauty" },
  ],
  col4: [
    { src: "/pins/MIDJOURNEY promt Eye.webp", label: "AI Art" },
  ],
  col5: [
    { src: "/pins/Afro.jpg", label: "Fashion" },
  ],
  col6: [
    { src: "/pins/Elegant Together – Black Women Sitting Print - 29_7x42 cm _ Museum Quality Matte Paper.webp", label: "Illustration" },
  ],
  col7: [
    { src: "/pins/604889793746585636.webp", label: "Decor" },
    { src: "/pins/230739180905009958.webp", label: "Architecture" },
    { src: "/pins/438115870021984227.webp", label: "Design" },
  ],
  col8: [
    { src: "/pins/633387444029154.webp", label: "Style" },
    { src: "/pins/2040762329177782.webp", label: "Photography" },
  ]
};

const GRID_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7];

// Animation Float Variants with unique delays for staggered wave motion
const floatVariant = (delay = 0, distance = 8) => ({
  animate: {
    y: [-distance, distance, -distance],
    transition: {
      duration: 3.5 + delay * 0.4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay * 0.2,
    }
  }
});

// Pin Card Styling matching reference screenshot
const cardStyle = "w-full rounded-[18px] sm:rounded-[26px] overflow-hidden border border-black/5 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-zinc-800";

export default function CTASection({ onExplore }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="py-8 sm:py-20 px-2 sm:px-6 lg:px-8 max-w-[1560px] mx-auto w-full select-none">

      {/* ========================================================================= */}
      {/* PURE WHITE FLOATING CONTAINER CARD WITH ELEVATION SHADOW                  */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-[28px] sm:rounded-[48px] bg-white dark:bg-zinc-900 border border-gray-100/90 dark:border-zinc-800/90 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-4 sm:p-12 lg:p-16 overflow-hidden">

        {/* Background Vertical Grid Guidelines */}
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 px-4 sm:px-12 lg:px-16 pointer-events-none opacity-30 sm:opacity-40">
          {GRID_COLUMNS.map((colIdx) => (
            <div key={colIdx} className="border-r border-dashed border-gray-200 dark:border-zinc-800 h-full w-full" />
          ))}
        </div>

        {/* TOP STAGGERED ARCH IMAGE GALLERY & CENTRAL HEADING */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">

          {/* Arch Image Collage Grid: Mobile (2 Cols), Tablet (4 Cols), Desktop (8 Cols) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3.5 items-center justify-center opacity-95">

            {/* Column 1 (Far Left - 2 Cards) */}
            <motion.div {...(isMounted ? floatVariant(0.1, 6) : {})} className="flex flex-col gap-2.5 sm:gap-3">
              <div className="hidden sm:block h-16 sm:h-20 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.06, zIndex: 20, y: -4 }}
                className={`h-28 sm:h-40 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col1[0].label)}
              >
                <img src={GALLERY_IMAGES.col1[0].src} alt={GALLERY_IMAGES.col1[0].label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06, zIndex: 20, y: -4 }}
                className={`h-24 sm:h-36 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col1[1].label)}
              >
                <img src={GALLERY_IMAGES.col1[1].src} alt={GALLERY_IMAGES.col1[1].label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 2 (2 Cards on Mobile, 3 Cards on Desktop) */}
            <motion.div {...(isMounted ? floatVariant(0.3, 8) : {})} className="flex flex-col gap-2.5 sm:gap-3">
              <div className="hidden sm:block h-12 sm:h-16 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.06, zIndex: 20, y: -4 }}
                className={`h-24 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col2[0].label)}
              >
                <img src={GALLERY_IMAGES.col2[0].src} alt={GALLERY_IMAGES.col2[0].label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06, zIndex: 20, y: -4 }}
                className={`h-28 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col2[1].label)}
              >
                <img src={GALLERY_IMAGES.col2[1].src} alt={GALLERY_IMAGES.col2[1].label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06, zIndex: 20, y: -4 }}
                className={`hidden sm:block h-20 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col2[2].label)}
              >
                <img src={GALLERY_IMAGES.col2[2].src} alt={GALLERY_IMAGES.col2[2].label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 3 (Tall Vertical Card - Hidden on Mobile) */}
            <motion.div {...(isMounted ? floatVariant(0.5, 9) : {})} className="hidden sm:flex flex-col justify-center gap-3">
              <div className="h-10 sm:h-14 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6 }}
                className={`h-52 sm:h-64 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col3[0].label)}
              >
                <img src={GALLERY_IMAGES.col3[0].src} alt={GALLERY_IMAGES.col3[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 4 (Center Left Tall Card - Hidden on Mobile/Tablet) */}
            <motion.div {...(isMounted ? floatVariant(0.2, 12) : {})} className="hidden md:flex flex-col justify-center gap-3">
              <div className="h-8 sm:h-12 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6 }}
                className={`h-64 sm:h-80 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col4[0].label)}
              >
                <img src={GALLERY_IMAGES.col4[0].src} alt={GALLERY_IMAGES.col4[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 5 (Center Right Tall Card - Hidden on Mobile/Tablet) */}
            <motion.div {...(isMounted ? floatVariant(0.4, 11) : {})} className="hidden md:flex flex-col justify-center gap-3">
              <div className="h-8 sm:h-12 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6 }}
                className={`h-64 sm:h-80 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col5[0].label)}
              >
                <img src={GALLERY_IMAGES.col5[0].src} alt={GALLERY_IMAGES.col5[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 6 (Tall Vertical Card - Hidden on Mobile) */}
            <motion.div {...(isMounted ? floatVariant(0.6, 8) : {})} className="hidden sm:flex flex-col justify-center gap-3">
              <div className="h-10 sm:h-14 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6 }}
                className={`h-52 sm:h-64 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col6[0].label)}
              >
                <img src={GALLERY_IMAGES.col6[0].src} alt={GALLERY_IMAGES.col6[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 7 (Hidden on Mobile) */}
            <motion.div {...(isMounted ? floatVariant(0.3, 10) : {})} className="hidden sm:flex flex-col gap-3">
              <div className="h-12 sm:h-16 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6, rotateY: 6 }}
                className={`h-20 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col7[0].label)}
              >
                <img src={GALLERY_IMAGES.col7[0].src} alt={GALLERY_IMAGES.col7[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6, rotateY: 6 }}
                className={`h-20 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col7[1].label)}
              >
                <img src={GALLERY_IMAGES.col7[1].src} alt={GALLERY_IMAGES.col7[1].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6, rotateY: 6 }}
                className={`h-20 sm:h-24 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col7[2].label)}
              >
                <img src={GALLERY_IMAGES.col7[2].src} alt={GALLERY_IMAGES.col7[2].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

            {/* Column 8 (Hidden on Mobile) */}
            <motion.div {...(isMounted ? floatVariant(0.1, 7) : {})} className="hidden sm:flex flex-col gap-3">
              <div className="h-16 sm:h-20 w-full bg-gray-100/80 dark:bg-zinc-800/40 rounded-[20px]" />
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6, rotateY: 8 }}
                className={`h-28 sm:h-36 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col8[0].label)}
              >
                <img src={GALLERY_IMAGES.col8[0].src} alt={GALLERY_IMAGES.col8[0].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, zIndex: 20, y: -6, rotateY: 8 }}
                className={`h-32 sm:h-40 ${cardStyle}`}
                onClick={() => onExplore?.(GALLERY_IMAGES.col8[1].label)}
              >
                <img src={GALLERY_IMAGES.col8[1].src} alt={GALLERY_IMAGES.col8[1].label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </motion.div>
            </motion.div>

          </div>

          {/* Central Title Section */}
          <div className="mt-6 sm:mt-12 text-center max-w-2xl px-2 sm:px-4 flex flex-col items-center">

            {/* Pill Badge */}
            <div className="inline-flex items-center px-3.5 sm:px-4 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100/80 dark:bg-zinc-800/80 backdrop-blur-xs text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium mb-3 sm:mb-4 shadow-2xs">
              Testimonials
            </div>

            {/* Main Headline */}
            <h2 className="text-xl sm:text-4xl lg:text-[42px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Trusted by creators
            </h2>

            {/* Subtitle */}
            <p className="text-lg sm:text-3xl font-semibold text-gray-400 dark:text-gray-500 tracking-tight mt-0.5">
              from various industries
            </p>

            {/* Description Text */}
            <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 font-normal max-w-md mt-2 sm:mt-3 mb-6 sm:mb-8 leading-relaxed">
              Learn why creators and visionaries trust AltPintrest to find inspiration and bring ideas to life.
            </p>

            {/* EXPLORE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onExplore?.("")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
            >
              <span>Explore All Ideas</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.button>

          </div>

        </div>

      </div>

    </section>
  );
}