"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** Formats big rupee amounts the way Indian insurers quote cover: lakh / crore. */
const inWords = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 10000000) return `${NUM.format(value / 10000000)} crore`;
  if (value >= 100000) return `${NUM.format(value / 100000)} lakh`;
  return money(value);
};

const DEFAULTS = {
  annualIncome: 1200000,
  replacement: 70,
  currentAge: 35,
  supportUntilAge: 60,
  inflation: 6,
  returns: 8,
  loans: 3000000,
  goals: 5000000,
  assets: 2000000,
  existingCover: 5000000,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs text-[var(--muted-foreground)]";
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

/**
 * Present value of an inflation-growing annuity discounted at the expected
 * return — i.e. the lump sum that, invested today, replaces a rising income
 * for `years` years. Uses the real (inflation-adjusted) rate.
 */
export function presentValueOfIncome(annualNeed, years, returnPct, inflationPct) {
  if (!(annualNeed > 0) || !(years > 0)) return 0;
  const real = (1 + returnPct / 100) / (1 + inflationPct / 100) - 1;
  if (Math.abs(real) < 1e-9) return annualNeed * years;
  return (annualNeed * (1 - Math.pow(1 + real, -years))) / real;
}

/** Needs-based term cover: income replacement + debts + goals − assets − existing cover. */
export function computeTermCover(input) {
  const {
    annualIncome,
    replacement,
    currentAge,
    supportUntilAge,
    inflation,
    returns,
    loans,
    goals,
    assets,
    existingCover,
  } = input;

  const years = supportUntilAge - currentAge;
  const annualNeed = (annualIncome * replacement) / 100;
  const incomeCorpus = presentValueOfIncome(annualNeed, years, returns, inflation);
  const grossNeed = incomeCorpus + loans + goals;
  const offsets = assets + existingCover;
  const netNeed = grossNeed - offsets;
  // Insurers sell cover in fixed steps; round up to the next ₹5 lakh.
  const recommended = netNeed > 0 ? Math.ceil(netNeed / 500000) * 500000 : 0;
  const realRate = (1 + returns / 100) / (1 + inflation / 100) - 1;

  return {
    years,
    annualNeed,
    incomeCorpus,
    grossNeed,
    offsets,
    netNeed,
    recommended,
    realRate: realRate * 100,
    incomeMultiple: annualIncome > 0 ? recommended / annualIncome : 0,
    grossMultiple: annualIncome > 0 ? grossNeed / annualIncome : 0,
  };
}

export default function ToolHome() {
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [replacement, setReplacement] = useState(String(DEFAULTS.replacement));
  const [currentAge, setCurrentAge] = useState(String(DEFAULTS.currentAge));
  const [supportUntilAge, setSupportUntilAge] = useState(String(DEFAULTS.supportUntilAge));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [returns, setReturns] = useState(String(DEFAULTS.returns));
  const [loans, setLoans] = useState(String(DEFAULTS.loans));
  const [goals, setGoals] = useState(String(DEFAULTS.goals));
  const [assets, setAssets] = useState(String(DEFAULTS.assets));
  const [existingCover, setExistingCover] = useState(String(DEFAULTS.existingCover));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const values = {
      annualIncome: toNumber(annualIncome),
      replacement: toNumber(replacement),
      currentAge: toNumber(currentAge),
      supportUntilAge: toNumber(supportUntilAge),
      inflation: toNumber(inflation),
      returns: toNumber(returns),
      loans: toNumber(loans),
      goals: toNumber(goals),
      assets: toNumber(assets),
      existingCover: toNumber(existingCover),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (values.annualIncome <= 0) return { error: "Annual income must be greater than zero." };
    if (values.replacement <= 0 || values.replacement > 100) {
      return { error: "Income to replace should be between 1% and 100%." };
    }
    if (values.currentAge < 18 || values.currentAge > 70) {
      return { error: "Current age should be between 18 and 70." };
    }
    if (values.supportUntilAge <= values.currentAge) {
      return { error: "Support-until age must be greater than your current age." };
    }
    if (values.supportUntilAge > 85) {
      return { error: "Term plans rarely run past age 85 — lower the support-until age." };
    }
    if (values.inflation < 0 || values.inflation > 20) {
      return { error: "Inflation should be between 0% and 20% per year." };
    }
    if (values.returns < 0 || values.returns > 25) {
      return { error: "Expected return should be between 0% and 25% per year." };
    }
    if ([values.loans, values.goals, values.assets, values.existingCover].some((v) => v < 0)) {
      return { error: "Loans, goals, assets and existing cover cannot be negative." };
    }

    return { ...values, ...computeTermCover(values) };
  }, [
    annualIncome,
    replacement,
    currentAge,
    supportUntilAge,
    inflation,
    returns,
    loans,
    goals,
    assets,
    existingCover,
  ]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Term Insurance Cover Calculator",
      `Annual income: ${money(calc.annualIncome)} (replacing ${calc.replacement}%)`,
      `Income support for ${calc.years} years, until age ${calc.supportUntilAge}`,
      `Corpus to replace income: ${money(calc.incomeCorpus)}`,
      `Outstanding loans: ${money(calc.loans)}`,
      `Dependants' future goals: ${money(calc.goals)}`,
      `Total requirement: ${money(calc.grossNeed)}`,
      `Less existing assets: ${money(calc.assets)}`,
      `Less existing life cover: ${money(calc.existingCover)}`,
      calc.recommended > 0
        ? `Additional term cover needed: ${money(calc.recommended)} (${inWords(calc.recommended)})`
        : "Additional term cover needed: none — your existing cover and assets meet the requirement",
    ].join("\n");
  }, [calc]);

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
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setReplacement(String(DEFAULTS.replacement));
    setCurrentAge(String(DEFAULTS.currentAge));
    setSupportUntilAge(String(DEFAULTS.supportUntilAge));
    setInflation(String(DEFAULTS.inflation));
    setReturns(String(DEFAULTS.returns));
    setLoans(String(DEFAULTS.loans));
    setGoals(String(DEFAULTS.goals));
    setAssets(String(DEFAULTS.assets));
    setExistingCover(String(DEFAULTS.existingCover));
    setCopied(false);
  };

  const covered = calc.error ? false : calc.recommended <= 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Life cover
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Term Insurance Cover Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A needs-based estimate instead of a rough income multiple: it discounts the income your
          family would lose, adds outstanding loans and your children&apos;s goals, then subtracts
          the assets and policies you already hold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Income your family depends on</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="term-income">
              Annual income (INR)
            </label>
            <input
              id="term-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={annualIncome}
              onChange={(event) => setAnnualIncome(event.target.value)}
            />
            <p className={HINT_CLASS}>Post-tax annual take-home, including bonus.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-replacement">
              Share of income the family needs (%)
            </label>
            <input
              id="term-replacement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="5"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            />
            <p className={HINT_CLASS}>Household spend minus your own personal expenses — usually 60-80%.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-age">
              Your current age
            </label>
            <input
              id="term-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="70"
              step="1"
              value={currentAge}
              onChange={(event) => setCurrentAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-until">
              Replace income until age
            </label>
            <input
              id="term-until"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="19"
              max="85"
              step="1"
              value={supportUntilAge}
              onChange={(event) => setSupportUntilAge(event.target.value)}
            />
            <p className={HINT_CLASS}>Usually your retirement age, or when the youngest child starts earning.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-inflation">
              Expected inflation (% per year)
            </label>
            <input
              id="term-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={inflation}
              onChange={(event) => setInflation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-returns">
              Return on the payout (% per year)
            </label>
            <input
              id="term-returns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.5"
              value={returns}
              onChange={(event) => setReturns(event.target.value)}
            />
            <p className={HINT_CLASS}>Keep this conservative — the claim amount should sit in safe instruments.</p>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Debts, goals and what you already have</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="term-loans">
              Outstanding loans (INR)
            </label>
            <input
              id="term-loans"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={loans}
              onChange={(event) => setLoans(event.target.value)}
            />
            <p className={HINT_CLASS}>Home, car, education and personal loan balances.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-goals">
              Children&apos;s education &amp; marriage corpus (INR)
            </label>
            <input
              id="term-goals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={goals}
              onChange={(event) => setGoals(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-assets">
              Existing investments &amp; savings (INR)
            </label>
            <input
              id="term-assets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={assets}
              onChange={(event) => setAssets(event.target.value)}
            />
            <p className={HINT_CLASS}>Count only what the family can actually liquidate — not the home you live in.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="term-existing">
              Life cover you already hold (INR)
            </label>
            <input
              id="term-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={existingCover}
              onChange={(event) => setExistingCover(event.target.value)}
            />
            <p className={HINT_CLASS}>Personal term plans plus employer group cover.</p>
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
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Additional term cover needed
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${
                    covered ? "text-[var(--success)]" : "text-[var(--primary)]"
                  }`}
                >
                  {covered ? "Adequately covered" : money(calc.recommended)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {covered
                    ? `Your assets and existing cover already exceed the ${money(calc.grossNeed)} requirement.`
                    : `About ${inWords(calc.recommended)} — roughly ${num(calc.incomeMultiple)}× your annual income.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy term insurance cover result"
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
                ["Income to replace each year", `${money(calc.annualNeed)} for ${calc.years} years`],
                ["Corpus that funds that income", money(calc.incomeCorpus)],
                ["Outstanding loans to clear", money(calc.loans)],
                ["Children's education and marriage corpus", money(calc.goals)],
                ["Total requirement", money(calc.grossNeed)],
                ["Less: existing investments", `− ${money(calc.assets)}`],
                ["Less: life cover already held", `− ${money(calc.existingCover)}`],
                ["Shortfall", money(Math.max(0, calc.netNeed))],
                ["Rounded to the next ₹5 lakh slab", covered ? "—" : money(calc.recommended)],
                ["Inflation-adjusted (real) return used", `${num(calc.realRate)}% per year`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How the requirement is made up</h2>
            <div
              className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label="Split of the total requirement between income replacement, loans and goals"
            >
              {[
                ["income", calc.incomeCorpus, "bg-[var(--primary)]"],
                ["loans", calc.loans, "bg-[var(--danger)]"],
                ["goals", calc.goals, "bg-[var(--success)]"],
              ].map(([key, value, tone]) => (
                <span
                  key={key}
                  className={`block h-full ${tone}`}
                  style={{
                    width: `${calc.grossNeed > 0 ? Math.max(0, Math.min(100, (value / calc.grossNeed) * 100)) : 0}%`,
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Income replacement{" "}
              {num(calc.grossNeed > 0 ? (calc.incomeCorpus / calc.grossNeed) * 100 : 0)}% · Loans{" "}
              {num(calc.grossNeed > 0 ? (calc.loans / calc.grossNeed) * 100 : 0)}% · Goals{" "}
              {num(calc.grossNeed > 0 ? (calc.goals / calc.grossNeed) * 100 : 0)}%
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Before offsets, the requirement is about {num(calc.grossMultiple)}× your annual income.
              Choose a policy term that runs at least until age {calc.supportUntilAge}, and re-check
              this number after every salary jump, new loan or new child.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not insurance advice. Actual premiums and the cover an insurer will
        issue depend on medical underwriting, smoking status and income proof — insurers usually cap
        cover at a multiple of your documented annual income. Employer group cover ends when the job
        does, so treat it as temporary when filling the &quot;already held&quot; field.
      </p>
    </main>
  );
}
