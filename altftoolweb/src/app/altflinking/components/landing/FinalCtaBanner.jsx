/**
 * High-Converting Final CTA Section
 * Location: src/app/altflinking/components/landing/FinalCtaBanner.jsx
 */

"use client";

import React from "react";
import { ArrowRight, Globe, Search, Sparkles, ShieldCheck } from "lucide-react";

export default function FinalCtaBanner({ onExploreMarketplace, onListWebsite }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-50 via-white to-slate-50 p-8 sm:p-14 shadow-2xl space-y-6">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Ready to Scale Your Organic Search Rankings?</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Join 1,400+ Verified Publishers & Agencies Today
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Zero upfront listing fees for publishers. Guaranteed indexation and escrow fund protection for SEO buyers. Start building high-DR authority links in minutes.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExploreMarketplace}
            className="altf-btn-primary py-3 px-6 text-xs sm:text-sm font-extrabold rounded-xl"
          >
            <Search className="h-4 w-4" />
            <span>Explore Marketplace Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onListWebsite}
            className="altf-btn-secondary py-3 px-6 text-xs sm:text-sm font-bold rounded-xl"
          >
            <Globe className="h-4 w-4 text-indigo-400" />
            <span>List Your Domain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
