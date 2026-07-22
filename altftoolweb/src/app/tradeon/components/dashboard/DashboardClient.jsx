// src/app/tradeon/components/dashboard/DashboardClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Command, LayoutGrid, Search, User } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import AIPredictionCard from "../shared/AIPredictionCard";
import MarketStatusBadge from "../shared/MarketStatusBadge";
import ThemeToggle from "../shared/ThemeToggle";
import SearchOverlay from "../landing/SearchOverlay";
import Sidebar from "./Sidebar";
import {
  AIPredictionsWidget,
  ChartWidget,
  FearGreedWidget,
  HeatmapWidget,
  MoversWidget,
  NewsWidget,
  StatTiles,
  WatchlistWidget,
} from "./widgets";

export default function DashboardClient() {
  const { data, status } = useMarketData();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const featured = data.find((d) => d.symbol === "BTC");
  const predInstrument = data.find((d) => d.symbol === "NVDA") || data[0];

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="tradeon-root flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 tdn-glass border-b flex items-center gap-3 h-16 px-4 sm:px-6"
          style={{ borderColor: "var(--tdn-border)" }}
        >
          <Link href="/tradeon" className="tdn-btn tdn-btn-icon md:hidden" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none" style={{ color: "var(--tdn-fg-strong)" }}>
              Dashboard
            </h1>
            <p className="text-[0.7rem] mt-0.5 hidden sm:block" style={{ color: "var(--tdn-faint)" }}>
              Public crypto feed and illustrative multi-asset workspace
            </p>
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 tdn-input !w-64 !py-2 text-sm"
            style={{ color: "var(--tdn-faint)" }}
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search market symbols…</span>
            <kbd className="tdn-mono text-[0.66rem] px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--tdn-border)" }}>
              <Command size={10} className="inline" />K
            </kbd>
          </button>

          <MarketStatusBadge status={status} className="hidden lg:inline-flex" />
          <Link href="/tradeon/workspace" className="tdn-btn tdn-btn-ghost !px-3 !py-2 text-sm hidden sm:inline-flex">
            <LayoutGrid size={15} /> Layouts
          </Link>
          <ThemeToggle />
          <Link href="/account" className="tdn-btn tdn-btn-icon" aria-label="Account"><User size={17} /></Link>
        </header>

        {/* Widget grid */}
        <main className="flex-1 p-4 sm:p-6 space-y-4 overflow-x-hidden">
          {data.length === 0 ? (
            <div className="grid gap-4">
              <div className="h-24 tdn-skeleton" />
              <div className="h-80 tdn-skeleton" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="tdn-eyebrow">Overview</span>
                <Link href="/tradeon/workspace" className="tdn-btn tdn-btn-soft !py-1.5 !px-3 text-xs">
                  <LayoutGrid size={14} /> Open workspace
                </Link>
              </div>

              <StatTiles data={data} />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <ChartWidget instrument={featured} />
                <AIPredictionCard instrument={predInstrument} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <WatchlistWidget data={data} symbols={["BTC", "ETH", "AAPL", "NVDA", "TSLA", "EUR/USD"]} />
                <AIPredictionsWidget data={data} />
                <FearGreedWidget data={data} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                <HeatmapWidget data={data} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <MoversWidget data={data} />
                  <NewsWidget data={data} />
                </div>
              </div>

              <p className="text-center text-[0.7rem] pt-2" style={{ color: "var(--tdn-faint)" }}>
                Live crypto via Binance public API · other classes simulated · analytical signals, not financial advice
              </p>
            </>
          )}
        </main>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} data={data} />
    </div>
  );
}
