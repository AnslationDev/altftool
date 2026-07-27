/**
 * 20+ Year UX/UI Enterprise Website Card Component
 * Location: src/app/altflinking/components/marketplace/WebsiteCard.jsx
 */

"use client";

import React from "react";
import { ShieldCheck, Eye, Clock, TrendingUp, Plus, Check, ShoppingBag, ArrowRight, Repeat } from "lucide-react";
import TrafficSparklineSvg from "../visuals/TrafficSparklineSvg";

export default function WebsiteCard({ site, onQuickPreview, onSelectOrder, isCompared, onToggleCompare, onAddToCart, isLinkExchange = false }) {
  const isHighDr = site.dr >= 70;

  // Extract logo avatar initials
  const domainName = site.name || site.domain || "website.com";
  const initials = domainName
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .slice(0, 2)
    .toUpperCase();

  const formattedTraffic = typeof site.traffic === "number"
    ? `${(site.traffic / 1000).toFixed(0)}k`
    : site.traffic || "50k";

  return (
    <div className="altf-card p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all duration-200 group bg-white">

      {/* Top Row: Logo Avatar + Domain Header + DR Pill */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">
            {/* Domain Logo Avatar */}
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition flex items-center gap-1.5">
                {domainName}
                {site.verified && (
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" title="Verified Publisher Domain" />
                )}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono truncate">{site.domain}</p>
            </div>
          </div>

          {/* DR & DA Score Badges */}
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono shadow-2xs ${
              isHighDr ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}>
              DR {site.dr}
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-medium">DA {site.da || Math.round(site.dr * 0.95)}</span>
          </div>
        </div>

        {/* Niche Category & Organic Metrics Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
            {site.niche}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-extrabold border border-emerald-200/80">
            {formattedTraffic} traffic/mo
          </span>
          <span className="bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-lg text-[11px] font-mono border border-cyan-200/80 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {site.tatDays || 3}d TAT
          </span>
        </div>
      </div>

      {/* Organic Traffic Sparkline Graph Card */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
            6-Month Organic Trend
          </span>
          <span className="text-emerald-600 font-mono font-extrabold">+28%</span>
        </div>
        <TrafficSparklineSvg trafficHistory={site.trafficHistory} width={220} height={28} />
      </div>

      {/* Pricing / Link Exchange Info Container */}
      <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
        {isLinkExchange || (site.prices?.guestPost === 0 || site.price === 0) ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Repeat className="h-4 w-4 text-indigo-600" />
              <span className="font-extrabold text-indigo-900 text-xs">1:1 Link Exchange</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-200">
              FREE ($0 Fee)
            </span>
          </div>
        ) : (
          <>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none">Guest Post</span>
              <span className="font-mono font-black text-indigo-600 text-sm">
                ${site.prices?.guestPost || site.price || 180}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none">Insertion</span>
              <span className="font-mono font-bold text-slate-700 text-xs">
                ${site.prices?.linkInsertion || Math.round((site.price || 180) * 0.65)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-2 pt-1">
        {/* Tier 1: Secondary Tool Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickPreview(site)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200"
            title="Inspect Domain Details"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Inspect</span>
          </button>

          <button
            onClick={() => onToggleCompare(site)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
              isCompared
                ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                : "bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border-slate-200"
            }`}
            title="Compare Domain"
          >
            {isCompared ? <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> : <Plus className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
            <span>Compare</span>
          </button>

          {onAddToCart && (
            <button
              onClick={() => onAddToCart(site)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200"
              title="Add to Cart"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>Cart</span>
            </button>
          )}
        </div>

        {/* Tier 2: Primary Order Action CTA */}
        <button
          onClick={() => onSelectOrder(site)}
          className="altf-btn-primary w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <span>{isLinkExchange ? "Swap Link Now" : "Order Backlink"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
}
