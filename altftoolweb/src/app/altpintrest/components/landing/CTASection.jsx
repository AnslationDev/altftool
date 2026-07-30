"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export default function CTASection({ onExplore }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-lg bg-primary p-8 text-center text-primary-foreground shadow-lg sm:p-12 sm:text-left lg:flex-row lg:p-16">
        <div className="max-w-2xl space-y-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} aria-hidden="true" />
            <span>Explore visual ideas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Browse the AltPinterest visual library
          </h2>
          <p className="max-w-xl text-base font-normal text-primary-foreground/90 sm:text-lg">
            Search curated visuals and available live pins by category, then save ideas locally for this browser session.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={() => onExplore()}
            className="flex min-h-11 items-center gap-3 rounded-lg bg-surface px-8 py-4 text-base font-extrabold text-foreground shadow-md transition-all hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground sm:text-lg"
          >
            <Compass size={22} className="text-primary" aria-hidden="true" />
            <span>Browse visual library</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
}
