// src/app/tradeon/components/chart/MiniChart.jsx
// The single mini-chart used across Tradeon (home, dashboard, asset detail,
// workspace, widgets). It reuses the SAME engine as the Full Chart (LWChart /
// lightweight-charts) so every chart shares identical interaction, crosshair,
// zoom/pan, live updates and visual language — mini charts simply expose fewer
// controls and add a fullscreen icon that opens the dedicated Full Chart page,
// preserving the asset, timeframe and chart type.
"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { useTradeonTheme } from "../../hooks/tradeonTheme";
import { generateCandles, TF_BY_ID } from "../../lib/candles";
import { chartHref } from "../../lib/format";
import LWChart from "./LWChart";

const SIGNAL_COLOR = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };
const COMPARE_COLORS = ["#22d3ee", "#10c477", "#f5426c", "#f7b955"];

const MiniChart = forwardRef(function MiniChart({
  symbol,
  chartType = "area",
  tf,
  onTfChange,
  defaultTf = "1d",
  indicators = [],
  height,
  className = "",
  timeframes,
  showFullscreen = true,
  prediction,
  live = true,
  drawTool = "cursor",
  drawColor = "#0d9488",
  compareSymbols = [],
  minimal = false,
  externalBars = null,
  theme: themeProp,
}, ref) {
  const { data } = useMarketData();
  const { theme: ctxTheme } = useTradeonTheme();
  const theme = themeProp || ctxTheme; // allow callers to force a chart theme (e.g. white pages)
  const inst = data.find((d) => d.symbol === symbol) || null;

  const [tfState, setTfState] = useState(defaultTf);
  const activeTf = tf ?? tfState;
  const setTf = onTfChange || setTfState;

  const [bars, setBars] = useState([]);
  const chartRef = useRef();
  const barsRef = useRef([]);
  const priceRef = useRef(0);
  useEffect(() => { barsRef.current = bars; }, [bars]);
  useEffect(() => { if (inst?.price) priceRef.current = inst.price; }, [inst?.price]);

  useImperativeHandle(ref, () => ({
    fit: () => chartRef.current?.fit(),
    autoScale: () => chartRef.current?.autoScale(),
    zoom: (f) => chartRef.current?.zoom(f),
    screenshot: () => chartRef.current?.screenshot(),
    clearDrawings: () => chartRef.current?.clearDrawings(),
    undoDrawing: () => chartRef.current?.undoDrawing(),
  }));

  useEffect(() => {
    if (externalBars?.length) return; // real bars supplied by caller — skip synth
    if (!priceRef.current) return;
    setBars(generateCandles(symbol, activeTf, priceRef.current, Date.now()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, activeTf, !!inst]);

  // Adopt externally-supplied (e.g. real, fetched) candles when provided.
  useEffect(() => {
    if (externalBars?.length) setBars(externalBars);
  }, [externalBars]);

  useEffect(() => {
    if (externalBars?.length) return; // don't overwrite real candles with the simulated tick
    if (!live || !inst || !barsRef.current.length) return;
    const arr = barsRef.current;
    const last = { ...arr[arr.length - 1] };
    last.close = inst.price;
    last.high = Math.max(last.high, inst.price);
    last.low = Math.min(last.low, inst.price);
    arr[arr.length - 1] = last;
    chartRef.current?.updateLast(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inst?.price]);

  // normalized compare overlays (own % scale)
  const compare = useMemo(
    () =>
      (compareSymbols || []).map((s, i) => {
        const cb = generateCandles(s, activeTf, data.find((d) => d.symbol === s)?.price || 100, Date.now());
        const b0 = cb[0]?.close || 1;
        return { key: s, color: COMPARE_COLORS[i % COMPARE_COLORS.length], data: cb.map((b) => ({ time: b.time, value: (b.close / b0 - 1) * 100 })) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(compareSymbols || []).join(","), activeTf]
  );

  const href = chartHref(symbol, { tf: activeTf, type: chartType });

  return (
    <div className={`relative ${height ? "" : "h-full"} ${className}`} style={height ? { height } : undefined}>
      {bars.length ? (
        <LWChart ref={chartRef} bars={bars} chartType={chartType} indicators={indicators} theme={theme} drawTool={drawTool} drawColor={drawColor} compare={compare} minimal={minimal} />
      ) : (
        <div className="tdn-skeleton w-full h-full" />
      )}

      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
        {prediction && (
          <span className="text-[0.58rem] font-bold px-1.5 py-0.5 rounded tdn-glass" style={{ color: SIGNAL_COLOR[prediction.signal] }}>
            {prediction.signal} {prediction.confidence}%
          </span>
        )}
        {showFullscreen && (
          <Link href={href} className="w-6 h-6 rounded grid place-items-center tdn-glass hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-muted)" }} title="Open full chart" aria-label="Open full chart">
            <Maximize2 size={12} />
          </Link>
        )}
      </div>

      {timeframes?.length > 0 && (
        <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-0.5 tdn-glass rounded-md px-1 py-0.5">
          {timeframes.map((t) => (
            <button key={t} onClick={() => setTf(t)} className="px-1.5 py-0.5 rounded text-[0.6rem] font-semibold tdn-mono"
              style={{ color: activeTf === t ? "#fff" : "var(--tdn-faint)", background: activeTf === t ? "var(--tdn-iris)" : "transparent" }}>
              {TF_BY_ID[t]?.label || t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default MiniChart;
