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
  return (
    <footer className="relative mt-10 border-t" style={{ borderColor: "var(--tdn-border)" }}>
      <div className="tdn-container pb-8 pt-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
              An educational market workspace with public crypto pricing,
              illustrative multi-asset data, interactive charts and explainable model signals.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <MarketStatusBadge status={status} />
              <span className="tdn-chip !py-1 !text-[0.7rem]"><Globe size={12} /> English</span>
              <span className="tdn-chip !py-1 !text-[0.7rem]"><Coins size={12} /> USD</span>
              <ThemeToggle />
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase" style={{ color: "var(--tdn-fg-strong)" }}>
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-muted)" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: "var(--tdn-border)" }}>
          <span className="tdn-chip !py-1 !text-[0.7rem]">Public crypto feed</span>
          <span className="tdn-chip !py-1 !text-[0.7rem]">Illustrative non-crypto markets</span>
          <span className="tdn-chip !py-1 !text-[0.7rem]">Educational signals</span>
          <div className="flex-1" />
          <a href="#top" className="tdn-btn tdn-btn-ghost !px-3 !py-1.5 text-xs" aria-label="Back to top">
            Back to top <ArrowUp size={13} />
          </a>
        </div>

        <p className="mt-6 text-[0.7rem] leading-relaxed" style={{ color: "var(--tdn-faint)" }}>
          <strong style={{ color: "var(--tdn-muted)" }}>Risk disclaimer:</strong> Tradeon provides analytical tools and
          informational content only. It is not financial, investment, legal or tax advice. Market data can be delayed,
          unavailable or simulated, and model signals are not guarantees. Research independently and consult a licensed
          professional before making financial decisions.
        </p>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-5 text-xs sm:flex-row" style={{ borderColor: "var(--tdn-border)", color: "var(--tdn-faint)" }}>
          <span>© {new Date().getFullYear()} AltFTool Tradeon.</span>
          <span className="flex items-center gap-4">
            <Link href="/status" className="hover:text-[var(--tdn-iris-2)]">Platform status</Link>
            <span className="tdn-mono">Preview</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
