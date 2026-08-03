// src/app/tradeon/components/chart/FullChartClient.jsx
// Full-screen professional charting workspace. Occupies the whole viewport:
// top control bar, left drawing rail, live interactive chart (lightweight-charts),
// right info rail (prediction + watchlist) and a bottom timeframe strip. Live
// data streams from the market engine while the session is open; when closed it
// freezes the last session but stays fully interactive. Chart type, timeframe and
// indicators persist to localStorage.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftToLine, ArrowRightToLine, ArrowUpRight, Bell, Camera, ChevronDown, ChevronUp, Circle, Copy,
  Eye, EyeOff, GitCompare, Home, LineChart as LineIcon, Lock, Magnet, Maximize, Minus, MousePointer2,
  MoveUpRight, MoveVertical, Minimize2, PenTool, Redo2, RotateCcw, Ruler, Scaling, Search as SearchIcon,
  Activity, Gauge, Share2, Square, Star, Trash2, Type, Undo2, Unlock, X,
} from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { useTradeonTheme } from "../../hooks/tradeonTheme";
import { predict } from "../../lib/ai";
import { generateCandles, TIMEFRAMES, TF_BY_ID, INDICATOR_DEFS } from "../../lib/candles";
import { getMarketStatus, STATUS_COLOR } from "../../lib/marketHours";
import { assetHref, formatCompact, formatPct, formatPrice } from "../../lib/format";
import { useClickOutside } from "../../hooks/useClickOutside";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import LiveValue from "../shared/LiveValue";
import DeltaPill from "../shared/DeltaPill";
import AssetPicker from "../workspace/AssetPicker";
import LWChart from "./LWChart";

const CHART_TYPES = [
  { id: "line", label: "Line" }, { id: "candlestick", label: "Candlestick" }, { id: "hollow", label: "Hollow Candle" },
  { id: "area", label: "Area" }, { id: "baseline", label: "Baseline" }, { id: "ohlc", label: "OHLC" },
  { id: "bar", label: "Bar" }, { id: "heikinashi", label: "Heikin Ashi" },
];
const DRAW_TOOLS = [
  { id: "cursor", Icon: MousePointer2, title: "Cursor / select" },
  { id: "trend", Icon: PenTool, title: "Trend line" },
  { id: "ray", Icon: MoveUpRight, title: "Ray" },
  { id: "horizontal", Icon: Minus, title: "Horizontal line" },
  { id: "vertical", Icon: MoveVertical, title: "Vertical line" },
  { id: "arrow", Icon: ArrowUpRight, title: "Arrow" },
  { id: "rect", Icon: Square, title: "Rectangle" },
  { id: "ellipse", Icon: Circle, title: "Ellipse" },
  { id: "fib", Icon: Ruler, title: "Fibonacci retracement" },
  { id: "text", Icon: Type, title: "Text" },
];
const DRAW_COLORS = ["#0d9488", "#22d3ee", "#10c477", "#f5426c", "#f7b955"];
const TOOL_BTN = "w-9 h-9 rounded-lg grid place-items-center shrink-0 transition-colors";
const DRAW_LABELS = { trend: "Trend Line", ray: "Ray", horizontal: "Horizontal Line", vertical: "Vertical Line", arrow: "Arrow", rect: "Rectangle", ellipse: "Ellipse", fib: "Fibonacci", text: "Text" };
const LINE_TYPES = new Set(["trend", "arrow", "ray", "horizontal", "vertical"]);
// Right-rail watchlist grouped by asset class (TradingView-style).
const WATCH_CATS = [
  { id: "stocks", label: "Stocks" },
  { id: "indices", label: "Indices" },
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "etf", label: "ETFs" },
];

function TbDivider() { return <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: "var(--tdn-border)" }} />; }

/**
 * Floating properties toolbar for a drawing tool / selected object (TradingView-
 * style): colour, width, line style, opacity, extend L/R, lock, hide, z-order,
 * duplicate, delete and name. Edits the selected drawing, or (with no selection
 * but a tool active) the defaults applied to the next drawing.
 */
function DrawingToolbar({ target, isSel, onPatch, onDuplicate, onDelete, onForward, onBackward }) {
  const isLine = LINE_TYPES.has(target.type);
  const width = target.width ?? 2;
  const style = target.style ?? "solid";
  const opacity = target.opacity ?? 1;
  const ib = "tdn-btn tdn-btn-icon !w-6 !h-6 shrink-0";
  const cycleOpacity = () => { const seq = [1, 0.7, 0.4]; const i = seq.findIndex((v) => Math.abs(v - opacity) < 0.05); onPatch({ opacity: seq[(i + 1) % seq.length] }); };
  return (
    <div className="tdn-panel absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-1.5 py-1 max-w-[calc(100%-1rem)] overflow-x-auto tdn-scroll-hide tdn-rise" style={{ borderRadius: 12 }}>
      {DRAW_COLORS.map((c) => (
        <button key={c} onClick={() => onPatch({ color: c })} className="w-4 h-4 rounded-full shrink-0" title="Colour"
          style={{ background: c, outline: (target.color || "").toLowerCase() === c ? "2px solid var(--tdn-fg-strong)" : "none", outlineOffset: 1 }} />
      ))}
      <TbDivider />
      {[1, 2, 3.5].map((w) => (
        <button key={w} onClick={() => onPatch({ width: w })} className={ib} title={`Width ${w}`} style={{ color: Math.abs(width - w) < 0.1 ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}>
          <span style={{ width: 13, height: Math.max(1, Math.round(w)), background: "currentColor", borderRadius: 2, display: "block" }} />
        </button>
      ))}
      <TbDivider />
      {["solid", "dashed", "dotted"].map((s) => (
        <button key={s} onClick={() => onPatch({ style: s })} className={ib} title={s} style={{ color: style === s ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}>
          <span style={{ width: 14, height: 0, borderTop: `2px ${s} currentColor`, display: "block" }} />
        </button>
      ))}
      <button onClick={cycleOpacity} className="tdn-btn tdn-btn-icon !w-auto !px-1.5 !h-6 !text-[0.62rem] shrink-0 tdn-mono" title="Opacity" style={{ color: "var(--tdn-muted)" }}>{Math.round(opacity * 100)}%</button>
      {isLine && (
        <>
          <TbDivider />
          <button onClick={() => onPatch({ extendLeft: !target.extendLeft })} className={ib} title="Extend left" style={{ color: target.extendLeft ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}><ArrowLeftToLine size={13} /></button>
          <button onClick={() => onPatch({ extendRight: !target.extendRight })} className={ib} title="Extend right" style={{ color: target.extendRight ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}><ArrowRightToLine size={13} /></button>
        </>
      )}
      {isSel && (
        <>
          <TbDivider />
          <button onClick={() => onPatch({ locked: !target.locked })} className={ib} title={target.locked ? "Unlock" : "Lock"} style={{ color: target.locked ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}>{target.locked ? <Unlock size={13} /> : <Lock size={13} />}</button>
          <button onClick={() => onPatch({ hidden: !target.hidden })} className={ib} title={target.hidden ? "Show" : "Hide"} style={{ color: target.hidden ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}>{target.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
          <button onClick={onForward} className={ib} title="Bring forward" style={{ color: "var(--tdn-muted)" }}><ChevronUp size={14} /></button>
          <button onClick={onBackward} className={ib} title="Send backward" style={{ color: "var(--tdn-muted)" }}><ChevronDown size={14} /></button>
          <button onClick={onDuplicate} className={ib} title="Duplicate (⌘D)" style={{ color: "var(--tdn-muted)" }}><Copy size={13} /></button>
          <button onClick={onDelete} className={ib} title="Delete (Del)" style={{ color: "var(--tdn-down)" }}><Trash2 size={13} /></button>
          <TbDivider />
          <input value={target.name || DRAW_LABELS[target.type] || "Drawing"} onChange={(e) => onPatch({ name: e.target.value })} className="tdn-input !h-6 !py-0 !px-1.5 !text-[0.66rem] shrink-0" style={{ width: 96 }} title="Drawing name" />
        </>
      )}
    </div>
  );
}

// Which indicators live in their own lower pane vs. overlay the price, keyed by id.
const PANE_BY_ID = Object.fromEntries(INDICATOR_DEFS.map((d) => [d.id, d.pane]));
const LABEL_BY_ID = Object.fromEntries(INDICATOR_DEFS.map((d) => [d.id, d.label]));
const DEFAULT_PANE_H = 130;

const stampTime = () => new Date().toLocaleTimeString("en-US", { hour12: false });

// When `seed` is provided (embedded/workspace fullscreen) it becomes the initial
// value and the stored value is NOT loaded (so the panel's state wins); changes
// still persist so "save" keeps working.
function usePersisted(key, initial, seed) {
  const hasSeed = seed !== undefined;
  const [v, setV] = useState(hasSeed ? seed : initial);
  useEffect(() => {
    if (hasSeed) return;
    try { const s = localStorage.getItem(key); if (s != null) setV(JSON.parse(s)); } catch { /* noop */ }
  }, [key, hasSeed]);
  const set = useCallback((nv) => { setV(nv); try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* noop */ } }, [key]);
  return [v, set];
}

function Menu({ label, icon: Icon, width = 200, children, active }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const ref = useClickOutside(() => setOpen(false), open);
  // The toolbar uses overflow-x for horizontal scroll, which clips absolutely
  // positioned children — so the menu is rendered `fixed`, anchored to the button.
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - width - 8);
      setCoords({ top: r.bottom + 4, left: Math.max(8, left) });
    }
    setOpen((o) => !o);
  };
  return (
    <div className="relative" ref={ref}>
      <button ref={btnRef} onClick={toggle} className="tdn-btn tdn-btn-icon !w-auto !px-2.5 !h-8 !text-xs gap-1.5" style={active ? { color: "var(--tdn-iris-2)" } : undefined}>
        {Icon && <Icon size={14} />} {label} <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && coords && (
        <div className="fixed z-[200] rounded-xl overflow-hidden shadow-[var(--tdn-shadow-lg)] p-1" style={{ top: coords.top, left: coords.left, width, background: "var(--tdn-surface-solid)", border: "1px solid var(--tdn-border-strong)" }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Searchable indicator panel (TradingView-style): filter, browse and toggle. */
function IndicatorPanel({ indicators, onToggle, onClear }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = query ? INDICATOR_DEFS.filter((i) => i.label.toLowerCase().includes(query) || i.id.toLowerCase().includes(query)) : INDICATOR_DEFS;
  const paneTag = (p) => (p === "lower" ? "pane" : p === "volume" ? "vol" : "overlay");
  return (
    <div>
      <div className="flex items-center gap-2 px-2.5 py-2 border-b" style={{ borderColor: "var(--tdn-border)" }}>
        <SearchIcon size={13} style={{ color: "var(--tdn-muted)" }} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search indicators…" className="flex-1 min-w-0 bg-transparent outline-none text-sm" style={{ color: "var(--tdn-fg)" }} />
        {indicators.length > 0 && <button onClick={onClear} className="text-[0.6rem] font-semibold shrink-0" style={{ color: "var(--tdn-down)" }}>Clear</button>}
      </div>
      <div className="max-h-72 overflow-y-auto tdn-scroll-thin py-1">
        {list.map((ind) => {
          const on = indicators.includes(ind.id);
          return (
            <button key={ind.id} onClick={() => onToggle(ind.id)} className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-sm hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]" style={{ color: "var(--tdn-fg)" }}>
              <span className="flex items-center gap-1.5 min-w-0"><span className="truncate">{ind.label}</span><span className="text-[0.52rem] uppercase tracking-wide shrink-0" style={{ color: "var(--tdn-faint)" }}>{paneTag(ind.pane)}</span></span>
              <span className="w-3.5 h-3.5 rounded grid place-items-center shrink-0" style={{ border: "1px solid var(--tdn-border-strong)", background: on ? "var(--tdn-iris)" : "transparent" }}>
                {on && <span className="text-white text-[0.6rem]">✓</span>}
              </span>
            </button>
          );
        })}
        {!list.length && <div className="px-3 py-6 text-center text-xs" style={{ color: "var(--tdn-faint)" }}>No indicators match “{q}”</div>}
      </div>
    </div>
  );
}

function SessionBadge({ mkt }) {
  const c = STATUS_COLOR[mkt.status] || "var(--tdn-faint)";
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold px-2 py-1 rounded-md" style={{ color: c, background: `color-mix(in srgb, ${c} 12%, transparent)` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c, boxShadow: mkt.streaming ? `0 0 6px ${c}` : "none" }} />
      {mkt.label}
    </span>
  );
}

export default function FullChartClient({ initialSymbol = null, initialTf, initialType, initialIndicators, embedded = false, onClose } = {}) {
  const params = useParams();
  const routeSym = decodeURIComponent(Array.isArray(params.symbol) ? params.symbol[0] : params.symbol || "BTC");
  const { data } = useMarketData();
  const { theme } = useTradeonTheme();

  const [symbol, setSymbol] = useState(initialSymbol ?? routeSym);
  // Embedded (workspace fullscreen) seeds tf / type / indicators from the panel;
  // the standalone /chart page loads the shared persisted values as before.
  const [tf, setTf] = usePersisted("tradeon-chart-tf", "1d", embedded ? initialTf : undefined);
  const [chartType, setChartType] = usePersisted("tradeon-chart-type", "candlestick", embedded ? initialType : undefined);
  const [indicators, setIndicators] = usePersisted("tradeon-chart-inds", ["Volume"], embedded ? initialIndicators : undefined);
  const [panePrefs, setPanePrefs] = usePersisted("tradeon-chart-panes", {}); // id -> { h, c }
  const [drawTool, setDrawTool] = useState("cursor");
  const [drawColor, setDrawColor] = useState("#0d9488");
  const [drawDefaults, setDrawDefaults] = useState({ width: 2, style: "solid", opacity: 1 });
  const [drawings, setDrawings] = useState([]);
  const [selDrawId, setSelDrawId] = useState(null);
  const [magnet, setMagnet] = useState(false);
  const [hideDraw, setHideDraw] = useState(false);
  const drawHist = useRef({ past: [], future: [] });
  const drawClip = useRef(null);
  const [compareList, setCompareList] = useState([]);
  const [legend, setLegend] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bars, setBars] = useState([]);
  const [now, setNow] = useState(null);

  const chartRef = useRef();
  const barsRef = useRef([]);
  useEffect(() => { barsRef.current = bars; }, [bars]);

  const inst = data.find((d) => d.symbol === symbol) || null;
  const mkt = now ? getMarketStatus(inst?.assetClass, now) : { status: "open", label: "Market Open", streaming: true, session: "" };
  const p = useMemo(() => (inst ? predict(inst) : null), [inst]);
  const cur = inst && inst.assetClass === "forex" ? "" : "$";

  // Group the universe by asset class for the category-wise watchlist rail.
  const watchGroups = useMemo(() => {
    const g = { stocks: [], indices: [], crypto: [], forex: [], commodities: [], etf: [] };
    for (const d of data) if (g[d.assetClass]) g[d.assetClass].push(d);
    return g;
  }, [data]);

  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  // Honor ?tf= & ?type= from the launching widget (preserves the selection).
  useEffect(() => {
    if (embedded) return; // workspace fullscreen has no URL params to read
    try {
      const q = new URLSearchParams(window.location.search);
      const qtf = q.get("tf");
      const qtype = q.get("type");
      if (qtf && TF_BY_ID[qtf]) setTf(qtf);
      if (qtype && CHART_TYPES.some((c) => c.id === qtype)) setChartType(qtype);
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect the current symbol / timeframe / chart type in the URL (shareable,
  // no reload) so `?tf=…&type=…` always matches what's on screen.
  useEffect(() => {
    if (embedded) return; // don't rewrite the workspace URL (embedded is stable per mount)
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("tf", tf);
      params.set("type", chartType);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf, chartType]);

  // keep the latest price in a ref (updated in an effect, not during render)
  const priceRef = useRef(0);
  useEffect(() => { if (inst?.price) priceRef.current = inst.price; }, [inst?.price]);

  // regenerate the series on symbol / timeframe change (uses live price as anchor)
  useEffect(() => {
    if (!priceRef.current) return;
    setBars(generateCandles(symbol, tf, priceRef.current, Date.now()));
    setLastUpdated(stampTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, tf, !!inst]);

  // live last-bar update (imperative — no rebuild) while streaming
  useEffect(() => {
    if (!inst || !barsRef.current.length || !mkt.streaming) return;
    const arr = barsRef.current;
    const last = { ...arr[arr.length - 1] };
    last.close = inst.price;
    last.high = Math.max(last.high, inst.price);
    last.low = Math.min(last.low, inst.price);
    arr[arr.length - 1] = last;
    chartRef.current?.updateLast(last);
    setLastUpdated(stampTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inst?.price]);

  // compare overlays (normalized %)
  const compare = useMemo(() => {
    return compareList.map((s, i) => {
      const cb = generateCandles(s, tf, data.find((d) => d.symbol === s)?.price || 100, Date.now());
      const base = cb[0]?.close || 1;
      return { key: s, color: DRAW_COLORS[(i + 1) % DRAW_COLORS.length], data: cb.map((b) => ({ time: b.time, value: (b.close / base - 1) * 100 })) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareList, tf]);

  const switchSymbol = (s) => {
    setSymbol(s);
    setCompareList((l) => l.filter((x) => x !== s));
    if (embedded) return; // keep the workspace URL intact
    try { window.history.replaceState(null, "", assetHref(s).replace("/asset/", "/chart/")); } catch { /* noop */ }
  };

  const shot = () => {
    const cv = chartRef.current?.screenshot();
    if (!cv) return;
    const a = document.createElement("a");
    a.download = `tradeon-${symbol}-${tf}.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
  };
  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* noop */ } };
  const toggleFullscreen = () => { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen?.(); else el.requestFullscreen?.(); };
  const toggleInd = (id) => setIndicators(indicators.includes(id) ? indicators.filter((x) => x !== id) : [...indicators, id]);

  // Lower-pane indicators (RSI/MACD/…) — one stacked, synced pane each. Overlay
  // indicators (SMA/BB/…) and Volume stay on the price chart.
  const managedLower = useMemo(
    () =>
      indicators
        .filter((id) => PANE_BY_ID[id] === "lower")
        .map((id) => ({ id, label: LABEL_BY_ID[id] || id, height: panePrefs[id]?.h ?? DEFAULT_PANE_H, collapsed: !!panePrefs[id]?.c })),
    [indicators, panePrefs]
  );

  const handleLowerAction = useCallback(
    (action, id, payload) => {
      if (action === "remove") { setIndicators(indicators.filter((x) => x !== id)); return; }
      if (action === "collapse") { setPanePrefs({ ...panePrefs, [id]: { ...(panePrefs[id] || {}), c: !panePrefs[id]?.c } }); return; }
      if (action === "resize") { setPanePrefs({ ...panePrefs, [id]: { ...(panePrefs[id] || {}), h: payload } }); return; }
      if (action === "reorder") {
        const arr = [...indicators];
        const lowerPos = arr.map((x, i) => (PANE_BY_ID[x] === "lower" ? i : -1)).filter((i) => i >= 0);
        const li = lowerPos.findIndex((i) => arr[i] === id);
        const target = payload === "up" ? li - 1 : li + 1;
        if (li < 0 || target < 0 || target >= lowerPos.length) return;
        const a = lowerPos[li], b = lowerPos[target];
        [arr[a], arr[b]] = [arr[b], arr[a]];
        setIndicators(arr);
      }
    },
    [indicators, panePrefs, setIndicators, setPanePrefs]
  );

  // ---- drawings: per-symbol persistence + undo/redo ----
  const persistDraw = useCallback((list) => { try { localStorage.setItem("tradeon-draw-" + symbol, JSON.stringify(list)); } catch { /* noop */ } }, [symbol]);

  // Load the saved drawings whenever the symbol changes (reset the history too).
  useEffect(() => {
    let list = [];
    try { const raw = localStorage.getItem("tradeon-draw-" + symbol); const p = raw ? JSON.parse(raw) : null; if (Array.isArray(p)) list = p; } catch { /* noop */ }
    setDrawings(list);
    drawHist.current = { past: [], future: [] };
    setSelDrawId(null);
  }, [symbol]);

  const commitDrawings = useCallback((next) => {
    drawHist.current.past.push(drawings);
    if (drawHist.current.past.length > 60) drawHist.current.past.shift();
    drawHist.current.future = [];
    setDrawings(next);
    persistDraw(next);
  }, [drawings, persistDraw]);

  const undoDraw = useCallback(() => {
    const h = drawHist.current;
    if (!h.past.length) return;
    h.future.push(drawings);
    const prev = h.past.pop();
    setDrawings(prev); persistDraw(prev); setSelDrawId(null);
  }, [drawings, persistDraw]);

  const redoDraw = useCallback(() => {
    const h = drawHist.current;
    if (!h.future.length) return;
    h.past.push(drawings);
    const nxt = h.future.pop();
    setDrawings(nxt); persistDraw(nxt); setSelDrawId(null);
  }, [drawings, persistDraw]);

  const selDraw = drawings.find((d) => d.id === selDrawId) || null;

  const deleteSelected = useCallback(() => {
    if (!selDrawId) return;
    const d = drawings.find((x) => x.id === selDrawId);
    if (d?.locked) return;
    commitDrawings(drawings.filter((x) => x.id !== selDrawId));
    setSelDrawId(null);
  }, [selDrawId, drawings, commitDrawings]);

  const clearDraw = useCallback(() => { if (drawings.length) commitDrawings([]); setSelDrawId(null); }, [drawings, commitDrawings]);
  const toggleLockSel = useCallback(() => { if (selDrawId) commitDrawings(drawings.map((x) => (x.id === selDrawId ? { ...x, locked: !x.locked } : x))); }, [selDrawId, drawings, commitDrawings]);

  // Patch a property on the selected drawing (used by the floating toolbar); when
  // nothing is selected but a tool is active, patch the new-drawing defaults.
  const patchDrawing = useCallback((patch) => {
    if (selDrawId) commitDrawings(drawings.map((x) => (x.id === selDrawId ? { ...x, ...patch } : x)));
    else {
      if ("color" in patch) setDrawColor(patch.color);
      const rest = { ...patch }; delete rest.color;
      if (Object.keys(rest).length) setDrawDefaults((d) => ({ ...d, ...rest }));
    }
  }, [selDrawId, drawings, commitDrawings]);

  const spawnCopy = useCallback((src, offsetPx = true) => {
    // small time/price nudge so the copy is visible, then select it
    const dt = offsetPx ? Math.round((barsRef.current[1]?.time - barsRef.current[0]?.time) || 0) * 2 : 0;
    const dp = offsetPx ? (src.points[0].price - (src.points[1]?.price ?? src.points[0].price)) * 0.06 || 0 : 0;
    const copy = { ...src, id: `d${Math.random().toString(36).slice(2, 9)}`, points: src.points.map((p) => ({ time: p.time + dt, price: p.price + dp })), locked: false };
    commitDrawings([...drawings, copy]);
    setSelDrawId(copy.id);
  }, [drawings, commitDrawings]);

  const duplicateSel = useCallback(() => { if (selDraw) spawnCopy(selDraw); }, [selDraw, spawnCopy]);
  const copySel = useCallback(() => { if (selDraw) drawClip.current = selDraw; }, [selDraw]);
  const pasteDraw = useCallback(() => { if (drawClip.current) spawnCopy(drawClip.current); }, [spawnCopy]);

  // z-order = position in the array (later = on top).
  const reorderSel = useCallback((dir) => {
    if (!selDrawId) return;
    const i = drawings.findIndex((d) => d.id === selDrawId);
    const j = dir === "forward" ? i + 1 : i - 1;
    if (i < 0 || j < 0 || j >= drawings.length) return;
    const next = drawings.slice();
    [next[i], next[j]] = [next[j], next[i]];
    commitDrawings(next);
  }, [selDrawId, drawings, commitDrawings]);

  // Keyboard: Delete removes selection, ⌘/Ctrl+Z undo, +Shift redo, Esc deselect.
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const mod = e.metaKey || e.ctrlKey;
      if ((e.key === "Delete" || e.key === "Backspace") && selDrawId) { e.preventDefault(); deleteSelected(); }
      else if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redoDraw(); else undoDraw(); }
      else if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redoDraw(); }
      else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateSel(); }
      else if (mod && e.key.toLowerCase() === "c") { copySel(); }
      else if (mod && e.key.toLowerCase() === "v") { e.preventDefault(); pasteDraw(); }
      else if (e.key === "Escape") setSelDrawId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selDrawId, deleteSelected, undoDraw, redoDraw, duplicateSel, copySel, pasteDraw]);

  const disp = legend || (inst ? { open: inst.open, high: inst.high, low: inst.low, close: inst.price } : null);
  // The floating toolbar edits the selected drawing, or (a tool is active with no
  // selection) the defaults for the next drawing.
  const toolbarTarget = selDraw || (drawTool !== "cursor" ? { type: drawTool, color: drawColor, ...drawDefaults } : null);

  return (
    <div className={`tradeon-root ${embedded ? "h-full" : "h-screen"} flex flex-col overflow-hidden`} style={{ background: "var(--tdn-bg)" }}>
      {/* TOP CONTROL BAR */}
      <header className="tdn-topbar flex items-center gap-1.5 h-11 px-2 shrink-0 overflow-x-auto tdn-scroll-hide">
        {embedded ? (
          <button onClick={onClose} className="tdn-btn tdn-btn-icon !w-8 !h-8 shrink-0" title="Exit fullscreen chart" aria-label="Exit fullscreen chart"><Minimize2 size={15} /></button>
        ) : (
          <Link href="/tradeon" className="tdn-btn tdn-btn-icon !w-8 !h-8 shrink-0" title="Home"><Home size={15} /></Link>
        )}
        <div className="hidden sm:block shrink-0"><Logo mark size={24} wordmark={false} /></div>

        <div className="flex items-center gap-1 tdn-card-i px-1.5 py-0.5 shrink-0">
          <AssetPicker value={symbol} onSelect={switchSymbol} />
          <span className="text-[0.62rem] hidden md:inline" style={{ color: "var(--tdn-faint)" }}>{inst?.name}</span>
        </div>

        <Menu label={CHART_TYPES.find((c) => c.id === chartType)?.label} icon={LineIcon} width={190}>
          {(close) => CHART_TYPES.map((c) => (
            <button key={c.id} onClick={() => { setChartType(c.id); close(); }} className="w-full text-left px-2.5 py-1.5 rounded-lg text-sm hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]" style={{ color: chartType === c.id ? "var(--tdn-iris-2)" : "var(--tdn-fg)", fontWeight: chartType === c.id ? 600 : 400 }}>{c.label}</button>
          ))}
        </Menu>

        <Menu label="Indicators" icon={Activity} width={252} active={indicators.length > 0}>
          {() => <IndicatorPanel indicators={indicators} onToggle={toggleInd} onClear={() => setIndicators([])} />}
        </Menu>

        <span className="hidden lg:inline-flex shrink-0"><SessionBadge mkt={mkt} /></span>

        <div className="flex-1" />

        {/* Live price */}
        {inst && (
          <div className="flex items-center gap-2 shrink-0 mr-1">
            <span className="tdn-mono text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}><LiveValue value={inst.price} currency={cur} /></span>
            <DeltaPill value={inst.changePct} />
          </div>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          <Menu label="" icon={GitCompare} width={240}>
            {(close) => (
              <div>
                <div className="tdn-eyebrow text-[0.56rem] px-2 pb-1">Compare with</div>
                <AssetPicker value="Add symbol" onSelect={(s) => { if (s !== symbol && !compareList.includes(s)) setCompareList([...compareList, s]); close(); }} />
                {compareList.map((s) => (
                  <div key={s} className="flex items-center justify-between px-2 py-1 text-xs" style={{ color: "var(--tdn-fg)" }}>
                    {s} <button onClick={() => setCompareList(compareList.filter((x) => x !== s))}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </Menu>
          <button className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Watchlist"><Star size={15} /></button>
          <button className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Alerts"><Bell size={15} /></button>
          <button onClick={() => chartRef.current?.autoScale()} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Auto scale"><Scaling size={15} /></button>
          <button onClick={() => chartRef.current?.fit()} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Reset chart"><RotateCcw size={15} /></button>
          <button onClick={shot} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Export screenshot"><Camera size={15} /></button>
          <button onClick={share} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Share chart"><Share2 size={15} /></button>
          <button onClick={toggleFullscreen} className="tdn-btn tdn-btn-icon !w-8 !h-8" title="Fullscreen"><Maximize size={15} /></button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* LEFT DRAWING RAIL */}
        <div className="w-12 shrink-0 tdn-topbar border-r flex flex-col items-center py-2 gap-1 overflow-y-auto tdn-scroll-hide" style={{ borderColor: "var(--tdn-border)" }}>
          {DRAW_TOOLS.map(({ id, Icon, title }) => (
            <button key={id} onClick={() => setDrawTool(id)} className={TOOL_BTN} title={title}
              style={{ background: drawTool === id ? "var(--tdn-iris)" : "transparent", color: drawTool === id ? "#fff" : "var(--tdn-muted)" }}>
              <Icon size={18} />
            </button>
          ))}
          <div className="w-6 my-1 border-t shrink-0" style={{ borderColor: "var(--tdn-border)" }} />
          <button onClick={() => setMagnet((m) => !m)} className={TOOL_BTN} title="Magnet — snap to price"
            style={{ background: magnet ? "var(--tdn-iris)" : "transparent", color: magnet ? "#fff" : "var(--tdn-muted)" }}><Magnet size={16} /></button>
          <button onClick={toggleLockSel} disabled={!selDraw} className={TOOL_BTN} title={selDraw?.locked ? "Unlock selected" : "Lock selected"}
            style={{ color: selDraw ? (selDraw.locked ? "var(--tdn-iris-2)" : "var(--tdn-muted)") : "var(--tdn-faint)", opacity: selDraw ? 1 : 0.4 }}>{selDraw?.locked ? <Unlock size={16} /> : <Lock size={16} />}</button>
          <button onClick={() => setHideDraw((h) => !h)} className={TOOL_BTN} title={hideDraw ? "Show drawings" : "Hide drawings"}
            style={{ color: hideDraw ? "var(--tdn-iris-2)" : "var(--tdn-muted)" }}>{hideDraw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          <div className="w-6 my-1 border-t shrink-0" style={{ borderColor: "var(--tdn-border)" }} />
          <button onClick={() => setDrawColor(DRAW_COLORS[(DRAW_COLORS.indexOf(drawColor) + 1) % DRAW_COLORS.length])} className={TOOL_BTN} title="Drawing color">
            <span className="w-[18px] h-[18px] rounded-full" style={{ background: drawColor, border: "2px solid var(--tdn-surface-solid)", boxShadow: "0 0 0 1px var(--tdn-border-strong)" }} />
          </button>
          <button onClick={undoDraw} className={TOOL_BTN} style={{ color: "var(--tdn-muted)" }} title="Undo (⌘Z)"><Undo2 size={16} /></button>
          <button onClick={redoDraw} className={TOOL_BTN} style={{ color: "var(--tdn-muted)" }} title="Redo (⌘⇧Z)"><Redo2 size={16} /></button>
          <button onClick={deleteSelected} disabled={!selDraw} className={TOOL_BTN} style={{ color: selDraw ? "var(--tdn-down)" : "var(--tdn-faint)", opacity: selDraw ? 1 : 0.4 }} title="Delete selected (Del)"><Trash2 size={16} /></button>
          <button onClick={clearDraw} className={TOOL_BTN} style={{ color: "var(--tdn-muted)" }} title="Clear all drawings"><X size={16} /></button>
        </div>

        {/* CHART AREA */}
        <div className="flex-1 min-w-0 relative flex flex-col">
          {/* OHLC legend */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2 flex-wrap text-[0.7rem] tdn-glass rounded-md px-2 py-1" style={{ pointerEvents: "none" }}>
            <span className="font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{symbol}</span>
            <span style={{ color: "var(--tdn-faint)" }}>· {TF_BY_ID[tf]?.label} · {inst ? getMarketStatus(inst.assetClass).session : ""}</span>
            {disp && (
              <span className="flex items-center gap-1.5 tdn-mono">
                <span style={{ color: "var(--tdn-faint)" }}>O</span><span style={{ color: "var(--tdn-fg)" }}>{formatPrice(disp.open, { currency: cur })}</span>
                <span style={{ color: "var(--tdn-faint)" }}>H</span><span className="tdn-up">{formatPrice(disp.high, { currency: cur })}</span>
                <span style={{ color: "var(--tdn-faint)" }}>L</span><span className="tdn-down">{formatPrice(disp.low, { currency: cur })}</span>
                <span style={{ color: "var(--tdn-faint)" }}>C</span><span style={{ color: "var(--tdn-fg)" }}>{formatPrice(disp.close, { currency: cur })}</span>
              </span>
            )}
          </div>

          {!mkt.streaming && (
            <div className="absolute top-2 right-2 z-10 tdn-glass rounded-md px-2.5 py-1 text-[0.7rem] font-semibold" style={{ color: "var(--tdn-faint)" }}>
              Market closed · showing last session
            </div>
          )}

          {/* Floating drawing properties toolbar (selected object, or tool defaults) */}
          {toolbarTarget && (
            <DrawingToolbar
              target={toolbarTarget}
              isSel={!!selDraw}
              onPatch={patchDrawing}
              onDuplicate={duplicateSel}
              onDelete={deleteSelected}
              onForward={() => reorderSel("forward")}
              onBackward={() => reorderSel("backward")}
            />
          )}

          {bars.length ? (
            <LWChart ref={chartRef} bars={bars} chartType={chartType} indicators={indicators} theme={theme} drawTool={drawTool} drawColor={drawColor} drawDefaults={drawDefaults} compare={compare} onCrosshair={setLegend} managedLower={managedLower} onLowerAction={handleLowerAction} drawings={drawings} onCommitDrawings={commitDrawings} magnet={magnet} hideDrawings={hideDraw} selectedId={selDrawId} onSelect={setSelDrawId} onToolDone={() => setDrawTool("cursor")} />
          ) : (
            <div className="flex-1 grid place-items-center"><div className="tdn-skeleton w-3/4 h-3/4" /></div>
          )}
        </div>

        {/* RIGHT INFO RAIL — flat, TradingView-style (no cards); category-wise watchlist */}
        <aside className="w-64 shrink-0 border-l hidden xl:flex flex-col overflow-y-auto tdn-scroll-thin" style={{ borderColor: "var(--tdn-border)", background: "var(--tdn-bg-2)" }}>
          {p && (
            <section className="px-3 py-3 border-b" style={{ borderColor: "var(--tdn-border)" }}>
              <div className="flex items-center gap-1.5 mb-2"><Gauge size={13} style={{ color: "var(--tdn-iris-2)" }} /><span className="text-[0.68rem] font-bold uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>Prediction</span></div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: p.signal === "BUY" ? "var(--tdn-up)" : p.signal === "SELL" ? "var(--tdn-down)" : "var(--tdn-amber)" }}>{p.signal}</span>
                <span className="text-xs" style={{ color: "var(--tdn-faint)" }}>{p.confidence}% conf.</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden flex" style={{ background: "color-mix(in srgb, var(--tdn-fg) 10%, transparent)" }}>
                <span style={{ width: `${p.probabilities.buy}%`, background: "var(--tdn-up)" }} /><span style={{ width: `${p.probabilities.hold}%`, background: "var(--tdn-amber)" }} /><span style={{ width: `${p.probabilities.sell}%`, background: "var(--tdn-down)" }} />
              </div>
              <Link href={assetHref(symbol)} className="tdn-btn tdn-btn-soft w-full mt-2.5 !py-1.5 text-xs">Full analysis</Link>
            </section>
          )}
          {inst && (
            <section className="px-3 py-3 border-b" style={{ borderColor: "var(--tdn-border)" }}>
              <div className="text-[0.68rem] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--tdn-faint)" }}>Key data</div>
              {[["Open", formatPrice(inst.open, { currency: cur })], ["High", formatPrice(inst.high, { currency: cur })], ["Low", formatPrice(inst.low, { currency: cur })], ["Volume", inst.volume ? formatCompact(inst.volume) : "—"], ["Change", formatPct(inst.changePct)]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-xs"><span style={{ color: "var(--tdn-muted)" }}>{k}</span><span className="tdn-mono font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{v}</span></div>
              ))}
            </section>
          )}
          {/* Watchlist — grouped by asset class */}
          <section className="px-3 py-3">
            <div className="flex items-center gap-1.5 mb-1.5"><Star size={12} style={{ color: "var(--tdn-iris-2)" }} /><span className="text-[0.68rem] font-bold uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>Watchlist</span></div>
            {WATCH_CATS.map((cat) => {
              const rows = watchGroups[cat.id];
              if (!rows || !rows.length) return null;
              return (
                <div key={cat.id} className="mt-3 first:mt-1.5">
                  <div className="flex items-center justify-between px-0.5 mb-1">
                    <span className="tdn-eyebrow text-[0.54rem]">{cat.label}</span>
                    <span className="text-[0.56rem]" style={{ color: "var(--tdn-faint)" }}>{rows.length}</span>
                  </div>
                  {rows.map((d) => {
                    const active = d.symbol === symbol;
                    const up = d.changePct >= 0;
                    return (
                      <button
                        key={d.symbol}
                        onClick={() => switchSymbol(d.symbol)}
                        className="w-full flex items-center gap-2 py-1.5 px-1.5 -mx-1.5 rounded-md transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_9%,transparent)]"
                        style={active ? { background: "color-mix(in srgb, var(--tdn-iris) 12%, transparent)" } : undefined}
                      >
                        <span className="text-xs font-semibold truncate flex-1 text-left" style={{ color: active ? "var(--tdn-iris-2)" : "var(--tdn-fg-strong)" }}>{d.symbol}</span>
                        <span className="tdn-mono text-[0.66rem] shrink-0" style={{ color: "var(--tdn-muted)" }}>{formatPrice(d.price, { currency: d.assetClass === "forex" ? "" : "$" })}</span>
                        <span className={`tdn-mono text-[0.66rem] font-semibold w-12 text-right shrink-0 ${up ? "tdn-up" : "tdn-down"}`}>{formatPct(d.changePct)}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </section>
        </aside>
      </div>

      {/* BOTTOM TIMEFRAME STRIP — the buttons scroll horizontally in their own
          min-w-0 track so every timeframe stays reachable and none is ever
          hidden or overlapped; the timestamps sit outside the scroll area. */}
      <footer className="tdn-topbar h-9 flex items-center gap-2 px-2 border-t shrink-0" style={{ borderColor: "var(--tdn-border)" }}>
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto tdn-scroll-hide">
          {TIMEFRAMES.map((t) => (
            <button key={t.id} onClick={() => setTf(t.id)} className="px-2 py-0.5 rounded text-[0.7rem] font-semibold tdn-mono shrink-0"
              style={{ background: tf === t.id ? "var(--tdn-iris)" : "transparent", color: tf === t.id ? "#fff" : "var(--tdn-faint)" }}>{t.label}</button>
          ))}
        </div>
        <span className="text-[0.64rem] shrink-0 hidden md:inline" style={{ color: "var(--tdn-faint)" }}>
          {lastUpdated ? `Last updated ${lastUpdated}` : "—"}
        </span>
        <span className="tdn-mono text-[0.64rem] shrink-0 hidden md:inline" style={{ color: "var(--tdn-muted)" }}>{now ? now.toLocaleTimeString("en-US", { hour12: false }) : ""}</span>
      </footer>
    </div>
  );
}
