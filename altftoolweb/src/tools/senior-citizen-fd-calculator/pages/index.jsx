"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserRoundCheck } from "lucide-react";

import {
  SECTION_80TTB_LIMIT,
  SENIOR_AGE,
  SUPER_SENIOR_AGE,
  TDS_THRESHOLD_SENIOR,
  computeSeniorFd,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "1500000",
  baseRate: "6.9",
  years: "5",
  age: "65",
  seniorPremium: "0.5",
  superSeniorPremium: "0.75",
  otherInterest: "0",
  slab: "20",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [oldRegime, setOldRegime] = useState(true);
  const [panFurnished, setPanFurnished] = useState(true);
  const [formFiled, setFormFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setFields((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeSeniorFd({
        principal: toNumber(fields.principal),
        baseRate: toNumber(fields.baseRate),
        years: toNumber(fields.years),
        age: toNumber(fields.age),
        seniorPremium: toNumber(fields.seniorPremium),
        superSeniorPremium: toNumber(fields.superSeniorPremium),
        otherDepositInterest: toNumber(fields.otherInterest) || 0,
        oldRegime,
        taxSlabPercent: toNumber(fields.slab) || 0,
        panFurnished,
        formFiled,
      }),
    [fields, oldRegime, panFurnished, formFiled],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Senior Citizen FD Extra Rate Calculator",
      `${money(result.principal)} for ${result.years} years, age ${result.age}`,
      `Rate: ${pct(result.baseRate)} card rate + ${pct(result.premium)} senior premium = ${pct(result.seniorRate)}`,
      `Maturity value: ${money(result.seniorMaturity)}`,
      `Extra earned because of the senior rate: ${money(result.extraFromPremium)}`,
      `TDS over the term (threshold ${money(result.tdsThreshold)}): ${money(result.totalTds)}`,
      `Section 80TTB deduction claimed: ${money(result.deduction80ttb)}`,
      `Tax at ${pct(result.taxSlabPercent)}: ${money(result.taxOnInterest)}`,
      `Value after tax: ${money(result.postTaxValue)}`,
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
    setFields(DEFAULTS);
    setOldRegime(true);
    setPanFurnished(true);
    setFormFiled(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
          Senior citizen deposit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Senior Citizen FD Extra Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Banks add a premium to the card rate for depositors aged {SENIOR_AGE} and above. This
          shows what that premium is worth in rupees over the term, when TDS starts at the higher{" "}
          {money(TDS_THRESHOLD_SENIOR)} threshold, and how much section 80TTB shelters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-principal">
              Deposit amount (INR)
            </label>
            <input
              id="sf-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fields.principal}
              onChange={(event) => setField("principal", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-age">
              Depositor&apos;s age (completed years)
            </label>
            <input
              id="sf-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={fields.age}
              onChange={(event) => setField("age", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-base">
              Bank&apos;s ordinary card rate (%)
            </label>
            <input
              id="sf-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.baseRate}
              onChange={(event) => setField("baseRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-years">
              Tenure (years)
            </label>
            <input
              id="sf-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="1"
              value={fields.years}
              onChange={(event) => setField("years", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-premium">
              Senior premium, ages {SENIOR_AGE}–{SUPER_SENIOR_AGE - 1} (points)
            </label>
            <input
              id="sf-premium"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.05"
              value={fields.seniorPremium}
              onChange={(event) => setField("seniorPremium", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-super">
              Premium from age {SUPER_SENIOR_AGE} (points)
            </label>
            <input
              id="sf-super"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.05"
              value={fields.superSeniorPremium}
              onChange={(event) => setField("superSeniorPremium", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-other">
              Other deposit interest in the year (INR)
            </label>
            <input
              id="sf-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={fields.otherInterest}
              onChange={(event) => setField("otherInterest", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Savings, other FDs and post office interest share the same{" "}
              {money(SECTION_80TTB_LIMIT)} ceiling.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-slab">
              Marginal slab rate
            </label>
            <select
              id="sf-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.slab}
              onChange={(event) => setField("slab", event.target.value)}
            >
              {SLAB_RATES.map((value) => (
                <option key={value} value={String(value)}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4 rounded-md border border-[var(--border)] p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Tax position
          </legend>
          <div className="grid gap-1 sm:grid-cols-3">
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sf-regime">
              <input
                id="sf-regime"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={oldRegime}
                onChange={(event) => setOldRegime(event.target.checked)}
              />
              Old tax regime
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sf-pan">
              <input
                id="sf-pan"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              PAN given to bank
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sf-15h">
              <input
                id="sf-15h"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={formFiled}
                onChange={(event) => setFormFiled(event.target.checked)}
              />
              Form 15H filed
            </label>
          </div>
        </fieldset>
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
              Extra earned from the senior rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.extraFromPremium)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : result.isSenior
                  ? `${pct(result.seniorRate)} instead of ${pct(result.baseRate)} over ${result.years} years`
                  : `No premium applies below age ${SENIOR_AGE}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy senior citizen FD result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["Rate applied to this deposit", show(result.seniorRate, pct)],
            ["Maturity value at the senior rate", show(result.seniorMaturity)],
            ["Maturity value at the ordinary rate", show(result.regularMaturity)],
            ["Extra earned per year of the term", show(result.extraPerYear)],
            ["Effective annual yield (quarterly compounding)", show(result.effectiveYield, pct)],
            ["Interest credited in the first year", show(result.firstYearInterest)],
            ["TDS threshold that applies", hasError ? DASH : money(result.tdsThreshold)],
            ["TDS deducted across the term", show(result.totalTds)],
            ["Section 80TTB deduction claimed", show(result.deduction80ttb)],
            ["Taxable interest after 80TTB", show(result.taxableInterest)],
            [
              `Tax at ${hasError ? DASH : pct(result.taxSlabPercent)}`,
              show(result.taxOnInterest),
            ],
            ["Tax saved by section 80TTB", show(result.taxSavedBy80ttb)],
            ["Value after tax", show(result.postTaxValue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.isSenior && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            At age {result.age} the depositor does not yet qualify for the senior rate, the{" "}
            {money(TDS_THRESHOLD_SENIOR)} TDS threshold or section 80TTB. Figures above use the
            ordinary card rate.
          </p>
        )}
        {!hasError && result.isSenior && !oldRegime && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Section 80TTB is not available under the new regime of section 115BAC, so the whole
            interest is taxable. The higher TDS threshold and the bank&apos;s senior rate still
            apply.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    80TTB
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Taxable
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    TDS
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.year}
                      {row.monthsInYear < 12 && (
                        <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
                          ({row.monthsInYear} mo)
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.interest)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.deduction)}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.taxable)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.tdsDeducted ? money(row.tds) : "Nil"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. The senior premium is each bank&apos;s commercial decision and is
        often not offered on the longest tenures or on bulk deposits above ₹3 crore. Section 80TTB is
        available only to resident individuals aged {SENIOR_AGE} or above under the old regime.
        Consult a tax professional before acting on these figures.
      </p>
    </main>
  );
}
