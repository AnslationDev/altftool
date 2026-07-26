"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Minus, Percent, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  mode: "change",
  oldValue: "250",
  newValue: "310",
  baseValue: "1200",
  percent: "18",
  direction: "increase",
};

const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const percentFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumber = (value) => (Number.isFinite(value) ? numberFormatter.format(value) : "—");
const formatPercent = (value) => (Number.isFinite(value) ? `${percentFormatter.format(value)}%` : "—");

/** Parses a user-typed number, tolerating thousands separators and stray spaces. */
function toNumber(raw) {
  const cleaned = String(raw ?? "").replace(/[,\s]/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [oldValue, setOldValue] = useState(DEFAULTS.oldValue);
  const [newValue, setNewValue] = useState(DEFAULTS.newValue);
  const [baseValue, setBaseValue] = useState(DEFAULTS.baseValue);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "change") {
      const start = toNumber(oldValue);
      const end = toNumber(newValue);

      if (start === null || end === null) {
        return { error: "Enter a number in both the original and new value fields." };
      }
      if (start === 0) {
        return {
          error:
            "Percentage change from 0 is undefined — any increase from zero is infinite in percentage terms. Use the difference instead.",
        };
      }

      const difference = end - start;
      const changePercent = (difference / Math.abs(start)) * 100;
      const isIncrease = difference > 0;
      const isFlat = difference === 0;
      const multiplier = end / start;

      return {
        error: null,
        headline: `${isFlat ? "" : isIncrease ? "+" : "−"}${percentFormatter.format(Math.abs(changePercent))}%`,
        label: isFlat ? "No change" : isIncrease ? "Percentage increase" : "Percentage decrease",
        isIncrease,
        isFlat,
        rows: [
          ["Original value", formatNumber(start)],
          ["New value", formatNumber(end)],
          ["Absolute difference", `${difference >= 0 ? "+" : "−"}${formatNumber(Math.abs(difference))}`],
          ["Change", `${formatPercent(Math.abs(changePercent))} ${isFlat ? "(unchanged)" : isIncrease ? "increase" : "decrease"}`],
          ["Multiplier", `${numberFormatter.format(multiplier)}×`],
          [
            "Reverse change",
            end === 0
              ? "Undefined (new value is 0)"
              : `${formatPercent(Math.abs(((start - end) / Math.abs(end)) * 100))} to get back`,
          ],
        ],
        formula: "((new − original) ÷ |original|) × 100",
        summary: [
          "Percentage Increase / Decrease",
          `Original: ${formatNumber(start)}`,
          `New: ${formatNumber(end)}`,
          `Difference: ${difference >= 0 ? "+" : "−"}${formatNumber(Math.abs(difference))}`,
          `Change: ${formatPercent(Math.abs(changePercent))} ${isFlat ? "(no change)" : isIncrease ? "increase" : "decrease"}`,
        ].join("\n"),
      };
    }

    const base = toNumber(baseValue);
    const pct = toNumber(percent);

    if (base === null || pct === null) {
      return { error: "Enter a starting value and a percentage." };
    }

    const signed = direction === "increase" ? pct : -pct;
    const delta = (base * signed) / 100;
    const final = base + delta;

    return {
      error: null,
      headline: formatNumber(final),
      label: `${formatPercent(Math.abs(pct))} ${direction} applied`,
      isIncrease: direction === "increase",
      isFlat: pct === 0,
      rows: [
        ["Starting value", formatNumber(base)],
        ["Percentage applied", `${direction === "increase" ? "+" : "−"}${formatPercent(Math.abs(pct))}`],
        ["Amount of change", `${delta >= 0 ? "+" : "−"}${formatNumber(Math.abs(delta))}`],
        ["Final value", formatNumber(final)],
        ["Multiplier", `${numberFormatter.format(1 + signed / 100)}×`],
      ],
      formula:
        direction === "increase"
          ? "value × (1 + percent ÷ 100)"
          : "value × (1 − percent ÷ 100)",
      summary: [
        "Apply a Percentage Change",
        `Starting value: ${formatNumber(base)}`,
        `Applied: ${direction === "increase" ? "+" : "−"}${formatPercent(Math.abs(pct))}`,
        `Change: ${delta >= 0 ? "+" : "−"}${formatNumber(Math.abs(delta))}`,
        `Final value: ${formatNumber(final)}`,
      ].join("\n"),
    };
  }, [mode, oldValue, newValue, baseValue, percent, direction]);

  const handleCopy = async () => {
    if (result.error) return;
    const ok = await safeCopyText(result.summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleReset = () => {
    setMode(DEFAULTS.mode);
    setOldValue(DEFAULTS.oldValue);
    setNewValue(DEFAULTS.newValue);
    setBaseValue(DEFAULTS.baseValue);
    setPercent(DEFAULTS.percent);
    setDirection(DEFAULTS.direction);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  const tabClass = (active) =>
    `min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
      active
        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
        : "border border-[var(--border)] text-[var(--muted-foreground)]"
    }`;

  const DirectionIcon = result.isFlat ? Minus : result.isIncrease ? TrendingUp : TrendingDown;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Percent className="h-4 w-4" aria-hidden="true" />
            Percentage change
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Percentage Increase / Decrease Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter an old and a new number to get the percentage change and whether it is an increase or a decrease — or
            switch tabs to apply a percentage rise or cut to any starting value.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Calculation mode">
              <button type="button" onClick={() => setMode("change")} aria-pressed={mode === "change"} className={tabClass(mode === "change")}>
                Change between two
              </button>
              <button type="button" onClick={() => setMode("apply")} aria-pressed={mode === "apply"} className={tabClass(mode === "apply")}>
                Apply a percentage
              </button>
            </div>

            {mode === "change" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pid-old" className="mb-1.5 block text-sm font-semibold">
                    Original value
                  </label>
                  <input
                    id="pid-old"
                    type="text"
                    inputMode="decimal"
                    value={oldValue}
                    onChange={(event) => setOldValue(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="pid-new" className="mb-1.5 block text-sm font-semibold">
                    New value
                  </label>
                  <input
                    id="pid-new"
                    type="text"
                    inputMode="decimal"
                    value={newValue}
                    onChange={(event) => setNewValue(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pid-base" className="mb-1.5 block text-sm font-semibold">
                      Starting value
                    </label>
                    <input
                      id="pid-base"
                      type="text"
                      inputMode="decimal"
                      value={baseValue}
                      onChange={(event) => setBaseValue(event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="pid-percent" className="mb-1.5 block text-sm font-semibold">
                      Percentage (%)
                    </label>
                    <input
                      id="pid-percent"
                      type="text"
                      inputMode="decimal"
                      value={percent}
                      onChange={(event) => setPercent(event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold">Direction</span>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Direction of change">
                    <button
                      type="button"
                      onClick={() => setDirection("increase")}
                      aria-pressed={direction === "increase"}
                      className={tabClass(direction === "increase")}
                    >
                      Increase
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("decrease")}
                      aria-pressed={direction === "decrease"}
                      className={tabClass(direction === "decrease")}
                    >
                      Decrease
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={Boolean(result.error)}
                aria-label="Copy the result to clipboard"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {result.error ? (
              <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {result.error}
              </div>
            ) : (
              <>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  <DirectionIcon
                    className={`h-4 w-4 ${
                      result.isFlat
                        ? "text-[var(--muted-foreground)]"
                        : result.isIncrease
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                    }`}
                    aria-hidden="true"
                  />
                  {result.label}
                </p>
                <p className="mt-1 break-words text-4xl font-semibold tracking-tight text-[var(--primary)] sm:text-5xl">
                  {result.headline}
                </p>

                {mode === "change" ? (
                  <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">{formatNumber(toNumber(oldValue))}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    <span className="font-semibold text-[var(--foreground)]">{formatNumber(toNumber(newValue))}</span>
                  </p>
                ) : null}

                <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                  {result.rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right text-sm font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: {result.formula}
                </p>
                {mode === "change" ? (
                  <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    A percentage rise and the matching fall are not symmetrical: adding 50% then removing 50% leaves you
                    below where you started, which is why the reverse-change row is listed separately.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
