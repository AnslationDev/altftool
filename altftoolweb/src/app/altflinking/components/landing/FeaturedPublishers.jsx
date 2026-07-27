/**
 * Featured Publishers Component (Reference Match)
 * Location: src/app/altflinking/components/landing/FeaturedPublishers.jsx
 */

"use client";

import React from "react";
import { Star, ShieldCheck, ArrowRight } from "lucide-react";

export default function FeaturedPublishers({ onSelectSite, onExploreMarketplace }) {
  const publishers = [
    {
      id: "site_techcrunch_01",
      domain: "TechCrunch.com",
      color: "bg-emerald-600 text-white",
      logoText: "TC",
      dr: 93,
      da: 92,
      traffic: "5.2M/mo",
      price: 280,
      rating: 4.9,
      reviews: 123,
      verified: true,
    },
    {
      id: "site_forbes_02",
      domain: "Forbes.com",
      color: "bg-white text-white border border-slate-200",
      logoText: "Forbes",
      dr: 94,
      da: 93,
      traffic: "8.7M/mo",
      price: 350,
      rating: 4.9,
      reviews: 98,
      verified: true,
    },
    {
      id: "site_bi_03",
      domain: "BusinessInsider.com",
      color: "bg-blue-600 text-white",
      logoText: "BI",
      dr: 91,
      da: 90,
      traffic: "6.1M/mo",
      price: 250,
      rating: 4.8,
      reviews: 76,
      verified: true,
    },
    {
      id: "site_medium_04",
      domain: "Medium.com",
      color: "bg-white text-white font-serif",
      logoText: "M",
      dr: 92,
      da: 91,
      traffic: "4.3M/mo",
      price: 180,
      rating: 4.8,
      reviews: 76,
      verified: true,
    },
    {
      id: "site_yahoo_05",
      domain: "Yahoo.com",
      color: "bg-purple-600 text-white",
      logoText: "yahoo!",
      dr: 92,
      da: 90,
      traffic: "3.2M/mo",
      price: 200,
      rating: 4.7,
      reviews: 58,
      verified: true,
    },
  ];

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Featured Publishers
          </h2>
          <p className="text-xs text-slate-500 ">
            Top quality websites trusted by thousands of marketers.
          </p>
        </div>

        <button
          onClick={onExploreMarketplace}
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
        >
          <span>View All Publishers</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grid of 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {publishers.map((pub) => (
          <div
            key={pub.id}
            onClick={() => onSelectSite && onSelectSite(pub)}
            className="altf-card p-4 rounded-2xl border border-slate-200 space-y-4 hover:border-indigo-500/40 hover:shadow-lg transition cursor-pointer group"
          >
            {/* Top Row: Logo + Domain Name */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${pub.color}`}
              >
                {pub.logoText}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {pub.domain}
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>DR <strong className="text-indigo-600">{pub.dr}</strong></span>
                  <span>DA <strong className="text-blue-600">{pub.da || "—"}</strong></span>
                </div>
              </div>
            </div>

            {/* Traffic Row */}
            <div className="bg-slate-50 p-2 rounded-xl text-[11px] font-mono flex items-center justify-between border border-slate-100 ">
              <span className="text-slate-500">Traffic</span>
              <span className="font-bold text-slate-900 ">{pub.traffic}</span>
            </div>

            {/* Price & Rating Bottom Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 ">
              <div>
                <span className="text-sm font-black text-indigo-600 font-mono">${pub.price}</span>
                <span className="text-[10px] text-slate-500 block font-sans leading-none">Guest Post</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Star className="h-3 w-3 fill-amber-500" />
                <span>{pub.rating}</span>
                <span className="text-[10px] text-slate-500 font-normal">({pub.reviews})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
