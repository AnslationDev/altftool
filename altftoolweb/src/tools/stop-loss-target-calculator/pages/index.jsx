"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => INR0.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  entry: "100",
  slMode: "percent",
  slPercent: "5",
  slPrice: "95",
  ratio: "2",
  qty: "100",
  direction: "long",
};

const RATIO_PRESETS = [1, 1.5, 2, 3];

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
 * Stop loss sits `risk` away from entry against the trade;
 * target sits `risk * ratio` away in the trade's favour.
 */
export function stopAndTarget({ entry, risk, ratio, direction }) {
  const isLong = direction === "long";
  const stopLoss = isLong ? entry - risk : entry + risk;
  const reward = risk * ratio;
  const target = isLong ? entry + reward : entry - reward;
  return { stopLoss, target, reward };
}

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [entry, setEntry] = useState(DEFAULTS.entry);
  const [slMode, setSlMode] = useState(DEFAULTS.slMode);
  const [slPercent, setSlPercent] = useState(DEFAULTS.slPercent);
  const [slPrice, setSlPrice] = useState(DEFAULTS.slPrice);
  const [ratio, setRatio] = useState(DEFAULTS.ratio);
  const [qty, setQty] = useState(DEFAULTS.qty);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setDirection(DEFAULTS.direction);
    setEntry(DEFAULTS.entry);
    setSlMode(DEFAULTS.slMode);
    setSlPercent(DEFAULTS.slPercent);
    setSlPrice(DEFAULTS.slPrice);
    setRatio(DEFAULTS.ratio);
    setQty(DEFAULTS.qty);
    setCopied(false);
  };

  const calc = useMemo(() => {
    const e = toNumber(entry);
    const r = toNumber(ratio);
    const q = toNumber(qty);

    if (Number.isNaN(e) || Number.isNaN(r) || Number.isNaN(q)) {
      return { error: "Enter valid numbers in every field." };
    }
    if (e <= 0) return { error: "Entry price must be greater than zero." };
    if (r <= 0) return { error: "Risk-reward ratio must be greater than zero." };
    if (q <= 0) return { error: "Quantity must be at least 1." };

    let risk;
    if (slMode === "percent") {
      const p = toNumber(slPercent);
      if (Number.isNaN(p)) return { error: "Enter a valid stop loss percentage." };
      if (p <= 0 || p >= 100) return { error: "Stop loss percentage must be between 0 and 100." };
      risk = (e * p) / 100;
    } else {
      const sl = toNumber(slPrice);
      if (Number.isNaN(sl)) return { error: "Enter a valid stop loss price." };
      if (sl <= 0) return { error: "Stop loss price must be greater than zero." };
      if (direction === "long" && sl >= e) {
        return { error: "For a long trade the stop loss must be below the entry price." };
      }
      if (direction === "short" && sl <= e) {
        return { error: "For a short trade the stop loss must be above the entry price." };
      }
      risk = Math.abs(e - sl);
    }

    if (!(risk > 0)) return { error: "Stop loss distance must be greater than zero." };

    const { stopLoss, target, reward } = stopAndTarget({ entry: e, risk, ratio: r, direction });
    if (stopLoss <= 0) {
      return { error: "That stop loss distance pushes the stop below zero — reduce it." };
    }
    if (target <= 0) {
      return { error: "That ratio pushes the target below zero — lower the risk-reward ratio." };
    }

    const riskPct = (risk / e) * 100;
    const rewardPct = (reward / e) * 100;
    const levels = RATIO_PRESETS.map((preset) => {
      const level = stopAndTarget({ entry: e, risk, ratio: preset, direction });
      return { ratio: preset, price: level.target, gain: level.reward * q };
    });

    return {
      entry: e,
      direction,
      risk,
      reward,
      stopLoss,
      target,
      ratio: r,
      qty: q,
      riskPct,
      rewardPct,
      riskAmount: risk * q,
      rewardAmount: reward * q,
      capital: e * q,
      capitalRiskPct: (risk * q) / (e * q) * 100,
      breakEvenWinRate: (1 / (1 + r)) * 100,
      levels,
    };
  }, [entry, ratio, qty, slMode, slPercent, slPrice, direction]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Stop Loss and Target Calculator",
      `Trade: ${calc.direction === "long" ? "Long (buy)" : "Short (sell)"}`,
      `Entry price: ${money(calc.entry)}`,
      `Stop loss: ${money(calc.stopLoss)} (${pct(calc.riskPct)} away)`,
      `Target: ${money(calc.target)} (${pct(calc.rewardPct)} away)`,
      `Risk-reward: 1 : ${num(calc.ratio)}`,
      `Quantity: ${num(calc.qty)}`,
      `Risk per share: ${money(calc.risk)} · Total risk: ${money0(calc.riskAmount)}`,
      `Reward per share: ${money(calc.reward)} · Total reward: ${money0(calc.rewardAmount)}`,
      `Break-even win rate at this ratio: ${pct(calc.breakEvenWinRate)}`,
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
          <Target className="h-4 w-4" aria-hidden="true" />
          Investing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stop Loss and Target Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the exact stop loss and target price for a long or short trade from your entry price
          and the risk-reward ratio you want, with the rupee risk and reward on your position size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Trade direction</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["long", "Long (buy first)"],
              ["short", "Short (sell first)"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDirection(key)}
                aria-pressed={direction === key}
                className={CHIP(direction === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-entry">
              Entry price (INR)
            </label>
            <input
              id="sl-entry"
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
            <label className={LABEL_CLASS} htmlFor="sl-qty">
              Quantity
            </label>
            <input
              id="sl-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Define the stop loss by</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["percent", "Percentage from entry"],
              ["price", "Exact stop price"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSlMode(key)}
                aria-pressed={slMode === key}
                className={CHIP(slMode === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {slMode === "percent" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-percent">
                Stop loss distance (% of entry)
              </label>
              <input
                id="sl-percent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={slPercent}
                onChange={(event) => setSlPercent(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-price">
                Stop loss price (INR)
              </label>
              <input
                id="sl-price"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.05"
                value={slPrice}
                onChange={(event) => setSlPrice(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-ratio">
              Risk-reward ratio (1 : ?)
            </label>
            <input
              id="sl-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RATIO_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRatio(String(preset))}
              className={CHIP(toNumber(ratio) === preset)}
            >
              1 : {preset}
            </button>
          ))}
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
                  Target price
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money(calc.target)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Stop loss at {money(calc.stopLoss)} · risking {money(calc.risk)} to make{" "}
                  {money(calc.reward)} per share
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy stop loss and target result"
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

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-[var(--danger-soft)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">Stop loss</p>
                <p className="mt-1 text-xl font-semibold text-[var(--danger)]">{money(calc.stopLoss)}</p>
                <p className="mt-1 text-xs text-[var(--danger)]">{pct(calc.riskPct)} from entry</p>
              </div>
              <div className="rounded-md bg-[var(--muted)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Entry</p>
                <p className="mt-1 text-xl font-semibold">{money(calc.entry)}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {calc.direction === "long" ? "Long" : "Short"} · {num(calc.qty)} qty
                </p>
              </div>
              <div className="rounded-md bg-[var(--success-soft)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">Target</p>
                <p className="mt-1 text-xl font-semibold text-[var(--success)]">{money(calc.target)}</p>
                <p className="mt-1 text-xs text-[var(--success)]">{pct(calc.rewardPct)} from entry</p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Risk per share", money(calc.risk)],
                ["Reward per share", money(calc.reward)],
                ["Total risk if stopped out", money0(calc.riskAmount)],
                ["Total reward if target hits", money0(calc.rewardAmount)],
                ["Capital deployed at entry", money0(calc.capital)],
                ["Risk as % of position value", pct(calc.capitalRiskPct)],
                ["Break-even win rate at this ratio", pct(calc.breakEvenWinRate)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Target ladder</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Where the same stop loss lands your targets at other risk-reward ratios.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Ratio</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Target price</th>
                    <th scope="col" className="py-2 text-right font-semibold">Profit on {num(calc.qty)}</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.levels.map((level) => (
                    <tr key={level.ratio} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">1 : {num(level.ratio)}</td>
                      <td className="py-2 pr-3 text-right">{money(level.price)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{money0(level.gain)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not investment advice. Real fills can slip past your stop in a gap or a
        fast market, and brokerage plus taxes reduce the net reward — plan for a slightly worse
        outcome than the arithmetic here.
      </p>
    </main>
  );
}
