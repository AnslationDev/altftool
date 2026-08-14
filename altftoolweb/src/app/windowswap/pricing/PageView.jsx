"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Sparkles, HelpCircle } from "lucide-react";
import "../style/windowswap.css";

export default function PricingPage() {
  const features = [
    { name: "Random embedded window views", current: true, planned: true },
    { name: "Fullscreen and category switching", current: true, planned: true },
    { name: "Save a private window draft in this browser", current: true, planned: true },
    { name: "Back button (revisit previous windows)", current: false, planned: true },
    { name: "Search and filtering", current: false, planned: true },
    { name: "Bookmarks and collections", current: false, planned: true },
    { name: "Custom view playlists", current: false, planned: true },
  ];

  return (
    <div className="windowswap-theme min-h-screen font-sans antialiased flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">

      {/* ──────────────────────────────────────────────────────── */}
      {/* HEADER NAVBAR */}
      {/* ──────────────────────────────────────────────────────── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <Link
          href="/windowswap"
          className="flex items-center gap-2 text-windowswap-cream hover:text-white transition duration-200 text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" /> Back to WindowSwap
        </Link>
        <span className="font-serif text-xl tracking-[0.2em] font-medium text-white select-none">
          WindowSwap
        </span>
        <div className="w-24" /> {/* Alignment balancer */}
      </header>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-16">

        {/* HERO HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] tracking-[0.3em] font-bold text-windowswap-cream/70 uppercase">Concept preview — unavailable</span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-windowswap-peach leading-tight">
            All-Access is not available
          </h1>
          <p className="text-sm text-windowswap-cream/80 font-light leading-relaxed">
            This page previews possible future features. There is no All-Access account, billing, waitlist, purchase, or creator-payout system.
          </p>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

          {/* FREE PLAN CARD */}
          <div className="windowswap-card p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase">Current demo</span>
                <h3 className="font-serif text-2xl font-semibold text-white">Available Now</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Browse the embedded window views and save a private window draft on this device.
                </p>
              </div>

              <div className="flex items-baseline">
                <span className="font-serif text-4xl md:text-5xl font-bold text-white">$0</span>
                <span className="text-xs text-zinc-400 font-medium ml-2">no account required</span>
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Random embedded window views</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Fullscreen and category switching</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Save a private draft in this browser</span>
                </li>
                <li className="flex items-start gap-3 text-zinc-500 line-through">
                  <X className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>Bookmarks & custom playlists</span>
                </li>
                <li className="flex items-start gap-3 text-zinc-500 line-through">
                  <X className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>Back button & location search</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                disabled
                className="w-full border border-border bg-muted/60 text-muted-foreground py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase select-none cursor-not-allowed"
              >
                Current Demo
              </button>
            </div>
          </div>

          {/* ALL ACCESS PREMIUM CARD */}
          <div className="windowswap-card p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
            {/* Top highlight ribbon */}
            <div className="absolute top-0 right-0 bg-windowswap-terracotta text-white text-[9px] font-bold tracking-widest px-4 py-1.5 uppercase rounded-bl-xl select-none">
              Concept Only
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-windowswap-peach font-bold uppercase">Future idea</span>
                <h3 className="font-serif text-2xl font-semibold text-white">Planned All-Access</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Illustrative feature ideas only. No account, subscription, checkout, or launch date exists.
                </p>
              </div>

              <div className="flex items-baseline">
                <span className="font-serif text-4xl md:text-5xl font-bold text-white">Not for sale</span>
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-white">Planned: back button</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-white">Planned: search and filtering</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Planned: bookmark collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Planned: custom view playlists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Plans, price, and launch date are undecided</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled
                className="w-full border border-border bg-muted/60 text-muted-foreground py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase select-none cursor-not-allowed"
              >
                Waitlist Unavailable
              </button>
              <p className="mt-2 text-center text-[10px] text-windowswap-cream/60">
                No signup is recorded and no payment is collected.
              </p>
            </div>
          </div>

        </div>

        {/* COMPARISON MATRIX SECTION */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl font-medium text-white">Current demo and future ideas</h3>
            <p className="text-xs text-windowswap-cream/70 font-light">Planned items are concepts, not an available subscription.</p>
          </div>

          <div className="windowswap-card overflow-hidden backdrop-blur-sm">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-teal-950/30 text-xs">
                <thead>
                  <tr className="bg-muted text-[10px] tracking-wider uppercase font-bold text-windowswap-cream">
                    <th scope="col" className="px-6 py-4 text-left font-bold">Capabilities</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold">Current demo</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold text-windowswap-peach">Planned only</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-950/20 text-windowswap-cream/90">
                  {features.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition duration-150">
                      <td className="px-6 py-4 font-medium text-left">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        {item.current ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-white">
                        {item.planned ? (
                          <Check className="h-4 w-4 text-windowswap-terracotta mx-auto font-bold" />
                        ) : (
                          <X className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ABOUT ALL-ACCESS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto border-t border-teal-950/30 pt-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Sparkles className="h-8 w-8 text-windowswap-peach shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">A concept, not a product</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">Feature ideas may change; there is no membership or creator-revenue program.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <HelpCircle className="h-8 w-8 text-windowswap-peach shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Not live yet</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">The embedded viewing demo is available. All-Access billing and signup do not exist.</p>
            </div>
          </div>
        </div>

      </main>

      {/* ──────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-widest text-windowswap-cream/55 select-none font-medium">
        <span>WINDOWSWAP</span>
        <span className="uppercase mt-2 sm:mt-0">NO SUBSCRIPTIONS OR PAYMENTS ARE AVAILABLE</span>
      </footer>

    </div>
  );
}
