/**
 * Reference-Match Enterprise Landing Hero Component
 * Location: src/app/altflinking/components/landing/LandingHero.jsx
 */

"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Sparkles, SlidersHorizontal, Check } from "lucide-react";
import { NICHES } from "../../types";

export default function LandingHero({ onExploreMarketplace, onListWebsite, onSearchFilter }) {
  const [searchTab, setSearchTab] = useState("domain");
  const [domainSearch, setDomainSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [country, setCountry] = useState("All Countries");
  const [language, setLanguage] = useState("All Languages");
  const [drMin, setDrMin] = useState("");
  const [drMax, setDrMax] = useState("");
  const [daMin, setDaMin] = useState("");
  const [daMax, setDaMax] = useState("");
  const [trafficMin, setTrafficMin] = useState("");
  const [trafficMax, setTrafficMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchFilter) {
      onSearchFilter({
        search: domainSearch,
        niche: category === "All Categories" ? "All" : category,
        minDr: drMin ? Number(drMin) : 0,
        minTraffic: trafficMin ? Number(trafficMin) : 0,
        maxPrice: priceMax ? Number(priceMax) : 500,
      });
    }
  };

  return (
    <div className="relative py-4 sm:py-8">
      {/* Hero Outer Wrapper Container (Pure Light SaaS Styling) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 shadow-xl p-6 sm:p-10 lg:p-14">

        {/* Soft Network Background Graphic */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-multiply transition-opacity"
          style={{ backgroundImage: `url('/assets/hero_network_bg.png')` }}
        />
        {/* Soft Light Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-slate-50/80 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">

        {/* Trust Pill Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
          <span>Publisher-submitted listings with admin review</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
          Explore Publisher-Submitted{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Placement Listings
          </span>{" "}
          <br className="hidden sm:block" />
          With Explicit Pricing
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Compare the details publishers provide, then submit a placement request for admin and publisher review.
        </p>

        {/* Comprehensive Search Box Overlay Card (Reference Match) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-left max-w-3xl mx-auto">

          {/* Top Search Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchTab("domain")}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition ${
                  searchTab === "domain"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:hover:text-indigo-600"
                }`}
              >
                Search by Domain
              </button>
              <button
                type="button"
                onClick={() => setSearchTab("keyword")}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition ${
                  searchTab === "keyword"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:hover:text-indigo-600"
                }`}
              >
                Search by Keyword
              </button>
            </div>

            <button
              type="button"
              onClick={onExploreMarketplace}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Advanced Search</span>
            </button>
          </div>

          {/* Form Filter Inputs */}
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Input Search Field */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Enter a publisher domain"
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 7 Dropdowns Grid (Row matching reference image) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 "
                >
                  <option value="All Categories">All Categories</option>
                  {NICHES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 "
                >
                  <option>All Countries</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 "
                >
                  <option>All Languages</option>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">DR (Min - Max)</label>
                <input
                  type="number"
                  placeholder="Min - Max"
                  value={drMin}
                  onChange={(e) => setDrMin(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">DA (Min - Max)</label>
                <input
                  type="number"
                  placeholder="Min - Max"
                  value={daMin}
                  onChange={(e) => setDaMin(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Traffic (Min - Max)</label>
                <input
                  type="number"
                  placeholder="Min - Max"
                  value={trafficMin}
                  onChange={(e) => setTrafficMin(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Price (Min - Max)</label>
                <input
                  type="number"
                  placeholder="Min - Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-200 ">
              <button
                type="submit"
                className="altf-btn-primary py-2.5 px-6 text-xs font-extrabold rounded-xl shadow-md shadow-indigo-600/30"
              >
                <span>Explore Marketplace</span>
              </button>

              <button
                type="button"
                onClick={onListWebsite}
                className="altf-btn-secondary py-2.5 px-5 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>Become a Publisher</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 pt-2">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <Check className="h-4 w-4" />
            Publisher-set prices only
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600">
            <Check className="h-4 w-4" />
            Unknown prices cannot be ordered
          </span>
        </div>

      </div>
    </div>
  </div>
  );
}
