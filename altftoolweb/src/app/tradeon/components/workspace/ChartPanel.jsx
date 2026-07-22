// src/app/tradeon/components/workspace/ChartPanel.jsx
// One independent workspace chart panel. Uses the SAME engine as the Full Chart
// (MiniChart → LWChart) and exposes a compact-but-complete control set per panel:
// asset search, timeframe, chart type, indicators, drawing tools, compare, reset,
// fullscreen and a live prediction summary — every panel operating independently.
"use client";

import { useRef, useState } from "react";
import {
  AreaChart as AreaIcon, BarChart3, CandlestickChart, GitCompare, LineChart as LineIcon,
  Maximize2, Minus, MousePointer2, PenTool, RotateCcw, Ruler, Square, Type, X,
} from "lucide-react";
import { predict } from "../../lib/ai";
import { formatPrice } from "../../lib/format";
import MiniChart from "../chart/MiniChart";
import DeltaPill from "../shared/DeltaPill";
import LiveValue from "../shared/LiveValue";
import AssetPicker from "./AssetPicker";

const TYPE_MAP = { candle: "candlestick", line: "line", area: "area", ohlc: "ohlc" };
const TF_MAP = { "1m": "1m", "5m": "5m", "15m": "15m", "1H": "1h", "4H": "4h", "1D": "1d", "1W": "1w" };

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
const TYPES = [
  { id: "candle", Icon: CandlestickChart },
  { id: "line", Icon: LineIcon },
  { id: "area", Icon: AreaIcon },
  { id: "ohlc", Icon: BarChart3 },
];
const INDICATORS = ["EMA", "RSI", "MACD", "BB", "VWAP"];
const DRAW_TOOLS = [
  { id: "cursor", Icon: MousePointer2 },
  { id: "trend", Icon: PenTool },
  { id: "horizontal", Icon: Minus },
  { id: "fib", Icon: Ruler },
  { id: "rect", Icon: Square },
  { id: "text", Icon: Type },
];
const SIGNAL_COLOR = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };

export default function ChartPanel({ panel, instrument, onChange, onClose, onFullscreen, density = "normal" }) {
  const dense = density === "dense";
  const p = instrument ? predict(instrument) : null;
  const cur = instrument ? (instrument.assetClass === "forex" ? "" : "$") : "$";
  const [drawTool, setDrawTool] = useState("cursor");
  const [compareList, setCompareList] = useState([]);
  const miniRef = useRef();

  const toggleInd = (ind) => {
    const set = new Set(panel.indicators || []);
    set.has(ind) ? set.delete(ind) : set.add(ind);
    onChange({ indicators: [...set] });
  };

  return (
    <div className="tdn-card-i flex flex-col overflow-hidden h-full" style={{ background: "var(--tdn-surface-solid)" }}>
      {/* Panel header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b" style={{ borderColor: "var(--tdn-border)" }}>
        <AssetPicker value={panel.symbol} onSelect={(symbol) => onChange({ symbol })} />
        {instrument && (
          <>
            <span className="tdn-mono text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
              <LiveValue value={instrument.price} currency={cur} />
            </span>
            <DeltaPill value={instrument.changePct} showIcon={false} className="!text-[0.6rem] !py-0 !px-1" />
          </>
        )}
        <div className="flex-1" />
        {p && !dense && (
          <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded" style={{ color: SIGNAL_COLOR[p.signal], background: `color-mix(in srgb, ${SIGNAL_COLOR[p.signal]} 14%, transparent)` }}>
            {p.signal} {p.confidence}%
          </span>
        )}
        <button onClick={onFullscreen} className="tdn-btn tdn-btn-icon !w-6 !h-6" aria-label="Expand panel" title="Expand panel"><Maximize2 size={12} /></button>
        <button onClick={onClose} className="tdn-btn tdn-btn-icon !w-6 !h-6" aria-label="Close chart" title="Close"><X size={12} /></button>
      </div>

      {/* Controls */}
      {!dense && (
        <div className="flex items-center gap-1 px-2 py-1 border-b overflow-x-auto tdn-scroll-hide" style={{ borderColor: "var(--tdn-border)" }}>
          {TIMEFRAMES.map((tf) => (
            <button key={tf} onClick={() => onChange({ timeframe: tf })} className="px-1.5 py-0.5 rounded text-[0.66rem] font-semibold tdn-mono shrink-0"
              style={{ background: panel.timeframe === tf ? "color-mix(in srgb, var(--tdn-iris) 16%, transparent)" : "transparent", color: panel.timeframe === tf ? "var(--tdn-iris-2)" : "var(--tdn-faint)" }}>{tf}</button>
          ))}
          <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: "var(--tdn-border)" }} />
          {TYPES.map(({ id, Icon }) => (
            <button key={id} onClick={() => onChange({ type: id })} className="p-1 rounded shrink-0" title={id}
              style={{ color: panel.type === id ? "var(--tdn-iris-2)" : "var(--tdn-faint)", background: panel.type === id ? "color-mix(in srgb, var(--tdn-iris) 14%, transparent)" : "transparent" }}><Icon size={13} /></button>
          ))}
          <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: "var(--tdn-border)" }} />
          {INDICATORS.map((ind) => {
            const on = (panel.indicators || []).includes(ind);
            return (
              <button key={ind} onClick={() => toggleInd(ind)} className="px-1.5 py-0.5 rounded text-[0.62rem] font-semibold shrink-0"
                style={{ color: on ? "#fff" : "var(--tdn-faint)", background: on ? "var(--tdn-iris)" : "color-mix(in srgb, var(--tdn-fg) 5%, transparent)" }}>{ind}</button>
            );
          })}
          <span className="w-px h-4 mx-0.5 shrink-0" style={{ background: "var(--tdn-border)" }} />
          {DRAW_TOOLS.map(({ id, Icon }) => (
            <button key={id} onClick={() => setDrawTool(id)} className="p-1 rounded shrink-0" title={`Draw: ${id}`}
              style={{ color: drawTool === id ? "#fff" : "var(--tdn-faint)", background: drawTool === id ? "var(--tdn-iris)" : "transparent" }}><Icon size={12} /></button>
          ))}
          <button onClick={() => miniRef.current?.fit()} className="p-1 rounded shrink-0" style={{ color: "var(--tdn-faint)" }} title="Reset chart"><RotateCcw size={12} /></button>
          <span className="shrink-0" title="Compare asset">
            <AssetPicker value="＋" onSelect={(s) => { if (s !== panel.symbol && !compareList.includes(s)) setCompareList([...compareList, s]); }} />
          </span>
          {compareList.length > 0 && <GitCompare size={11} className="shrink-0" style={{ color: "var(--tdn-cyan)" }} />}
        </div>
      )}

      {/* Chart body — same engine as the Full Chart */}
      <div className="flex-1 min-h-0">
        <MiniChart
          ref={miniRef}
          symbol={panel.symbol}
          chartType={TYPE_MAP[panel.type] || "candlestick"}
          tf={TF_MAP[panel.timeframe] || "1d"}
          indicators={panel.indicators || []}
          drawTool={drawTool}
          compareSymbols={compareList}
          showFullscreen={!dense}
        />
      </div>

      {/* Footer: prediction summary + meta */}
      {!dense && p && (
        <div className="px-2 py-1 border-t" style={{ borderColor: "var(--tdn-border)" }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden flex" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }} title="Buy / Hold / Sell">
              <span style={{ width: `${p.probabilities.buy}%`, background: "var(--tdn-up)" }} />
              <span style={{ width: `${p.probabilities.hold}%`, background: "var(--tdn-amber)" }} />
              <span style={{ width: `${p.probabilities.sell}%`, background: "var(--tdn-down)" }} />
            </div>
            <span className="text-[0.6rem] tdn-mono shrink-0" style={{ color: "var(--tdn-faint)" }}>
              {panel.timeframe}{compareList.length ? ` · vs ${compareList.join(",")}` : ""}{instrument ? ` · O ${formatPrice(instrument.open, { currency: cur })}` : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
