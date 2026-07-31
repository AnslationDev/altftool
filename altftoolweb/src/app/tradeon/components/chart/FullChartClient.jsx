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
  Camera, ChevronDown, Crosshair, GitCompare, Home, LineChart as LineIcon, Maximize,
  Minus, MousePointer2, MoveVertical, PenTool, Plus, RotateCcw, Ruler, Scaling, Share2,
  Square, Sparkles, Trash2, Type, Undo2, X,
} from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { useTradeonTheme } from "../../hooks/tradeonTheme";
import { predict } from "../../lib/ai";
import { generateCandles, TIMEFRAMES, TF_BY_ID, INDICATOR_DEFS } from "../../lib/candles";
import { getMarketStatus, STATUS_COLOR } from "../../lib/marketHours";
import { assetHref, chartHref, formatCompact, formatPct, formatPrice } from "../../lib/format";
import { symbolFromSlug } from "../../lib/instruments";
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
  { id: "cursor", Icon: MousePointer2, title: "Cursor / pan" },
  { id: "trend", Icon: PenTool, title: "Trend line" },
  { id: "horizontal", Icon: Minus, title: "Horizontal line" },
  { id: "vertical", Icon: MoveVertical, title: "Vertical line" },
  { id: "fib", Icon: Ruler, title: "Fibonacci" },
  { id: "rect", Icon: Square, title: "Rectangle" },
  { id: "text", Icon: Type, title: "Text annotation" },
];
const DRAW_COLORS = ["#6d5efc", "#22d3ee", "#10c477", "#f5426c", "#f7b955"];

const stampTime = () => new Date().toLocaleTimeString("en-US", { hour12: false });

function usePersisted(key, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => { try { const s = localStorage.getItem(key); if (s != null) setV(JSON.parse(s)); } catch { /* noop */ } }, [key]);
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

function SessionBadge({ mkt }) {
  const c = STATUS_COLOR[mkt.status] || "var(--tdn-faint)";
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold px-2 py-1 rounded-md" style={{ color: c, background: `color-mix(in srgb, ${c} 12%, transparent)` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c, boxShadow: mkt.streaming ? `0 0 6px ${c}` : "none" }} />
      {mkt.label}
    </span>
  );
}

export default function FullChartClient() {
  const params = useParams();
  const routeSym = symbolFromSlug(Array.isArray(params.symbol) ? params.symbol[0] : params.symbol || "BTC");
  const { data } = useMarketData();
  const { theme } = useTradeonTheme();

  const [symbol, setSymbol] = useState(routeSym);
  const [tf, setTf] = usePersisted("tradeon-chart-tf", "1d");
  const [chartType, setChartType] = usePersisted("tradeon-chart-type", "line");
  const [indicators, setIndicators] = usePersisted("tradeon-chart-inds", ["Volume"]);
  const [drawTool, setDrawTool] = useState("cursor");
  const [drawColor, setDrawColor] = useState("#6d5efc");
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

  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  // Honor ?tf= & ?type= from the launching widget (preserves the selection).
  useEffect(() => {
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
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("tf", tf);
      params.set("type", chartType);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    } catch { /* noop */ }
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
    try { window.history.replaceState(null, "", chartHref(s, { tf, type: chartType })); } catch { /* noop */ }
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

  const disp = legend || (inst ? { open: inst.open, high: inst.high, low: inst.low, close: inst.price } : null);

  return (
    <div className="tradeon-root h-screen flex flex-col overflow-hidden" style={{ background: "var(--tdn-bg)" }}>
      {/* TOP CONTROL BAR */}
      <header className="tdn-topbar flex items-center gap-1.5 h-12 px-2 shrink-0 overflow-x-auto tdn-scroll-hide">
        <Link href="/tradeon" className="tdn-btn tdn-btn-icon !w-11 !h-11 shrink-0" title="Home"><Home size={15} /></Link>
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

        <Menu label="Indicators" icon={Sparkles} width={210} active={indicators.length > 0}>
          {() => (
            <div>
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b" style={{ borderColor: "var(--tdn-border)" }}>
                <span className="tdn-eyebrow text-[0.56rem]">Indicators</span>
                {indicators.length > 0 && <button onClick={() => setIndicators([])} className="text-[0.6rem] font-semibold" style={{ color: "var(--tdn-down)" }}>Clear all</button>}
              </div>
              <div className="max-h-72 overflow-y-auto tdn-scroll-thin py-1">
                {INDICATOR_DEFS.map((ind) => {
                  const on = indicators.includes(ind.id);
                  return (
                    <button key={ind.id} onClick={() => toggleInd(ind.id)} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]" style={{ color: "var(--tdn-fg)" }}>
                      {ind.label}
                      <span className="w-3.5 h-3.5 rounded grid place-items-center" style={{ border: "1px solid var(--tdn-border-strong)", background: on ? "var(--tdn-iris)" : "transparent" }}>
                        {on && <span className="text-white text-[0.6rem]">✓</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
          <button onClick={() => chartRef.current?.autoScale()} className="tdn-btn tdn-btn-icon !w-11 !h-11" title="Auto scale"><Scaling size={15} /></button>
          <button onClick={() => chartRef.current?.fit()} className="tdn-btn tdn-btn-icon !w-11 !h-11" title="Reset chart"><RotateCcw size={15} /></button>
          <button onClick={shot} className="tdn-btn tdn-btn-icon !w-11 !h-11" title="Export screenshot"><Camera size={15} /></button>
          <button onClick={share} className="tdn-btn tdn-btn-icon !w-11 !h-11" title="Share chart"><Share2 size={15} /></button>
          <button onClick={toggleFullscreen} className="tdn-btn tdn-btn-icon !w-11 !h-11" title="Fullscreen"><Maximize size={15} /></button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* LEFT DRAWING RAIL */}
        <div className="w-11 shrink-0 tdn-topbar border-r flex flex-col items-center py-2 gap-0.5" style={{ borderColor: "var(--tdn-border)" }}>
          {DRAW_TOOLS.map(({ id, Icon, title }) => (
            <button key={id} onClick={() => setDrawTool(id)} className="w-8 h-8 rounded-lg grid place-items-center" title={title}
              style={{ background: drawTool === id ? "var(--tdn-iris)" : "transparent", color: drawTool === id ? "#fff" : "var(--tdn-muted)" }}>
              <Icon size={16} />
            </button>
          ))}
          <div className="w-6 my-1 border-t" style={{ borderColor: "var(--tdn-border)" }} />
          <button onClick={() => setDrawColor(DRAW_COLORS[(DRAW_COLORS.indexOf(drawColor) + 1) % DRAW_COLORS.length])} className="w-8 h-8 rounded-lg grid place-items-center" title="Drawing color">
            <span className="w-4 h-4 rounded-full" style={{ background: drawColor, border: "2px solid var(--tdn-surface-solid)", boxShadow: "0 0 0 1px var(--tdn-border-strong)" }} />
          </button>
          <button onClick={() => chartRef.current?.undoDrawing()} className="w-8 h-8 rounded-lg grid place-items-center" style={{ color: "var(--tdn-muted)" }} title="Undo drawing"><Undo2 size={15} /></button>
          <button onClick={() => chartRef.current?.clearDrawings()} className="w-8 h-8 rounded-lg grid place-items-center" style={{ color: "var(--tdn-muted)" }} title="Clear drawings"><Trash2 size={15} /></button>
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

          {bars.length ? (
            <LWChart ref={chartRef} bars={bars} chartType={chartType} indicators={indicators} theme={theme} drawTool={drawTool} drawColor={drawColor} compare={compare} onCrosshair={setLegend} />
          ) : (
            <div className="flex-1 grid place-items-center"><div className="tdn-skeleton w-3/4 h-3/4" /></div>
          )}
        </div>

        {/* RIGHT INFO RAIL */}
        <aside className="w-60 shrink-0 border-l hidden xl:flex flex-col overflow-y-auto tdn-scroll-thin p-2.5 gap-2.5" style={{ borderColor: "var(--tdn-border)" }}>
          {p && (
            <div className="tdn-card p-3">
              <div className="flex items-center gap-1.5 mb-2"><Sparkles size={13} style={{ color: "var(--tdn-iris-2)" }} /><span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Prediction</span></div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: p.signal === "BUY" ? "var(--tdn-up)" : p.signal === "SELL" ? "var(--tdn-down)" : "var(--tdn-amber)" }}>{p.signal}</span>
                <span className="text-xs" style={{ color: "var(--tdn-faint)" }}>{p.confidence}% conf.</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden flex" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
                <span style={{ width: `${p.probabilities.buy}%`, background: "var(--tdn-up)" }} /><span style={{ width: `${p.probabilities.hold}%`, background: "var(--tdn-amber)" }} /><span style={{ width: `${p.probabilities.sell}%`, background: "var(--tdn-down)" }} />
              </div>
              <Link href={assetHref(symbol)} className="tdn-btn tdn-btn-soft w-full mt-2.5 !py-1.5 text-xs">Full analysis</Link>
            </div>
          )}
          {inst && (
            <div className="tdn-card p-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--tdn-fg-strong)" }}>Key data</div>
              {[["Open", formatPrice(inst.open, { currency: cur })], ["High", formatPrice(inst.high, { currency: cur })], ["Low", formatPrice(inst.low, { currency: cur })], ["Volume", inst.volume ? formatCompact(inst.volume) : "—"], ["Change", formatPct(inst.changePct)]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-xs"><span style={{ color: "var(--tdn-muted)" }}>{k}</span><span className="tdn-mono font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{v}</span></div>
              ))}
            </div>
          )}
          <div className="tdn-card p-3">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--tdn-fg-strong)" }}>Watchlist</div>
            {data.filter((d) => ["BTC", "ETH", "AAPL", "NVDA", "TSLA", "SPX"].includes(d.symbol)).map((d) => (
              <button key={d.symbol} onClick={() => switchSymbol(d.symbol)} className="w-full flex items-center justify-between py-1 text-xs hover:text-[var(--tdn-iris-2)]">
                <span className="font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
                <span className={`tdn-mono ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>{formatPct(d.changePct)}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* BOTTOM TIMEFRAME STRIP */}
      <footer className="tdn-topbar h-9 flex items-center gap-1 px-2 border-t shrink-0 overflow-x-auto tdn-scroll-hide" style={{ borderColor: "var(--tdn-border)" }}>
        {TIMEFRAMES.map((t) => (
          <button key={t.id} onClick={() => setTf(t.id)} className="px-2 py-0.5 rounded text-[0.7rem] font-semibold tdn-mono shrink-0"
            style={{ background: tf === t.id ? "var(--tdn-iris)" : "transparent", color: tf === t.id ? "#fff" : "var(--tdn-faint)" }}>{t.label}</button>
        ))}
        <div className="flex-1" />
        <span className="text-[0.64rem] shrink-0" style={{ color: "var(--tdn-faint)" }}>
          {lastUpdated ? `Last updated ${lastUpdated}` : "—"}
        </span>
        <span className="tdn-mono text-[0.64rem] shrink-0 ml-2" style={{ color: "var(--tdn-muted)" }}>{now ? now.toLocaleTimeString("en-US", { hour12: false }) : ""}</span>
      </footer>
    </div>
  );
}
