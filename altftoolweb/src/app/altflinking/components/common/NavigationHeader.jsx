/**
 * Premium Enterprise Navigation Header
 * Location: src/app/altflinking/components/common/NavigationHeader.jsx
 */

"use client";

import React, { useState } from "react";
import { Link2, LayoutGrid, ShoppingBag, Globe, Shield, Wrench, Sparkles, Search, ChevronRight, Menu, X, ArrowUpRight } from "lucide-react";

export default function NavigationHeader({ activeTab, setActiveTab, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "landing", label: "Overview", icon: Sparkles },
    { id: "marketplace", label: "Marketplace", icon: LayoutGrid, badge: "1.4k+" },
    { id: "buyer", label: "Buyer Portal", icon: ShoppingBag },
    { id: "publisher", label: "Publisher Studio", icon: Globe },
    { id: "admin", label: "Admin Console", icon: Shield },
    { id: "tools", label: "SEO Tools", icon: Wrench },
  ];

  return (
    <header className="altf-glass-nav sticky top-0 z-40 w-full border-b border-slate-200 bg-white backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">

          {/* Brand Logo & Tagline Lockup */}
          <div
            className="flex cursor-pointer items-center gap-3 group transition-transform active:scale-[0.98]"
            onClick={() => setActiveTab("landing")}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:shadow-indigo-500/40 transition-all">
              <Link2 className="h-5 w-5 transition-transform group-hover:rotate-45" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg font-sans">
                  AltF<span className="text-indigo-400">Linking</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                  Marketplace
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-none mt-0.5 hidden xs:block">
                Authority Backlink Ecosystem
              </p>
            </div>
          </div>

          {/* Center Segmented Navigation Pills (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs (Right Cluster) */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Shortcut Trigger */}
            <button
              onClick={() => setActiveTab("marketplace")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-slate-200 text-xs font-medium transition"
              title="Search Websites"
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>Search domains...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* List Website Secondary CTA */}
            <button
              onClick={() => setActiveTab("publisher")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.97]"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              <span>List Website</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setActiveTab("marketplace")}
              className="altf-btn-primary py-2 px-4 text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-[0.97]"
            >
              <span>Explore Marketplace</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 bg-white backdrop-blur-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-600 hover:bg-white hover:text-indigo-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
