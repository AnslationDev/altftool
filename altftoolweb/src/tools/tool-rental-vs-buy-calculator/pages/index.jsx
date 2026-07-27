"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import {
  DEFAULT_HORIZON_YEARS,
  DEFAULT_OPPORTUNITY_RATE_PCT,
  compareRentVsBuy,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULTS = {
  dayRate: "400",
  daysPerHire: "2",
  hiresPerYear: "3",
  costPerTrip: "150",
  purchasePrice: "12000",
  upkeep: "500",
  storage: "0",
  resale: "40",
  horizon: String(DEFAULT_HORIZON_YEARS),
  opportunity: String(DEFAULT_OPPORTUNITY_RATE_PCT),
  consumables: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const VERDICT = {
  rent: "Rent it",
  buy: "Buy it",
  either: "Line ball",
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      compareRentVsBuy({
        dayRate: toNum(values.dayRate),
        daysPerHire: toNum(values.daysPerHire),
        hiresPerYear: toNum(values.hiresPerYear),
        costPerTrip: toNum(values.costPerTrip),
        purchasePrice: toNum(values.purchasePrice),
        upkeepPerYear: toNum(values.upkeep),
        storagePerYear: toNum(values.storage),
        resalePercent: toNum(values.resale),
        horizonYears: toNum(values.horizon),
        opportunityRatePct: toNum(values.opportunity),
        consumablesPerDay: toNum(values.consumables),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Usage days over the horizon", DASH],
        ["Collection and return trips", DASH],
        ["Rent — hire charges", DASH],
        ["Rent — trip costs", DASH],
        ["Rent — total", DASH],
        ["Buy — purchase price", DASH],
        ["Buy — servicing", DASH],
        ["Buy — storage", DASH],
        ["Buy — cost of capital", DASH],
        ["Buy — resale recovered", DASH],
        ["Buy — total", DASH],
        ["Consumables (both options)", DASH],
        ["Cost per usage day — rent", DASH],
        ["Cost per usage day — buy", DASH],
        ["Break-even usage", DASH],
      ]
    : [
        ["Usage days over the horizon", `${num1(result.usageDays)} days`],
        ["Collection and return trips", `${num1(result.trips)}`],
        ["Rent — hire charges", money(result.rentHireCost)],
        ["Rent — trip costs", money(result.rentTripCost)],
        ["Rent — total", money(result.rentTotal)],
        ["Buy — purchase price", money(result.purchasePrice)],
        ["Buy — servicing", money(result.upkeep)],
        ["Buy — storage", money(result.storage)],
        ["Buy — cost of capital", money(result.capitalCost)],
        ["Buy — resale recovered", `-${money(result.resaleValue)}`],
        ["Buy — total", money(result.buyTotal)],
        ["Consumables (both options)", money(result.consumables)],
        ["Cost per usage day — rent", money2(result.rentPerUsageDay)],
        ["Cost per usage day — buy", money2(result.buyPerUsageDay)],
        [
          "Break-even usage",
          result.breakEvenDays === null
            ? "no crossover"
            : `${num1(result.breakEvenDays)} days${
                result.breakEvenYears === null ? "" : ` (about ${num1(result.breakEvenYears)} years at this rate)`
              }`,
        ],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tool Rental vs Buy Calculator",
      `Verdict: ${VERDICT[result.cheaper]} — ${money(result.saving)} cheaper over ${toNum(values.horizon)} years`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ...result.notes.map((note) => `Note: ${note}`),
    ].join("\n");
  }, [hasError, result, rows, values.horizon]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const rentFields = [
    ["trb-dayrate", "Hire rate (₹ per day)", "dayRate", "10"],
    ["trb-days", "Days per hire", "daysPerHire", "0.5"],
    ["trb-hires", "Jobs per year", "hiresPerYear", "1"],
    ["trb-trip", "Collection and return cost per hire (₹)", "costPerTrip", "10"],
  ];

  const buyFields = [
    ["trb-price", "Purchase price (₹)", "purchasePrice", "500"],
    ["trb-upkeep", "Servicing per year (₹)", "upkeep", "50"],
    ["trb-storage", "Storage per year (₹)", "storage", "50"],
    ["trb-resale", "Resale value at the end (% of price)", "resale", "5"],
  ];

  const sharedFields = [
    ["trb-horizon", "Horizon (years)", "horizon", "1"],
    ["trb-opportunity", "Return your money would earn (% per year)", "opportunity", "0.5"],
    ["trb-consumables", "Consumables per usage day (₹)", "consumables", "10"],
  ];

  const groups = [
    ["Renting", rentFields],
    ["Buying", buyFields],
    ["Both options", sharedFields],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Break-even
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tool Rental vs Buy Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Owning is mostly a fixed cost, hiring is entirely a variable one. The question is only
          ever how many days you will really use it — this puts a number on that crossover.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {groups.map(([title, fields], groupIndex) => (
          <div
            key={title}
            className={groupIndex === 0 ? "" : "mt-5 border-t border-[var(--border)] pt-5"}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              {title}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {fields.map(([id, label, key, step]) => (
                <div key={id}>
                  <label className={LABEL_CLASS} htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={step}
                    value={values[key]}
                    onChange={set(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheaper option over your horizon
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : VERDICT[result.cheaper]}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the comparison."
                : result.cheaper === "either"
                  ? "The two options cost the same on these numbers."
                  : `${money(result.saving)} cheaper — ${money(result.rentTotal)} to rent against ${money(result.buyTotal)} to own`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy rent versus buy comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Cost only — it does not price convenience, the risk of a hire shop being closed on the
        morning you need the tool, or the safety training that comes with a supervised hire. Damage
        waivers, refundable deposits and late-return penalties vary by hire company; read the
        agreement before signing.
      </p>
    </main>
  );
}
