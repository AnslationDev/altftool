"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PieChart, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MODES = [
  { id: "percent", label: "X is what % of Y?", hint: "Find the percentage" },
  { id: "part", label: "What is X% of Y?", hint: "Find the part" },
  { id: "total", label: "X is Y% of what?", hint: "Find the total" },
];

const DEFAULTS = {
  mode: "percent",
  part: "45",
  total: "180",
  percent: "25",
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
  const [part, setPart] = useState(DEFAULTS.part);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const partValue = toNumber(part);
    const totalValue = toNumber(total);
    const percentValue = toNumber(percent);

    if (mode === "percent") {
      if (partValue === null || totalValue === null) {
        return { error: "Enter both the part and the total." };
      }
      if (totalValue === 0) {
        return { error: "The total cannot be zero — dividing by zero has no percentage answer." };
      }

      const pct = (partValue / totalValue) * 100;
      const remainder = totalValue - partValue;

      return {
        error: null,
        headline: formatPercent(pct),
        caption: `${formatNumber(partValue)} out of ${formatNumber(totalValue)}`,
        fillPercent: pct,
        rows: [
          ["Part", formatNumber(partValue)],
          ["Total", formatNumber(totalValue)],
          ["Percentage of total", formatPercent(pct)],
          ["Remaining amount", formatNumber(remainder)],
          ["Remaining percentage", formatPercent(100 - pct)],
          ["As a fraction", `${numberFormatter.format(partValue / totalValue)} of 1`],
        ],
        formula: "(part ÷ total) × 100",
        summary: [
          "Percentage of Total",
          `Part: ${formatNumber(partValue)}`,
          `Total: ${formatNumber(totalValue)}`,
          `Result: ${formatPercent(pct)} of the total`,
          `Remaining: ${formatNumber(remainder)} (${formatPercent(100 - pct)})`,
        ].join("\n"),
      };
    }

    if (mode === "part") {
      if (percentValue === null || totalValue === null) {
        return { error: "Enter both a percentage and a total." };
      }

      const computedPart = (percentValue / 100) * totalValue;
      const remainder = totalValue - computedPart;

      return {
        error: null,
        headline: formatNumber(computedPart),
        caption: `${formatPercent(percentValue)} of ${formatNumber(totalValue)}`,
        fillPercent: percentValue,
        rows: [
          ["Percentage", formatPercent(percentValue)],
          ["Total", formatNumber(totalValue)],
          ["Part (answer)", formatNumber(computedPart)],
          ["Remaining amount", formatNumber(remainder)],
          ["Remaining percentage", formatPercent(100 - percentValue)],
        ],
        formula: "(percent ÷ 100) × total",
        summary: [
          "Percentage of Total — find the part",
          `Percentage: ${formatPercent(percentValue)}`,
          `Total: ${formatNumber(totalValue)}`,
          `Result: ${formatNumber(computedPart)}`,
        ].join("\n"),
      };
    }

    if (partValue === null || percentValue === null) {
      return { error: "Enter both the part and the percentage it represents." };
    }
    if (percentValue === 0) {
      return { error: "The percentage cannot be zero — no total can make a non-zero part equal 0%." };
    }

    const computedTotal = (partValue / percentValue) * 100;
    const remainder = computedTotal - partValue;

    return {
      error: null,
      headline: formatNumber(computedTotal),
      caption: `${formatNumber(partValue)} is ${formatPercent(percentValue)} of this total`,
      fillPercent: percentValue,
      rows: [
        ["Part", formatNumber(partValue)],
        ["Percentage it represents", formatPercent(percentValue)],
        ["Total (answer)", formatNumber(computedTotal)],
        ["Rest of the total", formatNumber(remainder)],
        ["Rest as a percentage", formatPercent(100 - percentValue)],
      ],
      formula: "(part ÷ percent) × 100",
      summary: [
        "Percentage of Total — find the total",
        `Part: ${formatNumber(partValue)}`,
        `Percentage: ${formatPercent(percentValue)}`,
        `Result: total is ${formatNumber(computedTotal)}`,
      ].join("\n"),
    };
  }, [mode, part, total, percent]);

  const handleCopy = async () => {
    if (result.error) return;
    const ok = await safeCopyText(result.summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleReset = () => {
    setMode(DEFAULTS.mode);
    setPart(DEFAULTS.part);
    setTotal(DEFAULTS.total);
    setPercent(DEFAULTS.percent);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  const barWidth = result.error
    ? 0
    : Math.max(0, Math.min(100, Number.isFinite(result.fillPercent) ? result.fillPercent : 0));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <PieChart className="h-4 w-4" aria-hidden="true" />
            Share of a total
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Percentage of Total Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out what percent one number is of another — marks out of a maximum, spend against a budget, one
            category inside a bigger figure — and run the reverse lookups when the part or the total is the unknown.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-2" role="group" aria-label="Choose which value to solve for">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  aria-pressed={mode === item.id}
                  className={`min-h-11 rounded-md px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    mode === item.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`block text-xs font-normal ${
                      mode === item.id ? "text-[var(--primary-foreground)]/80" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {mode !== "part" ? (
                <div>
                  <label htmlFor="pot-part" className="mb-1.5 block text-sm font-semibold">
                    Part (the smaller number)
                  </label>
                  <input
                    id="pot-part"
                    type="text"
                    inputMode="decimal"
                    value={part}
                    onChange={(event) => setPart(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}

              {mode !== "percent" ? (
                <div>
                  <label htmlFor="pot-percent" className="mb-1.5 block text-sm font-semibold">
                    Percentage (%)
                  </label>
                  <input
                    id="pot-percent"
                    type="text"
                    inputMode="decimal"
                    value={percent}
                    onChange={(event) => setPercent(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}

              {mode !== "total" ? (
                <div>
                  <label htmlFor="pot-total" className="mb-1.5 block text-sm font-semibold">
                    Total (the whole)
                  </label>
                  <input
                    id="pot-total"
                    type="text"
                    inputMode="decimal"
                    value={total}
                    onChange={(event) => setTotal(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}
            </div>

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
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {MODES.find((item) => item.id === mode)?.hint}
                </p>
                <p className="mt-1 break-words text-4xl font-semibold tracking-tight text-[var(--primary)] sm:text-5xl">
                  {result.headline}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{result.caption}</p>

                <div
                  className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`Share of the total: ${percentFormatter.format(barWidth)} percent`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

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
                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  A part larger than its total gives a result above 100%, which is valid — the progress bar simply caps
                  at full.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
