"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  NPS_MIN_ANNUITY_SHARE,
  MAX_SOLVE_RETURN,
  MIN_SOLVE_RETURN,
  UPS_MIN_MONTHLY_PAYOUT,
  compareUpsVsNps,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const SIGNED_INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const signedMoney = (value) => (Number.isFinite(value) ? SIGNED_INR.format(value) : DASH);
const pct1 = (value) => (Number.isFinite(value) ? `${NUM1.format(value)}%` : DASH);
const pct2 = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
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

const DEFAULTS = {
  currentBasic: "56100",
  daNowPercent: "60",
  basicGrowthPercent: "3",
  daStepPointsPerYear: "4",
  yearsToRetirement: "25",
  qualifyingServiceYears: "33",
  existingNpsCorpus: "1500000",
  employeeContribPercent: "10",
  employerContribPercent: "14",
  npsReturnPercent: "9",
  annuitySharePercent: "40",
  annuityRatePercent: "6",
  annuityRop: "yes",
  retirementYears: "25",
};

export default function ToolHome() {
  const [currentBasic, setCurrentBasic] = useState(DEFAULTS.currentBasic);
  const [daNowPercent, setDaNowPercent] = useState(DEFAULTS.daNowPercent);
  const [basicGrowthPercent, setBasicGrowthPercent] = useState(DEFAULTS.basicGrowthPercent);
  const [daStepPointsPerYear, setDaStepPointsPerYear] = useState(DEFAULTS.daStepPointsPerYear);
  const [yearsToRetirement, setYearsToRetirement] = useState(DEFAULTS.yearsToRetirement);
  const [qualifyingServiceYears, setQualifyingServiceYears] = useState(
    DEFAULTS.qualifyingServiceYears,
  );
  const [existingNpsCorpus, setExistingNpsCorpus] = useState(DEFAULTS.existingNpsCorpus);
  const [employeeContribPercent, setEmployeeContribPercent] = useState(
    DEFAULTS.employeeContribPercent,
  );
  const [employerContribPercent, setEmployerContribPercent] = useState(
    DEFAULTS.employerContribPercent,
  );
  const [npsReturnPercent, setNpsReturnPercent] = useState(DEFAULTS.npsReturnPercent);
  const [annuitySharePercent, setAnnuitySharePercent] = useState(DEFAULTS.annuitySharePercent);
  const [annuityRatePercent, setAnnuityRatePercent] = useState(DEFAULTS.annuityRatePercent);
  const [annuityRop, setAnnuityRop] = useState(DEFAULTS.annuityRop);
  const [retirementYears, setRetirementYears] = useState(DEFAULTS.retirementYears);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareUpsVsNps({
        currentBasic: toNumber(currentBasic),
        daNowPercent: toNumber(daNowPercent),
        basicGrowthPercent: toNumber(basicGrowthPercent),
        daStepPointsPerYear: toNumber(daStepPointsPerYear),
        yearsToRetirement: toNumber(yearsToRetirement),
        qualifyingServiceYears: toNumber(qualifyingServiceYears),
        existingNpsCorpus: toNumber(existingNpsCorpus),
        employeeContribPercent: toNumber(employeeContribPercent),
        employerContribPercent: toNumber(employerContribPercent),
        npsReturnPercent: toNumber(npsReturnPercent),
        annuitySharePercent: toNumber(annuitySharePercent),
        annuityRatePercent: toNumber(annuityRatePercent),
        annuityReturnsPurchasePrice: annuityRop === "yes",
        retirementYears: toNumber(retirementYears),
      }),
    [
      currentBasic,
      daNowPercent,
      basicGrowthPercent,
      daStepPointsPerYear,
      yearsToRetirement,
      qualifyingServiceYears,
      existingNpsCorpus,
      employeeContribPercent,
      employerContribPercent,
      npsReturnPercent,
      annuitySharePercent,
      annuityRatePercent,
      annuityRop,
      retirementYears,
    ],
  );

  const failed = Boolean(result.error);

  const heroValue = useMemo(() => {
    if (failed) return DASH;
    if (result.requiredReturnAboveCap) return `Above ${MAX_SOLVE_RETURN}%`;
    if (result.requiredReturnBelowFloor) return `Below ${MIN_SOLVE_RETURN}%`;
    return pct2(result.requiredReturn);
  }, [failed, result]);

  const heroExDr = useMemo(() => {
    if (failed) return DASH;
    if (result.requiredReturnExDrAboveCap) return `above ${MAX_SOLVE_RETURN}%`;
    if (result.requiredReturnExDrBelowFloor) return `below ${MIN_SOLVE_RETURN}%`;
    return pct2(result.requiredReturnExDr);
  }, [failed, result]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "UPS vs NPS Comparator",
      `Average basic pay of the last 12 months: ${money(result.avgBasicLast12)}`,
      `Qualifying service counted: ${NUM1.format(result.countedServiceYears)} of 25 years (${pct1(result.servicePercent)} of the full rate)`,
      "",
      "UPS (notification F. No. FX-1/3/2024-PR dated 24-01-2025)",
      `  Assured payout (50% rule): ${money(result.assuredPayout)} a month`,
      `  Dearness Relief at ${pct1(result.daAtSuperannuation)}: ${money(result.drAtSuperannuation)}`,
      `  Total monthly at superannuation: ${money(result.upsMonthlyAtRetirement)}`,
      `  Family payout (60%): ${money(result.upsFamilyMonthly)} a month`,
      `  Lump sum (1/10th of emoluments x ${result.completedHalfYears} completed six-month blocks): ${money(result.upsLumpSum)}`,
      "",
      `NPS at ${pct1(toNumber(npsReturnPercent))} a year (PFRDA exit rules)`,
      `  Corpus at superannuation: ${money(result.npsCorpus)}`,
      `  Annuitised ${pct1(toNumber(annuitySharePercent))}: ${money(result.npsAnnuityPurchase)}`,
      `  Commuted lump sum: ${money(result.npsCommutedLumpSum)}`,
      `  Monthly pension at ${pct1(toNumber(annuityRatePercent))} annuity rate: ${money(result.npsMonthlyPension)}`,
      `  Estate left at superannuation: ${money(result.npsBequest)}`,
      "",
      `NPS return needed to match the UPS payout: ${heroValue}`,
      `  (to match the 50% assured payout before DR: ${heroExDr})`,
      `Bequest value forgone under UPS: ${signedMoney(result.bequestGivenUpUnderUps)}`,
    ].join("\n");
  }, [
    failed,
    result,
    heroValue,
    heroExDr,
    npsReturnPercent,
    annuitySharePercent,
    annuityRatePercent,
  ]);

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
    setCurrentBasic(DEFAULTS.currentBasic);
    setDaNowPercent(DEFAULTS.daNowPercent);
    setBasicGrowthPercent(DEFAULTS.basicGrowthPercent);
    setDaStepPointsPerYear(DEFAULTS.daStepPointsPerYear);
    setYearsToRetirement(DEFAULTS.yearsToRetirement);
    setQualifyingServiceYears(DEFAULTS.qualifyingServiceYears);
    setExistingNpsCorpus(DEFAULTS.existingNpsCorpus);
    setEmployeeContribPercent(DEFAULTS.employeeContribPercent);
    setEmployerContribPercent(DEFAULTS.employerContribPercent);
    setNpsReturnPercent(DEFAULTS.npsReturnPercent);
    setAnnuitySharePercent(DEFAULTS.annuitySharePercent);
    setAnnuityRatePercent(DEFAULTS.annuityRatePercent);
    setAnnuityRop(DEFAULTS.annuityRop);
    setRetirementYears(DEFAULTS.retirementYears);
    setCopied(false);
  };

  const upsRows = [
    ["Average basic pay, last 12 months", failed ? DASH : money(result.avgBasicLast12)],
    [
      "Qualifying service counted",
      failed
        ? DASH
        : `${NUM1.format(result.countedServiceYears)} / 25 years (${pct1(result.servicePercent)})`,
    ],
    ["Assured payout at 50% of average basic", failed ? DASH : money(result.assuredPayout)],
    [
      `Dearness Relief at ${failed ? DASH : pct1(result.daAtSuperannuation)}`,
      failed ? DASH : money(result.drAtSuperannuation),
    ],
    ["Family payout (60% of the above)", failed ? DASH : money(result.upsFamilyMonthly)],
    [
      `Lump sum, ${failed ? DASH : result.completedHalfYears} completed six-month blocks`,
      failed ? DASH : money(result.upsLumpSum),
    ],
  ];

  const npsRows = [
    ["Corpus at superannuation", failed ? DASH : money(result.npsCorpus)],
    ["Of which your + employer contributions", failed ? DASH : money(result.npsContributed)],
    ["Of which investment growth", failed ? DASH : money(result.npsGrowth)],
    ["Annuitised share (purchase price)", failed ? DASH : money(result.npsAnnuityPurchase)],
    ["Commuted lump sum, tax-free u/s 10(12A)", failed ? DASH : money(result.npsCommutedLumpSum)],
    ["Estate left at superannuation", failed ? DASH : money(result.npsBequest)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Pension scheme comparison
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">UPS vs NPS Comparator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Models the Unified Pension Scheme assured payout beside a National Pension System annuity
          on the same pay history, then solves for the one number that makes the two comparable:
          the annual NPS return at which the NPS pension would equal the UPS payout. Every
          assumption below is yours to edit.
        </p>
      </header>

      <section className={CARD_CLASS} aria-labelledby="upsnps-pay-heading">
        <h2 id="upsnps-pay-heading" className="text-base font-semibold">
          Your pay and service
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-basic">
              Current monthly basic pay (INR)
            </label>
            <input
              id="upsnps-basic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={currentBasic}
              onChange={(event) => setCurrentBasic(event.target.value)}
            />
            <p className={HINT_CLASS}>Basic pay only — exclude DA, HRA and every other allowance.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-da">
              Dearness Allowance now (% of basic)
            </label>
            <input
              id="upsnps-da"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="1"
              value={daNowPercent}
              onChange={(event) => setDaNowPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>Central Government DA is 60% with effect from 01-01-2026.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-growth">
              Basic pay growth (% per year)
            </label>
            <input
              id="upsnps-growth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={basicGrowthPercent}
              onChange={(event) => setBasicGrowthPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The annual increment is 3% of basic under the CCS (Revised Pay) Rules, 2016. Raise it
              to allow for promotions or a pay commission.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-dastep">
              DA / DR growth (percentage points per year)
            </label>
            <input
              id="upsnps-dastep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={daStepPointsPerYear}
              onChange={(event) => setDaStepPointsPerYear(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The two AICPI-IW instalments added about 5 points a year over 2025-26. A pay
              commission resets DA to zero, which this straight-line model does not do.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-years">
              Years left to superannuation
            </label>
            <input
              id="upsnps-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="45"
              step="1"
              value={yearsToRetirement}
              onChange={(event) => setYearsToRetirement(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-service">
              Total qualifying service at superannuation (years)
            </label>
            <input
              id="upsnps-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="45"
              step="1"
              value={qualifyingServiceYears}
              onChange={(event) => setQualifyingServiceYears(event.target.value)}
            />
            <p className={HINT_CLASS}>
              25 years earns the full rate; 10 years is the floor for any assured payout.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD_CLASS}`} aria-labelledby="upsnps-nps-heading">
        <h2 id="upsnps-nps-heading" className="text-base font-semibold">
          NPS assumptions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-corpus">
              NPS corpus already accumulated (INR)
            </label>
            <input
              id="upsnps-corpus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={existingNpsCorpus}
              onChange={(event) => setExistingNpsCorpus(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-return">
              Assumed NPS return (% per year)
            </label>
            <input
              id="upsnps-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-15"
              max="30"
              step="0.25"
              value={npsReturnPercent}
              onChange={(event) => setNpsReturnPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>NPS is market-linked; nothing about this rate is guaranteed.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-emp">
              Employee contribution (% of basic + DA)
            </label>
            <input
              id="upsnps-emp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={employeeContribPercent}
              onChange={(event) => setEmployeeContribPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-govt">
              Government contribution (% of basic + DA)
            </label>
            <input
              id="upsnps-govt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={employerContribPercent}
              onChange={(event) => setEmployerContribPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              14% for Central Government subscribers with effect from 01-04-2019.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-share">
              Share of corpus annuitised (%)
            </label>
            <input
              id="upsnps-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="100"
              step="5"
              value={annuitySharePercent}
              onChange={(event) => setAnnuitySharePercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              PFRDA exit rules set a {NPS_MIN_ANNUITY_SHARE}% floor at superannuation.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-annuity">
              Annuity rate (% per year)
            </label>
            <input
              id="upsnps-annuity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="15"
              step="0.1"
              value={annuityRatePercent}
              onChange={(event) => setAnnuityRatePercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Return-of-purchase-price annuities for a 60-year-old were quoted around 5.7%-6.4% in
              2026.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-rop">
              Annuity returns the purchase price to the nominee?
            </label>
            <select
              id="upsnps-rop"
              className={`mt-2 ${INPUT_CLASS}`}
              value={annuityRop}
              onChange={(event) => setAnnuityRop(event.target.value)}
            >
              <option value="yes">Yes — with return of purchase price</option>
              <option value="no">No — level annuity, nothing returned</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsnps-horizon">
              Years of retirement to project
            </label>
            <input
              id="upsnps-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="45"
              step="1"
              value={retirementYears}
              onChange={(event) => setRetirementYears(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD_CLASS}`} aria-labelledby="upsnps-hero-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="upsnps-hero-heading"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              NPS return needed to match the UPS payout
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{heroValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `The annuity would have to pay ${money(result.upsMonthlyAtRetirement)} a month to equal the UPS assured payout plus Dearness Relief on the day you superannuate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the UPS versus NPS comparison"
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
              aria-label="Reset all inputs to their defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && result.requiredReturnAboveCap && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            No return up to {MAX_SOLVE_RETURN}% a year builds a corpus large enough to buy that
            annuity on these contributions and this horizon.
          </p>
        )}
        {!failed && result.requiredReturnBelowFloor && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            The corpus already on hand matches the UPS payout even at {MIN_SOLVE_RETURN}% a year, so
            the matching return is off the bottom of the search range.
          </p>
        )}
        {!failed && result.minimumApplied && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            The proportionate calculation gave {money(result.proportionatePayout)}, so the assured
            minimum of {money(UPS_MIN_MONTHLY_PAYOUT)} a month applies instead.
          </p>
        )}
        {!failed && result.npsFullWithdrawalAllowed && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            The projected corpus is at or below Rs 5,00,000, the threshold at which PFRDA exit rules
            permit the whole amount to be withdrawn without buying an annuity.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "To match the 50% assured payout before Dearness Relief",
              failed ? DASH : heroExDr,
            ],
            [
              "UPS monthly payout at superannuation",
              failed ? DASH : money(result.upsMonthlyAtRetirement),
            ],
            [
              `NPS monthly pension at your assumed ${failed ? DASH : pct1(toNumber(npsReturnPercent))}`,
              failed ? DASH : money(result.npsMonthlyPension),
            ],
            [
              "NPS pension minus UPS payout, month one",
              failed ? DASH : signedMoney(result.monthlyGapAtAssumedReturn),
            ],
            ["UPS lump sum on superannuation", failed ? DASH : money(result.upsLumpSum)],
            ["NPS estate at superannuation", failed ? DASH : money(result.npsBequest)],
            [
              "Bequest value forgone under UPS",
              failed ? DASH : signedMoney(result.bequestGivenUpUnderUps),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          &quot;Bequest value forgone&quot; is the NPS estate at superannuation less the UPS lump
          sum. Under UPS the estate is replaced by the assured family payout of{" "}
          {failed ? DASH : money(result.upsFamilyMonthly)} a month, which the estate figure does not
          capture.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className={CARD_CLASS} aria-labelledby="upsnps-ups-heading">
          <h2 id="upsnps-ups-heading" className="text-base font-semibold">
            Unified Pension Scheme
          </h2>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
            {failed ? DASH : money(result.upsMonthlyAtRetirement)}
          </p>
          <p className={HINT_CLASS}>assured payout plus DR, per month, indexed thereafter</p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {upsRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={CARD_CLASS} aria-labelledby="upsnps-npsside-heading">
          <h2 id="upsnps-npsside-heading" className="text-base font-semibold">
            National Pension System
          </h2>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
            {failed ? DASH : money(result.npsMonthlyPension)}
          </p>
          <p className={HINT_CLASS}>annuity pension, per month, level for life</p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {npsRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className={`mt-6 ${CARD_CLASS}`} aria-labelledby="upsnps-schedule-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="upsnps-schedule-heading" className="text-base font-semibold">
            Year by year in retirement
          </h2>
          <button
            type="button"
            onClick={() => setShowSchedule((value) => !value)}
            aria-expanded={showSchedule}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showSchedule ? "Hide" : "Show"}
          </button>
        </div>
        <p className={HINT_CLASS}>
          The UPS payout carries Dearness Relief and rises with it. The NPS annuity is level, so the
          same rupee amount is paid every year.
        </p>
        {showSchedule &&
          (failed ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Year
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        DR rate
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        UPS monthly
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        NPS monthly
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        UPS cumulative
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        NPS cumulative
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {pct1(row.drRate)}
                        </td>
                        <td className="py-2 pr-3 text-right">{money(row.upsMonthly)}</td>
                        <td className="py-2 pr-3 text-right">{money(row.npsMonthly)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {money(row.upsCumulative)}
                        </td>
                        <td className="py-2 text-right text-[var(--muted-foreground)]">
                          {money(row.npsCumulative)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Total UPS payouts over the horizon", money(result.upsTotalOverHorizon)],
                  ["Total NPS pension over the horizon", money(result.npsTotalOverHorizon)],
                  [
                    "First year the UPS monthly payout exceeds the NPS pension",
                    result.monthlyCrossoverYear === null
                      ? "Not within the horizon"
                      : `Year ${result.monthlyCrossoverYear}`,
                  ],
                  [
                    "First year cumulative UPS exceeds cumulative NPS",
                    result.cumulativeCrossoverYear === null
                      ? "Not within the horizon"
                      : `Year ${result.cumulativeCrossoverYear}`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ))}
      </section>

      <section className={`mt-6 ${CARD_CLASS}`} aria-labelledby="upsnps-rules-heading">
        <h2 id="upsnps-rules-heading" className="text-base font-semibold">
          Which rule produced each number
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            <span className="font-semibold text-[var(--foreground)]">UPS assured payout</span> — 50%
            of the average basic pay of the last twelve months, pro-rated below 25 years of
            qualifying service, with an assured minimum of Rs 10,000 a month at 10 years or more.
            Department of Financial Services notification F. No. FX-1/3/2024-PR dated 24-01-2025,
            operative from 01-04-2025.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">UPS lump sum</span> — one-tenth
            of monthly emoluments (basic pay + DA) for every completed six months of qualifying
            service, which does not reduce the assured payout. Same notification.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Family payout and DR</span> —
            60% of the payout admissible immediately before demise; Dearness Relief on the assured
            and family payout is worked out the same way as DA for serving employees. Same
            notification.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">NPS 40% / 60% split</span> —
            PFRDA (Exits and Withdrawals under the NPS) Regulations, 2015. The commuted portion of
            up to 60% is exempt under Section 10(12A) of the Income-tax Act, 1961; the annuity
            income is taxable as it is received.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Contribution rates</span> —
            10% of basic + DA from the employee and 14% from the Central Government with effect
            from 01-04-2019, both editable above.
          </li>
        </ul>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Rules read on 29 July 2026. This page states what each rule produces for the figures you
          entered; it does not tell you which scheme to elect, and it is not financial, tax or legal
          advice. NPS returns and annuity rates are not guaranteed, a pay commission would reset
          both basic pay and DA in ways this straight-line model does not capture, and the election
          between UPS and NPS is made under statute and is not reversible. Confirm your own
          qualifying service and pay particulars with your Head of Office or Pay and Accounts
          Office.
        </p>
      </section>
    </main>
  );
}
