/**
 * Faceted Filter Sidebar — Premium Light Theme
 * Location: src/app/altflinking/components/common/FilterSidebar.jsx
 */

"use client";

import React from "react";
import { Filter, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { NICHES, SORT_OPTIONS } from "../../types";

export default function FilterSidebar({ filters, setFilters, resetFilters, totalResults }) {
  return (
    <div className="altf-card p-5 space-y-5 bg-white border border-slate-200 shadow-sm rounded-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          <span>Filter Listings</span>
          <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 font-black border border-indigo-200">
            {totalResults}
          </span>
        </div>

        <button
          onClick={resetFilters}
          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Domain / Topic</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="e.g. tech, saas, journal..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="altf-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Niche Category */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Niche Industry</label>
        <select
          value={filters.niche}
          onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
          className="altf-input text-xs"
        >
          <option value="All">All Niches</option>
          {NICHES.map((niche) => (
            <option key={niche} value={niche}>
              {niche}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum DR */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-bold text-slate-700">Min Domain Rating (DR)</span>
          <span className="font-mono text-indigo-600 font-black">{filters.minDr || 0}+</span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={filters.minDr || 0}
          onChange={(e) => setFilters({ ...filters, minDr: Number(e.target.value) })}
          className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
        />
      </div>

      {/* Minimum Monthly Organic Traffic */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Organic Traffic</label>
        <select
          value={filters.minTraffic}
          onChange={(e) => setFilters({ ...filters, minTraffic: e.target.value })}
          className="altf-input text-xs"
        >
          <option value="0">Any Traffic</option>
          <option value="10000">10,000+ / mo</option>
          <option value="50000">50,000+ / mo</option>
          <option value="100000">100,000+ / mo</option>
          <option value="250000">250,000+ / mo</option>
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-bold text-slate-700">Max Guest Post Price</span>
          <span className="font-mono text-emerald-600 font-black">${filters.maxPrice || 500}</span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="25"
          value={filters.maxPrice || 500}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer h-2"
        />
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Sort Results By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="altf-input text-xs"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
