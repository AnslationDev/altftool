"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Rocket, X } from "lucide-react";

import {
  ELIGIBLE_SECTORS,
  MAX_BANK_FINANCE_PCT,
  MAX_LOAN,
  MAX_MORATORIUM_MONTHS,
  MAX_REPAYMENT_YEARS,
  MIN_LOAN,
  MIN_OWN_CONTRIBUTION_PCT,
  SOCIAL_CATEGORIES,
  assessStandUpIndia,
  computeStandUpRepayment,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  age: "32",
  socialCategory: "general",
  gender: "female",
  entityType: "individual",
  shareholding: "100",
  greenfield: true,
  inDefault: false,
  sector: "manufacturing",
  projectCost: "4000000",
  ownContribution: "600000",
  rate: "10",
  tenure: "7",
  moratorium: "18",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [socialCategory, setSocialCategory] = useState(DEFAULTS.socialCategory);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [entityType, setEntityType] = useState(DEFAULTS.entityType);
  const [shareholding, setShareholding] = useState(DEFAULTS.shareholding);
  const [greenfield, setGreenfield] = useState(DEFAULTS.greenfield);
  const [inDefault, setInDefault] = useState(DEFAULTS.inDefault);
  const [sector, setSector] = useState(DEFAULTS.sector);
  const [projectCost, setProjectCost] = useState(DEFAULTS.projectCost);
  const [ownContribution, setOwnContribution] = useState(DEFAULTS.ownContribution);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [moratorium, setMoratorium] = useState(DEFAULTS.moratorium);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessStandUpIndia({
        ageYears: toNumber(age),
        socialCategory,
        gender,
        entityType,
        scstWomanShareholdingPct: toNumber(shareholding),
        isGreenfield: greenfield,
        hasExistingDefault: inDefault,
        sector,
        projectCost: toNumber(projectCost),
        ownContribution: toNumber(ownContribution),
      }),
    [
      age,
      socialCategory,
      gender,
      entityType,
      shareholding,
      greenfield,
      inDefault,
      sector,
      projectCost,
      ownContribution,
    ],
  );

  const ok = !result.error;

  const repayment = useMemo(() => {
    if (!ok) return { error: "Fix the inputs above first." };
    return computeStandUpRepayment({
      loanAmount: result.sizing.indicativeLoan,
      annualRate: toNumber(rate),
      tenureYears: toNumber(tenure),
      moratoriumMonths: toNumber(moratorium),
    });
  }, [ok, result, rate, tenure, moratorium]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Stand Up India eligibility check",
      result.eligible
        ? "Result: meets every scheme criterion listed below."
        : `Result: ${result.failedCount} criterion/criteria not met.`,
      `Project cost: ${money(result.sizing.projectCost)}`,
      `Indicative composite loan: ${money(result.sizing.indicativeLoan)}`,
      `Margin money required (minimum): ${money(result.sizing.minOwnContribution)}`,
      `Margin money available: ${money(result.sizing.ownContribution)} (${NUM.format(result.sizing.ownContributionPct)}%)`,
      "",
      ...result.checks.map(
        (check) => `${check.passed ? "PASS" : "CHECK"} — ${check.label}: ${check.detail}`,
      ),
    ];
    return lines.join("\n");
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
    setAge(DEFAULTS.age);
    setSocialCategory(DEFAULTS.socialCategory);
    setGender(DEFAULTS.gender);
    setEntityType(DEFAULTS.entityType);
    setShareholding(DEFAULTS.shareholding);
    setGreenfield(DEFAULTS.greenfield);
    setInDefault(DEFAULTS.inDefault);
    setSector(DEFAULTS.sector);
    setProjectCost(DEFAULTS.projectCost);
    setOwnContribution(DEFAULTS.ownContribution);
    setRate(DEFAULTS.rate);
    setTenure(DEFAULTS.tenure);
    setMoratorium(DEFAULTS.moratorium);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Government scheme
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stand Up India Loan Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stand Up India asks every bank branch to lend {money(MIN_LOAN)} to {money(MAX_LOAN)} to at
          least one SC or ST borrower and one woman borrower for a greenfield enterprise. Test an
          applicant against each criterion and size the composite loan and margin money.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-age">
              Age (completed years)
            </label>
            <input
              id="sui-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-gender">
              Gender of the promoter
            </label>
            <select
              id="sui-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="female">Woman</option>
              <option value="male">Man</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-category">
              Social category
            </label>
            <select
              id="sui-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={socialCategory}
              onChange={(event) => setSocialCategory(event.target.value)}
            >
              {SOCIAL_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-entity">
              Borrower type
            </label>
            <select
              id="sui-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              <option value="individual">Individual / proprietor</option>
              <option value="entity">Company, LLP or partnership</option>
            </select>
          </div>
          {entityType === "entity" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="sui-share">
                SC/ST and women shareholding (%)
              </label>
              <input
                id="sui-share"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={shareholding}
                onChange={(event) => setShareholding(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-sector">
              Sector of the enterprise
            </label>
            <select
              id="sui-sector"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              {ELIGIBLE_SECTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
              <option value="other">Something else</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECKBOX_ROW} htmlFor="sui-greenfield">
            <input
              id="sui-greenfield"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={greenfield}
              onChange={(event) => setGreenfield(event.target.checked)}
            />
            First venture in this activity (greenfield)
          </label>
          <label className={CHECKBOX_ROW} htmlFor="sui-default">
            <input
              id="sui-default"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={inDefault}
              onChange={(event) => setInDefault(event.target.checked)}
            />
            In default to a bank or financial institution
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Project</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-cost">
              Total project cost (INR)
            </label>
            <input
              id="sui-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={projectCost}
              onChange={(event) => setProjectCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-own">
              Margin money you can bring (INR)
            </label>
            <input
              id="sui-own"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={ownContribution}
              onChange={(event) => setOwnContribution(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Indicative composite loan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.sizing.indicativeLoan) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.eligible
                  ? `All criteria met — up to ${MAX_BANK_FINANCE_PCT}% of the project cost, term loan plus working capital`
                  : `${result.failedCount} criterion${result.failedCount === 1 ? "" : "a"} still to fix before a branch can sanction`
                : "Fix the inputs above to size the loan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Stand Up India eligibility result"
              className={GHOST_BTN}
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
            ["Project cost", ok ? money(result.sizing.projectCost) : DASH],
            [
              `Bank finance at ${MAX_BANK_FINANCE_PCT}%`,
              ok
                ? result.sizing.cappedByCeiling
                  ? `${money(result.sizing.financeAt85)} — capped at the ${money(MAX_LOAN)} scheme ceiling`
                  : money(result.sizing.financeAt85)
                : DASH,
            ],
            [
              `Minimum margin money (${MIN_OWN_CONTRIBUTION_PCT}% floor)`,
              ok
                ? `${money(result.sizing.minOwnContribution)} (${NUM.format(result.sizing.minOwnContributionPct)}%)`
                : DASH,
            ],
            [
              "Margin money available",
              ok
                ? `${money(result.sizing.ownContribution)} (${NUM.format(result.sizing.ownContributionPct)}%)`
                : DASH,
            ],
            [
              "Shortfall in margin money",
              ok ? money(result.sizing.contributionShortfall) : DASH,
            ],
            ["Funding still unaccounted for", ok ? money(result.sizing.fundingGap) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Criterion by criterion</h2>
          <ul className="mt-3 space-y-3">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className="flex gap-3 rounded-md border border-[var(--border)] p-3 text-sm"
              >
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    check.passed
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  aria-hidden="true"
                >
                  {check.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="block font-semibold">
                    {check.label}
                    <span className="sr-only">{check.passed ? " — met" : " — not met"}</span>
                  </span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{check.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Indicative repayment</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-rate">
              Interest rate (% per year)
            </label>
            <input
              id="sui-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-tenure">
              Total tenure (years, max {MAX_REPAYMENT_YEARS})
            </label>
            <input
              id="sui-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_REPAYMENT_YEARS}
              step="1"
              value={tenure}
              onChange={(event) => setTenure(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sui-moratorium">
              Moratorium (months, max {MAX_MORATORIUM_MONTHS})
            </label>
            <input
              id="sui-moratorium"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_MORATORIUM_MONTHS}
              step="1"
              value={moratorium}
              onChange={(event) => setMoratorium(event.target.value)}
            />
          </div>
        </div>

        {repayment.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {repayment.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["EMI once repayment starts", money(repayment.emi)],
              [
                "Instalments",
                `${repayment.repayMonths} months after a ${repayment.moratoriumMonths}-month moratorium`,
              ],
              ["Interest accrued during the moratorium", money(repayment.moratoriumInterest)],
              ["Interest across the instalments", money(repayment.interestAfterMoratorium)],
              ["Total interest", money(repayment.totalInterest)],
              ["Total outgo", money(repayment.totalOutgo)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The final sanction, interest rate, security and credit-guarantee cover
        are decided by the lending branch after appraisal, and state or central subsidies may
        change how much margin money you actually need to bring. Apply through the Stand Up India
        portal or your bank branch.
      </p>
    </main>
  );
}
