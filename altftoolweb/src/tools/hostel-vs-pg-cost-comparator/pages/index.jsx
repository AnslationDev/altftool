"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import { compareHostelVsPg } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const FIELD_DEFS = [
  { id: "rent", label: "Rent / fee (per month)" },
  { id: "food", label: "Mess / food (per month)" },
  { id: "utilities", label: "Electricity, wifi, laundry (per month)" },
  { id: "travel", label: "Commute from this stay (per month)" },
  { id: "oneTime", label: "Non-refundable one-time (admission, brokerage)" },
  { id: "deposit", label: "Refundable security deposit" },
];

const DEFAULTS = {
  months: "10",
  hostel: { rent: "5000", food: "3000", utilities: "0", travel: "500", oneTime: "2000", deposit: "5000" },
  pg: { rent: "7000", food: "3000", utilities: "800", travel: "200", oneTime: "7000", deposit: "14000" },
};

const VERDICT = {
  hostel: "The hostel works out cheaper",
  pg: "The PG works out cheaper",
  equal: "Both cost the same over the stay",
};

export default function ToolHome() {
  const [months, setMonths] = useState(DEFAULTS.months);
  const [hostel, setHostel] = useState(DEFAULTS.hostel);
  const [pg, setPg] = useState(DEFAULTS.pg);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareHostelVsPg({
        months: months.trim() === "" ? Number.NaN : Number(months),
        hostel,
        pg,
      }),
    [months, hostel, pg],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Hostel vs PG over ${result.months} months`,
      `Hostel: ${money(result.hostel.total)} total (${money(result.hostel.effectiveMonthly)}/month), upfront cash ${money(result.hostel.upfrontCash)}`,
      `PG: ${money(result.pg.total)} total (${money(result.pg.effectiveMonthly)}/month), upfront cash ${money(result.pg.upfrontCash)}`,
      `${VERDICT[result.cheaper]} — difference ${money(result.difference)} (${money(result.differencePerMonth)}/month)`,
    ].join("\n");
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
    setMonths(DEFAULTS.months);
    setHostel(DEFAULTS.hostel);
    setPg(DEFAULTS.pg);
    setCopied(false);
  };

  const renderOption = (title, prefix, values, setValues) => (
    <fieldset className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {title}
      </legend>
      <div className="space-y-3">
        {FIELD_DEFS.map((field) => (
          <div key={field.id}>
            <label className={LABEL_CLASS} htmlFor={`${prefix}-${field.id}`}>
              {field.label} (INR)
            </label>
            <input
              id={`${prefix}-${field.id}`}
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={values[field.id] ?? ""}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.id]: event.target.value }))
              }
            />
          </div>
        ))}
      </div>
    </fieldset>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hostel vs PG Cost Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare the full cost of both stays — rent, food, utilities, commute and one-time
          charges — over your planned duration. Refundable deposits are tracked as locked-up cash,
          not cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="hpg-months">
            Planned stay (months)
          </label>
          <input
            id="hpg-months"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="1"
            max="72"
            step="1"
            value={months}
            onChange={(event) => setMonths(event.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {renderOption("Hostel", "hpg-h", hostel, setHostel)}
          {renderOption("PG", "hpg-p", pg, setPg)}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Difference over the stay
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.difference)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the comparison." : VERDICT[result.cheaper]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the hostel vs PG comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Figure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Hostel
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  PG
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError
                ? [
                    ["Monthly recurring", DASH, DASH],
                    ["Total over the stay", DASH, DASH],
                    ["Effective per month", DASH, DASH],
                    ["Upfront cash needed", DASH, DASH],
                  ]
                : [
                    [
                      "Monthly recurring",
                      money(result.hostel.monthlyRecurring),
                      money(result.pg.monthlyRecurring),
                    ],
                    ["Total over the stay", money(result.hostel.total), money(result.pg.total)],
                    [
                      "Effective per month",
                      money(result.hostel.effectiveMonthly),
                      money(result.pg.effectiveMonthly),
                    ],
                    [
                      "Upfront cash needed (incl. deposit)",
                      money(result.hostel.upfrontCash),
                      money(result.pg.upfrontCash),
                    ],
                    [
                      "Refundable deposit (returned later)",
                      money(result.hostel.deposit),
                      money(result.pg.deposit),
                    ],
                  ]
              ).map(([label, h, p]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{h}</td>
                  <td className="py-2 text-right font-semibold">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Deposits are assumed fully refundable — deductions at move-out effectively raise the true
        cost. Factor in non-money differences too: curfews, food quality, room sharing and
        distance from campus.
      </p>
    </main>
  );
}
