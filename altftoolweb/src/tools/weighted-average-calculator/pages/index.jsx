"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, label: "Assignments", value: "88", weight: "20" },
  { id: 2, label: "Mid-term", value: "74", weight: "30" },
  { id: 3, label: "Final exam", value: "81", weight: "50" },
];

const num4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const updateRow = (id, field, value) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId, label: `Item ${prev.length + 1}`, value: "", weight: "" },
    ]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setNextId(4);
  };

  const result = useMemo(() => {
    const errors = [];
    const items = [];
    let sumWeights = 0;
    let sumProducts = 0;

    rows.forEach((row, index) => {
      const label = row.label.trim() || `Item ${index + 1}`;
      if (row.value === "" || row.weight === "") return;

      const value = Number(row.value);
      const weight = Number(row.weight);

      if (!Number.isFinite(value) || !Number.isFinite(weight)) {
        errors.push(`${label}: value and weight must be numbers.`);
        return;
      }
      if (weight < 0) {
        errors.push(`${label}: weight cannot be negative.`);
        return;
      }

      sumWeights += weight;
      sumProducts += value * weight;
      items.push({ id: row.id, label, value, weight, product: value * weight });
    });

    if (items.length > 0 && sumWeights <= 0) {
      errors.push("Total weight is 0, so a weighted average cannot be calculated.");
    }

    const ready = items.length > 0 && sumWeights > 0 && errors.length === 0;
    const weighted = ready ? sumProducts / sumWeights : 0;
    const simple = items.length > 0 ? items.reduce((a, i) => a + i.value, 0) / items.length : 0;

    return {
      errors,
      items: items.map((item) => ({
        ...item,
        share: sumWeights > 0 ? (item.weight / sumWeights) * 100 : 0,
        contribution: sumWeights > 0 ? (item.product / sumWeights) : 0,
      })),
      sumWeights,
      sumProducts,
      weighted,
      simple,
      ready,
    };
  }, [rows]);

  const copyResult = async () => {
    if (!result.ready) return;
    const text = [
      "Weighted Average Calculator",
      `Weighted average: ${num4.format(result.weighted)}`,
      `Sum of (value x weight): ${num4.format(result.sumProducts)}`,
      `Sum of weights: ${num4.format(result.sumWeights)}`,
      `Unweighted mean: ${num4.format(result.simple)}`,
      "",
      "Items:",
      ...result.items.map(
        (i) =>
          `- ${i.label}: value ${num4.format(i.value)}, weight ${num4.format(i.weight)} (${num2.format(i.share)}% share), contributes ${num4.format(i.contribution)}`
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Scale className="h-4 w-4" aria-hidden="true" />
            Statistics
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Weighted Average Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Enter value and weight pairs to get the weighted mean: the sum of value x weight divided
            by the sum of the weights. Weights need not add up to 100 - they are normalised for you.
          </p>
        </header>

        <section
          aria-label="Value and weight pairs"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label
                    htmlFor={`label-${row.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Item {index + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove item ${index + 1}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <input
                  id={`label-${row.id}`}
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(row.id, "label", e.target.value)}
                  placeholder="Label"
                  className={INPUT_CLASS}
                />

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`value-${row.id}`} className="mb-1 block text-sm font-medium">
                      Value
                    </label>
                    <input
                      id={`value-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, "value", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor={`weight-${row.id}`} className="mb-1 block text-sm font-medium">
                      Weight
                    </label>
                    <input
                      id={`weight-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={row.weight}
                      onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={addRow} className={PRIMARY_BTN}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add item
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all items to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        {result.errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 space-y-1 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <section
          aria-label="Weighted average result"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Weighted average
              </p>
              <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
                {result.ready ? num4.format(result.weighted) : "--"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.ready
                  ? `Unweighted mean would be ${num4.format(result.simple)}`
                  : "Enter at least one value and a weight above 0."}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={!result.ready}
              aria-label="Copy weighted average result to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Sum of value x weight</dt>
              <dd className="font-semibold">{num4.format(result.sumProducts)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Sum of weights</dt>
              <dd className="font-semibold">{num4.format(result.sumWeights)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Items counted</dt>
              <dd className="font-semibold">{result.items.length}</dd>
            </div>
          </dl>

          {result.items.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Running contribution to the average
              </p>
              <ul className="space-y-2">
                {result.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-semibold">+{num4.format(item.contribution)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                      <span>
                        value {num4.format(item.value)} x weight {num4.format(item.weight)}
                      </span>
                      <span>{num2.format(item.share)}% of total weight</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${Math.min(100, Math.max(0, item.share))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
            Formula: weighted average = sum(value x weight) / sum(weight). The contribution column
            shows each item&apos;s share of the final figure, and they add up to the result.
          </p>
        </section>
      </div>
    </main>
  );
}
