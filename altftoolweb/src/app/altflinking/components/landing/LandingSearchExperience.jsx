/**
 * Landing Page Embedded Search & Filter Experience
 * Location: src/app/altflinking/components/landing/LandingSearchExperience.jsx
 */

"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { NICHES } from "../../types";

export default function LandingSearchExperience({ onSearchSubmit }) {
  const [query, setQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [minDr, setMinDr] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit({ search: query, niche: selectedNiche, minDr });
  };

  return (
    <div className="altf-card p-6 sm:p-8 space-y-6 border-indigo-500/30 bg-gradient-to-r from-indigo-50 via-white to-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-400" />
            <span>Instant Marketplace Domain Search</span>
          </h2>
          <p className="text-xs text-slate-500">Filter 1,400+ verified publisher domains by DR, organic traffic, and niche</p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 self-start md:self-auto">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Live Index Guaranteed</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Domain Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search domain name or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="altf-input pl-10 text-xs font-medium py-3"
          />
        </div>

        {/* Niche Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="altf-input text-xs font-medium py-3"
          >
            <option value="All">All Niches</option>
            {NICHES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Min DR Selector */}
        <div className="sm:col-span-2">
          <select
            value={minDr}
            onChange={(e) => setMinDr(Number(e.target.value))}
            className="altf-input text-xs font-medium py-3"
          >
            <option value="0">Any DR</option>
            <option value="40">DR 40+</option>
            <option value="50">DR 50+</option>
            <option value="60">DR 60+</option>
            <option value="70">DR 70+</option>
            <option value="80">DR 80+</option>
          </select>
        </div>

        {/* Submit Search Button */}
        <div className="sm:col-span-2">
          <button type="submit" className="altf-btn-primary w-full py-3 text-xs font-extrabold rounded-xl">
            <span>Find Links</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
