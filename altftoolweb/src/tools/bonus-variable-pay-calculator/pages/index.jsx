"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RATINGS = [
  { id: "outstanding", label: "Outstanding / Top performer", multiplier: 150 },
  { id: "exceeds", label: "Exceeds expectations", multiplier: 125 },
  { id: "meets", label: "Meets expectations", multiplier: 100 },
  { id: "partial", label: "Partially meets", multiplier: 70 },
  { id: "below", label: "Below expectations", multiplier: 0 },
];

const FREQUENCIES = [
  { id: "annual", label: "Annual (1 payout)", cycles: 1 },
  { id: "half", label: "Half-yearly (2 payouts)", cycles: 2 },
  { id: "quarterly", label: "Quarterly (4 payouts)", cycles: 4 },
  { id: "monthly", label: "Monthly (12 payouts)", cycles: 12 },
];

const DEFAULTS = {
  mode: "percent",
  ctc: 2000000,
  variablePercent: 15,
  variableAmount: 300000,
  rating: "exceeds",
  ratingMultiplier: 125,
  companyMultiplier: 90,
  monthsEligible: 12,
  frequency: "quarterly",
  taxRate: 30,
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Payout = target variable pay x months worked / 12 x individual rating factor
 * x company/business payout factor. TDS on bonus is deducted as salary income.
 */
export function computeBonus({
  mode,
  ctc,
  variablePercent,
  variableAmount,
  ratingMultiplier,
  companyMultiplier,
  monthsEligible,
  cycles,
  taxRate,
}) {
  const targetAnnual = mode === "percent" ? (ctc * variablePercent) / 100 : variableAmount;
  const proratedTarget = (targetAnnual * monthsEligible) / 12;
  const effectiveFactor = (ratingMultiplier / 100) * (companyMultiplier / 100);
  const grossPayout = proratedTarget * effectiveFactor;
  const tax = (grossPayout * taxRate) / 100;
  const netPayout = grossPayout - tax;
  const perCycleGross = cycles > 0 ? grossPayout / cycles : 0;
  const perCycleNet = cycles > 0 ? netPayout / cycles : 0;
  const fixedPay = mode === "percent" ? Math.max(0, ctc - targetAnnual) : null;
  const totalCash = fixedPay === null ? null : fixedPay + grossPayout;
  const shortfall = proratedTarget - grossPayout;

  return {
    targetAnnual,
    proratedTarget,
    effectiveFactor: effectiveFactor * 100,
    grossPayout,
    tax,
    netPayout,
    perCycleGross,
    perCycleNet,
    fixedPay,
    totalCash,
    shortfall,
    achievement: proratedTarget > 0 ? (grossPayout / proratedTarget) * 100 : 0,
  };
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [ctc, setCtc] = useState(String(DEFAULTS.ctc));
  const [variablePercent, setVariablePercent] = useState(String(DEFAULTS.variablePercent));
  const [variableAmount, setVariableAmount] = useState(String(DEFAULTS.variableAmount));
  const [rating, setRating] = useState(DEFAULTS.rating);
  const [ratingMultiplier, setRatingMultiplier] = useState(String(DEFAULTS.ratingMultiplier));
  const [companyMultiplier, setCompanyMultiplier] = useState(String(DEFAULTS.companyMultiplier));
  const [monthsEligible, setMonthsEligible] = useState(String(DEFAULTS.monthsEligible));
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [copied, setCopied] = useState(false);

  const onRatingChange = (value) => {
    setRating(value);
    const preset = RATINGS.find((item) => item.id === value);
    if (preset) setRatingMultiplier(String(preset.multiplier));
  };

  const calc = useMemo(() => {
    const values = {
      ctc: toNumber(ctc),
      variablePercent: toNumber(variablePercent),
      variableAmount: toNumber(variableAmount),
      ratingMultiplier: toNumber(ratingMultiplier),
      companyMultiplier: toNumber(companyMultiplier),
      monthsEligible: toNumber(monthsEligible),
      taxRate: toNumber(taxRate),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (mode === "percent") {
      if (values.ctc <= 0) return { error: "Annual CTC must be greater than zero." };
      if (values.variablePercent < 0 || values.variablePercent > 100) {
        return { error: "Variable pay share should be between 0% and 100% of CTC." };
      }
    } else if (values.variableAmount < 0) {
      return { error: "Target variable pay cannot be negative." };
    }
    if (values.ratingMultiplier < 0 || values.ratingMultiplier > 300) {
      return { error: "Rating multiplier should be between 0% and 300%." };
    }
    if (values.companyMultiplier < 0 || values.companyMultiplier > 300) {
      return { error: "Company payout factor should be between 0% and 300%." };
    }
    if (values.monthsEligible < 0 || values.monthsEligible > 12) {
      return { error: "Eligible months should be between 0 and 12." };
    }
    if (values.taxRate < 0 || values.taxRate > 50) {
      return { error: "Effective tax rate should be between 0% and 50%." };
    }

    const freq = FREQUENCIES.find((item) => item.id === frequency) ?? FREQUENCIES[0];
    return computeBonus({ ...values, mode, cycles: freq.cycles });
  }, [
    mode,
    ctc,
    variablePercent,
    variableAmount,
    ratingMultiplier,
    companyMultiplier,
    monthsEligible,
    frequency,
    taxRate,
  ]);

  const freqLabel = (FREQUENCIES.find((item) => item.id === frequency) ?? FREQUENCIES[0]).label;

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Bonus and Variable Pay Calculator",
      `Target variable pay (annual): ${money(calc.targetAnnual)}`,
      `Prorated target for ${num(toNumber(monthsEligible))} months: ${money(calc.proratedTarget)}`,
      `Rating multiplier: ${pct(toNumber(ratingMultiplier))}`,
      `Company payout factor: ${pct(toNumber(companyMultiplier))}`,
      `Effective payout factor: ${pct(calc.effectiveFactor)}`,
      `Gross bonus payout: ${money(calc.grossPayout)}`,
      `Estimated tax @ ${pct(toNumber(taxRate))}: ${money(calc.tax)}`,
      `Net in hand: ${money(calc.netPayout)}`,
      `Payout schedule: ${freqLabel} — ${money(calc.perCycleGross)} gross per cycle`,
    ].join("\n");
  }, [calc, monthsEligible, ratingMultiplier, companyMultiplier, taxRate, freqLabel]);

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
    setMode(DEFAULTS.mode);
    setCtc(String(DEFAULTS.ctc));
    setVariablePercent(String(DEFAULTS.variablePercent));
    setVariableAmount(String(DEFAULTS.variableAmount));
    setRating(DEFAULTS.rating);
    setRatingMultiplier(String(DEFAULTS.ratingMultiplier));
    setCompanyMultiplier(String(DEFAULTS.companyMultiplier));
    setMonthsEligible(String(DEFAULTS.monthsEligible));
    setFrequency(DEFAULTS.frequency);
    setTaxRate(String(DEFAULTS.taxRate));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Variable pay
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bonus and Variable Pay Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your target variable pay into an actual number. Set the rating multiplier, the company
          payout factor and the months you were eligible, and see the gross bonus, the tax bite and
          what lands per payout cycle.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>How is your variable pay defined?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["percent", "% of annual CTC"],
              ["amount", "Fixed annual amount"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "percent" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="bvp-ctc">
                  Annual CTC (INR)
                </label>
                <input
                  id="bvp-ctc"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10000"
                  value={ctc}
                  onChange={(event) => setCtc(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bvp-varpct">
                  Variable pay share of CTC (%)
                </label>
                <input
                  id="bvp-varpct"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  value={variablePercent}
                  onChange={(event) => setVariablePercent(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="bvp-varamt">
                Target variable pay per year (INR)
              </label>
              <input
                id="bvp-varamt"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="5000"
                value={variableAmount}
                onChange={(event) => setVariableAmount(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-rating">
              Performance rating
            </label>
            <select
              id="bvp-rating"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rating}
              onChange={(event) => onRatingChange(event.target.value)}
            >
              {RATINGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.multiplier}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-ratemult">
              Rating multiplier (%) — edit for your band
            </label>
            <input
              id="bvp-ratemult"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="5"
              value={ratingMultiplier}
              onChange={(event) => setRatingMultiplier(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-company">
              Company / business payout factor (%)
            </label>
            <input
              id="bvp-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="5"
              value={companyMultiplier}
              onChange={(event) => setCompanyMultiplier(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-months">
              Months eligible in the year (0-12)
            </label>
            <input
              id="bvp-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="12"
              step="1"
              value={monthsEligible}
              onChange={(event) => setMonthsEligible(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-freq">
              Payout frequency
            </label>
            <select
              id="bvp-freq"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvp-tax">
              Effective tax rate on the bonus (%)
            </label>
            <input
              id="bvp-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Gross bonus payout
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {money(calc.grossPayout)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {pct(calc.achievement)} of your prorated target · {money(calc.netPayout)} after tax
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy bonus and variable pay result"
                className={GHOST_BTN}
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
                aria-label="Reset all inputs"
                className={PRIMARY_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Target variable pay (full year)", money(calc.targetAnnual)],
              [
                "Prorated target",
                `${money(calc.proratedTarget)} · ${num(toNumber(monthsEligible))} of 12 months`,
              ],
              [
                "Effective payout factor",
                `${pct(calc.effectiveFactor)} (${pct(toNumber(ratingMultiplier))} × ${pct(toNumber(companyMultiplier))})`,
              ],
              ["Gross bonus payout", money(calc.grossPayout)],
              [
                calc.shortfall >= 0 ? "Short of prorated target by" : "Above prorated target by",
                money(Math.abs(calc.shortfall)),
              ],
              [`Estimated tax @ ${pct(toNumber(taxRate))}`, money(calc.tax)],
              ["Net bonus in hand", money(calc.netPayout)],
              ["Gross per payout cycle", money(calc.perCycleGross)],
              ["Net per payout cycle", money(calc.perCycleNet)],
              calc.fixedPay === null ? null : ["Fixed pay component of CTC", money(calc.fixedPay)],
              calc.totalCash === null
                ? null
                : ["Total cash for the year (fixed + bonus)", money(calc.totalCash)],
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Payout is ${pct(calc.achievement)} of the prorated target`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, calc.achievement))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Payout vs prorated target: {pct(calc.achievement)}
            </p>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Bonus schemes differ — some cap the individual multiplier, some
        apply the company factor before the rating, and statutory bonus under the Payment of Bonus
        Act 1965 is a separate entitlement. Tax here is a flat effective rate, not a slab computation.
      </p>
    </main>
  );
}
