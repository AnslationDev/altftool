// src/app/tradeon/components/workspace/WorkspaceClient.jsx
// Full-screen professional trading workstation. Full browser width/height, its
// own toolbar, and up to 16 fully independent chart panels (each with its own
// asset search, timeframe, type, indicators & prediction). Layout, sync and
// panels auto-save to localStorage.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Grid2x2,
  Home,
  Link2,
  Maximize,
  Minimize2,
  RotateCcw,
  Save,
  Search,
  Star,
} from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { INSTRUMENTS } from "../../lib/instruments";
import { cn } from "../../utils/cn";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import MarketClock from "../shared/MarketClock";
import MarketStatusBadge from "../shared/MarketStatusBadge";
import ChartPanel from "./ChartPanel";
import AssetPicker from "./AssetPicker";

const LAYOUTS = [1, 2, 4, 6, 8, 9, 12, 16];
const COLS = { 1: 1, 2: 2, 4: 2, 6: 3, 8: 4, 9: 3, 12: 4, 16: 4 };
const DEFAULT_ASSETS = ["BTC", "ETH", "AAPL", "TSLA", "EUR/USD", "XAU", "SPX", "NVDA", "NIFTY", "SOL", "GBP/USD", "WTI", "QQQ", "DOGE", "AMZN", "XAG"];
const STORE_KEY = "tradeon-workspace-v1";
const WATCHLIST = ["BTC", "ETH", "AAPL", "NVDA", "TSLA", "SPX", "XAU", "EUR/USD"];

let idc = 0;
const makePanel = (i) => ({
  id: `wp-${idc++}`,
  symbol: DEFAULT_ASSETS[i % DEFAULT_ASSETS.length],
  timeframe: "1H",
  type: "candle",
  indicators: ["EMA"],
});

export default function WorkspaceClient() {
  const { data, status } = useMarketData();
  const bySymbol = new Map(data.map((d) => [d.symbol, d]));

  const [layout, setLayout] = useState(4);
  const [synced, setSynced] = useState(false);
  const [panels, setPanels] = useState(() => Array.from({ length: 4 }, (_, i) => makePanel(i)));
  const [fullscreenId, setFullscreenId] = useState(null);
  const [showWatch, setShowWatch] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const rootRef = useRef(null);
  const hydrated = useRef(false);

  // Restore saved workspace on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.panels) && s.panels.length) {
          setPanels(s.panels.map((p) => ({ ...p, id: `wp-${idc++}` })));
          setLayout(s.layout || s.panels.length);
          setSynced(!!s.synced);
        }
      }
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  // Auto-save whenever the workspace changes.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ layout, synced, panels }));
    } catch {
      /* ignore */
    }
  }, [layout, synced, panels]);

  const changeLayout = useCallback((n) => {
    setPanels((prev) => {
      if (n <= prev.length) return prev.slice(0, n);
      const add = Array.from({ length: n - prev.length }, (_, k) => makePanel(prev.length + k));
      return [...prev, ...add];
    });
    setLayout(n);
    setFullscreenId(null);
  }, []);

  const updatePanel = useCallback(
    (id, patch) => {
      setPanels((prev) => {
        // Sync applies timeframe changes to every panel; everything else is local.
        if (synced && patch.timeframe) return prev.map((p) => ({ ...p, timeframe: patch.timeframe }));
        return prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      });
    },
    [synced]
  );

  const closePanel = useCallback((id) => {
    setPanels((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setLayout(next.length || 1);
      return next.length ? next : [makePanel(0)];
    });
    setFullscreenId(null);
  }, []);

  const resetWorkspace = useCallback(() => {
    setPanels(Array.from({ length: 4 }, (_, i) => makePanel(i)));
    setLayout(4);
    setSynced(false);
    setFullscreenId(null);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const saveWorkspace = useCallback(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ layout, synced, panels }));
    } catch {
      /* ignore */
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1600);
  }, [layout, synced, panels]);

  const toggleFullscreenBrowser = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }, []);

  const cols = COLS[layout] || 2;
  const density = layout >= 9 ? "dense" : layout >= 4 ? "compact" : "normal";
  const shown = fullscreenId ? panels.filter((p) => p.id === fullscreenId) : panels;

  return (
    <div ref={rootRef} className="tradeon-root h-screen flex flex-col overflow-hidden" style={{ background: "var(--tdn-bg)" }}>
      {/* Toolbar */}
      <header className="tdn-topbar flex items-center gap-2 h-12 px-2 sm:px-3 shrink-0">
        <Link href="/tradeon" className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Home" aria-label="Home">
          <Home size={15} />
        </Link>
        <div className="hidden sm:block"><Logo mark size={26} wordmark={false} /></div>
        <span className="text-sm font-bold pr-1 hidden md:inline" style={{ color: "var(--tdn-fg-strong)" }}>Workspace</span>

        {/* Global asset search — loads into the first panel */}
        <div className="hidden sm:flex items-center gap-1 tdn-card-i px-1.5 py-0.5">
          <Search size={13} style={{ color: "var(--tdn-faint)" }} />
          <AssetPicker
            value="Search"
            onSelect={(symbol) => setPanels((prev) => prev.map((p, i) => (i === 0 ? { ...p, symbol } : p)))}
          />
        </div>

        {/* Layout selector */}
        <div className="flex items-center gap-0.5 tdn-card-i p-0.5 ml-auto">
          <Grid2x2 size={13} className="mx-1 hidden sm:block" style={{ color: "var(--tdn-faint)" }} />
          {LAYOUTS.map((n) => (
            <button
              key={n}
              onClick={() => changeLayout(n)}
              className="px-2 py-1 rounded text-[0.7rem] font-bold tdn-mono"
              style={{ background: layout === n ? "var(--tdn-iris)" : "transparent", color: layout === n ? "#fff" : "var(--tdn-muted)" }}
              title={`${n} chart${n > 1 ? "s" : ""}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSynced((s) => !s)}
          className="tdn-btn tdn-btn-icon !w-auto !px-2 !h-8 !text-xs gap-1 hidden sm:inline-flex"
          style={{ color: synced ? "var(--tdn-iris-2)" : "var(--tdn-muted)", borderColor: synced ? "color-mix(in srgb, var(--tdn-iris) 40%, transparent)" : "var(--tdn-border)" }}
          title="Synchronize timeframes"
        >
          <Link2 size={14} /> {synced ? "Synced" : "Independent"}
        </button>

        <div className="relative hidden md:block">
          <button onClick={() => setShowWatch((s) => !s)} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Watchlist" aria-label="Watchlist">
            <Star size={15} />
          </button>
          {showWatch && (
            <div className="absolute right-0 top-full mt-1 z-[70] w-48 rounded-xl overflow-hidden shadow-[var(--tdn-shadow-lg)]" style={{ background: "var(--tdn-surface-solid)", border: "1px solid var(--tdn-border-strong)" }}>
              <div className="tdn-eyebrow text-[0.56rem] px-3 pt-2 pb-1">Watchlist</div>
              {WATCHLIST.map((s) => {
                const d = bySymbol.get(s);
                return (
                  <button
                    key={s}
                    onClick={() => { setPanels((prev) => prev.map((p, i) => (i === 0 ? { ...p, symbol: s } : p))); setShowWatch(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]"
                  >
                    <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{s}</span>
                    {d && <span className={`tdn-mono text-[0.66rem] ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>{d.changePct >= 0 ? "+" : ""}{d.changePct.toFixed(2)}%</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className="hidden lg:inline-flex items-center gap-2 mx-1">
          <MarketClock compact />
          <MarketStatusBadge status={status} />
        </span>

        <button onClick={saveWorkspace} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Save workspace" aria-label="Save workspace">
          <Save size={15} style={{ color: savedAt ? "var(--tdn-up)" : undefined }} />
        </button>
        <button onClick={resetWorkspace} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Reset workspace" aria-label="Reset workspace">
          <RotateCcw size={15} />
        </button>
        <ThemeToggle />
        <button onClick={toggleFullscreenBrowser} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Fullscreen" aria-label="Fullscreen">
          <Maximize size={15} />
        </button>
      </header>

      {savedAt && (
        <div className="absolute left-1/2 -translate-x-1/2 top-14 z-[80] tdn-badge-live !text-xs px-3 py-1.5 tdn-rise">Workspace saved</div>
      )}

      {/* Chart grid */}
      <div className="flex-1 min-h-0 p-2">
        {fullscreenId && (
          <button onClick={() => setFullscreenId(null)} className="tdn-btn tdn-btn-ghost !py-1 !px-2 text-xs mb-2">
            <Minimize2 size={13} /> Exit fullscreen chart
          </button>
        )}
        <div
          className="grid gap-2 h-full"
          style={{
            gridTemplateColumns: fullscreenId ? "1fr" : `repeat(${cols}, minmax(0, 1fr))`,
            gridAutoRows: "1fr",
          }}
        >
          {shown.map((panel) => (
            <ChartPanel
              key={panel.id}
              panel={panel}
              instrument={bySymbol.get(panel.symbol) || null}
              density={fullscreenId ? "normal" : density}
              onChange={(patch) => updatePanel(panel.id, patch)}
              onClose={() => closePanel(panel.id)}
              onFullscreen={() => setFullscreenId(fullscreenId === panel.id ? null : panel.id)}
            />
          ))}
        </div>
      </div>

      <div className={cn("shrink-0 px-3 py-1 flex items-center justify-between text-[0.64rem] border-t", "tdn-topbar")} style={{ color: "var(--tdn-faint)" }}>
        <span>{panels.length} independent {panels.length === 1 ? "chart" : "charts"} · {synced ? "synchronized timeframes" : "unsynchronized"} · auto-saved</span>
        <span className="hidden sm:inline">Each panel has its own asset, timeframe, indicators & prediction — analytical signals, not financial advice</span>
      </div>
    </div>
  );
}
