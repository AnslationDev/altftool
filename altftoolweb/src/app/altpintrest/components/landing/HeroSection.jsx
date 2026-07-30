"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, ChevronDown, RefreshCw, Sparkle } from 'lucide-react';

// Topic categories with synchronized text, accent colors, and image collections
const TOPIC_CATEGORIES = [
  {
    id: 'decor',
    text: 'home decor idea',
    accentColor: '#E60023', // Pinterest Red
    bgGradient: 'from-red-500/10 via-white to-gray-50 dark:from-red-950/40 dark:via-zinc-950 dark:to-black',
    badge: 'Trending Interior Design',
    images: [
      '/pins/Campfire comfort.webp',
      '/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg',
      '/pins/2251868558904023.jpg',
      '/pins/422281212308384.jpg',
      '/pins/2744449769477436.webp',
      '/pins/604889793746585636.webp',
      '/pins/230739180905009958.webp',
      '/pins/438115870021984227.webp',
      '/pins/633387444029154.webp',
      '/pins/2040762329177782.webp',
      '/pins/1407443628414407.webp',
      '/pins/1055599909375314.webp',
    ],
  },
  {
    id: 'outfit',
    text: 'outfit & style idea',
    accentColor: '#EC4899', // Pink Accent
    bgGradient: 'from-pink-500/10 via-white to-gray-50 dark:from-pink-950/40 dark:via-zinc-950 dark:to-black',
    badge: 'Fashion & Aesthetic',
    images: [
      '/pins/How TIRTIR’s Viral Red Cushion Foundation Went From 3 to 40 Shades in Less Than a Year.webp',
      '/pins/Afro.jpg',
      '/pins/Elegant Together – Black Women Sitting Print - 29_7x42 cm _ Museum Quality Matte Paper.webp',
      '/pins/Skintific New Launch Cushion💙.webp',
      '/pins/ad eBay _ $23_68 _ Black Girl Canvas Wall Art African American Woman painting Decor Pictures Ret___.jpg',
      '/pins/1050464681855394612.webp',
      '/pins/610378555811432711.jpg',
      '/pins/424182858677944671.jpg',
      '/pins/51450bb8e74a6d3f0ebffcc113abc8cb_webp 574×1,024….webp',
      '/pins/download (1).jpg',
      '/pins/download (2).webp',
      '/pins/download (3).webp',
    ],
  },
  {
    id: 'green-thumb',
    text: 'green thumb idea',
    accentColor: '#10B981', // Emerald Accent
    bgGradient: 'from-emerald-500/10 via-white to-gray-50 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-black',
    badge: 'Plants & Urban Jungle',
    images: [
      '/altpintrest-images/pin-card-6.png',
      '/pins/Campfire comfort.webp',
      '/altpintrest-images/pin-card-7.png',
      '/pins/Full Moon Tea Towels (cotton, Poly) - Etsy Canada.jpg',
      '/pins/2744449769477436.webp',
      '/pins/230739180905009958.webp',
      '/altpintrest-images/pin-card-2.png',
      '/pins/438115870021984227.webp',
      '/pins/2251868558904023.jpg',
      '/pins/422281212308384.jpg',
      '/pins/604889793746585636.webp',
      '/pins/1407443628414407.webp',
    ],
  },
  {
    id: 'ui-design',
    text: 'UI & AI design idea',
    accentColor: '#3B82F6', // Blue Accent
    bgGradient: 'from-blue-500/10 via-white to-gray-50 dark:from-blue-950/40 dark:via-zinc-950 dark:to-black',
    badge: 'GenAI & Creative Tools',
    images: [
      '/altpintrest-images/pin-card-1.png',
      '/altpintrest-images/pin-card-3.png',
      '/altpintrest-images/pin-card-5.png',
      '/altpintrest-images/pin-card-10.png',
      '/altpintrest-images/Component 4.png',
      '/altpintrest-images/pin-card-12.png',
      '/pins/MIDJOURNEY promt Eye.webp',
      '/altpintrest-images/pin-card-8.png',
      '/altpintrest-images/pin-card-9.png',
      '/altpintrest-images/pin-card-11.png',
      '/altpintrest-images/pin-card-4.png',
      '/altpintrest-images/pin-card.png',
    ],
  },
];

// Helper to chunk images into 4 columns
const getColumnImages = (images, colIndex) => {
  const colImages = [];
  for (let i = colIndex; i < images.length; i += 4) {
    colImages.push(images[i]);
  }
  return [...colImages, ...colImages, ...colImages];
};

export default function HeroSection({ onExplore }) {
  const [topicIndex, setTopicIndex] = useState(0);
  const [scene, setScene] = useState(1); // 1 = Floating Marquee Hero, 2 = Next Scene 3D Showcase
  const [hoveredCard, setHoveredCard] = useState(null);

  const activeTopic = TOPIC_CATEGORIES[topicIndex];

  // STEP 8 — Automatic Infinite Loop (8.0 Seconds per Topic Cycle)
  useEffect(() => {
    if (scene !== 1) return;
    const interval = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % TOPIC_CATEGORIES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [scene]);

  const columnsConfig = [
    { id: 1, speedDuration: 22, direction: 'up' },
    { id: 2, speedDuration: 32, direction: 'down' },
    { id: 3, speedDuration: 26, direction: 'up' },
    { id: 4, speedDuration: 20, direction: 'down' },
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-white select-none">

      {/* STEP 6 — Theme Color Morphing Background Interpolation */}
      <motion.div
        key={activeTopic.id + '-bg'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className={`absolute inset-0 bg-gradient-to-b ${activeTopic.bgGradient} pointer-events-none`}
      />

      {/* ========================================================================= */}
      {/* STAGE 1: OFFICIAL INFINITE PINTEREST HERO ANIMATION TIMELINE              */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div
            key="scene-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex flex-col justify-between"
          >

            {/* Horizontal Drifting Movement Wrapper */}
            <motion.div
              animate={{
                x: [-18, 18, -18],
                rotate: [-0.6, 0.6, -0.6],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-8 opacity-90 pointer-events-auto"
            >
              {columnsConfig.map((col, colIdx) => {
                const colImages = getColumnImages(activeTopic.images, colIdx);
                const isMovingUp = col.direction === 'up';

                return (
                  <div
                    key={col.id}
                    className="relative overflow-hidden h-[120vh] -top-[10vh] group/column"
                  >
                    {/* STEP 1 — Continuous Vertical Scroll Parallax */}
                    <motion.div
                      animate={{
                        y: isMovingUp ? ['0%', '-50%'] : ['-50%', '0%'],
                      }}
                      transition={{
                        duration: col.speedDuration,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="flex flex-col gap-4 sm:gap-6 group-hover/column:[animation-play-state:paused]"
                    >
                      {/* STEP 3 & STEP 5 — RADIAL COLLAPSE / BURST & STAGGERED FLY OUT */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTopic.id + '-col-' + colIdx}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={{
                            initial: { opacity: 0 },
                            animate: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.08, // Staggered ripple timing (80ms between cards)
                                delayChildren: colIdx * 0.06,
                              }
                            },
                            exit: {
                              opacity: 0,
                              transition: {
                                staggerChildren: 0.04,
                                staggerDirection: -1
                              }
                            }
                          }}
                          className="flex flex-col gap-4 sm:gap-6"
                        >
                          {colImages.map((imgUrl, imgIdx) => {
                            const cardId = `col-${colIdx}-img-${imgIdx}`;
                            const offsetX = (colIdx < 2 ? 180 : -180) * (imgIdx % 2 === 0 ? 1 : 0.85);
                            const offsetY = imgIdx < colImages.length / 2 ? 220 : -220;

                            return (
                              <motion.div
                                key={cardId}
                                variants={{
                                  initial: {
                                    opacity: 0,
                                    scale: 0,
                                    x: offsetX,
                                    y: offsetY,
                                    rotate: (colIdx % 2 === 0 ? 15 : -15)
                                  },
                                  animate: {
                                    opacity: 1,
                                    scale: 1,
                                    x: 0,
                                    y: 0,
                                    rotate: 0,
                                    transition: {
                                      type: 'spring',
                                      stiffness: 180,
                                      damping: 20,
                                    }
                                  },
                                  exit: {
                                    opacity: 0,
                                    scale: 0.1,
                                    x: offsetX * 0.4,
                                    y: offsetY * 0.4,
                                    rotate: (colIdx % 2 === 0 ? -18 : 18),
                                    transition: {
                                      duration: 0.45,
                                      ease: [0.4, 0, 0.2, 1]
                                    }
                                  }
                                }}
                                className="relative rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/10 shadow-lg transition-all duration-300 transform-gpu"
                                style={{ perspective: 1000 }}
                                onMouseEnter={() => setHoveredCard(cardId)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => onExplore(activeTopic.text)}
                              >
                                {/* STEP 1 & STEP 7 — CONTINUOUS INDEPENDENT FLOATING MOTION */}
                                <motion.div
                                  animate={{
                                    y: [-8, 8, -8],
                                  }}
                                  transition={{
                                    duration: 3.2 + (imgIdx % 4) * 0.7,
                                    delay: (imgIdx % 5) * 0.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                  whileHover={{
                                    scale: 1.08,
                                    rotateX: (imgIdx % 2 === 0 ? 8 : -8),
                                    rotateY: (colIdx % 2 === 0 ? -8 : 8),
                                    z: 30,
                                    boxShadow: `0 20px 45px ${activeTopic.accentColor}44`,
                                  }}
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Pinterest Pin"
                                    className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                                    loading="lazy"
                                  />

                                  {/* Subtle Overlay Glow */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                      {activeTopic.badge}
                                    </span>
                                  </div>
                                </motion.div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* MINIMAL CENTER OVERLAY — SCALING OUT FROM CENTER TO FRONT */}
            <div className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
              <div className="pointer-events-auto">
                {/* Minimal White Category Card (Scales Out from Center to Front) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTopic.id}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                        delay: 0.1
                      }
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.15,
                      y: 0,
                      transition: { duration: 0.35, ease: 'easeIn' }
                    }}
                    className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-xl shadow-black/5 rounded-full px-6 sm:px-9 py-3.5 sm:py-4 inline-flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
                    onClick={() => onExplore(activeTopic.text)}
                  >
                    <span
                      className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight capitalize"
                      style={{ color: activeTopic.accentColor }}
                    >
                      {activeTopic.text}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Stage Reveal Trigger Button */}
            <div className="relative z-30 pb-8 flex justify-center pointer-events-auto">
              <button
                onClick={() => setScene(2)}
                className="px-6 py-3 rounded-full bg-gray-900 text-white dark:bg-white/10 dark:text-white hover:bg-black backdrop-blur-md border border-gray-200 dark:border-white/20 font-semibold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>Next Scene ➔</span>
                <ChevronDown size={16} className="animate-bounce" />
              </button>
            </div>

          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: DEDICATED 3D FLOATING SHOWCASE & EDITORIAL HIGHLIGHTS              */}
        {/* ========================================================================= */}
        {scene === 2 && (
          <motion.div
            key="scene-2"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 z-30 bg-white dark:bg-zinc-950"
          >
            <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: 3D Floating Showcase Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-6 flex justify-center"
              >
                <div className="relative w-72 sm:w-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-white/20 bg-white dark:bg-zinc-900 group transform-gpu hover:scale-105 transition-transform duration-500">
                  <img
                    src="/pins/MIDJOURNEY promt Eye.webp"
                    alt="Pinterest Featured Pin"
                    className="w-full h-[450px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold w-fit uppercase tracking-wider mb-2">
                      Spotlight Collection
                    </span>
                    <h3 className="text-xl font-bold text-white">Generative Art & Visual Prompts</h3>
                    <p className="text-xs text-gray-200 mt-1">Curated by top global creators on AltPinterest.</p>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Editorial Showcase Text */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-500/20 text-[#E60023] dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkle size={16} />
                  <span>Interactive Discovery Scene</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Turn your ideas into <br />
                  <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                    real-world achievements
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Pinterest is where people explore possibilities, organize inspiration into digital boards, and purchase products that bring their visions to life. From aesthetic living room makeovers to step-by-step coding guides, discover it all in one unified experience.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <button
                    onClick={() => onExplore('')}
                    className="px-8 py-4 rounded-full bg-[#E60023] hover:bg-red-700 text-white font-extrabold text-base shadow-xl shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-3"
                  >
                    <span>Browse All Live Pins</span>
                    <ArrowRight size={20} />
                  </button>

                  <button
                    onClick={() => setScene(1)}
                    className="px-6 py-4 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    <span>↩ Back to Floating Grid</span>
                  </button>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
