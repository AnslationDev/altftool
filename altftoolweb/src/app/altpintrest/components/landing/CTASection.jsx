"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export default function CTASection({ onExplore }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-8 sm:p-12 lg:p-16 text-white shadow-2xl text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">

        {/* Background Subtle Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />

        <div className="max-w-2xl space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Unleash Your Creativity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to discover more Pinterest-style ideas?
          </h2>
          <p className="text-white/90 text-base sm:text-lg font-normal max-w-xl">
            Jump into our curated Pinterest-style feed. Save your favorite pins, share with friends, and start building your boards today.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={() => onExplore()}
            className="px-8 py-4 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-extrabold text-base sm:text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
            <Compass size={22} className="text-[#E60023]" />
            <span>Enter Feed</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}
