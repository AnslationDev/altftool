"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Bell, Sparkles, HelpCircle } from "lucide-react";
import "../style/windowswap.css";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
  const [notifyRequested, setNotifyRequested] = useState(false);

  const features = [
    { name: "Random window views (10-min loops)", free: true, paid: true },
    { name: "Ambient sounds & audio toggle", free: true, paid: true },
    { name: "Upload your own window videos", free: true, paid: true },
    { name: "Back button (revisit previous windows)", free: false, paid: true },
    { name: "Search & Filter (by country, tags, weather)", free: false, paid: true },
    { name: "Unlimited bookmarks & collections", free: false, paid: true },
    { name: "Create & share custom view playlists", free: false, paid: true },
    { name: "Direct financial support for uploaders", free: false, paid: true },
    { name: "100% ad-free, quiet meditation", free: false, paid: true },
  ];

  return (
    <div className="windowswap-theme min-h-screen font-sans antialiased flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">

      {/* ──────────────────────────────────────────────────────── */}
      {/* HEADER NAVBAR */}
      {/* ──────────────────────────────────────────────────────── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <Link
          href="/windowswap"
          className="flex items-center gap-2 text-windowswap-cream hover:text-(--windowswap-foreground) transition duration-200 text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" /> Back to WindowSwap
        </Link>
        <span className="font-serif text-xl tracking-[0.2em] font-medium text-(--windowswap-foreground) select-none">
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
          <span className="text-[10px] tracking-[0.3em] font-bold text-windowswap-cream/70 uppercase">WindowSwap All-Access</span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-windowswap-peach leading-tight">
            Support the global window creators
          </h1>
          <p className="text-sm text-windowswap-cream/80 font-light leading-relaxed">
            Choose standard free viewing or unlock All-Access capabilities to search by weather, bookmark your favorite hideaways, and support original uploaders.
          </p>
        </div>

        {/* BILLING TOGGLE SWITCH */}
        <div className="flex justify-center items-center">
          <div className="relative flex items-center p-1 windowswap-card rounded-full select-none">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${billingCycle === "monthly" ? "bg-windowswap-terracotta text-white shadow-md" : "text-windowswap-cream/70 hover:text-(--windowswap-foreground)"
                }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition relative cursor-pointer ${billingCycle === "yearly" ? "bg-windowswap-terracotta text-white shadow-md" : "text-windowswap-cream/70 hover:text-(--windowswap-foreground)"
                }`}
            >
              Billed Yearly
              <span className="absolute -top-3 -right-2 px-2 py-0.5 bg-emerald-600 text-[8px] uppercase tracking-wider rounded-full font-bold text-white shadow-sm scale-90">Save 17%</span>
            </button>
          </div>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

          {/* FREE PLAN CARD */}
          <div className="windowswap-card p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase">Standard tier</span>
                <h3 className="font-serif text-2xl font-semibold text-(--windowswap-foreground)">Free Viewing</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Basic meditative exploration, random window flips, and beautiful sights from all over the globe.
                </p>
              </div>

              <div className="flex items-baseline">
                <span className="font-serif text-4xl md:text-5xl font-bold text-(--windowswap-foreground)">$0</span>
                <span className="text-xs text-zinc-400 font-medium ml-2">/ forever</span>
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Random 10-minute HD loops</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Atmospheric ambient sounds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Upload views from your room</span>
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
                Current Active Tier
              </button>
            </div>
          </div>

          {/* ALL ACCESS PREMIUM CARD */}
          <div className="windowswap-card p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
            {/* Top highlight ribbon */}
            <div className="absolute top-0 right-0 bg-windowswap-terracotta text-white text-[9px] font-bold tracking-widest px-4 py-1.5 uppercase rounded-bl-xl select-none">
              Most Popular
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-windowswap-peach font-bold uppercase">All-Access member</span>
                <h3 className="font-serif text-2xl font-semibold text-(--windowswap-foreground)">WindowSwap Premium</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Directly fund the global creator network, bookmark cozy spots, filter categories, and skip backward freely.
                </p>
              </div>

              <div className="flex items-baseline">
                {billingCycle === "monthly" ? (
                  <>
                    <span className="font-serif text-4xl md:text-5xl font-bold text-(--windowswap-foreground)">$5</span>
                    <span className="text-xs text-windowswap-cream/70 font-medium ml-2">/ month</span>
                  </>
                ) : (
                  <>
                    <span className="font-serif text-4xl md:text-5xl font-bold text-(--windowswap-foreground)">$50</span>
                    <span className="text-xs text-windowswap-cream/70 font-medium ml-2">/ year</span>
                    <span className="text-[9px] text-emerald-500 font-semibold ml-2 select-none">(~$4.16/mo)</span>
                  </>
                )}
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-(--windowswap-foreground)">Back Button enabled</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-(--windowswap-foreground)">Search by weather / country / tags</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Unlimited custom bookmark lists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Direct support payout for creators</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Zero commercials, 100% ad-free calm</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              {notifyRequested ? (
                <p className="w-full text-center text-xs font-semibold uppercase tracking-wider text-emerald-500">
                  Thanks for your interest!
                </p>
              ) : (
                <button
                  onClick={() => setNotifyRequested(true)}
                  className="w-full windowswap-primary-button py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-101 active:scale-99 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5" />
                  I&rsquo;m Interested
                </button>
              )}
              <p className="mt-2 text-center text-[10px] text-windowswap-cream/60">
                All-Access is still in development — no payment is collected yet.
              </p>
            </div>
          </div>

        </div>

        {/* COMPARISON MATRIX SECTION */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl font-medium text-(--windowswap-foreground)">Compare standard and premium features</h3>
            <p className="text-xs text-windowswap-cream/70 font-light">See everything included in the All-Access subscription.</p>
          </div>

          <div className="windowswap-card overflow-hidden backdrop-blur-sm">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-teal-950/30 text-xs">
                <thead>
                  <tr className="bg-muted text-[10px] tracking-wider uppercase font-bold text-windowswap-cream">
                    <th scope="col" className="px-6 py-4 text-left font-bold">Capabilities</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold">Standard Free</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold text-windowswap-peach">All Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-950/20 text-windowswap-cream/90">
                  {features.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition duration-150">
                      <td className="px-6 py-4 font-medium text-left">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        {item.free ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {item.paid ? (
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
              <h4 className="text-xs font-semibold text-(--windowswap-foreground)">Built to support creators</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">All-Access revenue is designed to go directly toward the people uploading windows.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <HelpCircle className="h-8 w-8 text-windowswap-peach shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-(--windowswap-foreground)">Not live yet</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">Free viewing works fully today. All-Access billing hasn&rsquo;t launched — nothing is charged.</p>
            </div>
          </div>
        </div>

      </main>

      {/* ──────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-widest text-windowswap-cream/55 select-none font-medium">
        <span>WINDOWSWAP</span>
        <span className="uppercase mt-2 sm:mt-0">FREE VIEWING IS FULLY FUNCTIONAL TODAY</span>
      </footer>

    </div>
  );
}
