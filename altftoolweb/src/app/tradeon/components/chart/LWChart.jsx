// src/app/tradeon/components/chart/LWChart.jsx
// Professional charting surface built on lightweight-charts (TradingView's OSS
// engine): native zoom / mouse-wheel / drag-pan / crosshair / price + time
// scales, 7 chart types, live last-bar updates, overlay + lower-pane indicators,
// and a custom drawing overlay (trend / horizontal / vertical / rect / fib / text)
// that stays anchored to price+time as you zoom and pan.
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { toHeikinAshi, computeIndicator } from "../../lib/candles";

const UP = "#10c477", DOWN = "#f5426c", IRIS = "#6d5efc", CYAN = "#22d3ee";

function palette(theme) {
  const dark = theme === "dark";
  return {
    text: dark ? "#9aa0bd" : "#5a6079",
    grid: dark ? "rgba(255,255,255,0.05)" : "rgba(16,19,42,0.06)",
    border: dark ? "rgba(255,255,255,0.10)" : "rgba(16,19,42,0.12)",
    cross: dark ? "rgba(255,255,255,0.35)" : "rgba(16,19,42,0.35)",
  };
}

const VALUE_TYPES = new Set(["line", "area", "baseline"]);

function toValueData(bars) { return bars.map((b) => ({ time: b.time, value: b.close })); }
function toOHLC(bars) { return bars.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close })); }

const LWChart = forwardRef(function LWChart(
  { bars, chartType = "line", indicators = [], theme = "dark", onCrosshair, onReady, drawTool = "cursor", drawColor = IRIS, compare = [], minimal = false },
  ref
) {
  const mainElRef = useRef(null);
  const lowerElRef = useRef(null);
  const overlayRef = useRef(null);
  const api = useRef({});
  const prevBarsRef = useRef(null);
  const drawingsRef = useRef([]);
  const draftRef = useRef(null);
  const toolRef = useRef(drawTool);
  const colorRef = useRef(drawColor);
  useEffect(() => { toolRef.current = drawTool; colorRef.current = drawColor; }, [drawTool, drawColor]);

  useImperativeHandle(ref, () => ({
    fit: () => api.current.chart?.timeScale().fitContent(),
    autoScale: () => api.current.mainSeries?.priceScale().applyOptions({ autoScale: true }),
    zoom: (factor) => {
      const ts = api.current.chart?.timeScale();
      if (!ts) return;
      const r = ts.getVisibleLogicalRange();
      if (!r) return;
      const mid = (r.from + r.to) / 2;
      const half = ((r.to - r.from) / 2) * factor;
      ts.setVisibleLogicalRange({ from: mid - half, to: mid + half });
    },
    screenshot: () => api.current.chart?.takeScreenshot() || null,
    clearDrawings: () => { drawingsRef.current = []; redrawOverlay(); },
    undoDrawing: () => { drawingsRef.current.pop(); redrawOverlay(); },
    updateLast: (bar) => {
      const s = api.current.mainSeries;
      if (!s) return;
      try {
        s.update(VALUE_TYPES.has(chartType) ? { time: bar.time, value: bar.close } : { time: bar.time, open: bar.open, high: bar.high, low: bar.low, close: bar.close });
        if (api.current.volume) api.current.volume.update({ time: bar.time, value: bar.volume, color: bar.close >= bar.open ? "rgba(16,196,119,0.5)" : "rgba(245,66,108,0.5)" });
      } catch { /* time ordering guard */ }
    },
  }));

  /* ---------------- overlay drawing ---------------- */
  function toPix(pt) {
    const { chart, mainSeries } = api.current;
    if (!chart || !mainSeries) return null;
    const x = chart.timeScale().timeToCoordinate(pt.time);
    const y = mainSeries.priceToCoordinate(pt.price);
    return x == null || y == null ? null : { x, y };
  }
  function fromPix(x, y) {
    const { chart, mainSeries } = api.current;
    const time = chart.timeScale().coordinateToTime(x);
    const price = mainSeries.priceToCoordinate ? mainSeries.coordinateToPrice(y) : null;
    return time == null || price == null ? null : { time, price };
  }
  function redrawOverlay() {
    const cv = overlayRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== cv.clientWidth * dpr || cv.height !== cv.clientHeight * dpr) {
      cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    const all = draftRef.current ? [...drawingsRef.current, draftRef.current] : drawingsRef.current;
    for (const d of all) drawShape(ctx, d, cv.clientWidth, cv.clientHeight);
  }
  function drawShape(ctx, d, W, H) {
    ctx.lineWidth = 1.5; ctx.strokeStyle = d.color; ctx.fillStyle = d.color;
    ctx.font = "12px ui-sans-serif, system-ui";
    const a = toPix(d.a); const b = d.b ? toPix(d.b) : null;
    if (!a) return;
    if (d.type === "horizontal") { ctx.beginPath(); ctx.moveTo(0, a.y); ctx.lineTo(W, a.y); ctx.stroke(); ctx.fillText(fmtP(d.a.price), 4, a.y - 4); return; }
    if (d.type === "vertical") { ctx.beginPath(); ctx.moveTo(a.x, 0); ctx.lineTo(a.x, H); ctx.stroke(); return; }
    if (d.type === "text") { ctx.fillText(d.text || "Text", a.x + 4, a.y); ctx.beginPath(); ctx.arc(a.x, a.y, 2.5, 0, 7); ctx.fill(); return; }
    if (!b) { ctx.beginPath(); ctx.arc(a.x, a.y, 2.5, 0, 7); ctx.fill(); return; }
    if (d.type === "trend") { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); return; }
    if (d.type === "rect") { ctx.globalAlpha = 0.12; ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); ctx.globalAlpha = 1; ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y); return; }
    if (d.type === "fib") {
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const p0 = d.a.price, p1 = d.b.price;
      for (const lv of levels) {
        const price = p1 + (p0 - p1) * lv;
        const y = api.current.mainSeries.priceToCoordinate(price);
        if (y == null) continue;
        ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(Math.min(a.x, b.x), y); ctx.lineTo(Math.max(a.x, b.x), y); ctx.stroke();
        ctx.fillText(`${(lv * 100).toFixed(1)}%  ${fmtP(price)}`, Math.min(a.x, b.x) + 3, y - 3);
      }
      ctx.globalAlpha = 1;
    }
  }
  function fmtP(v) { return Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }); }

  // Pointer handlers on the overlay (active only when a draw tool is selected)
  useEffect(() => {
    const cv = overlayRef.current;
    if (!cv) return;
    const single = new Set(["horizontal", "vertical", "text"]);
    const onDown = (e) => {
      if (toolRef.current === "cursor") return;
      const rect = cv.getBoundingClientRect();
      const p = fromPix(e.clientX - rect.left, e.clientY - rect.top);
      if (!p) return;
      const tool = toolRef.current;
      if (single.has(tool)) {
        const d = { type: tool, a: p, color: colorRef.current };
        if (tool === "text") { const t = window.prompt("Annotation text:", "Note"); if (t == null) return; d.text = t; }
        drawingsRef.current.push(d); redrawOverlay();
      } else {
        draftRef.current = { type: tool, a: p, b: p, color: colorRef.current };
      }
    };
    const onMove = (e) => {
      if (!draftRef.current) return;
      const rect = cv.getBoundingClientRect();
      const p = fromPix(e.clientX - rect.left, e.clientY - rect.top);
      if (p) { draftRef.current.b = p; redrawOverlay(); }
    };
    const onUp = () => { if (draftRef.current) { drawingsRef.current.push(draftRef.current); draftRef.current = null; redrawOverlay(); } };
    cv.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { cv.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, []);

  /* ---------------- build / rebuild ---------------- */
  useEffect(() => {
    let disposed = false;
    let ro;
    (async () => {
      const LWC = await import("lightweight-charts");
      if (disposed || !mainElRef.current) return;
      // Capture the current view so we can preserve zoom/pan across a rebuild
      // that is NOT a data change (e.g. switching chart type or toggling an
      // indicator). Only re-fit when the underlying bars actually changed.
      let savedRange = null;
      try { savedRange = api.current.chart?.timeScale().getVisibleLogicalRange() || null; } catch { /* noop */ }
      const sameData = prevBarsRef.current === bars;
      // tear down previous
      try { api.current.chart?.remove(); } catch { /* noop */ }
      try { api.current.lower?.remove(); } catch { /* noop */ }
      api.current = {};

      const pal = palette(theme);
      const base = {
        // attributionLogo hidden here; a "Charts by TradingView" link lives in the footer for attribution.
        layout: { background: { type: LWC.ColorType.Solid, color: "transparent" }, textColor: pal.text, fontFamily: "ui-sans-serif, system-ui", attributionLogo: false },
        grid: { vertLines: { color: pal.grid }, horzLines: { color: pal.grid } },
        rightPriceScale: { borderColor: pal.border },
        timeScale: { borderColor: pal.border, timeVisible: true, secondsVisible: false },
        crosshair: { mode: LWC.CrosshairMode.Normal, vertLine: { color: pal.cross, labelBackgroundColor: IRIS }, horzLine: { color: pal.cross, labelBackgroundColor: IRIS } },
        handleScroll: true, handleScale: true,
      };
      const chart = LWC.createChart(mainElRef.current, {
        ...base,
        autoSize: true,
        ...(minimal
          ? {
              rightPriceScale: { visible: false },
              leftPriceScale: { visible: false },
              timeScale: { ...base.timeScale, visible: false },
              grid: { vertLines: { visible: false }, horzLines: { visible: false } },
              handleScale: false,
              handleScroll: false,
            }
          : {}),
      });
      api.current.chart = chart;

      // main series by type
      let mainSeries;
      const hollow = chartType === "hollow";
      if (VALUE_TYPES.has(chartType)) {
        if (chartType === "area") mainSeries = chart.addAreaSeries({ lineColor: IRIS, topColor: "rgba(109,94,252,0.35)", bottomColor: "rgba(109,94,252,0.02)", lineWidth: 2 });
        else if (chartType === "baseline") { const bl = bars.length ? bars[0].close : 0; mainSeries = chart.addBaselineSeries({ baseValue: { type: "price", price: bl }, topLineColor: UP, topFillColor1: "rgba(16,196,119,0.28)", topFillColor2: "rgba(16,196,119,0.02)", bottomLineColor: DOWN, bottomFillColor1: "rgba(245,66,108,0.02)", bottomFillColor2: "rgba(245,66,108,0.28)", lineWidth: 2 }); }
        else mainSeries = chart.addLineSeries({ color: IRIS, lineWidth: 2 });
        mainSeries.setData(toValueData(bars));
      } else if (chartType === "bar" || chartType === "ohlc") {
        mainSeries = chart.addBarSeries({ upColor: UP, downColor: DOWN, thinBars: chartType === "ohlc" ? false : true });
        mainSeries.setData(toOHLC(bars));
      } else {
        const src = chartType === "heikinashi" ? toHeikinAshi(bars) : bars;
        mainSeries = chart.addCandlestickSeries({
          upColor: hollow ? "rgba(0,0,0,0)" : UP, downColor: DOWN,
          borderVisible: true, borderUpColor: UP, borderDownColor: DOWN,
          wickUpColor: UP, wickDownColor: DOWN,
        });
        mainSeries.setData(toOHLC(src));
      }
      api.current.mainSeries = mainSeries;

      // ---- indicators ----
      const overlays = [];
      let volume = null;
      const lowerSpecs = [];
      for (const id of indicators) {
        const res = computeIndicator(id, bars);
        if (res.overlays) for (const ov of res.overlays) {
          const s = chart.addLineSeries({ color: ov.color, lineWidth: 1.5, lineStyle: ov.dashed ? LWC.LineStyle.Dashed : LWC.LineStyle.Solid, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
          s.setData(ov.data); overlays.push(s);
        }
        if (res.volume) {
          volume = chart.addHistogramSeries({ priceScaleId: "vol", priceFormat: { type: "volume" }, lastValueVisible: false });
          volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
          volume.setData(res.volume);
        }
        if (res.lower) lowerSpecs.push(res.lower);
      }
      api.current.overlays = overlays;
      api.current.volume = volume;

      // ---- compare overlays (normalized %, own hidden scale) ----
      if (compare?.length) {
        for (const c of compare) {
          const s = chart.addLineSeries({ color: c.color, lineWidth: 1.5, priceScaleId: "cmp", lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
          s.setData(c.data);
        }
        chart.priceScale("cmp").applyOptions({ visible: false, scaleMargins: { top: 0.06, bottom: 0.24 } });
      }

      // ---- lower (oscillator) pane: a second synced chart ----
      if (lowerSpecs.length && lowerElRef.current) {
        const lower = LWC.createChart(lowerElRef.current, { ...base, autoSize: true, timeScale: { ...base.timeScale, visible: false } });
        api.current.lower = lower;
        let leftUsed = false;
        for (const spec of lowerSpecs) {
          const scaleId = spec.range ? (leftUsed ? "right" : "left") : "right";
          if (spec.range) leftUsed = true;
          for (const s of spec.series) {
            const ls = lower.addLineSeries({ color: s.color, lineWidth: 1.5, priceScaleId: scaleId, lastValueVisible: true });
            ls.setData(s.data);
          }
          if (spec.hist) { const h = lower.addHistogramSeries({ priceScaleId: scaleId }); h.setData(spec.hist); }
          if (spec.guides && spec.series[0]) for (const g of spec.guides) api.current.lowerGuide = spec.series[0];
        }
        // sync time scales both ways
        const mts = chart.timeScale(), lts = lower.timeScale();
        let lock = false;
        const syncFrom = (a, b) => a.subscribeVisibleLogicalRangeChange((r) => { if (lock || !r) return; lock = true; b.setVisibleLogicalRange(r); lock = false; });
        syncFrom(mts, lts); syncFrom(lts, mts);
      }

      if (sameData && savedRange) {
        try { chart.timeScale().setVisibleLogicalRange(savedRange); } catch { chart.timeScale().fitContent(); }
      } else {
        chart.timeScale().fitContent();
      }
      prevBarsRef.current = bars;

      // crosshair legend
      chart.subscribeCrosshairMove((param) => {
        if (!onCrosshair) return;
        if (!param.time || !param.seriesData?.get(mainSeries)) { onCrosshair(null); return; }
        onCrosshair(param.seriesData.get(mainSeries));
      });

      // keep drawings anchored while zoom/pan/resize
      chart.timeScale().subscribeVisibleLogicalRangeChange(redrawOverlay);
      ro = new ResizeObserver(() => redrawOverlay());
      ro.observe(mainElRef.current);
      setTimeout(redrawOverlay, 50);
      onReady?.();
    })();
    return () => { disposed = true; try { ro?.disconnect(); } catch { /* noop */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, chartType, indicators.join(","), theme, compare.map((c) => c.key).join(","), minimal]);

  const hasLower = indicators.some((id) => ["RSI", "MACD", "StochRSI", "ATR", "ADX", "OBV"].includes(id));

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="relative flex-1 min-h-0">
        <div ref={mainElRef} className="absolute inset-0" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0"
          style={{ pointerEvents: drawTool === "cursor" ? "none" : "auto", cursor: drawTool === "cursor" ? "default" : "crosshair" }}
        />
      </div>
      {hasLower && <div ref={lowerElRef} className="h-[130px] shrink-0 border-t" style={{ borderColor: "var(--tdn-border)" }} />}
    </div>
  );
});

export default LWChart;
