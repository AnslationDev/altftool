"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { MOCK_DATA } from '../../data/mockData';
import { useSavedPins } from '../../service/useSavedPins';

export default function InspirationGrid({ onExplorePin }) {
  const { isSaved, toggleSave } = useSavedPins();

  const handleToggleSave = (e, pin) => {
    if (e && e.stopPropagation) e.stopPropagation();
    toggleSave(pin);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Sparkles size={16} />
            <span>Visual Moodboards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Inspiration Grid
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Browse the starter visual ideas included with this board.
        </p>
      </div>

      {/* Masonry Columns Layout */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
        {MOCK_DATA.map((pin, idx) => {
          const pinSaved = isSaved(pin.id);
          return (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 5) * 0.08 }}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-800 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => onExplorePin(pin.id)}
            >
              {/* Media Preview */}
              <img
                src={pin.image}
                alt={pin.title}
                className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">

                {/* Top Right Action Button (Save) */}
                <div className="flex justify-end items-center">
                  <button
                    onClick={(e) => handleToggleSave(e, pin)}
                    aria-label={pinSaved ? "Unsave Pin" : "Save Pin"}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${pinSaved
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-[#0D9488] text-white hover:bg-teal-700'
                      }`}
                  >
                    {pinSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Bottom Title & Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold text-sm leading-tight truncate">
                    {pin.title}
                  </h4>
                  <div className="flex items-center justify-between text-white/80 pt-1 text-xs">
                    <span className="flex items-center gap-1 hover:text-white">
                      <Bookmark size={14} /> Save Idea
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                        <Share2 size={14} />
                      </div>
                      <div className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                        <Download size={14} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid Footer CTA Button */}
      <div className="mt-12 text-center">
        <button
          onClick={() => onExplorePin(null)}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:scale-105 transition-all cursor-pointer"
        >
          <span>Explore Available Pins</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
