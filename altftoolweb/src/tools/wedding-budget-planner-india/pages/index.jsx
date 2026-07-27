"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw, Scale } from "lucide-react";

import {
  DEFAULT_CATEGORIES,
  DEFAULT_CONTINGENCY_PCT,
  TAX_PRESETS,
  normaliseShares,
  planWeddingBudget,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const buildCategories = () =>
  DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    sharePct: String(category.sharePct),
    quoted: "",
  }));

export default function ToolHome() {
  const [budget, setBudget] = useState("2500000");
  const [contingency, setContingency] = useState(String(DEFAULT_CONTINGENCY_PCT));
  const [guests, setGuests] = useState("400");
  const [perPlate, setPerPlate] = useState("1200");
  const [tax, setTax] = useState("5");
  const [categories, setCategories] = useState(buildCategories);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planWeddingBudget({
        totalBudget: budget,
        categories,
        contingencyPct: contingency,
        guests,
        perPlate,
        taxPct: tax,
      }),
    [budget, categories, contingency, guests, perPlate, tax],
  );

  const hasError = Boolean(result.error);

  const updateCategory = (key, patch) =>
    setCategories((current) =>
      current.map((category) => (category.key === key ? { ...category, ...patch } : category)),
    );

  const rebalance = () =>
    setCategories((current) =>
      normaliseShares(current).map((category) => ({
        ...category,
        sharePct: String(category.sharePct),
      })),
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Wedding Budget Planner",
      `Total budget: ${money(result.totalBudget)}`,
      `Contingency held back: ${money(result.contingencyAmount)} (${pct(result.contingencyPct)})`,
      `Allocatable: ${money(result.allocatable)}`,
      result.costPerGuest === null
        ? null
        : `Cost per guest: ${money(result.costPerGuest)} across ${result.guests} guests`,
      result.affordablePlate === null
        ? null
        : `Affordable per-plate rate: ${money(result.affordablePlate)} before ${pct(result.taxPct)} tax`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.label}: ${pct(row.sharePct)} = ${money(row.allocation)}${row.quoted > 0 ? ` (quoted ${money(row.quoted)}, ${row.variance > 0 ? "over" : "under"} by ${money(Math.abs(row.variance))})` : ""}`,
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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

  const reset = () => {
    setBudget("2500000");
    setContingency(String(DEFAULT_CONTINGENCY_PCT));
    setGuests("400");
    setPerPlate("1200");
    setTax("5");
    setCategories(buildCategories());
    setCopied(false);
  };

  const numberFields = [
    { id: "wb-budget", label: "Total wedding budget (₹)", value: budget, set: setBudget, step: "50000" },
    { id: "wb-contingency", label: "Contingency held back (%)", value: contingency, set: setContingency, step: "1" },
    { id: "wb-guests", label: "Number of guests", value: guests, set: setGuests, step: "10" },
    { id: "wb-plate", label: "Per-plate rate quoted (₹)", value: perPlate, set: setPerPlate, step: "50" },
  ];

  const rows = hasError
    ? [
        ["Contingency held back", DASH],
        ["Allocatable across heads", DASH],
        ["Committed by quotes", DASH],
        ["Left to commit", DASH],
        ["Cost per guest", DASH],
        ["Catering at your plate rate", DASH],
        ["Per-plate rate you can afford", DASH],
      ]
    : [
        ["Contingency held back", `${money(result.contingencyAmount)} (${pct(result.contingencyPct)})`],
        ["Allocatable across heads", money(result.allocatable)],
        ["Committed by quotes", `${money(result.totalQuoted)} (${pct(result.committedPct)})`],
        ["Left to commit", money(result.remaining)],
        [
          "Cost per guest",
          result.costPerGuest === null ? "Add a guest count" : money(result.costPerGuest),
        ],
        [
          "Catering at your plate rate",
          result.guests > 0 ? money(result.cateringEstimate) : "Add a guest count",
        ],
        [
          "Per-plate rate you can afford",
          result.affordablePlate === null
            ? "Add a guest count"
            : `${money(result.affordablePlate)} before tax`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Wedding budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wedding Budget Planner India</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a wedding budget across venue, catering, jewellery, travel and the rest, hold back a
          contingency, and convert the catering allocation into the per-plate rate you can actually
          hold a caterer to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wb-tax">
              Tax and service charge on catering
            </label>
            <select
              id="wb-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tax}
              onChange={(event) => setTax(event.target.value)}
            >
              {TAX_PRESETS.map((preset) => (
                <option key={preset.value} value={String(preset.value)}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Shares and quotes</h2>
          <button type="button" onClick={rebalance} className={GHOST_BTN}>
            <Scale className="h-4 w-4" aria-hidden="true" />
            Rebalance to 100%
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {categories.map((category) => (
            <div key={category.key} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <p className="text-sm font-semibold">{category.label}</p>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`wb-share-${category.key}`}>
                  Share %
                </label>
                <input
                  id={`wb-share-${category.key}`}
                  className={`mt-1 ${INPUT_CLASS} sm:w-28`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={category.sharePct}
                  onChange={(event) => updateCategory(category.key, { sharePct: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`wb-quote-${category.key}`}>
                  Quoted (₹)
                </label>
                <input
                  id={`wb-quote-${category.key}`}
                  className={`mt-1 ${INPUT_CLASS} sm:w-40`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5000"
                  placeholder="0"
                  value={category.quoted}
                  onChange={(event) => updateCategory(category.key, { quoted: event.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Left to commit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.remaining)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the allocation." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy wedding budget allocation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy budget"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${pct(result.committedPct)} of the budget is committed`}
            >
              <span
                className={`block h-full ${result.overBudget ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${Math.max(0, Math.min(100, result.committedPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {pct(result.committedPct)} of the total budget is committed by the quotes entered.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.cateringGap !== null && result.guests > 0 && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.cateringOverBudget
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.cateringOverBudget
              ? `Catering runs ${money(result.cateringGap)} over its allocation — cut the guest list or negotiate the plate rate below ${money(result.affordablePlate)}.`
              : `Catering fits with ${money(Math.abs(result.cateringGap))} to spare against its allocation.`}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Allocation head by head</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Head</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Allocation</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Quoted</th>
                  <th scope="col" className="py-2 text-right font-semibold">Variance</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(row.sharePct)}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.allocation)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.quoted > 0 ? money(row.quoted) : DASH}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.quoted > 0 && row.overBudget ? "text-[var(--danger)]" : ""
                      }`}
                    >
                      {row.quoted > 0 ? money(row.variance) : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The default shares are a conventional planning split you should edit, not a recommendation on
        what to spend. Confirm the tax rate on your own contract — outdoor catering and a hotel
        banquet package are taxed differently. Informational only.
      </p>
    </main>
  );
}
