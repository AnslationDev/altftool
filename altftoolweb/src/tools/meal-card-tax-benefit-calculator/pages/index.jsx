"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  EXEMPT_PER_MEAL_INR,
  NEW_REGIME_MAX_SURCHARGE_PCT,
  NEW_SLAB_RATES_PCT,
  OLD_SLAB_RATES_PCT,
  REGIMES,
  SURCHARGE_RATES_PCT,
  buildMonthlyRows,
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

const DEFAULTS = {
  monthlyCredit: "2200",
  workingDays: "22",
  meals: "2",
  months: "12",
  slab: "30",
  surcharge: "0",
  regime: "old",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyCredit, setMonthlyCredit] = useState(DEFAULTS.monthlyCredit);
  const [workingDays, setWorkingDays] = useState(DEFAULTS.workingDays);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [surcharge, setSurcharge] = useState(DEFAULTS.surcharge);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [showRows, setShowRows] = useState(false);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const slabOptions = regime === "new" ? NEW_SLAB_RATES_PCT : OLD_SLAB_RATES_PCT;
  const surchargeOptions =
    regime === "new"
      ? SURCHARGE_RATES_PCT.filter((rate) => rate <= NEW_REGIME_MAX_SURCHARGE_PCT)
      : SURCHARGE_RATES_PCT;

  const handleRegimeChange = (nextRegime) => {
    setRegime(nextRegime);
    const nextSlabOptions = nextRegime === "new" ? NEW_SLAB_RATES_PCT : OLD_SLAB_RATES_PCT;
    if (!nextSlabOptions.includes(toNumber(slab))) {
      setSlab(String(nextSlabOptions[0]));
    }
    if (nextRegime === "new" && toNumber(surcharge) > NEW_REGIME_MAX_SURCHARGE_PCT) {
      setSurcharge(String(NEW_REGIME_MAX_SURCHARGE_PCT));
    }
  };

  const result = useMemo(
    () =>
      buildMonthlyRows({
        monthlyCredit: toNumber(monthlyCredit),
        workingDaysPerMonth: toNumber(workingDays),
        mealsPerWorkingDay: toNumber(meals),
        eligibleMonths: toNumber(months),
        slabRatePct: toNumber(slab),
        surchargePct: toNumber(surcharge),
        regime,
      }),
    [monthlyCredit, workingDays, meals, months, slab, surcharge, regime],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Food Coupon / Meal Card Tax Benefit",
      `Regime: ${regime === "old" ? "Old regime" : "New regime (Section 115BAC)"}`,
      `Card credit: ${money(result.annualCredit)} per year`,
      `Exempt limit: ${money(result.annualCeiling)} per year`,
      `Exempt amount: ${money(result.exemptAmount)}`,
      `Taxable perquisite: ${money(result.taxableAmount)}`,
      `Effective tax rate: ${pct(result.effectiveTaxRatePct)}`,
      `Tax saved in the year: ${money(result.taxSaved)}`,
    ].join("\n");
  }, [hasError, regime, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "meal card tax benefit result" });
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset all inputs back to the defaults?")
    ) {
      return;
    }
    setMonthlyCredit(DEFAULTS.monthlyCredit);
    setWorkingDays(DEFAULTS.workingDays);
    setMeals(DEFAULTS.meals);
    setMonths(DEFAULTS.months);
    setSlab(DEFAULTS.slab);
    setSurcharge(DEFAULTS.surcharge);
    setRegime(DEFAULTS.regime);
    resetCopyState();
  };

  const rows = [
    ["Card credit for the year", hasError ? DASH : money(result.annualCredit)],
    ["Exempt limit for the year", hasError ? DASH : money(result.annualCeiling)],
    ["Exempt monthly ceiling", hasError ? DASH : money(result.monthlyCeiling)],
    ["Exempt portion", hasError ? DASH : money(result.exemptAmount)],
    ["Taxable perquisite added to salary", hasError ? DASH : money(result.taxableAmount)],
    ["Unused exempt headroom", hasError ? DASH : money(result.unusedHeadroom)],
    ["Effective marginal tax rate", hasError ? DASH : pct(result.effectiveTaxRatePct)],
    ["Extra tax on the excess credit", hasError ? DASH : money(result.taxOnExcess)],
    ["Tax saved per month", hasError ? DASH : money(result.taxSavedPerMonth)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Meal card exemption
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Food Coupon and Meal Card Tax Benefit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rule 3(7)(iii) of the Income-tax Rules keeps employer-provided meal vouchers exempt up to
          Rs {EXEMPT_PER_MEAL_INR} per meal. See how much of your card credit stays tax free and
          what that is worth at your slab.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-credit">
              Monthly card credit (INR)
            </label>
            <input
              id="meal-credit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyCredit}
              onChange={(event) => setMonthlyCredit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-days">
              Working days in a month
            </label>
            <input
              id="meal-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="31"
              step="1"
              value={workingDays}
              onChange={(event) => setWorkingDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-meals">
              Meals claimed per working day
            </label>
            <select
              id="meal-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              value={meals}
              onChange={(event) => setMeals(event.target.value)}
            >
              <option value="1">1 meal (Rs 50 per day)</option>
              <option value="2">2 meals (Rs 100 per day)</option>
              <option value="3">3 meals (Rs 150 per day)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-months">
              Months the benefit is received
            </label>
            <input
              id="meal-months"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-slab">
              Income tax slab rate
            </label>
            <select
              id="meal-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {slabOptions.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-surcharge">
              Surcharge
            </label>
            <select
              id="meal-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              {surchargeOptions.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate === 0 ? "No surcharge" : `${rate}%`}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="meal-regime">
              Tax regime
            </label>
            <select
              id="meal-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => handleRegimeChange(event.target.value)}
            >
              {REGIMES.map((option) => (
                <option key={option.id} value={option.id}>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Income tax saved in the year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.taxSaved)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Check the values above and try again."
                : `${money(result.exemptAmount)} of the credit is exempt at ${pct(result.effectiveTaxRatePct)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied meal card tax benefit result to clipboard" : "Copy meal card tax benefit result"}
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        {!hasError && !result.exemptionAllowed && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Under the Section 115BAC regime the meal voucher exemption is not available, so the whole
            credit is taxable salary and the saving is nil.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Month-by-month split</h2>
            <button
              type="button"
              onClick={() => setShowRows((value) => !value)}
              aria-expanded={showRows}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showRows ? "Hide" : "Show"}
            </button>
          </div>
          {showRows && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Month
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Exempt
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Taxable
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Tax saved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.month} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.month}</td>
                      <td className="py-2 pr-3 text-right">{money(row.exempt)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.taxable)}
                      </td>
                      <td className="py-2 text-right">{money(row.taxSaved)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The exemption applies to non-transferable vouchers usable
        only at eating joints during working hours; cash reimbursements and unspent balances can be
        treated differently. Confirm the treatment with your payroll team or a tax professional.
      </p>
    </main>
  );
}
