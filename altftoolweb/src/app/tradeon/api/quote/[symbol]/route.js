// src/app/tradeon/api/quote/[symbol]/route.js
// Free, real OHLC for Tradeon's Indian stock universe (and beyond), proxied
// server-side from Yahoo Finance's public chart endpoint. Doing it on the server
// avoids browser CORS and needs no API key. The client falls back to Tradeon's
// simulated candles whenever this route errors, so the page always renders.
// Analytical demo — not investment advice.

import { INSTRUMENTS } from "@/app/tradeon/lib/instruments";
import { OUTLOOK_SYMBOLS } from "@/app/tradeon/lib/outlookStocks";

// Map a Tradeon symbol → its Yahoo ticker. Indian NSE stocks (the whole outlook
// universe, plus any INSTRUMENTS with a sector) get the ".NS" suffix; crypto uses
// the "-USD" pair; everything else passes through.
function yahooTicker(symbol) {
  if (OUTLOOK_SYMBOLS.has(symbol)) return `${symbol}.NS`; // Indian NSE outlook stocks
  const inst = INSTRUMENTS.find((i) => i.symbol === symbol);
  if (!inst) return null;
  if (inst.sector) return `${symbol}.NS`;
  if (inst.assetClass === "crypto") return `${symbol}-USD`;
  return symbol; // US stocks / indices / ETFs
}

// query2 is not rate-limited for datacenter IPs the way query1 often is; try both.
const HOSTS = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36";

const ALLOWED_INTERVALS = new Set(["1d", "1wk", "1mo"]);
const ALLOWED_RANGES = new Set(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]);

export async function GET(req, { params }) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw || "");
  const url = new URL(req.url);
  const interval = ALLOWED_INTERVALS.has(url.searchParams.get("interval")) ? url.searchParams.get("interval") : "1wk";
  const range = ALLOWED_RANGES.has(url.searchParams.get("range")) ? url.searchParams.get("range") : "1y";

  const ticker = yahooTicker(symbol);
  if (!ticker) return Response.json({ error: "unknown symbol" }, { status: 404 });

  let lastErr = "no hosts tried";
  for (const host of HOSTS) {
    try {
      const y = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;
      const res = await fetch(y, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        next: { revalidate: 900 }, // cache 15 min — weekly OHLC barely moves intraday
      });
      if (!res.ok) {
        lastErr = `yahoo ${res.status} via ${host}`;
        continue;
      }
      const j = await res.json();
      const r = j?.chart?.result?.[0];
      const ts = r?.timestamp;
      const q = r?.indicators?.quote?.[0];
      if (!r || !Array.isArray(ts) || !q) {
        lastErr = `empty payload via ${host}`;
        continue;
      }

      const bars = [];
      for (let i = 0; i < ts.length; i++) {
        const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
        if (o == null || h == null || l == null || c == null) continue; // skip holiday/partial gaps
        bars.push({ time: ts[i], open: round(o), high: round(h), low: round(l), close: round(c), volume: Math.round(q.volume?.[i] || 0) });
      }
      if (!bars.length) {
        lastErr = `no complete bars via ${host}`;
        continue;
      }

      return Response.json(
        {
          symbol,
          yahoo: ticker,
          interval,
          currency: r.meta?.currency || null,
          exchange: r.meta?.fullExchangeName || r.meta?.exchangeName || null,
          price: r.meta?.regularMarketPrice ?? bars[bars.length - 1].close,
          prevClose: r.meta?.chartPreviousClose ?? null,
          source: "yahoo",
          bars,
        },
        { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } }
      );
    } catch (e) {
      lastErr = String(e?.message || e);
    }
  }
  return Response.json({ error: "upstream unavailable", detail: lastErr }, { status: 502 });
}

function round(v) {
  const a = Math.abs(v);
  const d = a >= 1 ? 2 : a >= 0.01 ? 4 : 6;
  return Number(v.toFixed(d));
}
