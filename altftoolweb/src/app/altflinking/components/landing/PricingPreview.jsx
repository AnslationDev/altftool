/**
 * Transparent Pricing & Escrow Fee Structure Component
 * Location: src/app/altflinking/components/landing/PricingPreview.jsx
 */

"use client";

import React from "react";
import { Check, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";

export default function PricingPreview({ onExploreMarketplace, onListWebsite }) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-xs text-slate-500">Zero hidden fees for publishers. Protected escrow guarantee for SEO buyers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Publisher Tier Card */}
        <div className="altf-card p-8 space-y-6 flex flex-col justify-between border-slate-200">
          <div className="space-y-4">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
              FOR PUBLISHERS
            </span>
            <div>
              <p className="text-3xl font-black text-white font-mono">$0 <span className="text-xs font-normal text-slate-500">Upfront Listing Fee</span></p>
              <p className="text-xs text-slate-500 mt-1">Keep 100% of your set listing prices</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Instant DNS TXT record ownership verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Set your custom guest post & insertion prices</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Automatic payout releases to your bank wallet</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onListWebsite}
            className="altf-btn-secondary w-full py-3 text-xs font-bold"
          >
            <span>List Domain Free</span>
            <Globe className="h-4 w-4 text-indigo-400" />
          </button>
        </div>

        {/* Buyer Tier Card */}
        <div className="altf-card p-8 space-y-6 flex flex-col justify-between border-indigo-500/40 bg-gradient-to-b from-indigo-50 to-white">
          <div className="space-y-4">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              FOR SEO BUYERS & AGENCIES
            </span>
            <div>
              <p className="text-3xl font-black text-white font-mono">15% <span className="text-xs font-normal text-slate-500">Escrow & Verification Fee</span></p>
              <p className="text-xs text-slate-500 mt-1">Funds held safely until link passes Google indexation check</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Access to 1,400+ verified DR 50-90+ domains</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>24/7 automated dofollow link crawler</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Full refund guarantee if TAT limit is missed</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onExploreMarketplace}
            className="altf-btn-primary w-full py-3 text-xs font-bold"
          >
            <span>Explore Directory</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
