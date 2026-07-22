// src/app/tradeon/lib/marketData.js
// Tradeon live market-data engine.
//
// Strategy:
//  - Crypto instruments are anchored to REAL live prices from Binance's free,
//    key-less, CORS-enabled public REST API (polled every few seconds).
//  - All other asset classes are simulated with a mean-reverting bounded random
//    walk so the UI feels alive without a paid market-data vendor.
//  - Between anchor fetches, every instrument micro-ticks so numbers animate
//    smoothly. Connection state (online / reconnecting / offline) is exposed so
//    the UI can show live/offline indicators and retry logic per the spec.

import { INSTRUMENTS, VOLATILITY } from "./instruments.js";

const SPARK_POINTS = 48;
const BINANCE_URL = "https://api.binance.com/api/v3/ticker/24hr";

function seededRandom(seed) {
  // Mulberry32 — deterministic per-symbol seed so SSR/CSR start aligned-ish.
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSymbol(symbol) {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildSpark(base, rng, vol) {
  const points = [];
  let p = base * (1 - (rng() - 0.5) * 0.04);
  for (let i = 0; i <= SPARK_POINTS; i++) {
    p += p * (rng() - 0.5) * vol * 6;
    points.push(p);
  }
  // Rescale so the final point lands exactly on `base` — keeps the series
  // continuous with live ticks (no vertical "cliff" where history meets now).
  const factor = base / points[points.length - 1];
  return points.map((x) => x * factor);
}

function makeState(inst) {
  const rng = seededRandom(hashSymbol(inst.symbol));
  const vol = VOLATILITY[inst.assetClass] ?? 0.001;
  const spark = buildSpark(inst.base, rng, vol);
  const dayOpen = inst.base * (1 - (rng() - 0.5) * 0.03);
  const price = inst.base;
  return {
    ...inst,
    rng,
    vol,
    price,
    prevPrice: price,
    dayOpen,
    open: dayOpen,
    high: Math.max(price, dayOpen) * (1 + rng() * 0.01),
    low: Math.min(price, dayOpen) * (1 - rng() * 0.01),
    change: price - dayOpen,
    changePct: ((price - dayOpen) / dayOpen) * 100,
    volume: (inst.mcap ? inst.mcap * 0.02 : inst.base * 1e6) * (0.6 + rng()),
    spark,
    anchored: false,
    updatedAt: 0,
  };
}

function tickState(s, now) {
  const drift = (s.dayOpen - s.price) * 0.0008; // gentle mean reversion
  const shock = (s.rng() - 0.5) * 2 * s.vol * s.price;
  const next = Math.max(0.0001, s.price + drift + shock);
  s.prevPrice = s.price;
  s.price = s.anchoredPrice != null ? lerp(s.price, s.anchoredPrice, 0.15) + shock * 0.3 : next;
  s.high = Math.max(s.high, s.price);
  s.low = Math.min(s.low, s.price);
  s.change = s.price - s.dayOpen;
  s.changePct = (s.change / s.dayOpen) * 100;
  s.spark = [...s.spark.slice(1), s.price];
  s.updatedAt = now;
  return s;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

class MarketEngine {
  constructor() {
    this.states = new Map();
    for (const inst of INSTRUMENTS) this.states.set(inst.symbol, makeState(inst));
    this.listeners = new Set();
    this.tickTimer = null;
    this.anchorTimer = null;
    this.refCount = 0;
    this.status = "connecting"; // connecting | live | reconnecting | offline
    this.failStreak = 0;
    this.lastAnchorAt = 0;
    // Cached, referentially-stable store for useSyncExternalStore. Rebuilt only
    // on emit() so getSnapshot() returns a stable reference between ticks.
    this.store = { data: this.buildData(), status: this.status };
  }

  subscribe(fn) {
    this.listeners.add(fn);
    this.refCount += 1;
    if (this.refCount === 1) this.start();
    return () => {
      this.listeners.delete(fn);
      this.refCount -= 1;
      if (this.refCount <= 0) this.stop();
    };
  }

  start() {
    this.anchor();
    this.tickTimer = setInterval(() => this.tick(), 1200);
    this.anchorTimer = setInterval(() => this.anchor(), 6000);
  }

  stop() {
    clearInterval(this.tickTimer);
    clearInterval(this.anchorTimer);
    this.tickTimer = null;
    this.anchorTimer = null;
  }

  tick() {
    const now = Date.now();
    for (const s of this.states.values()) tickState(s, now);
    this.emit();
  }

  async anchor() {
    const cryptos = INSTRUMENTS.filter((i) => i.binance);
    const symbols = JSON.stringify(cryptos.map((i) => i.binance));
    try {
      const res = await fetch(`${BINANCE_URL}?symbols=${encodeURIComponent(symbols)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      const byPair = new Map(rows.map((r) => [r.symbol, r]));
      for (const inst of cryptos) {
        const row = byPair.get(inst.binance);
        const s = this.states.get(inst.symbol);
        if (!row || !s) continue;
        const price = parseFloat(row.lastPrice);
        if (Number.isFinite(price) && price > 0) {
          // On the first real quote, reseed the spark around the live price so
          // the historical curve blends smoothly into streaming data.
          if (!s.anchored) s.spark = buildSpark(price, s.rng, s.vol);
          s.anchoredPrice = price;
          s.price = price;
          s.dayOpen = parseFloat(row.openPrice) || s.dayOpen;
          s.high = Math.max(parseFloat(row.highPrice) || s.high, s.high);
          s.low = parseFloat(row.lowPrice) || s.low;
          s.change = s.price - s.dayOpen;
          s.changePct = parseFloat(row.priceChangePercent);
          s.volume = parseFloat(row.quoteVolume) || s.volume;
          s.anchored = true;
        }
      }
      this.failStreak = 0;
      this.status = "live";
      this.lastAnchorAt = Date.now();
    } catch {
      // Binance unreachable → keep simulating, surface reconnecting/offline.
      this.failStreak += 1;
      this.status = this.failStreak >= 3 ? "offline" : "reconnecting";
    }
    this.emit();
  }

  emit() {
    this.rebuild();
    for (const fn of this.listeners) fn();
  }

  rebuild() {
    this.store = { data: this.buildData(), status: this.status };
  }

  getStore() {
    return this.store;
  }

  snapshot() {
    return this.buildData();
  }

  buildData() {
    return Array.from(this.states.values()).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      assetClass: s.assetClass,
      price: s.price,
      prevPrice: s.prevPrice,
      change: s.change,
      changePct: s.changePct,
      open: s.dayOpen,
      high: s.high,
      low: s.low,
      volume: s.volume,
      mcap: s.mcap,
      spark: s.spark,
      anchored: s.anchored,
      updatedAt: s.updatedAt,
    }));
  }

  getStatus() {
    return this.status;
  }
}

let engine = null;
export function getMarketEngine() {
  if (!engine) engine = new MarketEngine();
  return engine;
}
