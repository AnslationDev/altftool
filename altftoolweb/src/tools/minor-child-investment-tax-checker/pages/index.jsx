"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { INSTRUMENTS, SECTION_10_32_EXEMPTION, assessMinorIncome } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  instrument: "fd",
  annualIncome: "20000",
  childHasDisability80U: false,
  marriageSubsists: true,
  parentAIncome: "1200000",
  parentBIncome: "800000",
  maintainingParent: "A",
  regime: "old",
  marginalRatePct: "30",
};

const RATE_OPTIONS = [0, 5, 10, 15, 20, 25, 30];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [instrument, setInstrument] = useState(DEFAULTS.instrument);
  const [annualIncome, setAnnualIncome] = useState(DEFAULTS.annualIncome);
  const [childHasDisability80U, setChildHasDisability80U] = useState(
    DEFAULTS.childHasDisability80U,
  );
  const [marriageSubsists, setMarriageSubsists] = useState(DEFAULTS.marriageSubsists);
  const [parentAIncome, setParentAIncome] = useState(DEFAULTS.parentAIncome);
  const [parentBIncome, setParentBIncome] = useState(DEFAULTS.parentBIncome);
  const [maintainingParent, setMaintainingParent] = useState(DEFAULTS.maintainingParent);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [marginalRatePct, setMarginalRatePct] = useState(DEFAULTS.marginalRatePct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const income = toNumber(annualIncome);
    const parentA = toNumber(parentAIncome);
    const parentB = toNumber(parentBIncome);
    const rate = toNumber(marginalRatePct);

    if ([income, parentA, parentB, rate].some((value) => Number.isNaN(value))) {
      return { error: "Fill in the income, both parent incomes and the marginal rate with numbers." };
    }

    return assessMinorIncome({
      instrument,
      annualIncome: income,
      childHasDisability80U,
      marriageSubsists,
      parentAIncome: parentA,
      parentBIncome: parentB,
      maintainingParent,
      regime,
      marginalRatePct: rate,
    });
  }, [
    instrument,
    annualIncome,
    childHasDisability80U,
    marriageSubsists,
    parentAIncome,
    parentBIncome,
    maintainingParent,
    regime,
    marginalRatePct,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Minor child investment tax check — section 64(1A)",
      `Income type: ${result.instrumentLabel}`,
      `Verdict: ${result.headline}`,
      `Taxed in: ${result.taxedIn}`,
      `Gross income: ${money(result.grossIncome)}`,
      `Section 10(32) exemption: ${money(result.section1032Exemption)}`,
      `Amount added to the return: ${money(result.taxableAmount)}`,
      result.totalTax === null
        ? "Tax cost: depends on the child's own slab and basic exemption limit"
        : `Extra tax including cess: ${money(result.totalTax)}`,
      "",
      ...result.reasons.map((reason) => `- ${reason}`),
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
    setInstrument(DEFAULTS.instrument);
    setAnnualIncome(DEFAULTS.annualIncome);
    setChildHasDisability80U(DEFAULTS.childHasDisability80U);
    setMarriageSubsists(DEFAULTS.marriageSubsists);
    setParentAIncome(DEFAULTS.parentAIncome);
    setParentBIncome(DEFAULTS.parentBIncome);
    setMaintainingParent(DEFAULTS.maintainingParent);
    setRegime(DEFAULTS.regime);
    setMarginalRatePct(DEFAULTS.marginalRatePct);
    setCopied(false);
  };

  const headlineColour = hasError
    ? "text-[var(--muted-foreground)]"
    : result.treatment === "clubbed"
      ? "text-[var(--primary)]"
      : "text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Section 64(1A) and section 10(32)
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Minor Child Investment Tax Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A minor's investment income is normally added to the return of the parent with the higher
          income, with only Rs {SECTION_10_32_EXEMPTION} per child excluded. Exempt accounts and the
          child's own earnings are treated differently.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mci-instrument">
              Where does the child's income come from
            </label>
            <select
              id="mci-instrument"
              className={`mt-2 ${INPUT_CLASS}`}
              value={instrument}
              onChange={(event) => setInstrument(event.target.value)}
            >
              {INSTRUMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mci-income">
              Income this year (INR)
            </label>
            <input
              id="mci-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={annualIncome}
              onChange={(event) => setAnnualIncome(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mci-regime">
              Parent's tax regime
            </label>
            <select
              id="mci-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="old">Old regime — section 10(32) allowed</option>
              <option value="new">New regime — section 10(32) withdrawn</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mci-parent-a">
              Parent A total income, excluding the child's (INR)
            </label>
            <input
              id="mci-parent-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={parentAIncome}
              onChange={(event) => setParentAIncome(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mci-parent-b">
              Parent B total income, excluding the child's (INR)
            </label>
            <input
              id="mci-parent-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={parentBIncome}
              onChange={(event) => setParentBIncome(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mci-rate">
              Clubbing parent's marginal rate (%)
            </label>
            <select
              id="mci-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marginalRatePct}
              onChange={(event) => setMarginalRatePct(event.target.value)}
            >
              {RATE_OPTIONS.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>

          {!marriageSubsists && (
            <div>
              <label className={LABEL_CLASS} htmlFor="mci-maintaining">
                Which parent maintains the child
              </label>
              <select
                id="mci-maintaining"
                className={`mt-2 ${INPUT_CLASS}`}
                value={maintainingParent}
                onChange={(event) => setMaintainingParent(event.target.value)}
              >
                <option value="A">Parent A</option>
                <option value="B">Parent B</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="mci-marriage">
            <input
              id="mci-marriage"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={marriageSubsists}
              onChange={(event) => setMarriageSubsists(event.target.checked)}
            />
            The marriage of the parents subsists
          </label>
          <label
            className="flex min-h-11 items-start gap-3 text-sm font-medium"
            htmlFor="mci-disability"
          >
            <input
              id="mci-disability"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={childHasDisability80U}
              onChange={(event) => setChildHasDisability80U(event.target.checked)}
            />
            The child has a disability of the nature specified in section 80U
          </label>
        </div>
      </section>

      {hasError ? (
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Whose return does it go into
            </p>
            <p className={`mt-1 text-2xl font-semibold sm:text-3xl ${headlineColour}`}>
              {hasError ? "—" : result.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : result.taxedIn}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the minor child tax result"
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
            ["Income earned by the child", hasError ? "—" : money(result.grossIncome)],
            [
              "Exempt under the scheme's own section",
              hasError ? "—" : money(result.instrumentExempt),
            ],
            [
              `Section 10(32) exemption (max Rs ${SECTION_10_32_EXEMPTION})`,
              hasError ? "—" : money(result.section1032Exemption),
            ],
            ["Amount added to the return", hasError ? "—" : money(result.taxableAmount)],
            [
              "Income tax on the added amount",
              hasError || result.incomeTax === null ? "—" : money(result.incomeTax),
            ],
            [
              "Health and education cess",
              hasError || result.cess === null ? "—" : money(result.cess),
            ],
            [
              "Extra tax outgo",
              hasError || result.totalTax === null ? "—" : money(result.totalTax),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                  aria-hidden="true"
                />
                {reason}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
            {result.instrumentDetail}
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">When clubbing does not apply</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            "Income from manual work done by the child.",
            "Income from an activity involving the child's own skill, talent or specialised knowledge and experience.",
            "Income of a minor child suffering from a disability specified in section 80U.",
            "Income that is exempt anyway, such as PPF interest under section 10(11) or Sukanya Samriddhi interest under section 10(11A).",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The tax figure is an estimate at the marginal rate you
        pick and ignores surcharge, rebate and the special rates that apply to capital gains. Once
        the income has been clubbed with one parent it stays there in later years unless the
        Assessing Officer directs otherwise. Confirm your position with a chartered accountant.
      </p>
    </main>
  );
}
