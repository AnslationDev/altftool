// src/app/tradeon/components/landing/TradeonFooter.jsx
"use client";

import Link from "next/link";
import { ArrowUp, Coins, Globe } from "lucide-react";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import MarketStatusBadge from "../shared/MarketStatusBadge";

const COLUMNS = [
  {
    title: "Workspace",
    links: [
      { label: "Tradeon home", href: "/tradeon" },
      { label: "Dashboard", href: "/tradeon/dashboard" },
      { label: "Chart workspace", href: "/tradeon/workspace" },
      { label: "Bitcoin analysis", href: "/tradeon/asset/BTC" },
    ],
  },
  {
    title: "Markets",
    links: [
      { label: "Crypto", href: "/tradeon/asset/BTC" },
      { label: "Stocks", href: "/tradeon/asset/AAPL" },
      { label: "Forex", href: "/tradeon/asset/EUR-USD" },
      { label: "Indices", href: "/tradeon/asset/SPX" },
      { label: "Commodities", href: "/tradeon/asset/XAU" },
      { label: "ETFs", href: "/tradeon/asset/SPY" },
    ],
  },
  {
    title: "AltFTool",
    links: [
      { label: "All products", href: "/products" },
      { label: "Signals", href: "/signals" },
      { label: "Academy", href: "/academy" },
      { label: "Blog", href: "/blogs" },
      { label: "Support", href: "/supportsetting" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/policypages/about" },
      { label: "Contact", href: "/policypages/contact" },
      { label: "Privacy", href: "/policypages/privacy" },
      { label: "Terms", href: "/policypages/termsandconditions" },
      { label: "Disclaimer", href: "/policypages/disclaimer" },
      { label: "Licenses", href: "/licenses" },
    ],
  },
];

export default function TradeonFooter({ status = "live" }) {
  const bgImageUrl =
    "https://img.pikbest.com/back_our/20220610/bg/7a548966f1ae8.png!sw800";

  return (
    <footer className="relative mt-0 overflow-hidden bg-transparent border-t border-white/10">
      {/* ── 1. Hero Background Image ── */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
        }}
      />

      {/* ── 2. Darker Tint Overlay ── */}
      <div className="absolute inset-0 bg-[#0b1220]/90 z-0 pointer-events-none" />

      {/* Subtle Vertical Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 100%",
        }}
      />

      {/* ── 3. Footer Content ── */}
      <div className="relative z-10 tdn-container pb-8 pt-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand Info - Spans full width on mobile (2 cols), 1 col on desktop */}
          <div className="col-span-2 lg:col-span-1 max-w-xs">
            <Logo variant="white" />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              An educational market workspace with public crypto pricing,
              illustrative multi-asset data, interactive charts and explainable model signals.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <MarketStatusBadge status={status} />
              <span className="tdn-chip !py-1 !text-[0.7rem] bg-white/5 border border-white/10 backdrop-blur-md text-slate-200">
                <Globe size={12} className="text-cyan-400" /> English
              </span>
              <span className="tdn-chip !py-1 !text-[0.7rem] bg-white/5 border border-white/10 backdrop-blur-md text-slate-200">
                <Coins size={12} className="text-cyan-400" /> USD
              </span>
              <ThemeToggle />
            </div>
          </div>

          {/* Nav Columns - Automatically renders 2 per row on mobile */}
          {COLUMNS.map((column) => (
            <div key={column.title} className="col-span-1">
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider !text-white">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors hover:text-cyan-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          <span className="tdn-chip !py-1 !text-[0.7rem] bg-white/5 border border-white/10 text-slate-300">
            Public crypto feed
          </span>
          <span className="tdn-chip !py-1 !text-[0.7rem] bg-white/5 border border-white/10 text-slate-300">
            Illustrative non-crypto markets
          </span>
          <span className="tdn-chip !py-1 !text-[0.7rem] bg-white/5 border border-white/10 text-slate-300">
            Educational signals
          </span>
          <div className="flex-1" />
          <a
            href="#top"
            className="tdn-btn tdn-btn-ghost !px-3 !py-1.5 text-xs text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition-colors"
            aria-label="Back to top"
          >
            Back to top <ArrowUp size={13} />
          </a>
        </div>

        <p className="mt-6 text-[0.7rem] leading-relaxed text-slate-400">
          <strong className="text-slate-200">Risk disclaimer:</strong> Tradeon provides analytical tools and
          informational content only. It is not financial, investment, legal or tax advice. Market data can be delayed,
          unavailable or simulated, and model signals are not guarantees. Research independently and consult a licensed
          professional before making financial decisions.
        </p>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs sm:flex-row text-slate-400">
          <span>© {new Date().getFullYear()} AltFTool Tradeon.</span>
          <span className="flex items-center gap-4">
            <Link href="/status" className="hover:text-cyan-400 transition-colors">
              Platform status
            </Link>
            <span className="tdn-mono text-slate-400">Preview</span>
          </span>
        </div>
      </div>
    </footer>
  );
}