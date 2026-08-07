"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";
import { ASSET_TYPES, NO_PAN_RATE, computeTds194I, getAssetType } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const FY_OPTIONS = [
  { value: 2025, label: "FY 2025-26 onwards (Rs 50,000 per month)" },
  { value: 2024, label: "FY 2024-25 or earlier (Rs 2,40,000 per year)" },
];

const DEFAULTS = {
  rent: "80000",
  months: "12",
  assetType: "land-building",
  fyStartYear: 2025,
  panFurnished: true,
  payerCovered: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [assetType, setAssetType] = useState(DEFAULTS.assetType);
  const [fyStartYear, setFyStartYear] = useState(DEFAULTS.fyStartYear);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [payerCovered, setPayerCovered] = useState(DEFAULTS.payerCovered);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194I({
        monthlyRent: toNumber(rent),
        months: toNumber(months),
        assetType,
        fyStartYear,
        panFurnished,
        payerCovered,
      }),
    [rent, months, assetType, fyStartYear, panFurnished, payerCovered],
  );

  const asset = getAssetType(assetType);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194-I TDS on rent",
      `Asset let out: ${result.assetLabel}`,
      `Monthly rent: ${money(result.monthlyRent)} for ${result.months} month(s)`,
      `Rent for the period: ${money(result.annualRent)}`,
      `Threshold: ${result.thresholdLabel}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS per month: ${money(result.tdsPerMonth)}`,
      `TDS for the period: ${money(result.tdsForPeriod)}`,
      `Net rent per month: ${money(result.netMonthlyRent)}`,
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
    setRent(DEFAULTS.rent);
    setMonths(DEFAULTS.months);
    setAssetType(DEFAULTS.assetType);
    setFyStartYear(DEFAULTS.fyStartYear);
    setPanFurnished(DEFAULTS.panFurnished);
    setPayerCovered(DEFAULTS.payerCovered);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Section 194-I
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Rent (Section 194-I)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the rent TDS a business must deduct — 10% on land, buildings, furniture and
          fittings, 2% on plant, machinery and equipment — against the Rs 50,000 a month threshold
          that replaced the old Rs 2,40,000 annual limit on 1 April 2025.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="i-asset">
              What is let out
            </label>
            <select
              id="i-asset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assetType}
              onChange={(event) => setAssetType(event.target.value)}
            >
              {ASSET_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} &mdash; {item.rate}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{asset.note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="i-rent">
              Monthly rent, excluding GST (INR)
            </label>
            <input
              id="i-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
            />
            <p className={HINT_CLASS}>GST shown separately is left out of the base.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="i-months">
              Months of rent in this financial year
            </label>
            <input
              id="i-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
            <p className={HINT_CLASS}>A part of a month counts as a whole month.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="i-fy">
              Financial year
            </label>
            <select
              id="i-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartYear}
              onChange={(event) => setFyStartYear(Number(event.target.value))}
            >
              {FY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="i-pan">
              <input
                id="i-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Landlord has furnished a valid PAN
            </label>
            <p className={HINT_CLASS}>Without PAN, section 206AA forces {NO_PAN_RATE}%.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="i-covered">
              <input
                id="i-covered"
                type="checkbox"
                className={CHECKBOX}
                checked={payerCovered}
                onChange={(event) => setPayerCovered(event.target.checked)}
              />
              Tenant must deduct under 194-I
            </label>
            <p className={HINT_CLASS}>
              Untick for an individual or HUF not audited under section 44AB.
            </p>
          </div>
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS on each month&rsquo;s rent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tdsPerMonth)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the deduction." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 194-I rent TDS result"
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Statutory rate for this asset", hasError ? DASH : `${result.statutoryRate}%`],
            ["Threshold in force", hasError ? DASH : result.thresholdLabel],
            ["Monthly rent", hasError ? DASH : money(result.monthlyRent)],
            ["Months counted", hasError ? DASH : String(result.months)],
            ["Rent for the period", hasError ? DASH : money(result.annualRent)],
            ["TDS for the period", hasError ? DASH : money(result.tdsForPeriod)],
            ["Net rent per month", hasError ? DASH : money(result.netMonthlyRent)],
            ["Net rent for the period", hasError ? DASH : money(result.netForPeriod)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.deductionRequired && result.headroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            {result.thresholdBasis === "monthly"
              ? `Rent can rise by ${money(result.headroom)} a month before deduction starts.`
              : `Another ${money(result.headroom)} of rent this year is still within the limit.`}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Points that trip people up</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {[
            "The threshold is per landlord, so joint owners are tested separately on their own share of rent.",
            "A refundable security deposit is not rent; a non-refundable deposit adjusted against rent is.",
            "Warehousing charges, cold storage hire and hoarding rent normally fall under 194-I.",
            "Rent to a business trust for real estate assets it owns is outside 194-I under the second proviso.",
            "A part of a month counts as a full month for the Rs 50,000 test from FY 2025-26.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TDS on rent to a resident carries no surcharge or cess;
        deposit it by the 7th of the following month (30 April for a March deduction) and report it
        in Form 26Q. A landlord can apply under section 197 for a lower or nil deduction
        certificate — confirm your position with a tax professional.
      </p>
    </main>
  );
}
