// src/app/tradeon/components/chart/LWChart.jsx
// Professional charting surface built on lightweight-charts (TradingView's OSS
// engine): native zoom / mouse-wheel / drag-pan / crosshair / price + time
// scales, 7 chart types, live last-bar updates, overlay + lower-pane indicators.
//
// DRAWINGS: a full editing engine (see the "drawing overlay" block). A core set
// of tools — trend / ray / horizontal / vertical / arrow / rectangle / ellipse /
// fibonacci / text — is create-able, and every drawing is then selectable,
// movable (drag body) and resizable (drag endpoint handles), with an optional
// magnet (snap to OHLC). Drawings live in the parent (per-symbol persistence +
// undo/redo); this component renders + edits them and commits on each change.
//
// LOWER INDICATORS: by default a single shared lower pane (mini charts /
// workspace). When `managedLower` is supplied (the Full Chart) each lower
// indicator gets its OWN stacked pane — resizable / reorderable / collapsible /
// removable — all time-synced with the main chart.
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ChevronDown, ChevronUp, Minus as MinusIcon, Plus as PlusIcon, X as XIcon } from "lucide-react";
import { toHeikinAshi, computeIndicator } from "../../lib/candles";

const UP = "#10c477", DOWN = "#f5426c", IRIS = "#0d9488", CYAN = "#22d3ee";
const PANE_HEADER_H = 24; // px — the pane's title/controls strip
const COLLAPSED_H = PANE_HEADER_H + 1; // + top border

const SINGLE_POINT = new Set(["horizontal", "vertical", "text"]);
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

function palette(theme) {
  const dark = theme === "dark";
  return {
    text: dark ? "#9aa0bd" : "#5a6079",
    grid: dark ? "rgba(255,255,255,0.05)" : "rgba(16,19,42,0.06)",
    border: dark ? "rgba(255,255,255,0.10)" : "rgba(16,19,42,0.12)",
    cross: dark ? "rgba(255,255,255,0.35)" : "rgba(16,19,42,0.35)",
    guide: dark ? "rgba(255,255,255,0.16)" : "rgba(16,19,42,0.16)",
  };
}

const VALUE_TYPES = new Set(["line", "area", "baseline"]);
const LOWER_LIVE = ["RSI", "MACD", "StochRSI", "ATR", "ADX", "OBV"];

function toValueData(bars) { return bars.map((b) => ({ time: b.time, value: b.close })); }
function toOHLC(bars) { return bars.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close })); }
function distSeg(px, py, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  if (!L) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / L;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}
function makeId() { return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/** Header strip for one managed lower pane: title + reorder / collapse / remove. */
function PaneHeader({ pane, index, count, onAction }) {
  const btn = "grid place-items-center w-5 h-5 rounded transition-colors";
  return (
    <div
      className="flex items-center gap-1 px-1.5 shrink-0 select-none border-b"
      style={{ height: PANE_HEADER_H, background: "var(--tdn-bg-2)", borderColor: "var(--tdn-border)" }}
    >
      <span className="text-[0.62rem] font-semibold truncate" style={{ color: "var(--tdn-fg)" }}>{pane.label}</span>
      <span className="flex-1" />
      <button className={btn} title="Move up" disabled={index === 0} style={{ color: "var(--tdn-faint)", opacity: index === 0 ? 0.3 : 1 }}
        onClick={() => onAction("reorder", pane.id, "up")}><ChevronUp size={12} /></button>
      <button className={btn} title="Move down" disabled={index === count - 1} style={{ color: "var(--tdn-faint)", opacity: index === count - 1 ? 0.3 : 1 }}
        onClick={() => onAction("reorder", pane.id, "down")}><ChevronDown size={12} /></button>
      <button className={btn} title={pane.collapsed ? "Expand" : "Collapse"} style={{ color: "var(--tdn-faint)" }}
        onClick={() => onAction("collapse", pane.id)}>{pane.collapsed ? <PlusIcon size={12} /> : <MinusIcon size={12} />}</button>
      <button className={btn} title="Remove indicator" style={{ color: "var(--tdn-faint)" }}
        onClick={() => onAction("remove", pane.id)}><XIcon size={12} /></button>
    </div>
  );
}

const LWChart = forwardRef(function LWChart(
  {
    bars, chartType = "line", indicators = [], theme = "dark", onCrosshair, onReady,
    drawTool = "cursor", drawColor = IRIS, compare = [], minimal = false,
    managedLower = null, onLowerAction,
    drawings = null, onCommitDrawings, magnet = false, hideDrawings = false, selectedId = null, onSelect, onToolDone, drawDefaults = null,
  },
  ref
) {
  const editable = Array.isArray(drawings); // parent-managed editing engine active
  const managed = Array.isArray(managedLower) && managedLower.length > 0;
  const managedSig = (managedLower || []).map((p) => p.id + (p.collapsed ? "c" : "")).join(",");

  const mainElRef = useRef(null);
  const wrapRef = useRef(null);
  const lowerElRef = useRef(null);
  const overlayRef = useRef(null);
  const paneEls = useRef({});
  const api = useRef({});
  const prevBarsRef = useRef(null);
  const barsRef = useRef(bars);

  // ----- drawing engine state (all refs so the pointer effect stays stable) -----
  const editRef = useRef([]);           // working copy of drawings
  const dragRef = useRef(null);         // active create/move/resize op
  const selRef = useRef(selectedId);    // selected drawing id
  const toolRef = useRef(drawTool);
  const colorRef = useRef(drawColor);
  const cfg = useRef({ magnet, hideDrawings, onCommitDrawings, onSelect, onToolDone, editable, drawDefaults });

  useEffect(() => { toolRef.current = drawTool; colorRef.current = drawColor; }, [drawTool, drawColor]);
  useEffect(() => { barsRef.current = bars; }, [bars]);
  useEffect(() => { cfg.current = { magnet, hideDrawings, onCommitDrawings, onSelect, onToolDone, editable, drawDefaults }; });
  // Sync the working copy + selection from the parent, then repaint.
  useEffect(() => {
    if (editable) editRef.current = (drawings || []).map((d) => ({ ...d, points: d.points.map((p) => ({ ...p })) }));
    selRef.current = selectedId;
    redrawOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings, selectedId, hideDrawings, editable]);

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
    updateLast: (bar) => {
      const s = api.current.mainSeries;
      if (!s) return;
      try {
        s.update(VALUE_TYPES.has(chartType) ? { time: bar.time, value: bar.close } : { time: bar.time, open: bar.open, high: bar.high, low: bar.low, close: bar.close });
        if (api.current.volume) api.current.volume.update({ time: bar.time, value: bar.volume, color: bar.close >= bar.open ? "rgba(16,196,119,0.5)" : "rgba(245,66,108,0.5)" });
      } catch { /* time ordering guard */ }
    },
  }));

  /* ---------------- coordinate transforms ---------------- */
  function toPix(pt) {
    const { chart, mainSeries } = api.current;
    if (!chart || !mainSeries) return null;
    const x = chart.timeScale().timeToCoordinate(pt.time);
    const y = mainSeries.priceToCoordinate(pt.price);
    return x == null || y == null ? null : { x, y };
  }
  function priceToY(price) { return api.current.mainSeries?.priceToCoordinate(price) ?? null; }
  function fromPix(x, y) {
    const { chart, mainSeries } = api.current;
    if (!chart || !mainSeries) return null;
    const time = chart.timeScale().coordinateToTime(x);
    const price = mainSeries.coordinateToPrice(y);
    return time == null || price == null ? null : { time, price };
  }
  function snap(pt) {
    if (!cfg.current.magnet || !pt) return pt;
    const arr = barsRef.current;
    if (!arr?.length) return pt;
    let best = arr[0], bd = Infinity;
    for (const b of arr) { const d = Math.abs(b.time - pt.time); if (d < bd) { bd = d; best = b; } }
    const cands = [best.open, best.high, best.low, best.close];
    let bp = cands[0], bpd = Infinity;
    for (const c of cands) { const d = Math.abs(c - pt.price); if (d < bpd) { bpd = d; bp = c; } }
    return { time: pt.time, price: bp };
  }

  /* ---------------- drawing render ---------------- */
  function fmtP(v) { return Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }); }
  function seg(ctx, a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  function extend(a, b, W, H) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, big = (W + H) * 2;
    return { x: a.x + (dx / len) * big, y: a.y + (dy / len) * big };
  }
  function arrowhead(ctx, a, b) {
    const ang = Math.atan2(b.y - a.y, b.x - a.x), s = 9;
    ctx.beginPath(); ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - s * Math.cos(ang - Math.PI / 6), b.y - s * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(b.x - s * Math.cos(ang + Math.PI / 6), b.y - s * Math.sin(ang + Math.PI / 6));
    ctx.closePath(); ctx.fill();
  }
  // Extend a segment past a/b to the canvas edges per the drawing's extend flags.
  function extendSeg(a, b, d, W, H) {
    if (!d.extendLeft && !d.extendRight) return [a, b];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, big = (W + H) * 2;
    return [
      d.extendLeft ? { x: a.x - ux * big, y: a.y - uy * big } : a,
      d.extendRight ? { x: b.x + ux * big, y: b.y + uy * big } : b,
    ];
  }
  function drawShape(ctx, d, W, H, isSel) {
    if (d.hidden) return;
    const pts = d.points.map(toPix);
    if (pts.some((p) => !p)) return;
    const a = pts[0], b = pts[1];
    const op = d.opacity == null ? 1 : d.opacity;
    ctx.save();
    ctx.globalAlpha = op;
    ctx.lineWidth = (d.width || 1.75) + (isSel ? 0.5 : 0);
    ctx.strokeStyle = d.color || IRIS; ctx.fillStyle = d.color || IRIS;
    ctx.setLineDash(d.style === "dashed" ? [7, 5] : d.style === "dotted" ? [2, 4] : []);
    ctx.font = "12px ui-sans-serif, system-ui";
    switch (d.type) {
      case "horizontal": ctx.beginPath(); ctx.moveTo(0, a.y); ctx.lineTo(W, a.y); ctx.stroke(); ctx.setLineDash([]); ctx.fillText(fmtP(d.points[0].price), 4, a.y - 4); break;
      case "vertical": ctx.beginPath(); ctx.moveTo(a.x, 0); ctx.lineTo(a.x, H); ctx.stroke(); break;
      case "text": ctx.setLineDash([]); ctx.font = "13px ui-sans-serif, system-ui"; ctx.fillText(d.text || "Text", a.x + 7, a.y + 4); ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, 7); ctx.fill(); break;
      case "trend": { const [A, B] = extendSeg(a, b, d, W, H); seg(ctx, A, B); break; }
      case "arrow": { const [A, B] = extendSeg(a, b, d, W, H); seg(ctx, A, B); ctx.setLineDash([]); arrowhead(ctx, a, b); break; }
      case "ray": seg(ctx, a, extend(a, b, W, H)); break;
      case "rect": ctx.globalAlpha = op * 0.12; ctx.setLineDash([]); ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); ctx.globalAlpha = op; ctx.setLineDash(d.style === "dashed" ? [7, 5] : d.style === "dotted" ? [2, 4] : []); ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y); break;
      case "ellipse": {
        const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.globalAlpha = op * 0.1; ctx.fill(); ctx.globalAlpha = op; ctx.stroke(); break;
      }
      case "fib": {
        const p0 = d.points[0].price, p1 = d.points[1].price;
        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
        for (const lv of FIB_LEVELS) {
          const price = p1 + (p0 - p1) * lv, y = priceToY(price);
          if (y == null) continue;
          ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          ctx.fillText(`${(lv * 100).toFixed(1)}%  ${fmtP(price)}`, x0 + 3, y - 3);
        }
        break;
      }
      default: break;
    }
    if (isSel) {
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      for (const p of pts) {
        ctx.fillStyle = "#fff"; ctx.strokeStyle = d.color || IRIS; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.rect(p.x - 4, p.y - 4, 8, 8); ctx.fill(); ctx.stroke();
      }
    }
    if (d.locked) { ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = d.color || IRIS; ctx.beginPath(); ctx.arc(a.x, a.y - 11, 2.2, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function redrawOverlay() {
    const cv = overlayRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    // Measure the CSS box (pinned to 100% of the parent) — NOT the buffer — so
    // setting the width/height attributes below can never feed back into size.
    const rect = cv.getBoundingClientRect();
    const W = Math.round(rect.width), H = Math.round(rect.height);
    if (!W || !H) return;
    if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (cfg.current.hideDrawings) return;
    for (const d of editRef.current) drawShape(ctx, d, W, H, d.id === selRef.current);
  }

  /* ---------------- hit testing ---------------- */
  function onBody(d, pts, px, py, W, H) {
    const a = pts[0], b = pts[1];
    switch (d.type) {
      case "horizontal": return Math.abs(py - a.y) <= 6;
      case "vertical": return Math.abs(px - a.x) <= 6;
      case "text": return px >= a.x - 4 && px <= a.x + 70 && Math.abs(py - a.y) <= 12;
      case "trend": case "arrow": return distSeg(px, py, a, b) <= 6;
      case "ray": return distSeg(px, py, a, extend(a, b, W, H)) <= 6;
      case "rect": return px >= Math.min(a.x, b.x) - 6 && px <= Math.max(a.x, b.x) + 6 && py >= Math.min(a.y, b.y) - 6 && py <= Math.max(a.y, b.y) + 6;
      case "ellipse": {
        const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, rx = Math.abs(b.x - a.x) / 2 || 1, ry = Math.abs(b.y - a.y) / 2 || 1;
        return ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1.3;
      }
      case "fib": {
        if (px < Math.min(a.x, b.x) - 4 || px > Math.max(a.x, b.x) + 4) return false;
        return FIB_LEVELS.some((lv) => { const y = priceToY(d.points[1].price + (d.points[0].price - d.points[1].price) * lv); return y != null && Math.abs(py - y) <= 6; });
      }
      default: return false;
    }
  }
  function hitTest(px, py, W, H) {
    const list = editRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i];
      if (d.hidden) continue;
      const pts = d.points.map(toPix);
      if (pts.some((p) => !p)) continue;
      for (let h = 0; h < pts.length; h++) if (Math.hypot(px - pts[h].x, py - pts[h].y) <= 8) return { idx: i, handle: h };
      if (onBody(d, pts, px, py, W, H)) return { idx: i, handle: -1 };
    }
    return null;
  }
  function commit() { cfg.current.onCommitDrawings?.(editRef.current.map((d) => ({ ...d, points: d.points.map((p) => ({ ...p })) }))); }

  // Pointer engine — attached in CAPTURE phase to the chart wrapper so we can
  // claim events for drawing edits (stopPropagation) while letting the chart
  // pan/zoom untouched on empty space.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rel = (e) => { const r = wrap.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top, W: r.width, H: r.height }; };

    const onDown = (e) => {
      if (!cfg.current.editable || e.button !== 0) return;
      const { px, py, W, H } = rel(e);
      const tool = toolRef.current;
      if (tool !== "cursor") {
        e.stopPropagation(); e.preventDefault();
        const start = snap(fromPix(px, py));
        if (!start) return;
        const defs = cfg.current.drawDefaults || {};
        if (tool === "text") { const t = window.prompt("Text:", "Note"); if (t == null) return; editRef.current = [...editRef.current, { ...defs, id: makeId(), type: tool, points: [start], color: colorRef.current, text: t }]; selRef.current = editRef.current[editRef.current.length - 1].id; commit(); cfg.current.onSelect?.(selRef.current); cfg.current.onToolDone?.(); redrawOverlay(); return; }
        const single = SINGLE_POINT.has(tool);
        const dr = { ...defs, id: makeId(), type: tool, points: single ? [start] : [start, { ...start }], color: colorRef.current };
        editRef.current = [...editRef.current, dr];
        if (single) { selRef.current = dr.id; commit(); cfg.current.onSelect?.(dr.id); cfg.current.onToolDone?.(); }
        else dragRef.current = { mode: "create", idx: editRef.current.length - 1 };
        redrawOverlay();
        return;
      }
      // cursor mode → select / move / resize
      const hit = hitTest(px, py, W, H);
      if (hit) {
        e.stopPropagation(); e.preventDefault();
        const d = editRef.current[hit.idx];
        selRef.current = d.id; cfg.current.onSelect?.(d.id);
        if (!d.locked) {
          dragRef.current = hit.handle >= 0
            ? { mode: "resize", idx: hit.idx, handle: hit.handle }
            : { mode: "move", idx: hit.idx, from: snap(fromPix(px, py)) || fromPix(px, py), orig: d.points.map((p) => ({ ...p })) };
        }
        redrawOverlay();
      } else if (selRef.current != null) {
        selRef.current = null; cfg.current.onSelect?.(null); redrawOverlay();
        // no stopPropagation → chart still pans on empty drag
      }
    };
    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const { px, py } = rel(e);
      const d = editRef.current[drag.idx];
      if (!d) return;
      if (drag.mode === "create") d.points[1] = snap(fromPix(px, py)) || d.points[1];
      else if (drag.mode === "resize") d.points[drag.handle] = snap(fromPix(px, py)) || d.points[drag.handle];
      else if (drag.mode === "move") {
        const now = fromPix(px, py);
        if (now && drag.from) { const dt = now.time - drag.from.time, dp = now.price - drag.from.price; d.points = drag.orig.map((p) => ({ time: p.time + dt, price: p.price + dp })); }
      }
      redrawOverlay();
    };
    const onUp = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      if (drag.mode === "create") { const d = editRef.current[drag.idx]; if (d) { selRef.current = d.id; cfg.current.onSelect?.(d.id); } cfg.current.onToolDone?.(); }
      commit();
    };
    const onHover = (e) => {
      if (dragRef.current || !cfg.current.editable) return;
      const { px, py, W, H } = rel(e);
      if (toolRef.current !== "cursor") { wrap.style.cursor = "crosshair"; return; }
      const hit = hitTest(px, py, W, H);
      wrap.style.cursor = hit ? (hit.handle >= 0 ? "nwse-resize" : "move") : "";
    };

    wrap.addEventListener("pointerdown", onDown, true);
    wrap.addEventListener("pointermove", onHover, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      wrap.removeEventListener("pointerdown", onDown, true);
      wrap.removeEventListener("pointermove", onHover, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- build / rebuild ---------------- */
  useEffect(() => {
    let disposed = false;
    let ro;
    (async () => {
      const LWC = await import("lightweight-charts");
      if (disposed || !mainElRef.current) return;
      let savedRange = null;
      try { savedRange = api.current.chart?.timeScale().getVisibleLogicalRange() || null; } catch { /* noop */ }
      const sameData = prevBarsRef.current === bars;
      try { api.current.chart?.remove(); } catch { /* noop */ }
      try { api.current.lower?.remove(); } catch { /* noop */ }
      if (api.current.panes) for (const pc of api.current.panes) { try { pc.remove(); } catch { /* noop */ } }
      api.current = {};

      const pal = palette(theme);
      const base = {
        // attributionLogo hidden here; lightweight-charts (Apache-2.0) does not require on-chart attribution.
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
          ? { rightPriceScale: { visible: false }, leftPriceScale: { visible: false }, timeScale: { ...base.timeScale, visible: false }, grid: { vertLines: { visible: false }, horzLines: { visible: false } }, handleScale: false, handleScroll: false }
          : {}),
      });
      api.current.chart = chart;

      let mainSeries;
      const hollow = chartType === "hollow";
      if (VALUE_TYPES.has(chartType)) {
        if (chartType === "area") mainSeries = chart.addAreaSeries({ lineColor: IRIS, topColor: "rgba(13,148,136,0.35)", bottomColor: "rgba(13,148,136,0.02)", lineWidth: 2 });
        else if (chartType === "baseline") { const bl = bars.length ? bars[0].close : 0; mainSeries = chart.addBaselineSeries({ baseValue: { type: "price", price: bl }, topLineColor: UP, topFillColor1: "rgba(16,196,119,0.28)", topFillColor2: "rgba(16,196,119,0.02)", bottomLineColor: DOWN, bottomFillColor1: "rgba(245,66,108,0.02)", bottomFillColor2: "rgba(245,66,108,0.28)", lineWidth: 2 }); }
        else mainSeries = chart.addLineSeries({ color: IRIS, lineWidth: 2 });
        mainSeries.setData(toValueData(bars));
      } else if (chartType === "bar" || chartType === "ohlc") {
        mainSeries = chart.addBarSeries({ upColor: UP, downColor: DOWN, thinBars: chartType === "ohlc" ? false : true });
        mainSeries.setData(toOHLC(bars));
      } else {
        const src = chartType === "heikinashi" ? toHeikinAshi(bars) : bars;
        mainSeries = chart.addCandlestickSeries({ upColor: hollow ? "rgba(0,0,0,0)" : UP, downColor: DOWN, borderVisible: true, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN });
        mainSeries.setData(toOHLC(src));
      }
      api.current.mainSeries = mainSeries;

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
        if (res.lower && !managed) lowerSpecs.push(res.lower);
      }
      api.current.overlays = overlays;
      api.current.volume = volume;

      if (compare?.length) {
        for (const c of compare) {
          const s = chart.addLineSeries({ color: c.color, lineWidth: 1.5, priceScaleId: "cmp", lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
          s.setData(c.data);
        }
        chart.priceScale("cmp").applyOptions({ visible: false, scaleMargins: { top: 0.06, bottom: 0.24 } });
      }

      const lowerCharts = [];
      if (managed) {
        const visible = managedLower.filter((p) => !p.collapsed && paneEls.current[p.id]);
        const lastVisible = visible[visible.length - 1];
        for (const pane of managedLower) {
          if (pane.collapsed) continue;
          const el = paneEls.current[pane.id];
          if (!el) continue;
          const spec = computeIndicator(pane.id, bars).lower;
          if (!spec) continue;
          const isLast = pane === lastVisible;
          const pc = LWC.createChart(el, { ...base, autoSize: true, timeScale: { ...base.timeScale, visible: isLast }, rightPriceScale: { borderColor: pal.border, scaleMargins: { top: 0.12, bottom: 0.08 } } });
          const firstSeries = [];
          for (const s of spec.series) { const ls = pc.addLineSeries({ color: s.color, lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true }); ls.setData(s.data); firstSeries.push(ls); }
          if (spec.hist) { const h = pc.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false }); h.setData(spec.hist); }
          if (spec.guides && firstSeries[0]) for (const g of spec.guides) { try { firstSeries[0].createPriceLine({ price: g, color: pal.guide, lineWidth: 1, lineStyle: LWC.LineStyle.Dashed, axisLabelVisible: true }); } catch { /* noop */ } }
          lowerCharts.push(pc);
        }
        api.current.panes = lowerCharts.slice();
        if (!minimal) chart.timeScale().applyOptions({ visible: visible.length === 0 });
      } else if (lowerSpecs.length && lowerElRef.current) {
        const lower = LWC.createChart(lowerElRef.current, { ...base, autoSize: true, timeScale: { ...base.timeScale, visible: false } });
        api.current.lower = lower;
        let leftUsed = false;
        for (const spec of lowerSpecs) {
          const scaleId = spec.range ? (leftUsed ? "right" : "left") : "right";
          if (spec.range) leftUsed = true;
          let firstSeries = null;
          for (const s of spec.series) {
            const ls = lower.addLineSeries({ color: s.color, lineWidth: 1.5, priceScaleId: scaleId, lastValueVisible: true });
            ls.setData(s.data);
            if (!firstSeries) firstSeries = ls;
          }
          if (spec.hist) { const h = lower.addHistogramSeries({ priceScaleId: scaleId }); h.setData(spec.hist); }
          if (spec.guides && firstSeries) {
            for (const g of spec.guides) {
              firstSeries.createPriceLine({ price: g, color: pal.guide, lineWidth: 1, lineStyle: LWC.LineStyle.Dashed, axisLabelVisible: true, title: String(g) });
            }
          }
        }
        lowerCharts.push(lower);
      }

      const syncCharts = [chart, ...lowerCharts];
      if (syncCharts.length > 1) {
        let lock = false;
        for (const src of syncCharts) {
          src.timeScale().subscribeVisibleLogicalRangeChange((r) => {
            if (lock || !r) return;
            lock = true;
            for (const other of syncCharts) if (other !== src) { try { other.timeScale().setVisibleLogicalRange(r); } catch { /* noop */ } }
            lock = false;
          });
        }
      }

      if (sameData && savedRange) { try { chart.timeScale().setVisibleLogicalRange(savedRange); } catch { chart.timeScale().fitContent(); } }
      else chart.timeScale().fitContent();
      try { const mr = chart.timeScale().getVisibleLogicalRange(); if (mr) for (const c of lowerCharts) { try { c.timeScale().setVisibleLogicalRange(mr); } catch { /* noop */ } } } catch { /* noop */ }
      prevBarsRef.current = bars;

      chart.subscribeCrosshairMove((param) => {
        if (!onCrosshair) return;
        if (!param.time || !param.seriesData?.get(mainSeries)) { onCrosshair(null); return; }
        onCrosshair(param.seriesData.get(mainSeries));
      });

      chart.timeScale().subscribeVisibleLogicalRangeChange(redrawOverlay);
      ro = new ResizeObserver(() => redrawOverlay());
      ro.observe(mainElRef.current);
      setTimeout(redrawOverlay, 50);
      onReady?.();
    })();
    return () => { disposed = true; try { ro?.disconnect(); } catch { /* noop */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, chartType, indicators.join(","), theme, compare.map((c) => c.key).join(","), minimal, managedSig]);

  const hasLegacyLower = !managed && indicators.some((id) => LOWER_LIVE.includes(id));
  const overlayActive = editable && drawTool !== "cursor";

  return (
    <div className="w-full h-full flex flex-col relative">
      <div ref={wrapRef} className="relative flex-1 min-h-0">
        <div ref={mainElRef} className="absolute inset-0" />
        <canvas ref={overlayRef} className="absolute inset-0" style={{ width: "100%", height: "100%", pointerEvents: "none", cursor: overlayActive ? "crosshair" : "default" }} />
      </div>

      {managed
        ? managedLower.map((pane, i) => (
            <div key={pane.id} className="shrink-0 flex flex-col border-t relative" style={{ height: pane.collapsed ? COLLAPSED_H : pane.height, borderColor: "var(--tdn-border)" }}>
              {!pane.collapsed && <div className="tdn-pane-resize" onPointerDown={(e) => startResize(e, pane)} title="Drag to resize" />}
              <PaneHeader pane={pane} index={i} count={managedLower.length} onAction={onLowerAction} />
              {!pane.collapsed && <div ref={(el) => { if (el) paneEls.current[pane.id] = el; else delete paneEls.current[pane.id]; }} className="flex-1 min-h-0" />}
            </div>
          ))
        : hasLegacyLower && <div ref={lowerElRef} className="h-[130px] shrink-0 border-t" style={{ borderColor: "var(--tdn-border)" }} />}
    </div>
  );

  function startResize(e, pane) {
    e.preventDefault();
    const startY = e.clientY, startH = pane.height;
    const move = (ev) => onLowerAction?.("resize", pane.id, Math.max(70, Math.min(460, startH - (ev.clientY - startY))));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
});

export default LWChart;
