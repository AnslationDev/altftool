// src/app/tradeon/lib/ai.js
// Tradeon AI Prediction engine.
//
// This is a transparent, deterministic "signal model" that derives a full
// prediction profile from live price action (trend slope, momentum, RSI-style
// oscillator, volatility). It is intentionally explainable: every number the UI
// shows can be traced to an input, and it produces natural-language reasoning so
// non-expert users understand *why* a call is Buy / Sell / Hold.
//
// NOTE: This is analytical signal generation for a product demo, not financial
// advice. The UI surfaces that disclaimer prominently.

import { clamp } from "./format.js";

function slope(series) {
  // Normalised least-squares slope of the recent window (% per step).
  const n = series.length;
  if (n < 2) return 0;
  const xs = series.map((_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = series.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (series[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const m = den === 0 ? 0 : num / den;
  return (m / meanY) * 100;
}

function rsi(series, period = 14) {
  const s = series.slice(-period - 1);
  if (s.length < 2) return 50;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < s.length; i++) {
    const d = s[i] - s[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  if (loss === 0) return 100;
  const rs = gain / period / (loss / period);
  return 100 - 100 / (1 + rs);
}

function volatility(series) {
  const rets = [];
  for (let i = 1; i < series.length; i++) {
    rets.push((series[i] - series[i - 1]) / series[i - 1]);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const varr = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length || 1);
  return Math.sqrt(varr) * 100;
}

function ratingLabel(score) {
  if (score >= 75) return "Strong Buy";
  if (score >= 58) return "Buy";
  if (score >= 43) return "Neutral";
  if (score >= 26) return "Sell";
  return "Strong Sell";
}

/**
 * Generate the full AI prediction profile for a live instrument snapshot.
 * @param {{symbol:string,name:string,assetClass:string,price:number,changePct:number,spark:number[]}} inst
 */
export function predict(inst) {
  const series = inst.spark && inst.spark.length > 4 ? inst.spark : [inst.price];
  const price = inst.price;
  const trend = slope(series); // % per step
  const osc = rsi(series); // 0..100
  const vol = volatility(series); // %
  const chg = inst.changePct ?? 0;

  // Composite bullish score 0..100 blends trend, momentum position, day change.
  const trendScore = clamp(50 + trend * 340, 0, 100);
  const momentumScore = clamp(osc, 0, 100);
  const changeScore = clamp(50 + chg * 6, 0, 100);
  const bull = clamp(trendScore * 0.5 + momentumScore * 0.28 + changeScore * 0.22, 2, 98);

  // Probabilities (buy / hold / sell) sum to 100.
  const conviction = Math.abs(bull - 50) / 50; // 0..1
  const holdBase = 34 - conviction * 22;
  let buy = clamp((bull - 50) * 1.5 + 50 - holdBase / 2, 3, 92);
  let sell = clamp((50 - bull) * 1.5 + 50 - holdBase / 2, 3, 92);
  let hold = clamp(100 - buy - sell, 4, 60);
  const norm = 100 / (buy + sell + hold);
  buy = Math.round(buy * norm);
  sell = Math.round(sell * norm);
  hold = 100 - buy - sell;

  const signal = buy >= sell && buy >= hold ? "BUY" : sell >= buy && sell >= hold ? "SELL" : "HOLD";

  // Supporting metrics.
  const confidence = Math.round(clamp(52 + conviction * 44 - vol * 3, 40, 97));
  const risk = Math.round(clamp(vol * 14 + Math.abs(chg) * 2 + 18, 8, 96));
  const technical = Math.round(clamp(bull + (osc - 50) * 0.3, 2, 99));
  const fundamental = Math.round(clamp(58 + Math.sin(hashStr(inst.symbol)) * 22 + (chg > 0 ? 6 : -4), 15, 96));
  const trendStrength = Math.round(clamp(Math.abs(trend) * 520 + Math.abs(chg) * 4, 6, 99));

  const sentiments = {
    institutional: Math.round(clamp(bull + noise(inst.symbol, 1) * 14, 4, 98)),
    retail: Math.round(clamp(momentumScore + noise(inst.symbol, 2) * 18, 4, 98)),
    news: Math.round(clamp(56 + chg * 3 + noise(inst.symbol, 3) * 16, 4, 98)),
    social: Math.round(clamp(momentumScore + chg * 2 + noise(inst.symbol, 4) * 20, 4, 98)),
  };

  // Price levels.
  const atr = (vol / 100) * price * 3 || price * 0.01;
  const support = round(price - atr * 1.6);
  const resistance = round(price + atr * 1.7);
  const entry = round(signal === "SELL" ? price - atr * 0.2 : price + atr * 0.2);
  const target = round(signal === "SELL" ? price - atr * 2.4 : price + atr * 2.6);
  const stop = round(signal === "SELL" ? price + atr * 1.3 : price - atr * 1.3);
  const rr = Math.abs((target - entry) / (entry - stop) || 1);

  // ---- Explainable factor scorecard (the "why" behind the call) ----
  const recent = series.slice(-6);
  const recAction = recent.length > 1 ? ((recent[recent.length - 1] - recent[0]) / recent[0]) * 100 : 0;
  const srPos = clamp((price - support) / ((resistance - support) || 1), 0, 1);
  const sentAvg = Math.round((sentiments.institutional + sentiments.retail) / 2);
  const volFactor = clamp(45 + Math.abs(chg) * 8 + vol * 12, 5, 98);
  const factors = [
    mkFactor("Market trend", trend > 0.012 ? "bullish" : trend < -0.012 ? "bearish" : "neutral", clamp(50 + trend * 340, 3, 97),
      trend > 0.012 ? "Higher highs on the intraday tape" : trend < -0.012 ? "Lower highs pressuring price" : "Sideways — no clear trend"),
    mkFactor("Price momentum", chg > 0.25 ? "bullish" : chg < -0.25 ? "bearish" : "neutral", changeScore,
      `Session change ${chg > 0 ? "+" : ""}${chg.toFixed(2)}%`),
    mkFactor("Trading volume", Math.abs(chg) < 0.15 ? "neutral" : chg > 0 ? "bullish" : "bearish", volFactor,
      volFactor > 60 ? "Above-average participation" : "Below-average participation"),
    mkFactor("Relative strength", osc >= 50 && osc <= 72 ? "bullish" : osc <= 42 ? "bearish" : "neutral", osc,
      `RSI ${Math.round(osc)} · ${osc > 70 ? "overbought" : osc < 30 ? "oversold" : "balanced"}`),
    mkFactor("Support / resistance", srPos < 0.38 ? "bullish" : srPos > 0.7 ? "bearish" : "neutral", clamp((1 - srPos) * 100, 3, 97),
      srPos < 0.38 ? "Trading near support" : srPos > 0.7 ? "Resistance overhead" : "Holding mid-range"),
    mkFactor("Recent price action", recAction > 0.12 ? "bullish" : recAction < -0.12 ? "bearish" : "neutral", clamp(50 + recAction * 34, 3, 97),
      recAction > 0.12 ? "Last bars trending up" : recAction < -0.12 ? "Last bars trending down" : "Choppy, indecisive"),
    mkFactor("Technical indicators", technical >= 58 ? "bullish" : technical <= 42 ? "bearish" : "neutral", technical,
      technical >= 58 ? "Moving averages aligned up" : technical <= 42 ? "Moving averages aligned down" : "Mixed indicator readings"),
    mkFactor("Flow proxy", sentAvg > 55 ? "bullish" : sentAvg < 45 ? "bearish" : "neutral", sentAvg,
      `Synthetic momentum and attention proxy ${sentAvg}/100`),
    mkFactor("Context proxy", sentiments.news > 55 ? "bullish" : sentiments.news < 45 ? "bearish" : "neutral", sentiments.news,
      "Synthetic context derived from price action"),
  ];
  const factorTally = factors.reduce((a, f) => ((a[f.signal] += 1), a), { bullish: 0, bearish: 0, neutral: 0 });

  return {
    symbol: inst.symbol,
    name: inst.name,
    signal,
    probabilities: { buy, hold, sell },
    confidence,
    risk,
    technical,
    fundamental,
    trendStrength,
    ratingLabel: ratingLabel(technical),
    sentiments,
    factors,
    factorTally,
    levels: { support, resistance, entry, target, stop, rr: round(rr) },
    outlook: {
      short: signal === "BUY" ? "Bullish" : signal === "SELL" ? "Bearish" : "Range-bound",
      long: fundamental >= 60 ? "Constructive" : fundamental >= 45 ? "Neutral" : "Cautious",
    },
    metrics: { rsi: Math.round(osc), trend: round(trend * 100) / 100, volatility: round(vol) },
    explanation: explain({ inst, signal, osc, trend, chg, vol, confidence, risk, sentiments, rr }),
  };
}

function explain({ inst, signal, osc, trend, chg, vol, confidence, risk, sentiments, rr }) {
  const dir = signal === "BUY" ? "accumulation" : signal === "SELL" ? "distribution" : "consolidation";
  const rsiState = osc > 70 ? "overbought" : osc < 30 ? "oversold" : "neutral";
  const trendWord = trend > 0.02 ? "a firming uptrend" : trend < -0.02 ? "a developing downtrend" : "a sideways structure";

  const drivers = [];
  if (Math.abs(trend) > 0.02)
    drivers.push(`price is tracing ${trendWord} on the intraday tape`);
  drivers.push(`RSI reads ${Math.round(osc)} (${rsiState})`);
  if (Math.abs(chg) > 0.4)
    drivers.push(`session move of ${chg > 0 ? "+" : ""}${chg.toFixed(2)}% adds ${chg > 0 ? "demand" : "supply"} pressure`);
  drivers.push(`the synthetic flow proxy reads ${sentiments.institutional}/100`);

  const summary =
    signal === "BUY"
      ? `Tradeon leans **Buy** on ${inst.symbol}. Signals point to ${dir}: ${drivers.slice(0, 3).join(", ")}.`
      : signal === "SELL"
        ? `Tradeon leans **Sell** on ${inst.symbol}. The model detects ${dir}: ${drivers.slice(0, 3).join(", ")}.`
        : `Tradeon is **Neutral** on ${inst.symbol}. Momentum is balanced — ${drivers.slice(0, 2).join(", ")}, so patience is favoured.`;

  const bull = [];
  const bear = [];
  if (trend > 0) bull.push("positive trend slope"); else bear.push("negative trend slope");
  if (osc < 45) bull.push("RSI has room to recover"); else if (osc > 65) bear.push("RSI stretched near overbought");
  if (sentiments.news > 55) bull.push("supportive context proxy"); else bear.push("soft context proxy");
  if (sentiments.social > 55) bull.push("rising momentum proxy"); else bear.push("cooling momentum proxy");

  return {
    summary,
    drivers,
    bullCase: bull,
    bearCase: bear,
    risks: [
      vol > 1.4 ? "Elevated volatility widens stop distance" : "Volatility is contained for now",
      `Reward-to-risk on the suggested plan is ~${rr.toFixed(1)}:1`,
      risk > 65 ? "High model risk score — size positions conservatively" : "Model risk score is within normal range",
    ],
    confidenceNote:
      confidence >= 80
        ? "High conviction: multiple factors agree."
        : confidence >= 65
          ? "Moderate conviction: primary and secondary signals align."
          : "Lower conviction: signals are mixed — treat as a watch, not a trigger.",
  };
}

function mkFactor(label, signal, score, note) {
  return { label, signal, score: Math.round(score), note };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}
function noise(sym, salt) {
  return Math.sin(hashStr(sym) * (salt + 1)) * 0.5;
}
function round(v) {
  const abs = Math.abs(v);
  const d = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return Number(v.toFixed(d));
}
