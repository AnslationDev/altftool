"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

import {
  OLD_REGIME_MARGINAL_RATES,
  SECTION_80CCD_1B_LIMIT,
  SECTION_80CCE_LIMIT,
  computeNps80ccd1b,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  employmentType: "salaried",
  regime: "old",
  salaryBasicDa: "900000",
  grossTotalIncome: "1500000",
  npsContribution: "50000",
  other80C: "150000",
  marginalRatePercent: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [employmentType, setEmploymentType] = useState(DEFAULTS.employmentType);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [salaryBasicDa, setSalaryBasicDa] = useState(DEFAULTS.salaryBasicDa);
  const [grossTotalIncome, setGrossTotalIncome] = useState(DEFAULTS.grossTotalIncome);
  const [npsContribution, setNpsContribution] = useState(DEFAULTS.npsContribution);
  const [other80C, setOther80C] = useState(DEFAULTS.other80C);
  const [marginalRatePercent, setMarginalRatePercent] = useState(DEFAULTS.marginalRatePercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNps80ccd1b({
        employmentType,
        regime,
        salaryBasicDa: toNumber(salaryBasicDa),
        grossTotalIncome: toNumber(grossTotalIncome),
        npsContribution: toNumber(npsContribution),
        other80C: toNumber(other80C),
        marginalRatePercent: toNumber(marginalRatePercent),
      }),
    [
      employmentType,
      regime,
      salaryBasicDa,
      grossTotalIncome,
      npsContribution,
      other80C,
      marginalRatePercent,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "NPS 80CCD(1B) extra deduction",
      `Regime: ${result.regime === "old" ? "Old regime" : "New regime (section 115BAC)"}`,
      `NPS Tier-I contribution: ${money(result.npsContribution)}`,
      `Claimed under 80CCD(1B): ${money(result.claimed1B)}`,
      `Claimed under 80CCD(1): ${money(result.claimed80ccd1)}`,
      `80CCE bucket used (80C + 80CCC + 80CCD(1)): ${money(result.bucket80cce)}`,
      `Total deduction: ${money(result.totalDeduction)}`,
      `Extra deduction from 80CCD(1B): ${money(result.extraDeduction)}`,
      `Tax saved at ${NUM.format(result.marginalRatePercent)}% + 4% cess: ${money(result.taxSavedWithCess)}`,
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
    setEmploymentType(DEFAULTS.employmentType);
    setRegime(DEFAULTS.regime);
    setSalaryBasicDa(DEFAULTS.salaryBasicDa);
    setGrossTotalIncome(DEFAULTS.grossTotalIncome);
    setNpsContribution(DEFAULTS.npsContribution);
    setOther80C(DEFAULTS.other80C);
    setMarginalRatePercent(DEFAULTS.marginalRatePercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Section 80CCD(1B)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          NPS 80CCD(1B) Extra Deduction Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Section 80CCD(1B) gives up to {money(SECTION_80CCD_1B_LIMIT)} of NPS Tier-I deduction over
          and above the {money(SECTION_80CCE_LIMIT)} aggregate limit of section 80CCE. See how much
          of it you actually get and what it saves in tax.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nps-employment">
              I am
            </label>
            <select
              id="nps-employment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={employmentType}
              onChange={(event) => setEmploymentType(event.target.value)}
            >
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self-employed / other</option>
            </select>
            <p className={HINT_CLASS}>
              Sets the 80CCD(1) ceiling: 10% of salary, or 20% of gross total income.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nps-regime">
              Tax regime
            </label>
            <select
              id="nps-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="old">Old regime</option>
              <option value="new">New regime (section 115BAC)</option>
            </select>
            <p className={HINT_CLASS}>80CCD(1B) is available only under the old regime.</p>
          </div>

          {employmentType === "salaried" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="nps-basic">
                Annual basic pay + DA (INR)
              </label>
              <input
                id="nps-basic"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={salaryBasicDa}
                onChange={(event) => setSalaryBasicDa(event.target.value)}
              />
              <p className={HINT_CLASS}>Basic + dearness allowance only, not total CTC.</p>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="nps-gti">
                Annual gross total income (INR)
              </label>
              <input
                id="nps-gti"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={grossTotalIncome}
                onChange={(event) => setGrossTotalIncome(event.target.value)}
              />
              <p className={HINT_CLASS}>Income before Chapter VI-A deductions.</p>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="nps-contribution">
              Your NPS Tier-I contribution (INR)
            </label>
            <input
              id="nps-contribution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={npsContribution}
              onChange={(event) => setNpsContribution(event.target.value)}
            />
            <p className={HINT_CLASS}>Employee/self contribution only, not the employer share.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nps-other80c">
              Other 80C / 80CCC investments (INR)
            </label>
            <input
              id="nps-other80c"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={other80C}
              onChange={(event) => setOther80C(event.target.value)}
            />
            <p className={HINT_CLASS}>EPF, PPF, ELSS, life insurance, tuition fees, home loan principal.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nps-rate">
              Marginal tax rate
            </label>
            <select
              id="nps-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marginalRatePercent}
              onChange={(event) => setMarginalRatePercent(event.target.value)}
            >
              {OLD_REGIME_MARGINAL_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>Health and education cess of 4% is added on top.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[50000, 100000, 150000, 200000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setNpsContribution(String(amount))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              NPS {money(amount)}
            </button>
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
              Extra deduction from 80CCD(1B)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.extraDeduction)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `Tax saved ${money(result.taxSavedWithCess)} at ${NUM.format(result.marginalRatePercent)}% plus 4% cess`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the 80CCD(1B) deduction result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Claimed under 80CCD(1B)", show(result.claimed1B)],
            ["Claimed under 80CCD(1)", show(result.claimed80ccd1)],
            [
              "80CCD(1) ceiling",
              hasError
                ? DASH
                : `${money(result.ceiling80ccd1)} (${NUM.format(result.ceilingRatePercent)}% of ${money(result.ceilingBase)})`,
            ],
            ["80CCE bucket used (80C + 80CCC + 80CCD(1))", show(result.bucket80cce)],
            ["Unused 80CCE headroom", show(result.unused80cceHeadroom)],
            ["Total deduction claimed", show(result.totalDeduction)],
            ["Deduction without 80CCD(1B)", show(result.totalWithout1B)],
            ["NPS contribution getting no deduction", show(result.unusedContribution)],
            ["Income tax saved (before cess)", show(result.taxSaved)],
            ["Health and education cess saved", show(result.cess)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.available && result.investMoreForFull1B > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Invest {money(result.investMoreForFull1B)} more in NPS Tier-I to use the whole{" "}
            {money(SECTION_80CCD_1B_LIMIT)} allowed by 80CCD(1B).
          </p>
        )}

        {!hasError && !result.available && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Under section 115BAC no deduction is allowed under 80C, 80CCD(1) or 80CCD(1B). Only the
            employer contribution under 80CCD(2) survives in the new regime.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Surcharge, rebate under section 87A and any employer
        contribution under 80CCD(2) are not modelled here. Confirm your own position with a
        qualified tax professional before filing.
      </p>
    </main>
  );
}
