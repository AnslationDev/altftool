"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scaling } from "lucide-react";

const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money0 = (value) => INR0.format(Number.isFinite(value) ? value : 0);
const money = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  capital: "500000",
  riskMode: "percent",
  riskPercent: "1",
  riskAmount: "5000",
  entry: "250",
  stop: "240",
  leverage: "1",
  lotSize: "1",
};

const RISK_PRESETS = [0.5, 1, 2, 3];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP = (active) =>
  `min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
    active
      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
  }`;

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Shares = money you are willing to lose / loss per share at the stop,
 * then trimmed to what the buying power and lot size allow.
 */
export function positionSize({ riskBudget, riskPerShare, buyingPower, entry, lotSize }) {
  const byRisk = riskBudget / riskPerShare;
  const byCapital = buyingPower / entry;
  const raw = Math.min(byRisk, byCapital);
  const lots = Math.floor(raw / lotSize);
  return {
    byRisk,
    byCapital,
    shares: Math.max(0, lots * lotSize),
    limitedBy: byCapital < byRisk ? "capital" : "risk",
  };
}

export default function ToolHome() {
  const [capital, setCapital] = useState(DEFAULTS.capital);
  const [riskMode, setRiskMode] = useState(DEFAULTS.riskMode);
  const [riskPercent, setRiskPercent] = useState(DEFAULTS.riskPercent);
  const [riskAmount, setRiskAmount] = useState(DEFAULTS.riskAmount);
  const [entry, setEntry] = useState(DEFAULTS.entry);
  const [stop, setStop] = useState(DEFAULTS.stop);
  const [leverage, setLeverage] = useState(DEFAULTS.leverage);
  const [lotSize, setLotSize] = useState(DEFAULTS.lotSize);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setCapital(DEFAULTS.capital);
    setRiskMode(DEFAULTS.riskMode);
    setRiskPercent(DEFAULTS.riskPercent);
    setRiskAmount(DEFAULTS.riskAmount);
    setEntry(DEFAULTS.entry);
    setStop(DEFAULTS.stop);
    setLeverage(DEFAULTS.leverage);
    setLotSize(DEFAULTS.lotSize);
    setCopied(false);
  };

  const calc = useMemo(() => {
    const cap = toNumber(capital);
    const e = toNumber(entry);
    const s = toNumber(stop);
    const lev = toNumber(leverage);
    const lot = toNumber(lotSize);

    if ([cap, e, s, lev, lot].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (cap <= 0) return { error: "Trading capital must be greater than zero." };
    if (e <= 0) return { error: "Entry price must be greater than zero." };
    if (s <= 0) return { error: "Stop loss price must be greater than zero." };
    if (s === e) return { error: "Stop loss cannot be the same as the entry price." };
    if (lev < 1 || lev > 50) return { error: "Leverage should be between 1x and 50x." };
    if (lot < 1) return { error: "Lot size must be at least 1." };

    let budget;
    if (riskMode === "percent") {
      const rp = toNumber(riskPercent);
      if (Number.isNaN(rp)) return { error: "Enter a valid risk percentage." };
      if (rp <= 0 || rp > 100) return { error: "Risk per trade must be between 0% and 100% of capital." };
      budget = (cap * rp) / 100;
    } else {
      const ra = toNumber(riskAmount);
      if (Number.isNaN(ra)) return { error: "Enter a valid risk amount." };
      if (ra <= 0) return { error: "Risk amount must be greater than zero." };
      if (ra > cap) return { error: "Risk amount cannot be larger than your capital." };
      budget = ra;
    }

    const riskPerShare = Math.abs(e - s);
    const buyingPower = cap * lev;
    const { byRisk, byCapital, shares, limitedBy } = positionSize({
      riskBudget: budget,
      riskPerShare,
      buyingPower,
      entry: e,
      lotSize: Math.round(lot),
    });

    if (shares < 1) {
      return {
        error:
          "Your risk budget is too small for this stop loss distance — even one share (or lot) would risk more than allowed.",
      };
    }

    const positionValue = shares * e;
    const actualRisk = shares * riskPerShare;
    const direction = s < e ? "long" : "short";

    return {
      budget,
      riskPerShare,
      riskPerSharePct: (riskPerShare / e) * 100,
      shares,
      byRisk,
      byCapital,
      limitedBy,
      positionValue,
      actualRisk,
      actualRiskPct: (actualRisk / cap) * 100,
      capitalUsedPct: (positionValue / cap) * 100,
      marginNeeded: positionValue / lev,
      capital: cap,
      entry: e,
      stop: s,
      leverage: lev,
      lot: Math.round(lot),
      direction,
    };
  }, [capital, entry, stop, leverage, lotSize, riskMode, riskPercent, riskAmount]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Position Size Calculator",
      `Capital: ${money0(calc.capital)}`,
      `Risk budget for this trade: ${money0(calc.budget)}`,
      `Entry: ${money(calc.entry)} · Stop loss: ${money(calc.stop)} (${calc.direction})`,
      `Risk per share: ${money(calc.riskPerShare)} (${pct(calc.riskPerSharePct)})`,
      `Position size: ${num(calc.shares)} shares`,
      `Position value: ${money0(calc.positionValue)}`,
      `Margin needed at ${num(calc.leverage)}x: ${money0(calc.marginNeeded)}`,
      `Actual risk if stopped out: ${money0(calc.actualRisk)} (${pct(calc.actualRiskPct)} of capital)`,
      `Limited by: ${calc.limitedBy === "capital" ? "available buying power" : "risk budget"}`,
    ].join("\n");
  }, [calc]);

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
          <Scaling className="h-4 w-4" aria-hidden="true" />
          Investing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Position Size Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out exactly how many shares to buy so a stop loss costs you no more than the amount
          you decided to risk — with your buying power and lot size taken into account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-capital">
              Trading capital (INR)
            </label>
            <input
              id="ps-capital"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={capital}
              onChange={(event) => setCapital(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-leverage">
              Leverage / margin multiplier (x)
            </label>
            <input
              id="ps-leverage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="50"
              step="0.5"
              value={leverage}
              onChange={(event) => setLeverage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-entry">
              Entry price (INR)
            </label>
            <input
              id="ps-entry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={entry}
              onChange={(event) => setEntry(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-stop">
              Stop loss price (INR)
            </label>
            <input
              id="ps-stop"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={stop}
              onChange={(event) => setStop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-lot">
              Lot size (1 for cash equity)
            </label>
            <input
              id="ps-lot"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={lotSize}
              onChange={(event) => setLotSize(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Risk per trade set as</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["percent", "% of capital"],
              ["amount", "Fixed rupee amount"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRiskMode(key)}
                aria-pressed={riskMode === key}
                className={CHIP(riskMode === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          {riskMode === "percent" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ps-risk-pct">
                Risk per trade (% of capital)
              </label>
              <input
                id="ps-risk-pct"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={riskPercent}
                onChange={(event) => setRiskPercent(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {RISK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRiskPercent(String(preset))}
                    className={CHIP(toNumber(riskPercent) === preset)}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="ps-risk-amt">
                Risk per trade (INR)
              </label>
              <input
                id="ps-risk-amt"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={riskAmount}
                onChange={(event) => setRiskAmount(event.target.value)}
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
                  Position size
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{num(calc.shares)} shares</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money0(calc.positionValue)} at {money(calc.entry)} · risking{" "}
                  {money0(calc.actualRisk)} to the stop at {money(calc.stop)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy position size result"
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
                ["Risk budget for this trade", money0(calc.budget)],
                ["Risk per share (entry to stop)", `${money(calc.riskPerShare)} (${pct(calc.riskPerSharePct)})`],
                ["Shares the risk budget allows", num(Math.floor(calc.byRisk))],
                ["Shares the buying power allows", num(Math.floor(calc.byCapital))],
                ["Final position size", `${num(calc.shares)} shares`],
                ["Position value", money0(calc.positionValue)],
                ["Margin needed", money0(calc.marginNeeded)],
                ["Position value as % of capital", pct(calc.capitalUsedPct)],
                ["Actual loss if stopped out", `${money0(calc.actualRisk)} (${pct(calc.actualRiskPct)} of capital)`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                calc.limitedBy === "capital"
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "bg-[var(--success-soft)] text-[var(--success)]"
              }`}
            >
              {calc.limitedBy === "capital"
                ? `Capped by buying power: your stop is so tight that the risk budget would allow ${num(Math.floor(calc.byRisk))} shares, more than ${money0(calc.capital * calc.leverage)} can buy.`
                : `Sized by risk: the stop at ${money(calc.stop)} keeps the worst case at ${money0(calc.actualRisk)}.`}
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How the number is built</h2>
            <ol className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>
                <span className="font-semibold text-[var(--foreground)]">1.</span> Risk budget ={" "}
                {money0(calc.budget)} — the most you accept losing on this trade.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">2.</span> Risk per share = |
                {money(calc.entry)} − {money(calc.stop)}| = {money(calc.riskPerShare)}.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">3.</span> Shares ={" "}
                {money0(calc.budget)} ÷ {money(calc.riskPerShare)} ={" "}
                {num(Math.floor(calc.byRisk))}, then rounded down to whole lots of {num(calc.lot)}.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">4.</span> Capped at what{" "}
                {money0(calc.capital)} × {num(calc.leverage)}x buying power can afford.
              </li>
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not investment advice. Gaps, slippage and brokerage can make the real
        loss larger than the calculated risk, and intraday margin rules in India change how much
        leverage your broker may offer.
      </p>
    </main>
  );
}
