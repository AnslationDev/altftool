"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  ANNUAL_PT_CEILING,
  KERALA_PT_SLABS,
  LOCAL_BODIES,
  computeKeralaProfessionalTax,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  monthlyGross: "35000",
  monthsFirstHalf: "6",
  monthsSecondHalf: "6",
  extraFirstHalf: "0",
  extraSecondHalf: "0",
  marginalTaxRate: "0",
  localBody: "municipality",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const RELIEF_OPTIONS = [
  { value: "0", label: "No relief / new regime" },
  { value: "5.2", label: "5% + cess" },
  { value: "20.8", label: "20% + cess" },
  { value: "31.2", label: "30% + cess" },
];

export default function ToolHome() {
  const [monthlyGross, setMonthlyGross] = useState(DEFAULTS.monthlyGross);
  const [monthsFirstHalf, setMonthsFirstHalf] = useState(DEFAULTS.monthsFirstHalf);
  const [monthsSecondHalf, setMonthsSecondHalf] = useState(DEFAULTS.monthsSecondHalf);
  const [extraFirstHalf, setExtraFirstHalf] = useState(DEFAULTS.extraFirstHalf);
  const [extraSecondHalf, setExtraSecondHalf] = useState(DEFAULTS.extraSecondHalf);
  const [marginalTaxRate, setMarginalTaxRate] = useState(DEFAULTS.marginalTaxRate);
  const [localBody, setLocalBody] = useState(DEFAULTS.localBody);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeKeralaProfessionalTax({
        monthlyGross: toNumber(monthlyGross),
        monthsFirstHalf: toNumber(monthsFirstHalf),
        monthsSecondHalf: toNumber(monthsSecondHalf),
        extraFirstHalf: toNumber(extraFirstHalf),
        extraSecondHalf: toNumber(extraSecondHalf),
        marginalTaxRate: toNumber(marginalTaxRate),
      }),
    [
      monthlyGross,
      monthsFirstHalf,
      monthsSecondHalf,
      extraFirstHalf,
      extraSecondHalf,
      marginalTaxRate,
    ],
  );

  const hasError = Boolean(result.error);
  const body = LOCAL_BODIES.find((item) => item.key === localBody) || LOCAL_BODIES[1];

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Kerala Professional Tax", `Local body: ${body.label}`];
    result.halves.forEach((half) => {
      lines.push(
        `${half.short}: income ${money(half.income)} (${half.months} month(s)) -> ${money(half.tax)} [${half.slabLabel}]`,
      );
    });
    lines.push(`Annual professional tax: ${money(result.annualTax)}`);
    lines.push(`Effective rate on income: ${pct(result.effectiveRate)}`);
    lines.push(`Net cost after section 16(iii) relief: ${money(result.netCostAfterRelief)}`);
    return lines.join("\n");
  }, [body.label, hasError, result]);

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
    setMonthlyGross(DEFAULTS.monthlyGross);
    setMonthsFirstHalf(DEFAULTS.monthsFirstHalf);
    setMonthsSecondHalf(DEFAULTS.monthsSecondHalf);
    setExtraFirstHalf(DEFAULTS.extraFirstHalf);
    setExtraSecondHalf(DEFAULTS.extraSecondHalf);
    setMarginalTaxRate(DEFAULTS.marginalTaxRate);
    setLocalBody(DEFAULTS.localBody);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["First half (Apr-Sep) tax", DASH],
        ["Second half (Oct-Mar) tax", DASH],
        ["Total income considered", DASH],
        ["Effective rate on income", DASH],
        ["Income-tax saved (section 16(iii))", DASH],
        ["Net cost after tax relief", DASH],
      ]
    : [
        [
          "First half (Apr-Sep) tax",
          `${money(result.halves[0].tax)} on ${money(result.halves[0].income)}`,
        ],
        [
          "Second half (Oct-Mar) tax",
          `${money(result.halves[1].tax)} on ${money(result.halves[1].income)}`,
        ],
        ["Total income considered", money(result.annualIncome)],
        ["Effective rate on income", pct(result.effectiveRate)],
        ["Income-tax saved (section 16(iii))", money(result.incomeTaxSaved)],
        ["Net cost after tax relief", money(result.netCostAfterRelief)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Kerala
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Professional Tax Calculator Kerala
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          In Kerala the tax is collected by your panchayat, municipality or corporation and charged
          on income for each half year — April to September and October to March. Nothing is due
          below {money(12000)} a half year, and the year is capped at {money(ANNUAL_PT_CEILING)}.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-gross">
              Monthly gross pay (INR)
            </label>
            <input
              id="kl-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyGross}
              onChange={(event) => setMonthlyGross(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-body">
              Collecting local body
            </label>
            <select
              id="kl-body"
              className={`mt-2 ${INPUT_CLASS}`}
              value={localBody}
              onChange={(event) => setLocalBody(event.target.value)}
            >
              {LOCAL_BODIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-months-1">
              Months worked Apr-Sep (0-6)
            </label>
            <input
              id="kl-months-1"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={monthsFirstHalf}
              onChange={(event) => setMonthsFirstHalf(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-months-2">
              Months worked Oct-Mar (0-6)
            </label>
            <input
              id="kl-months-2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={monthsSecondHalf}
              onChange={(event) => setMonthsSecondHalf(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-extra-1">
              Bonus / arrears in Apr-Sep (INR)
            </label>
            <input
              id="kl-extra-1"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={extraFirstHalf}
              onChange={(event) => setExtraFirstHalf(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-extra-2">
              Bonus / arrears in Oct-Mar (INR)
            </label>
            <input
              id="kl-extra-2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={extraSecondHalf}
              onChange={(event) => setExtraSecondHalf(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kl-relief">
              Marginal income-tax rate for relief
            </label>
            <select
              id="kl-relief"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marginalTaxRate}
              onChange={(event) => setMarginalTaxRate(event.target.value)}
            >
              {RELIEF_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
              Professional tax for the full year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.annualTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your slabs."
                : result.isExempt
                  ? "Half-yearly income is below Rs 12,000 — no professional tax is payable."
                  : `${money(result.halves[0].tax)} in the first half + ${money(result.halves[1].tax)} in the second half${result.atCeiling ? ", at the annual ceiling" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Kerala professional tax result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Collected by your {body.label.toLowerCase()} under the {body.act}.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Half-year detail</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Half year
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Income
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Tax
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  If split monthly
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.halves).map((half) => (
                <tr key={half.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{half.label}</td>
                  <td className="py-2 pr-3 text-right">{money(half.income)}</td>
                  <td className="py-2 pr-3 text-right">{money(half.tax)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {half.months > 0 ? `${money2(half.perMonth)} x ${half.months}` : DASH}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasError && (
            <p className="py-3 text-sm text-[var(--muted-foreground)]">{DASH} No half-year detail to show.</p>
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The charge is per half year. Many Kerala employers deduct the whole half-yearly amount in
          one salary run; others spread it over the six months. Either way the half-year total is the
          same.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Kerala half-yearly slab table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Income for the half year
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Tax per half year
                </th>
              </tr>
            </thead>
            <tbody>
              {KERALA_PT_SLABS.map((slab) => {
                const active =
                  !hasError && result.halves.some((half) => half.slabLabel === slab.label);
                return (
                  <tr
                    key={slab.label}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold">{slab.label}</td>
                    <td className="py-2 text-right">
                      {slab.halfYearlyTax === 0 ? "Nil" : money(slab.halfYearlyTax)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Slabs follow the Kerala Municipality Act, 1994 and the
        Kerala Panchayat Raj Act, 1994 with the Article 276(2) ceiling of {money(ANNUAL_PT_CEILING)}
        {" "}a year. Individual local bodies issue their own demand notices and due dates, and the
        section 16(iii) deduction applies only under the old income-tax regime.
      </p>
    </main>
  );
}
