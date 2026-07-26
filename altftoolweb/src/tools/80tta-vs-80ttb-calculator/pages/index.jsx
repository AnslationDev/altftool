"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const TTA_LIMIT = 10000;
const TTB_LIMIT = 50000;
const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

const DEFAULTS = {
  senior: true,
  savings: "18000",
  deposits: "60000",
  otherInterest: "0",
  slab: "20",
};

function compute({ savings, deposits, otherInterest, senior }) {
  const totalInterest = savings + deposits + otherInterest;

  // Section 80TTA: savings-account interest only, capped at Rs 10,000, for taxpayers below 60.
  const ttaEligibleInterest = savings;
  const tta = Math.min(TTA_LIMIT, ttaEligibleInterest);

  // Section 80TTB: savings plus fixed and recurring deposit interest, capped at Rs 50,000, for resident seniors.
  const ttbEligibleInterest = savings + deposits;
  const ttb = Math.min(TTB_LIMIT, ttbEligibleInterest);

  const allowed = senior ? ttb : tta;
  return {
    totalInterest,
    tta,
    ttb,
    allowed,
    section: senior ? "80TTB" : "80TTA",
    taxableInterest: Math.max(0, totalInterest - allowed),
    unusedHeadroom: Math.max(0, (senior ? TTB_LIMIT : TTA_LIMIT) - allowed),
    ineligibleInterest: senior ? otherInterest : deposits + otherInterest,
  };
}

export default function ToolHome() {
  const [senior, setSenior] = useState(DEFAULTS.senior);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [deposits, setDeposits] = useState(DEFAULTS.deposits);
  const [otherInterest, setOtherInterest] = useState(DEFAULTS.otherInterest);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [copied, setCopied] = useState(false);

  const values = useMemo(
    () => ({
      savings: Number(savings),
      deposits: Number(deposits),
      otherInterest: Number(otherInterest),
    }),
    [savings, deposits, otherInterest]
  );

  const error = useMemo(() => {
    const list = Object.values(values);
    if (list.some((value) => !Number.isFinite(value))) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (list.some((value) => value < 0)) return "Interest amounts cannot be negative.";
    if (list.some((value) => value > 50000000)) {
      return "That interest amount looks too large. Enter the yearly interest in rupees.";
    }
    return "";
  }, [values]);

  const result = useMemo(() => {
    if (error) return null;
    const current = compute({ ...values, senior });
    const alternate = compute({ ...values, senior: !senior });
    const rate = Number(slab) / 100;
    return {
      current,
      alternate,
      taxSaved: current.allowed * rate * 1.04,
      taxOnBalance: current.taxableInterest * rate * 1.04,
      difference: Math.abs(current.allowed - alternate.allowed),
      rate,
    };
  }, [error, senior, slab, values]);

  const report = useMemo(() => {
    if (!result) return "";
    const { current, alternate } = result;
    return [
      "80TTA vs 80TTB Interest Deduction",
      `Taxpayer: ${senior ? "Resident senior citizen (60+)" : "Below 60"}`,
      `Savings account interest: ${money(values.savings)}`,
      `Fixed / recurring deposit interest: ${money(values.deposits)}`,
      `Other interest (bonds, loans, etc.): ${money(values.otherInterest)}`,
      `Total interest income: ${money(current.totalInterest)}`,
      "",
      `Section applicable: ${current.section}`,
      `Deduction allowed: ${money(current.allowed)} (limit ${money(senior ? TTB_LIMIT : TTA_LIMIT)})`,
      `Taxable interest after deduction: ${money(current.taxableInterest)}`,
      `Tax saved at ${slab}% + 4% cess: ${money(result.taxSaved)}`,
      "",
      `Section 80TTA on the same income: ${money(current.tta)} (savings interest only, cap ${money(TTA_LIMIT)})`,
      `Section 80TTB on the same income: ${money(current.ttb)} (savings + deposits, cap ${money(TTB_LIMIT)})`,
      `Difference between the two sections: ${money(Math.abs(current.ttb - current.tta))}`,
      `If your age status were the opposite, the deduction would be ${money(alternate.allowed)}.`,
      "Both deductions are available under the old tax regime only, and you cannot claim 80TTA and 80TTB together.",
      "Informational estimate only — confirm with the Income Tax Department or a tax professional.",
    ].join("\n");
  }, [result, senior, slab, values]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSenior(DEFAULTS.senior);
    setSavings(DEFAULTS.savings);
    setDeposits(DEFAULTS.deposits);
    setOtherInterest(DEFAULTS.otherInterest);
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";
  const chip = (active) =>
    `min-h-11 rounded-md px-3 py-2 text-sm font-semibold ring-1 transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
      active
        ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-[var(--primary)]"
        : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)]"
    }`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            80TTA vs 80TTB Interest Deduction
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Section 80TTA gives up to Rs 10,000 on savings-account interest to taxpayers below 60.
            Section 80TTB gives resident senior citizens up to Rs 50,000 covering savings, fixed and
            recurring deposit interest. Compare both on your own numbers.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your interest income</h2>

            <fieldset className="mt-4">
              <legend className={labelClass}>Age status</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSenior(false)}
                  aria-pressed={!senior}
                  className={chip(!senior)}
                >
                  Below 60 (80TTA)
                </button>
                <button
                  type="button"
                  onClick={() => setSenior(true)}
                  aria-pressed={senior}
                  className={chip(senior)}
                >
                  Senior citizen 60+ (80TTB)
                </button>
              </div>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="tt-savings">
                  Savings account interest (Rs)
                </label>
                <input
                  id="tt-savings"
                  className={inputClass}
                  inputMode="numeric"
                  value={savings}
                  onChange={(event) => setSavings(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="tt-deposits">
                  Fixed / recurring deposit interest (Rs)
                </label>
                <input
                  id="tt-deposits"
                  className={inputClass}
                  inputMode="numeric"
                  value={deposits}
                  onChange={(event) => setDeposits(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="tt-other">
                  Other interest — bonds, loans (Rs)
                </label>
                <input
                  id="tt-other"
                  className={inputClass}
                  inputMode="numeric"
                  value={otherInterest}
                  onChange={(event) => setOtherInterest(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="tt-slab">
                  Your income tax slab rate
                </label>
                <select
                  id="tt-slab"
                  className={inputClass}
                  value={slab}
                  onChange={(event) => setSlab(event.target.value)}
                >
                  {SLAB_RATES.map((value) => (
                    <option key={value} value={String(value)}>
                      {value}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Neither section covers interest from bonds, debentures or loans given to others, so
              enter that separately — it stays fully taxable.
            </p>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                aria-label="Copy 80TTA and 80TTB comparison result to clipboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ring-1 ring-[var(--border)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Deduction you can claim</h2>
            {result ? (
              <>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Section {result.current.section} deduction
                </p>
                <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                  {money(result.current.allowed)}
                </p>
                <p className="mt-1 text-sm text-[var(--success)]">
                  <PiggyBank className="mr-1 inline h-3.5 w-3.5" />
                  Roughly {money(result.taxSaved)} of tax saved at {slab}% plus cess
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Total interest income" value={money(result.current.totalInterest)} />
                  <Row
                    label={`Deduction limit (${result.current.section})`}
                    value={money(senior ? TTB_LIMIT : TTA_LIMIT)}
                  />
                  <Row label="Unused headroom" value={money(result.current.unusedHeadroom)} />
                  <Row
                    label="Interest not covered by this section"
                    value={money(result.current.ineligibleInterest)}
                  />
                  <Row
                    label="Taxable interest after deduction"
                    value={money(result.current.taxableInterest)}
                  />
                  <Row label="Tax on the balance interest" value={money(result.taxOnBalance)} strong />
                </dl>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Card
                    title="Section 80TTA"
                    subtitle={`Savings interest only · cap ${money(TTA_LIMIT)}`}
                    value={result.current.tta}
                    active={!senior}
                  />
                  <Card
                    title="Section 80TTB"
                    subtitle={`Savings + FD/RD · cap ${money(TTB_LIMIT)}`}
                    value={result.current.ttb}
                    active={senior}
                  />
                </div>

                <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  {senior
                    ? `As a senior citizen you claim 80TTB, which is ${money(
                        Math.abs(result.current.ttb - result.current.tta)
                      )} more than 80TTA would allow on the same income. 80TTA cannot be claimed alongside it.`
                    : `Below 60 only 80TTA applies, so deposit interest stays fully taxable. At 60 the same income would qualify for ${money(
                        result.current.ttb
                      )} under 80TTB.`}{" "}
                  Both sections are available under the old tax regime only.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see your deduction.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className={strong ? "text-base font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

function Card({ title, subtitle, value, active }) {
  return (
    <div
      className={`rounded-lg p-4 ring-1 ${
        active ? "ring-[var(--primary)] bg-[var(--muted)]" : "ring-[var(--border)]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xl font-bold">{money(value)}</p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{subtitle}</p>
      <p className="mt-2 text-xs font-semibold text-[var(--primary)]">
        {active ? "Applies to you" : "Not available to you"}
      </p>
    </div>
  );
}
