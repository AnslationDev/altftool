"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Heart, Share2, Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { MOCK_DATA } from '../../data/mockData';

export default function InspirationGrid({ onExplorePin }) {
  const [savedPins, setSavedPins] = useState(new Set([1, 4, 8, 12]));

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
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Sparkles size={16} />
            <span>Visual Moodboards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Popular Inspiration Grid
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Explore top-performing visual pins curated from active design boards.
        </p>
      </div>

      {/* Masonry Columns Layout */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
        {MOCK_DATA.map((pin, idx) => {
          const isSaved = savedPins.has(pin.id);
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
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {pin.category}
                  </span>
                  <button
                    onClick={(e) => toggleSave(e, pin.id)}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all ${isSaved
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-[#E60023] text-white hover:bg-red-700'
                      }`}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Bottom Title & Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">
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
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#E60023] hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
        >
          <span>Explore All 10,000+ Live Pins</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
