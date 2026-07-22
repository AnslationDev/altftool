// src/app/tradeon/lib/fundamentals.js
// Deterministic synthetic company/asset fundamentals derived from the symbol +
// live snapshot. Used to populate the detail page's Financials / Fundamentals /
// Earnings / Dividends / Holdings tabs without a paid data vendor. Stable per
// symbol so numbers don't jump on every render.

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296; // 0..1
}
const rnd = (sym, salt, min, max) => {
  const v = hash(sym + ":" + salt);
  return min + v * (max - min);
};

const EXCHANGE = {
  stocks: "NASDAQ",
  crypto: "Binance",
  forex: "FX",
  indices: "Index",
  commodities: "COMEX",
  etf: "NYSE Arca",
};

const SECTORS = ["Technology", "Financials", "Healthcare", "Energy", "Consumer", "Industrials", "Communication"];

export function getFundamentals(inst) {
  if (!inst) return null;
  const s = inst.symbol;
  const price = inst.price;
  const cap = inst.mcap || price * rnd(s, "cap", 2e8, 9e10);
  const pe = rnd(s, "pe", 9, 42);
  const eps = price / pe;
  const beta = rnd(s, "beta", 0.6, 1.9);
  const roe = rnd(s, "roe", 6, 34);
  const divYield = inst.assetClass === "stocks" || inst.assetClass === "etf" ? rnd(s, "div", 0, 3.6) : 0;
  const week52High = (inst.high || price) * rnd(s, "wh", 1.08, 1.44);
  const week52Low = (inst.low || price) * rnd(s, "wl", 0.58, 0.9);
  const avgVolume = (inst.volume || price * 1e6) * rnd(s, "avol", 0.82, 1.2);
  const revenue = cap * rnd(s, "rev", 0.12, 0.6);
  const netMargin = rnd(s, "nm", 0.06, 0.32);
  const netIncome = revenue * netMargin;

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const earnings = quarters.map((q, i) => {
    const est = eps * rnd(s, "e-est-" + i, 0.85, 1.05);
    const act = est * rnd(s, "e-act-" + i, 0.9, 1.18);
    return { q, estimate: est, actual: act, beat: act >= est };
  });

  const dividends = divYield > 0
    ? ["Mar", "Jun", "Sep", "Dec"].map((m, i) => ({
        month: m,
        amount: (price * divYield) / 100 / 4,
        yield: divYield / 4,
        status: i < 3 ? "Paid" : "Upcoming",
      }))
    : [];

  const holders = [
    { name: "Vanguard Group", pct: rnd(s, "h1", 6, 12) },
    { name: "BlackRock", pct: rnd(s, "h2", 5, 10) },
    { name: "State Street", pct: rnd(s, "h3", 3, 7) },
    { name: "Fidelity (FMR)", pct: rnd(s, "h4", 2, 5) },
    { name: "Geode Capital", pct: rnd(s, "h5", 1, 3.5) },
  ];
  const instTotal = holders.reduce((a, b) => a + b.pct, 0);

  return {
    exchange: EXCHANGE[inst.assetClass] || "—",
    sector: SECTORS[Math.floor(hash(s + ":sec") * SECTORS.length)],
    currency: inst.assetClass === "forex" ? "" : "$",
    stats: {
      marketCap: cap,
      pe,
      eps,
      dividendYield: divYield,
      beta,
      roe,
      volume: inst.volume,
      avgVolume,
      week52High,
      week52Low,
      dayHigh: inst.high,
      dayLow: inst.low,
      open: inst.open,
      prevClose: inst.open * rnd(s, "pc", 0.995, 1.005),
    },
    financials: {
      revenue,
      netIncome,
      netMargin,
      grossMargin: netMargin + rnd(s, "gm", 0.12, 0.3),
      totalAssets: cap * rnd(s, "ta", 0.4, 1.1),
      totalLiabilities: cap * rnd(s, "tl", 0.2, 0.7),
      cashFlow: netIncome * rnd(s, "cf", 0.9, 1.4),
      debtToEquity: rnd(s, "de", 0.2, 1.6),
    },
    earnings,
    dividends,
    ownership: { holders, institutional: Math.min(92, instTotal + rnd(s, "iof", 20, 45)), insider: rnd(s, "ins", 0.4, 6), retail: 0 },
  };
}
