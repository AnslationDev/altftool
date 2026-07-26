"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 5 });

const money = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const rate = (value) => `${NUM4.format(Number.isFinite(value) ? value : 0)}%`;

/**
 * Statutory rates for Indian equity / F&O trades (percent of the relevant turnover).
 * STT applies on both legs for delivery, sell-side only for intraday and derivatives.
 */
const SEGMENTS = {
  delivery: {
    label: "Equity delivery",
    unit: "shares",
    sttBuy: 0.1,
    sttSell: 0.1,
    stampBuy: 0.015,
    sebi: 0.0001,
    exchange: { NSE: 0.00297, BSE: 0.00375 },
    hasDp: true,
    turnoverNote: "Turnover = price x quantity on each leg.",
    defaults: { flat: "0", pct: "0", cap: "20", qty: "100", buy: "500", sell: "560" },
  },
  intraday: {
    label: "Equity intraday",
    unit: "shares",
    sttBuy: 0,
    sttSell: 0.025,
    stampBuy: 0.003,
    sebi: 0.0001,
    exchange: { NSE: 0.00297, BSE: 0.00375 },
    hasDp: false,
    turnoverNote: "Turnover = price x quantity on each leg.",
    defaults: { flat: "0", pct: "0.03", cap: "20", qty: "1000", buy: "100", sell: "105" },
  },
  futures: {
    label: "Equity / index futures",
    unit: "units",
    sttBuy: 0,
    sttSell: 0.02,
    stampBuy: 0.002,
    sebi: 0.0001,
    exchange: { NSE: 0.00173 },
    hasDp: false,
    turnoverNote: "Turnover = contract price x total units (lots x lot size).",
    defaults: { flat: "0", pct: "0.03", cap: "20", qty: "75", buy: "24000", sell: "24150" },
  },
  options: {
    label: "Equity / index options",
    unit: "units",
    sttBuy: 0,
    sttSell: 0.1,
    stampBuy: 0.003,
    sebi: 0.0001,
    exchange: { NSE: 0.03503 },
    hasDp: false,
    turnoverNote: "Turnover = premium x total units (lots x lot size).",
    defaults: { flat: "20", pct: "0", cap: "20", qty: "75", buy: "120", sell: "160" },
  },
};

const GST_RATE = 18;
const DEFAULT_DP = "15.93";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

/** Brokerage on one leg: flat fee plus a percentage of turnover, capped per order. */
export function legBrokerage(turnover, flat, pct, cap) {
  const raw = flat + (turnover * pct) / 100;
  if (cap > 0) return Math.min(raw, cap);
  return raw;
}

export function computeCharges(input) {
  const {
    segment,
    exchangeRatePct,
    qty,
    buyPrice,
    sellPrice,
    flat,
    pct,
    cap,
    dpCharge,
  } = input;
  const spec = SEGMENTS[segment];

  const buyTurnover = buyPrice * qty;
  const sellTurnover = sellPrice * qty;
  const totalTurnover = buyTurnover + sellTurnover;

  const buyBrokerage = legBrokerage(buyTurnover, flat, pct, cap);
  const sellBrokerage = legBrokerage(sellTurnover, flat, pct, cap);
  const brokerage = buyBrokerage + sellBrokerage;

  const stt = (buyTurnover * spec.sttBuy) / 100 + (sellTurnover * spec.sttSell) / 100;
  const exchangeCharge = (totalTurnover * exchangeRatePct) / 100;
  const sebi = (totalTurnover * spec.sebi) / 100;
  const stamp = (buyTurnover * spec.stampBuy) / 100;
  const gst = ((brokerage + exchangeCharge + sebi) * GST_RATE) / 100;
  const dp = spec.hasDp ? dpCharge : 0;

  const totalCharges = brokerage + stt + exchangeCharge + sebi + stamp + gst + dp;
  const grossPnl = (sellPrice - buyPrice) * qty;
  const netPnl = grossPnl - totalCharges;

  return {
    buyTurnover,
    sellTurnover,
    totalTurnover,
    buyBrokerage,
    sellBrokerage,
    brokerage,
    stt,
    exchangeCharge,
    sebi,
    stamp,
    gst,
    dp,
    totalCharges,
    grossPnl,
    netPnl,
    breakEvenMove: qty > 0 ? totalCharges / qty : 0,
    chargePctOfTurnover: totalTurnover > 0 ? (totalCharges / totalTurnover) * 100 : 0,
  };
}

export default function ToolHome() {
  const [segment, setSegment] = useState("intraday");
  const [exchange, setExchange] = useState("NSE");
  const [qty, setQty] = useState(SEGMENTS.intraday.defaults.qty);
  const [buyPrice, setBuyPrice] = useState(SEGMENTS.intraday.defaults.buy);
  const [sellPrice, setSellPrice] = useState(SEGMENTS.intraday.defaults.sell);
  const [flat, setFlat] = useState(SEGMENTS.intraday.defaults.flat);
  const [pct, setPct] = useState(SEGMENTS.intraday.defaults.pct);
  const [cap, setCap] = useState(SEGMENTS.intraday.defaults.cap);
  const [dpCharge, setDpCharge] = useState(DEFAULT_DP);
  const [copied, setCopied] = useState(false);

  const spec = SEGMENTS[segment];
  const exchangeOptions = Object.keys(spec.exchange);
  const activeExchange = exchangeOptions.includes(exchange) ? exchange : exchangeOptions[0];
  const exchangeRatePct = spec.exchange[activeExchange];

  const applySegment = (next) => {
    const preset = SEGMENTS[next];
    setSegment(next);
    setQty(preset.defaults.qty);
    setBuyPrice(preset.defaults.buy);
    setSellPrice(preset.defaults.sell);
    setFlat(preset.defaults.flat);
    setPct(preset.defaults.pct);
    setCap(preset.defaults.cap);
    if (!Object.keys(preset.exchange).includes(exchange)) setExchange("NSE");
    setCopied(false);
  };

  const reset = () => applySegment("intraday");

  const calc = useMemo(() => {
    const q = toNumber(qty);
    const bp = toNumber(buyPrice);
    const sp = toNumber(sellPrice);
    const f = toNumber(flat);
    const p = toNumber(pct);
    const c = toNumber(cap);
    const dp = toNumber(dpCharge);

    if ([q, bp, sp, f, p, c, dp].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (q <= 0) return { error: "Quantity must be greater than zero." };
    if (bp <= 0 || sp <= 0) return { error: "Buy and sell prices must be greater than zero." };
    if (f < 0 || p < 0 || c < 0 || dp < 0) return { error: "Brokerage and DP charges cannot be negative." };
    if (p > 5) return { error: "Brokerage percentage above 5% looks wrong — check the value." };

    return computeCharges({
      segment,
      exchangeRatePct,
      qty: q,
      buyPrice: bp,
      sellPrice: sp,
      flat: f,
      pct: p,
      cap: c,
      dpCharge: dp,
    });
  }, [segment, exchangeRatePct, qty, buyPrice, sellPrice, flat, pct, cap, dpCharge]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Brokerage and Charges Calculator",
      `Segment: ${spec.label} (${activeExchange})`,
      `Quantity: ${num(toNumber(qty))} ${spec.unit}`,
      `Buy ${money(toNumber(buyPrice))} · Sell ${money(toNumber(sellPrice))}`,
      `Turnover: ${money(calc.totalTurnover)}`,
      `Brokerage: ${money(calc.brokerage)}`,
      `STT / CTT: ${money(calc.stt)}`,
      `Exchange transaction charges: ${money(calc.exchangeCharge)}`,
      `SEBI turnover fees: ${money(calc.sebi)}`,
      `Stamp duty: ${money(calc.stamp)}`,
      `GST (18%): ${money(calc.gst)}`,
      ...(spec.hasDp ? [`DP charges: ${money(calc.dp)}`] : []),
      `Total charges: ${money(calc.totalCharges)}`,
      `Gross P&L: ${money(calc.grossPnl)}`,
      `Net P&L: ${money(calc.netPnl)}`,
      `Break-even move needed: ${money(calc.breakEvenMove)} per ${spec.unit.replace(/s$/, "")}`,
    ].join("\n");
  }, [calc, spec, activeExchange, qty, buyPrice, sellPrice]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Investing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Brokerage and Charges Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the full cost of a trade — brokerage, STT, exchange transaction charges, SEBI
          fees, stamp duty, GST and DP charges — and see the net profit left after everything.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Segment</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(SEGMENTS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => applySegment(key)}
                aria-pressed={segment === key}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  segment === key
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="br-qty">
              Quantity ({spec.unit})
            </label>
            <input
              id="br-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-exchange">
              Exchange
            </label>
            <select
              id="br-exchange"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activeExchange}
              onChange={(event) => setExchange(event.target.value)}
              disabled={exchangeOptions.length < 2}
            >
              {exchangeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-buy">
              Buy price (INR)
            </label>
            <input
              id="br-buy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={buyPrice}
              onChange={(event) => setBuyPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-sell">
              Sell price (INR)
            </label>
            <input
              id="br-sell"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={sellPrice}
              onChange={(event) => setSellPrice(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{spec.turnoverNote}</p>

        <h2 className="mt-6 text-base font-semibold">Your broker&apos;s plan</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="br-flat">
              Flat brokerage per order (INR)
            </label>
            <input
              id="br-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={flat}
              onChange={(event) => setFlat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-pct">
              Brokerage as % of turnover
            </label>
            <input
              id="br-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.005"
              value={pct}
              onChange={(event) => setPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-cap">
              Maximum brokerage per order (INR, 0 = no cap)
            </label>
            <input
              id="br-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
            />
          </div>
          {spec.hasDp && (
            <div>
              <label className={LABEL_CLASS} htmlFor="br-dp">
                DP charge per sell (INR, incl. GST)
              </label>
              <input
                id="br-dp"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={dpCharge}
                onChange={(event) => setDpCharge(event.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Total charges on this trade
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money(calc.totalCharges)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {rate(calc.chargePctOfTurnover)} of {money(calc.totalTurnover)} turnover
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy brokerage and charges breakdown"
                  className={GHOST_BTN}
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Buy-side turnover", money(calc.buyTurnover)],
                ["Sell-side turnover", money(calc.sellTurnover)],
                [`Brokerage (buy ${money(calc.buyBrokerage)} + sell ${money(calc.sellBrokerage)})`, money(calc.brokerage)],
                [
                  `STT / CTT (${rate(spec.sttBuy)} buy, ${rate(spec.sttSell)} sell)`,
                  money(calc.stt),
                ],
                [`Exchange transaction charges (${rate(exchangeRatePct)})`, money(calc.exchangeCharge)],
                [`SEBI turnover fees (${rate(spec.sebi)})`, money(calc.sebi)],
                [`Stamp duty (${rate(spec.stampBuy)} on buy)`, money(calc.stamp)],
                ["GST (18% on brokerage + exchange + SEBI)", money(calc.gst)],
                ...(spec.hasDp ? [["DP charges", money(calc.dp)]] : []),
                ["Total charges", money(calc.totalCharges)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Profit after charges</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Gross P&L (price difference)", money(calc.grossPnl)],
                ["Less: total charges", `- ${money(calc.totalCharges)}`],
                ["Net P&L in hand", money(calc.netPnl)],
                [
                  `Break-even move needed per ${spec.unit.replace(/s$/, "")}`,
                  money(calc.breakEvenMove),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                calc.netPnl >= 0
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
            >
              {calc.netPnl >= 0
                ? `You keep ${money(calc.netPnl)} after charges eat ${money(calc.totalCharges)}.`
                : `This trade loses ${money(Math.abs(calc.netPnl))} once ${money(calc.totalCharges)} of charges are applied.`}
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates follow the standard Indian equity and F&amp;O charge structure and are rounded for
        display. Exchanges and the government revise slabs periodically, and brokers add their own
        auto square-off, call-and-trade or AMC fees — always confirm against your contract note.
      </p>
    </main>
  );
}
