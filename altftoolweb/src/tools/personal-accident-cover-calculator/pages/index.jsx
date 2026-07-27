"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  GST_RATE_PERCENT,
  PPD_ONE_LIMB_PERCENT,
  RISK_GROUP_RATES,
  TTD_MAX_WEEKS,
  TTD_WEEKLY_RUPEE_CAP,
  sizePersonalAccidentCover,
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
  annualIncome: "1200000",
  replacementYears: "10",
  outstandingLoans: "3000000",
  futureGoals: "2000000",
  existingCover: "0",
  liquidSavings: "500000",
  incomeMultiple: "10",
  ptdPercent: "100",
  riskGroup: "1",
  dependants: "3",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [annualIncome, setAnnualIncome] = useState(DEFAULTS.annualIncome);
  const [replacementYears, setReplacementYears] = useState(DEFAULTS.replacementYears);
  const [outstandingLoans, setOutstandingLoans] = useState(DEFAULTS.outstandingLoans);
  const [futureGoals, setFutureGoals] = useState(DEFAULTS.futureGoals);
  const [existingCover, setExistingCover] = useState(DEFAULTS.existingCover);
  const [liquidSavings, setLiquidSavings] = useState(DEFAULTS.liquidSavings);
  const [incomeMultiple, setIncomeMultiple] = useState(DEFAULTS.incomeMultiple);
  const [ptdPercent, setPtdPercent] = useState(DEFAULTS.ptdPercent);
  const [riskGroup, setRiskGroup] = useState(DEFAULTS.riskGroup);
  const [dependants, setDependants] = useState(DEFAULTS.dependants);
  const [copied, setCopied] = useState(false);

  const rate = useMemo(() => {
    const found = RISK_GROUP_RATES.find((group) => group.id === riskGroup);
    return found ? found.ratePerMille : RISK_GROUP_RATES[0].ratePerMille;
  }, [riskGroup]);

  const result = useMemo(
    () =>
      sizePersonalAccidentCover({
        annualIncome: toNumber(annualIncome),
        replacementYears: toNumber(replacementYears),
        outstandingLoans: toNumber(outstandingLoans),
        futureGoals: toNumber(futureGoals),
        existingCover: toNumber(existingCover),
        liquidSavings: toNumber(liquidSavings),
        incomeMultiple: toNumber(incomeMultiple),
        ptdPercent: toNumber(ptdPercent),
        ratePerMille: rate,
        dependants: toNumber(dependants),
      }),
    [
      annualIncome,
      replacementYears,
      outstandingLoans,
      futureGoals,
      existingCover,
      liquidSavings,
      incomeMultiple,
      ptdPercent,
      rate,
      dependants,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Personal Accident Cover Calculator",
      `Cover you need: ${money(result.requiredCover)}`,
      `Usual underwriting ceiling: ${money(result.underwritingCap)}`,
      `Recommended sum insured: ${money(result.recommendedCover)}`,
      `Accidental death benefit: ${money(result.accidentalDeathBenefit)}`,
      `Permanent total disablement: ${money(result.ptdBenefit)}`,
      `Loss of one limb or one eye: ${money(result.ppdOneLimbBenefit)}`,
      `Weekly benefit while temporarily disabled: ${money(result.ttdWeekly)} for up to ${TTD_MAX_WEEKS} weeks`,
      `Indicative annual premium including GST: ${money(result.totalPremium)}`,
    ].join("\n");
  }, [ok, result]);

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
    setAnnualIncome(DEFAULTS.annualIncome);
    setReplacementYears(DEFAULTS.replacementYears);
    setOutstandingLoans(DEFAULTS.outstandingLoans);
    setFutureGoals(DEFAULTS.futureGoals);
    setExistingCover(DEFAULTS.existingCover);
    setLiquidSavings(DEFAULTS.liquidSavings);
    setIncomeMultiple(DEFAULTS.incomeMultiple);
    setPtdPercent(DEFAULTS.ptdPercent);
    setRiskGroup(DEFAULTS.riskGroup);
    setDependants(DEFAULTS.dependants);
    setCopied(false);
  };

  const numberField = (id, label, value, setter, step = "10000") => (
    <div>
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
        value={value}
        onChange={(event) => setter(event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Personal accident
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Personal Accident Cover Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the accidental death and permanent disability cover your family would actually
          need, then check it against the income multiple insurers are willing to issue.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("pa-income", "Gross annual income (INR)", annualIncome, setAnnualIncome, "50000")}
          {numberField(
            "pa-years",
            "Years of income to replace",
            replacementYears,
            setReplacementYears,
            "1",
          )}
          {numberField("pa-loans", "Outstanding loans (INR)", outstandingLoans, setOutstandingLoans)}
          {numberField(
            "pa-goals",
            "Education / marriage corpus needed (INR)",
            futureGoals,
            setFutureGoals,
          )}
          {numberField(
            "pa-existing",
            "Personal accident cover already held (INR)",
            existingCover,
            setExistingCover,
          )}
          {numberField("pa-savings", "Liquid savings the family can use (INR)", liquidSavings, setLiquidSavings)}
          {numberField("pa-dependants", "Financially dependent people", dependants, setDependants, "1")}
          {numberField(
            "pa-multiple",
            "Underwriting ceiling (times annual income)",
            incomeMultiple,
            setIncomeMultiple,
            "1",
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="pa-ptd">
              Permanent total disablement payout (% of cover)
            </label>
            <select
              id="pa-ptd"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ptdPercent}
              onChange={(event) => setPtdPercent(event.target.value)}
            >
              <option value="100">100% of sum insured</option>
              <option value="125">125% of sum insured</option>
              <option value="150">150% of sum insured</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pa-risk">
              Occupation risk group
            </label>
            <select
              id="pa-risk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={riskGroup}
              onChange={(event) => setRiskGroup(event.target.value)}
            >
              {RISK_GROUP_RATES.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
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
              Recommended sum insured
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.recommendedCover) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.alreadyCovered
                  ? "Your existing cover and savings already meet the need."
                  : `Need ${money(result.requiredCover)} · insurers usually stop at ${money(result.underwritingCap)}`
                : "Correct the inputs above to size your cover."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy personal accident cover result"
              className={GHOST_BTN}
              disabled={!ok}
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

        {ok && result.cappedByUnderwriting ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Your need is {money(result.shortfallAboveCap)} above the usual underwriting ceiling. Split
            the cover across two insurers or top it up with term life to close the gap.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Income to replace", ok ? money(result.incomeNeed) : DASH],
            ["Total need before offsets", ok ? money(result.grossNeed) : DASH],
            ["Existing cover plus savings", ok ? money(result.offsets) : DASH],
            ["Cover shortfall to buy", ok ? money(result.requiredCover) : DASH],
            ["Accidental death benefit", ok ? money(result.accidentalDeathBenefit) : DASH],
            ["Permanent total disablement benefit", ok ? money(result.ptdBenefit) : DASH],
            [
              `Loss of one limb or one eye (${PPD_ONE_LIMB_PERCENT}%)`,
              ok ? money(result.ppdOneLimbBenefit) : DASH,
            ],
            [
              `Weekly benefit while off work (max ${TTD_MAX_WEEKS} weeks)`,
              ok ? money(result.ttdWeekly) : DASH,
            ],
            ["Maximum weekly benefit payable in total", ok ? money(result.ttdMaximum) : DASH],
            ["Cover per dependant", ok && result.dependants > 0 ? money(result.perDependantSupport) : DASH],
            ["Indicative base premium", ok ? money(result.basePremium) : DASH],
            [`GST at ${GST_RATE_PERCENT}%`, ok ? money(result.gst) : DASH],
            ["Indicative annual premium", ok ? money(result.totalPremium) : DASH],
            ["Works out to per month", ok ? money(result.monthlyPremium) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not insurance advice. Weekly benefit is 1% of the sum insured subject to
        your policy&apos;s rupee cap (commonly {money(TTD_WEEKLY_RUPEE_CAP)} a week). Personal
        accident has been de-tariffed since 2007, so the premium shown is a ballpark — read the
        disablement scale and exclusions in the policy wording and speak to a licensed adviser before
        buying.
      </p>
    </main>
  );
}
