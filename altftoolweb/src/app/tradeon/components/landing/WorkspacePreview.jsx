// src/app/tradeon/components/landing/WorkspacePreview.jsx
// Home-page "Multi-Screen Workspace" section. Renders the SAME professional
// ChartPanel component used on the real workspace (live lightweight-charts
// engine, crosshair, indicators, timeframes, chart types, fullscreen) — not a
// simplified preview. Panels lazily mount when the section scrolls into view so
// the landing page stays fast.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grid2x2, Link2, Maximize2, Monitor } from "lucide-react";
import { useInView } from "../../hooks/useInView";
import ChartPanel from "../workspace/ChartPanel";

const LAYOUTS = [1, 2, 4, 6, 9, 16];
const COLS = { 1: 1, 2: 2, 4: 2, 6: 3, 9: 3, 16: 4 };
const DEFAULT_ASSETS = ["BTC", "ETH", "AAPL", "TSLA", "EUR/USD", "XAU", "SPX", "NVDA", "NIFTY", "SOL", "GBP/USD", "WTI", "QQQ", "DOGE", "AMZN", "XAG"];

let idc = 0;
const makePanel = (i) => ({
  id: `pv-${idc++}`,
  symbol: DEFAULT_ASSETS[i % DEFAULT_ASSETS.length],
  timeframe: "1D",
  type: "candle",
  indicators: ["EMA"],
});

export default function WorkspacePreview({ data = [] }) {
  const [layout, setLayout] = useState(4);
  const [synced, setSynced] = useState(false);
  const [panels, setPanels] = useState(() => Array.from({ length: 4 }, (_, i) => makePanel(i)));
  const [ref, inView] = useInView();
  const router = useRouter();

  const bySymbol = new Map(data.map((d) => [d.symbol, d]));
  const cols = COLS[layout] || 2;
  const density = layout >= 9 ? "dense" : "normal";
  const panelH = layout <= 2 ? 420 : layout <= 6 ? 300 : 210;

  const changeLayout = (n) => {
    setPanels((prev) => (n <= prev.length ? prev.slice(0, n) : [...prev, ...Array.from({ length: n - prev.length }, (_, k) => makePanel(prev.length + k))]));
    setLayout(n);
  };
  const updatePanel = (id, patch) =>
    setPanels((prev) => (synced && patch.timeframe ? prev.map((p) => ({ ...p, timeframe: patch.timeframe })) : prev.map((p) => (p.id === id ? { ...p, ...patch } : p))));
  const closePanel = (id) =>
    setPanels((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setLayout(next.length || 1);
      return next.length ? next : [makePanel(0)];
    });

  return (
    <section id="workspace" ref={ref} className="tdn-container tdn-section-tight">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div className="max-w-2xl">
          <span className="tdn-eyebrow text-[0.62rem]">Multi-screen workspace</span>
          <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
            Up to 16 independent charts
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--tdn-muted)" }}>
            The same professional chart engine as the full-screen chart — each panel has its own asset, timeframe, type & indicators.
          </p>
        </div>
        <span className="tdn-chip !py-1 !text-[0.68rem] hidden sm:inline-flex">
          <Monitor size={13} /> Multi-monitor ready
        </span>
      </div>

      <div className="tdn-panel p-2.5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-semibold mr-1 flex items-center gap-1.5" style={{ color: "var(--tdn-muted)" }}>
            <Grid2x2 size={13} /> Layout
          </span>
          <div className="flex items-center gap-0.5 tdn-inset p-0.5">
            {LAYOUTS.map((n) => (
              <button key={n} onClick={() => changeLayout(n)} className="px-2.5 py-1 rounded-md text-xs font-bold tdn-mono"
                style={{ background: layout === n ? "var(--tdn-iris)" : "transparent", color: layout === n ? "#fff" : "var(--tdn-muted)" }}>
                {n}
              </button>
            ))}
          </div>
          <button onClick={() => setSynced((s) => !s)} className="tdn-chip !py-1"
            style={{ color: synced ? "var(--tdn-iris-2)" : "var(--tdn-muted)", borderColor: synced ? "color-mix(in srgb, var(--tdn-iris) 40%, transparent)" : "var(--tdn-border)" }}>
            <Link2 size={13} /> {synced ? "Synced" : "Independent"}
          </button>
          <div className="flex-1" />
          <Link href="/tradeon/workspace" className="tdn-btn tdn-btn-soft !py-1.5 !px-3 text-xs">
            <Maximize2 size={14} /> Open workspace
          </Link>
        </div>

        {/* Panel grid — real ChartPanels, mounted when in view */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {panels.map((panel) =>
            inView ? (
              <div key={panel.id} style={{ height: panelH }}>
                <ChartPanel
                  panel={panel}
                  instrument={bySymbol.get(panel.symbol) || null}
                  density={density}
                  onChange={(patch) => updatePanel(panel.id, patch)}
                  onClose={() => closePanel(panel.id)}
                  onFullscreen={() => router.push("/tradeon/workspace")}
                />
              </div>
            ) : (
              <div key={panel.id} className="tdn-skeleton" style={{ height: panelH }} />
            )
          )}
        </div>
        <p className="mt-2 text-[0.7rem] text-center" style={{ color: "var(--tdn-faint)" }}>
          Showing {layout} interactive {layout === 1 ? "chart" : "charts"} · each independently configurable
        </p>
      </div>
    </section>
  );
}
