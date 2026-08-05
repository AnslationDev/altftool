/**
 * 20+ Year UX/UI Dedicated Guest Post Directory Page
 * Location: src/app/altflinking/components/marketplace/GuestPostsDirectoryView.jsx
 */

"use client";

import React, { useState } from "react";
import {
  FileEdit,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Eye,
  ShoppingBag,
  ArrowRight,
  Grid,
  List,
  Flame,
  Zap,
  DollarSign,
} from "lucide-react";
import FilterSidebar from "../common/FilterSidebar";
import WebsiteCard from "./WebsiteCard";

import { resolveGuestPostPrice, formatPrice } from "../../lib/pricing";
export default function GuestPostsDirectoryView({
  websites,
  filters,
  setFilters,
  resetFilters,
  onQuickPreview,
  onSelectOrder,
  compareList,
  onToggleCompare,
  cartItems,
  onAddToCart,
  showToast,
}) {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Apply Fast Filter Presets
  const applyPreset = (type) => {
    if (type === "top_dr") {
      setFilters({ ...filters, minDr: 70 });
      showToast("Filtered by Top DR (70+)");
    } else if (type === "fast_tat") {
      setFilters({ ...filters, maxTat: 3 });
      showToast("Filtered by Fast TAT (< 3 Days)");
    } else if (type === "under_200") {
      setFilters({ ...filters, maxPrice: 200 });
      showToast("Filtered by Price Under $200");
    } else if (type === "tech") {
      setFilters({ ...filters, niche: "Technology" });
      showToast("Filtered by Tech & SaaS");
    } else if (type === "finance") {
      setFilters({ ...filters, niche: "Finance" });
      showToast("Filtered by Finance & Crypto");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* 1. Hero Spotlight Banner */}
      <div className="altf-card p-6 sm:p-10 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 border border-indigo-200 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>EDITORIAL GUEST POST MARKETPLACE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Review Guest Post Listings <br className="hidden sm:block" />
              Before Requesting Placement
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Browse approved publisher listings with their submitted metrics, turnaround targets, guidelines, and explicit guest-post prices. A request does not guarantee publication or search indexing.
            </p>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <FileEdit className="h-4 w-4 text-indigo-600" />
                {websites.length} Approved Listing{websites.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Clock className="h-4 w-4 text-cyan-600" />
                Publisher-Stated Timing
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Admin-Reviewed Listings
              </span>
            </div>
          </div>

          {/* Preset Fast-Filter Buttons Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 shrink-0 lg:w-72">
            <p className="text-xs font-black text-slate-900 uppercase font-mono">Fast Presets</p>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => applyPreset("top_dr")}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-bold text-slate-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  Top DR (70+)
                </span>
                <span className="text-[10px] font-mono text-slate-500">High Authority</span>
              </button>

              <button
                onClick={() => applyPreset("fast_tat")}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-bold text-slate-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-500" />
                  Fast TAT (&lt; 3 Days)
                </span>
                <span className="text-[10px] font-mono text-slate-500">Express Delivery</span>
              </button>

              <button
                onClick={() => applyPreset("under_200")}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-bold text-slate-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Budget Under $200
                </span>
                <span className="text-[10px] font-mono text-slate-500">Best Value</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Directory Toolbar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900">
            {websites.length} Guest Post Opportunities
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            Approved Listings
          </span>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Grid / Table Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* 3. Main Content: Sidebar + Directory List/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Faceted Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            totalResults={websites.length}
          />
        </div>

        {/* Directory Output Area */}
        <div className="lg:col-span-3">
          {websites.length === 0 ? (
            <div className="altf-card p-12 text-center space-y-3 bg-white border border-slate-200">
              <p className="text-lg font-bold text-slate-800">
                No guest post publications match your search
              </p>
              <p className="text-xs text-slate-500">
                Try clearing search terms or selecting All Niches in the filter sidebar.
              </p>
              <button
                onClick={resetFilters}
                className="altf-btn-secondary py-2 px-5 text-xs font-bold mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {websites.map((site) => (
                <WebsiteCard
                  key={site.id}
                  site={site}
                  onQuickPreview={onQuickPreview}
                  onSelectOrder={onSelectOrder}
                  isCompared={compareList.some((s) => s.id === site.id)}
                  onToggleCompare={onToggleCompare}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            /* Enterprise Table View for Bulk Agency Ordering */
            <div className="altf-card p-4 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50 uppercase text-[10px]">
                    <th className="p-3">Publication</th>
                    <th className="p-3">DR</th>
                    <th className="p-3">Traffic</th>
                    <th className="p-3">Niche</th>
                    <th className="p-3">TAT</th>
                    <th className="p-3">Guest Post Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {websites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black flex items-center justify-center border border-indigo-100">
                          {(site.domain || "TC").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{site.name || site.domain}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{site.domain}</p>
                        </div>
                      </td>

                      <td className="p-3 font-mono font-black text-indigo-600">
                        DR {site.dr}
                      </td>

                      <td className="p-3 font-mono text-slate-600 font-semibold">
                        {typeof site.traffic === "number" ? `${(site.traffic / 1000).toFixed(0)}k/mo` : site.traffic}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {site.niche}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {site.tatDays || 3}d
                      </td>

                      <td className="p-3 font-mono font-black text-emerald-600 text-sm">
                        {formatPrice(resolveGuestPostPrice(site))}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickPreview(site)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 transition"
                            title="Inspect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectOrder(site)}
                            className="altf-btn-primary py-1 px-3 text-xs font-bold rounded-lg"
                          >
                            Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
