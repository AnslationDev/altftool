"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  CITY_CLASSES,
  RULE_2A_METRO_CITIES,
  RULE_2A_RENT_DEDUCTION_PERCENT,
  computeGovernmentHra,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  basicPay: "56100",
  cityClass: "X",
  daPercent: "58",
  monthlyRent: "25000",
  months: "12",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [basicPay, setBasicPay] = useState(DEFAULTS.basicPay);
  const [cityClass, setCityClass] = useState(DEFAULTS.cityClass);
  const [daPercent, setDaPercent] = useState(DEFAULTS.daPercent);
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [isRule2aMetro, setIsRule2aMetro] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGovernmentHra({
        basicPay: toNumber(basicPay),
        cityClass,
        daPercent: toNumber(daPercent),
        monthlyRent: toNumber(monthlyRent),
        isRule2aMetro,
        months: toNumber(months),
      }),
    [basicPay, cityClass, daPercent, monthlyRent, isRule2aMetro, months],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "House Rent Allowance for Government Staff (7th CPC)",
      `Basic pay: ${money(result.basicPay)} a month`,
      `City class: ${result.cityClass} — HRA at ${result.ratePercent}% (${result.rateNote})`,
      `Monthly HRA: ${money(result.monthlyHra)}`,
      `HRA for ${result.monthsCounted} month(s): ${money(result.annualHra)}`,
      "",
      "Section 10(13A) exemption, least of three:",
      `1. HRA received: ${money(result.limitActualHra)}`,
      `2. Rent less ${RULE_2A_RENT_DEDUCTION_PERCENT}% of salary: ${money(result.limitRentOverTenPercent)}`,
      `3. ${result.capPercent}% of salary: ${money(result.limitSalaryCap)}`,
      `Exempt: ${money(result.exempt)} (${result.exemptShare}%)`,
      `Taxable: ${money(result.taxable)}`,
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
    setBasicPay(DEFAULTS.basicPay);
    setCityClass(DEFAULTS.cityClass);
    setDaPercent(DEFAULTS.daPercent);
    setMonthlyRent(DEFAULTS.monthlyRent);
    setMonths(DEFAULTS.months);
    setIsRule2aMetro(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Government pay
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          House Rent Allowance for Government Staff
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          7th Pay Commission HRA on your Level pay, at the rate your current dearness allowance
          unlocks, with the ₹5,400 / ₹3,600 / ₹1,800 floors applied — and the exemption you can
          actually claim under section 10(13A).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ghra-pay">
              Basic pay in the pay matrix (per month)
            </label>
            <input
              id="ghra-pay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="18000"
              step="100"
              value={basicPay}
              onChange={(event) => setBasicPay(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Level pay only. Special pay, NPA and Military Service Pay are excluded.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghra-da">
              Current dearness allowance (%)
            </label>
            <input
              id="ghra-da"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="1"
              value={daPercent}
              onChange={(event) => setDaPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              This decides the HRA rate: 24/16/8 below 25%, 27/18/9 above 25%, 30/20/10 above 50%.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghra-rent">
              Rent you actually pay (per month)
            </label>
            <input
              id="ghra-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghra-months">
              Months this applies to (1-12)
            </label>
            <input
              id="ghra-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            City classification for HRA
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {CITY_CLASSES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={cityClass === option.id}
                onClick={() => setCityClass(option.id)}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  cityClass === option.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {option.label}
                <span className="mt-0.5 block text-xs font-normal opacity-80">
                  {option.population}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="ghra-metro"
        >
          <input
            id="ghra-metro"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={isRule2aMetro}
            onChange={(event) => setIsRule2aMetro(event.target.checked)}
          />
          <span>
            My rented home is in {RULE_2A_METRO_CITIES.join(", ")} — the only four cities that get
            the 50% cap for tax
          </span>
        </label>
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
              Monthly HRA entitlement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.monthlyHra)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your entitlement."
                : `${result.ratePercent}% of basic pay in a ${result.cityClass} class city — ${result.rateNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy HRA calculation"
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
            ["HRA at the applicable rate", hasError ? DASH : money(result.hraAtRate)],
            [
              "Floor for this city class",
              hasError
                ? DASH
                : `${money(result.floor)}${result.floorApplied ? " — applied, it is higher" : ""}`,
            ],
            ["Dearness allowance per month", hasError ? DASH : money(result.monthlyDa)],
            [
              "Salary for the exemption test (pay + DA)",
              hasError ? DASH : money(result.monthlySalaryForRule2a),
            ],
            [
              `HRA over ${hasError ? DASH : result.monthsCounted} month(s)`,
              hasError ? DASH : money(result.annualHra),
            ],
            ["Rent paid over the same period", hasError ? DASH : money(result.annualRent)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Exemption under section 10(13A)</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Rule 2A allows the least of these three. The binding one here is: {result.bindingLimit}.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Limit
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["HRA actually received", result.limitActualHra],
                  [
                    `Rent paid less ${RULE_2A_RENT_DEDUCTION_PERCENT}% of salary`,
                    result.limitRentOverTenPercent,
                  ],
                  [`${result.capPercent}% of salary`, result.limitSalaryCap],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-[var(--border)]">
                    <td className="py-2.5 pr-3">{label}</td>
                    <td className="py-2.5 text-right font-semibold">{money(value)}</td>
                  </tr>
                ))}
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2.5 pr-3 font-semibold text-[var(--success)]">
                    Exempt from tax
                  </td>
                  <td className="py-2.5 text-right font-semibold text-[var(--success)]">
                    {money(result.exempt)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">Taxable portion of HRA</td>
                  <td className="py-2.5 text-right font-semibold">{money(result.taxable)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.exemptShare} percent of your HRA is exempt from tax`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.exemptShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {result.exemptShare}% of your HRA is exempt.
              {result.fullExemptionPossible
                ? ` Rent of about ${money(result.rentForFullExemption)} a month would make all of it exempt.`
                : ` The ${result.capPercent}% of salary cap stops the whole HRA from ever being exempt here.`}
            </p>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The section 10(13A) exemption is available only under the
        old tax regime — the default regime under section 115BAC withdraws it. HRA is also not
        payable where government accommodation is occupied. Check your pay slip and the Department of
        Expenditure city list, and speak to a tax professional about your own case.
      </p>
    </main>
  );
}
