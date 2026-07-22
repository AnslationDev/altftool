// src/app/tradeon/lib/candles.js
// Deterministic OHLC candle generator + technical-indicator math for the chart
// engine. Each (symbol, timeframe) produces a stable synthetic history that ends
// at the instrument's live price, so switching timeframes/symbols loads distinct
// data and the newest bar can be live-updated from the streaming feed.

// timeframe → { seconds per bar, bar count, per-bar volatility }
export const TIMEFRAMES = [
  { id: "1m", label: "1m", sec: 60, bars: 240, vol: 0.0015 },
  { id: "3m", label: "3m", sec: 180, bars: 240, vol: 0.0022 },
  { id: "5m", label: "5m", sec: 300, bars: 240, vol: 0.003 },
  { id: "15m", label: "15m", sec: 900, bars: 220, vol: 0.005 },
  { id: "30m", label: "30m", sec: 1800, bars: 220, vol: 0.007 },
  { id: "45m", label: "45m", sec: 2700, bars: 200, vol: 0.008 },
  { id: "1h", label: "1H", sec: 3600, bars: 220, vol: 0.01 },
  { id: "2h", label: "2H", sec: 7200, bars: 200, vol: 0.014 },
  { id: "4h", label: "4H", sec: 14400, bars: 200, vol: 0.02 },
  { id: "1d", label: "D", sec: 86400, bars: 260, vol: 0.03 },
  { id: "1w", label: "W", sec: 604800, bars: 220, vol: 0.05 },
  { id: "1M", label: "M", sec: 2592000, bars: 140, vol: 0.09 },
  { id: "1Y", label: "Y", sec: 31536000, bars: 44, vol: 0.22 },
  { id: "all", label: "All", sec: 7776000, bars: 72, vol: 0.14 },
];

export const TF_BY_ID = Object.fromEntries(TIMEFRAMES.map((t) => [t.id, t]));

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generate a stable OHLC series that ends at `anchor` (the live price). */
export function generateCandles(symbol, tfId, anchor, nowMs = Date.now()) {
  const tf = TF_BY_ID[tfId] || TF_BY_ID["1h"];
  const rng = mulberry32(hash(`${symbol}|${tfId}`));
  const n = tf.bars;
  const vol = tf.vol;

  // Close-to-close random walk (relative), then rescale so last close = anchor.
  const rel = [1];
  for (let i = 1; i < n; i++) {
    const drift = (1 - rel[i - 1]) * 0.02;
    rel.push(Math.max(0.05, rel[i - 1] * (1 + (rng() - 0.5) * 2 * vol) + drift * vol));
  }
  const factor = anchor / rel[n - 1];
  const closes = rel.map((r) => r * factor);

  const nowSec = Math.floor(nowMs / 1000);
  const alignedNow = nowSec - (nowSec % tf.sec);
  const baseVol = (anchor > 1000 ? anchor * 12 : anchor * 1e5) || 1e6;

  const bars = [];
  for (let i = 0; i < n; i++) {
    const c = closes[i];
    const o = i === 0 ? c * (1 - (rng() - 0.5) * vol) : closes[i - 1];
    const wick = c * vol * (0.6 + rng() * 1.4);
    const high = Math.max(o, c) + wick * rng();
    const low = Math.min(o, c) - wick * rng();
    const volume = baseVol * (0.4 + rng() * 1.3) * (1 + Math.abs(c - o) / c * 40);
    bars.push({
      time: alignedNow - (n - 1 - i) * tf.sec,
      open: round(o),
      high: round(high),
      low: round(low),
      close: round(c),
      volume: Math.round(volume),
    });
  }
  return bars;
}

function round(v) {
  const abs = Math.abs(v);
  const d = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return Number(v.toFixed(d));
}

/** Heikin-Ashi transform of an OHLC array. */
export function toHeikinAshi(bars) {
  const out = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const prev = out[i - 1];
    const haOpen = prev ? (prev.open + prev.close) / 2 : (b.open + b.close) / 2;
    out.push({
      time: b.time,
      open: round(haOpen),
      high: round(Math.max(b.high, haOpen, haClose)),
      low: round(Math.min(b.low, haOpen, haClose)),
      close: round(haClose),
      volume: b.volume,
    });
  }
  return out;
}

/* ----------------------- Indicator math (LW-ready) ----------------------- */
const lw = (bars, values) => bars.map((b, i) => (values[i] == null || Number.isNaN(values[i]) ? null : { time: b.time, value: values[i] })).filter(Boolean);

function smaArr(src, p) {
  const out = new Array(src.length).fill(null);
  let sum = 0;
  for (let i = 0; i < src.length; i++) {
    sum += src[i];
    if (i >= p) sum -= src[i - p];
    if (i >= p - 1) out[i] = sum / p;
  }
  return out;
}
function emaArr(src, p) {
  const out = new Array(src.length).fill(null);
  const k = 2 / (p + 1);
  let prev;
  for (let i = 0; i < src.length; i++) {
    prev = i === 0 ? src[0] : src[i] * k + prev * (1 - k);
    if (i >= p - 1) out[i] = prev;
  }
  return out;
}
function rsiArr(src, p = 14) {
  const out = new Array(src.length).fill(null);
  let gain = 0, loss = 0;
  for (let i = 1; i < src.length; i++) {
    const d = src[i] - src[i - 1];
    const g = Math.max(0, d), l = Math.max(0, -d);
    if (i <= p) { gain += g; loss += l; if (i === p) { gain /= p; loss /= p; out[i] = 100 - 100 / (1 + gain / (loss || 1e-9)); } }
    else { gain = (gain * (p - 1) + g) / p; loss = (loss * (p - 1) + l) / p; out[i] = 100 - 100 / (1 + gain / (loss || 1e-9)); }
  }
  return out;
}

export const INDICATOR_DEFS = [
  { id: "SMA", label: "SMA (20)", pane: "main" },
  { id: "EMA", label: "EMA (50)", pane: "main" },
  { id: "BB", label: "Bollinger Bands", pane: "main" },
  { id: "VWAP", label: "VWAP", pane: "main" },
  { id: "SuperTrend", label: "SuperTrend", pane: "main" },
  { id: "Ichimoku", label: "Ichimoku Cloud", pane: "main" },
  { id: "Pivots", label: "Pivot Points", pane: "main" },
  { id: "Volume", label: "Volume", pane: "volume" },
  { id: "RSI", label: "RSI (14)", pane: "lower" },
  { id: "MACD", label: "MACD", pane: "lower" },
  { id: "StochRSI", label: "Stochastic RSI", pane: "lower" },
  { id: "ATR", label: "ATR (14)", pane: "lower" },
  { id: "ADX", label: "ADX (14)", pane: "lower" },
  { id: "OBV", label: "OBV", pane: "lower" },
];

/** Compute one indicator → { overlays?: [{key,color,data,style?}], lower?: {...}, volume?: [...] } */
export function computeIndicator(id, bars) {
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);

  switch (id) {
    case "SMA":
      return { overlays: [{ key: "SMA20", color: "#f7b955", data: lw(bars, smaArr(closes, 20)) }] };
    case "EMA":
      return { overlays: [{ key: "EMA50", color: "#22d3ee", data: lw(bars, emaArr(closes, 50)) }] };
    case "BB": {
      const p = 20, mult = 2;
      const mid = smaArr(closes, p);
      const up = [], lo = [];
      for (let i = 0; i < closes.length; i++) {
        if (mid[i] == null) { up.push(null); lo.push(null); continue; }
        let s = 0;
        for (let j = i - p + 1; j <= i; j++) s += (closes[j] - mid[i]) ** 2;
        const sd = Math.sqrt(s / p);
        up.push(mid[i] + mult * sd); lo.push(mid[i] - mult * sd);
      }
      return { overlays: [
        { key: "BBu", color: "#8b5cf6", data: lw(bars, up) },
        { key: "BBm", color: "rgba(139,92,246,0.5)", data: lw(bars, mid), dashed: true },
        { key: "BBl", color: "#8b5cf6", data: lw(bars, lo) },
      ] };
    }
    case "VWAP": {
      let cumPV = 0, cumV = 0;
      const out = bars.map((b) => { const tp = (b.high + b.low + b.close) / 3; cumPV += tp * b.volume; cumV += b.volume; return cumPV / cumV; });
      return { overlays: [{ key: "VWAP", color: "#10c477", data: lw(bars, out) }] };
    }
    case "SuperTrend": {
      const period = 10, mult = 3;
      const atr = atrArr(bars, period);
      const st = new Array(bars.length).fill(null);
      let prevUp = null, prevDn = null, trendUp = true;
      for (let i = 0; i < bars.length; i++) {
        if (atr[i] == null) continue;
        const hl2 = (highs[i] + lows[i]) / 2;
        let up = hl2 - mult * atr[i];
        let dn = hl2 + mult * atr[i];
        if (prevUp != null) up = closes[i - 1] > prevUp ? Math.max(up, prevUp) : up;
        if (prevDn != null) dn = closes[i - 1] < prevDn ? Math.min(dn, prevDn) : dn;
        if (closes[i] > (trendUp ? prevDn ?? dn : dn)) trendUp = true;
        else if (closes[i] < (trendUp ? up : prevUp ?? up)) trendUp = false;
        st[i] = trendUp ? up : dn;
        prevUp = up; prevDn = dn;
      }
      return { overlays: [{ key: "ST", color: "#f7885a", data: lw(bars, st) }] };
    }
    case "Ichimoku": {
      const conv = donchian(highs, lows, 9);
      const base = donchian(highs, lows, 26);
      const spanA = conv.map((c, i) => (c == null || base[i] == null ? null : (c + base[i]) / 2));
      const spanB = donchian(highs, lows, 52);
      return { overlays: [
        { key: "Tenkan", color: "#22d3ee", data: lw(bars, conv) },
        { key: "Kijun", color: "#f7b955", data: lw(bars, base) },
        { key: "SpanA", color: "rgba(16,196,119,0.6)", data: lw(bars, spanA) },
        { key: "SpanB", color: "rgba(245,66,108,0.6)", data: lw(bars, spanB) },
      ] };
    }
    case "Pivots": {
      const last = bars[bars.length - 2] || bars[bars.length - 1];
      const P = (last.high + last.low + last.close) / 3;
      const r1 = 2 * P - last.low, s1 = 2 * P - last.high;
      const r2 = P + (last.high - last.low), s2 = P - (last.high - last.low);
      const line = (v) => bars.map((b) => ({ time: b.time, value: v }));
      return { overlays: [
        { key: "P", color: "#8b5cf6", data: line(P), dashed: true },
        { key: "R1", color: "rgba(245,66,108,0.7)", data: line(r1), dashed: true },
        { key: "S1", color: "rgba(16,196,119,0.7)", data: line(s1), dashed: true },
        { key: "R2", color: "rgba(245,66,108,0.4)", data: line(r2), dashed: true },
        { key: "S2", color: "rgba(16,196,119,0.4)", data: line(s2), dashed: true },
      ] };
    }
    case "Volume":
      return { volume: bars.map((b) => ({ time: b.time, value: b.volume, color: b.close >= b.open ? "rgba(16,196,119,0.5)" : "rgba(245,66,108,0.5)" })) };
    case "RSI": {
      const r = rsiArr(closes, 14);
      return { lower: { title: "RSI", series: [{ key: "RSI", color: "#8b5cf6", data: lw(bars, r) }], guides: [30, 50, 70], range: [0, 100] } };
    }
    case "MACD": {
      const f = emaArr(closes, 12), s = emaArr(closes, 26);
      const macd = closes.map((_, i) => (f[i] == null || s[i] == null ? null : f[i] - s[i]));
      const sig = emaArr(macd.map((v) => v ?? 0), 9);
      const hist = macd.map((v, i) => (v == null || sig[i] == null ? null : v - sig[i]));
      return { lower: {
        title: "MACD",
        series: [{ key: "MACD", color: "#22d3ee", data: lw(bars, macd) }, { key: "Signal", color: "#f7885a", data: lw(bars, sig) }],
        hist: bars.map((b, i) => (hist[i] == null ? null : { time: b.time, value: hist[i], color: hist[i] >= 0 ? "rgba(16,196,119,0.6)" : "rgba(245,66,108,0.6)" })).filter(Boolean),
      } };
    }
    case "StochRSI": {
      const r = rsiArr(closes, 14);
      const p = 14;
      const k = r.map((_, i) => {
        if (i < p) return null;
        const win = r.slice(i - p + 1, i + 1).filter((x) => x != null);
        if (win.length < 2) return null;
        const mn = Math.min(...win), mx = Math.max(...win);
        return ((r[i] - mn) / ((mx - mn) || 1e-9)) * 100;
      });
      return { lower: { title: "Stoch RSI", series: [{ key: "K", color: "#8b5cf6", data: lw(bars, k) }], guides: [20, 80], range: [0, 100] } };
    }
    case "ATR": {
      const a = atrArr(bars, 14);
      return { lower: { title: "ATR", series: [{ key: "ATR", color: "#f7b955", data: lw(bars, a) }] } };
    }
    case "ADX": {
      const a = adxArr(bars, 14);
      return { lower: { title: "ADX", series: [{ key: "ADX", color: "#22d3ee", data: lw(bars, a) }], guides: [25], range: [0, 60] } };
    }
    case "OBV": {
      let obv = 0;
      const out = closes.map((c, i) => { if (i > 0) obv += c > closes[i - 1] ? bars[i].volume : c < closes[i - 1] ? -bars[i].volume : 0; return obv; });
      return { lower: { title: "OBV", series: [{ key: "OBV", color: "#10c477", data: lw(bars, out) }] } };
    }
    default:
      return {};
  }
}

function atrArr(bars, p) {
  const tr = bars.map((b, i) => (i === 0 ? b.high - b.low : Math.max(b.high - b.low, Math.abs(b.high - bars[i - 1].close), Math.abs(b.low - bars[i - 1].close))));
  return emaArr(tr, p);
}
function donchian(highs, lows, p) {
  return highs.map((_, i) => (i < p - 1 ? null : (Math.max(...highs.slice(i - p + 1, i + 1)) + Math.min(...lows.slice(i - p + 1, i + 1))) / 2));
}
function adxArr(bars, p) {
  const len = bars.length;
  const plusDM = new Array(len).fill(0), minusDM = new Array(len).fill(0), tr = new Array(len).fill(0);
  for (let i = 1; i < len; i++) {
    const up = bars[i].high - bars[i - 1].high;
    const dn = bars[i - 1].low - bars[i].low;
    plusDM[i] = up > dn && up > 0 ? up : 0;
    minusDM[i] = dn > up && dn > 0 ? dn : 0;
    tr[i] = Math.max(bars[i].high - bars[i].low, Math.abs(bars[i].high - bars[i - 1].close), Math.abs(bars[i].low - bars[i - 1].close));
  }
  const atr = emaArr(tr, p), pdi = emaArr(plusDM, p), mdi = emaArr(minusDM, p);
  const dx = bars.map((_, i) => {
    if (atr[i] == null || !atr[i]) return null;
    const p2 = (100 * pdi[i]) / atr[i], m2 = (100 * mdi[i]) / atr[i];
    return (100 * Math.abs(p2 - m2)) / ((p2 + m2) || 1e-9);
  });
  return emaArr(dx.map((v) => v ?? 0), p);
}
