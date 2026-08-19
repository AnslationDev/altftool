"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const AGE_GROUPS = [
  { id: "below60", label: "Below 60", exemption: 250000, note: "Regular individual" },
  { id: "senior", label: "Senior (60-79)", exemption: 300000, note: "Higher basic exemption" },
  { id: "super", label: "Super senior (80+)", exemption: 500000, note: "Highest basic exemption" },
];

const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

const oldRegimeSlabs = (exemption) => [
  { upTo: exemption, rate: 0 },
  { upTo: Math.max(exemption, 500000), rate: 0.05 },
  { upTo: Math.max(exemption, 1000000), rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

function slabTax(income, slabs) {
  let previous = 0;
  let tax = 0;
  const rows = [];
  for (const slab of slabs) {
    const band = Math.max(0, Math.min(income, slab.upTo) - previous);
    if (band > 0 && slab.rate > 0) {
      tax += band * slab.rate;
      rows.push({
        range: `${money(previous)} - ${slab.upTo === Infinity ? "above" : money(slab.upTo)}`,
        rate: `${Math.round(slab.rate * 100)}%`,
        amount: band * slab.rate,
      });
    }
    previous = slab.upTo;
    if (income <= slab.upTo) break;
  }
  return { tax, rows };
}

function surchargeOn(taxBeforeSurcharge, income, slabs, capped) {
  const bands = capped
    ? [
        { above: 20000000, rate: 0.25 },
        { above: 10000000, rate: 0.15 },
        { above: 5000000, rate: 0.1 },
      ]
    : [
        { above: 50000000, rate: 0.37 },
        { above: 20000000, rate: 0.25 },
        { above: 10000000, rate: 0.15 },
        { above: 5000000, rate: 0.1 },
      ];
  const band = bands.find((item) => income > item.above);
  if (!band) return 0;
  let surcharge = taxBeforeSurcharge * band.rate;
  // Marginal relief: tax + surcharge cannot exceed (tax AND surcharge at the
  // threshold) + income above the threshold. The surcharge already payable at
  // the threshold matters — at ₹1 crore the 10% band is itself in force, so
  // omitting it under-taxes every band above ₹50 lakh.
  const taxAtThreshold = slabTax(band.above, slabs).tax;
  const bandAtThreshold = bands.find((item) => band.above > item.above);
  const surchargeAtThreshold = bandAtThreshold
    ? taxAtThreshold * bandAtThreshold.rate
    : 0;
  const ceiling = taxAtThreshold + surchargeAtThreshold + (income - band.above);
  if (taxBeforeSurcharge + surcharge > ceiling) {
    surcharge = Math.max(0, ceiling - taxBeforeSurcharge);
  }
  return surcharge;
}

function computeRegime({ regime, taxableIncome, exemption }) {
  const income = Math.max(0, taxableIncome);
  const slabs = regime === "new" ? NEW_REGIME_SLABS : oldRegimeSlabs(exemption);
  const { tax: grossTax, rows } = slabTax(income, slabs);

  let rebate = 0;
  if (regime === "new") {
    if (income <= 1200000) {
      rebate = Math.min(grossTax, 60000);
    } else {
      // Marginal relief around the Rs 12,00,000 rebate threshold.
      const relief = Math.max(0, grossTax - (income - 1200000));
      rebate = Math.min(grossTax, relief);
    }
  } else if (income <= 500000) {
    rebate = Math.min(grossTax, 12500);
  }

  const taxAfterRebate = Math.max(0, grossTax - rebate);
  const surcharge = taxAfterRebate > 0 ? surchargeOn(taxAfterRebate, income, slabs, regime === "new") : 0;
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const total = taxAfterRebate + surcharge + cess;

  return {
    taxableIncome: income,
    grossTax,
    rebate,
    taxAfterRebate,
    surcharge,
    cess,
    total,
    rows,
    effectiveRate: income > 0 ? (total / income) * 100 : 0,
  };
}

const DEFAULTS = {
  ageGroup: "senior",
  pension: "600000",
  interest: "250000",
  otherIncome: "0",
  salaried: true,
  d80c: "150000",
  d80d: "50000",
  d80ttb: "50000",
  otherDeductions: "0",
};

export default function ToolHome() {
  const [ageGroup, setAgeGroup] = useState(DEFAULTS.ageGroup);
  const [pension, setPension] = useState(DEFAULTS.pension);
  const [interest, setInterest] = useState(DEFAULTS.interest);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [salaried, setSalaried] = useState(DEFAULTS.salaried);
  const [d80c, setD80c] = useState(DEFAULTS.d80c);
  const [d80d, setD80d] = useState(DEFAULTS.d80d);
  const [d80ttb, setD80ttb] = useState(DEFAULTS.d80ttb);
  const [otherDeductions, setOtherDeductions] = useState(DEFAULTS.otherDeductions);
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(
    () => ({
      pension: Number(pension),
      interest: Number(interest),
      otherIncome: Number(otherIncome),
      d80c: Number(d80c),
      d80d: Number(d80d),
      d80ttb: Number(d80ttb),
      otherDeductions: Number(otherDeductions),
    }),
    [pension, interest, otherIncome, d80c, d80d, d80ttb, otherDeductions]
  );

  // Section 80D's Rs 1,00,000 ceiling only applies when the assessee themselves is a
  // senior citizen (60+) with a senior-citizen-parent premium on top. A "Below 60"
  // filer without that senior-citizen status is capped at the base self/family rate of
  // Rs 25,000 — using the lower, always-defensible figure here rather than guessing
  // whether their parents are also senior citizens (which this form doesn't ask).
  const d80dCap = ageGroup === "below60" ? 25000 : 100000;

  const error = useMemo(() => {
    const entries = Object.entries(numbers);
    if (entries.some(([, value]) => !Number.isFinite(value))) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (entries.some(([, value]) => value < 0)) {
      return "Amounts cannot be negative. Enter 0 where an item does not apply.";
    }
    if (numbers.d80c > 150000) return "Section 80C deduction is capped at Rs 1,50,000.";
    if (numbers.d80d > d80dCap) {
      return ageGroup === "below60"
        ? "Section 80D deduction cannot exceed Rs 25,000 below age 60 (the Rs 1,00,000 senior-citizen ceiling does not apply)."
        : "Section 80D deduction cannot exceed Rs 1,00,000.";
    }
    if (numbers.d80ttb > 50000) return "Section 80TTB deduction is capped at Rs 50,000 for senior citizens.";
    return "";
  }, [numbers, ageGroup, d80dCap]);

  const result = useMemo(() => {
    if (error) return null;
    const group = AGE_GROUPS.find((item) => item.id === ageGroup) || AGE_GROUPS[0];
    const grossTotal = numbers.pension + numbers.interest + numbers.otherIncome;

    const oldStandard = salaried ? Math.min(50000, numbers.pension) : 0;
    const newStandard = salaried ? Math.min(75000, numbers.pension) : 0;

    // Section 80TTB (interest deduction up to Rs 50,000) is a senior-citizen-only
    // provision; a "Below 60" filer is not entitled to it, so it never counts here.
    const effectiveD80ttb = ageGroup === "below60" ? 0 : numbers.d80ttb;
    const chapterVia = numbers.d80c + numbers.d80d + effectiveD80ttb + numbers.otherDeductions;
    const oldTaxable = Math.max(0, grossTotal - oldStandard - chapterVia);
    const newTaxable = Math.max(0, grossTotal - newStandard);

    const oldRegime = computeRegime({
      regime: "old",
      taxableIncome: oldTaxable,
      exemption: group.exemption,
    });
    const newRegime = computeRegime({ regime: "new", taxableIncome: newTaxable, exemption: 400000 });

    const better = newRegime.total <= oldRegime.total ? "new" : "old";
    return {
      group,
      grossTotal,
      oldStandard,
      newStandard,
      chapterVia,
      oldRegime,
      newRegime,
      better,
      saving: Math.abs(oldRegime.total - newRegime.total),
    };
  }, [ageGroup, error, numbers, salaried]);

  const report = useMemo(() => {
    if (!result) return "";
    return [
      "Senior Citizen Income Tax Calculator (FY 2025-26 / AY 2026-27)",
      `Age group: ${result.group.label} (basic exemption ${money(result.group.exemption)} under old regime)`,
      `Gross total income: ${money(result.grossTotal)}`,
      "",
      "Old regime",
      `  Standard deduction: ${money(result.oldStandard)}`,
      `  Chapter VI-A deductions: ${money(result.chapterVia)}`,
      `  Taxable income: ${money(result.oldRegime.taxableIncome)}`,
      `  Tax before rebate: ${money(result.oldRegime.grossTax)}`,
      `  Section 87A rebate: ${money(result.oldRegime.rebate)}`,
      `  Surcharge: ${money(result.oldRegime.surcharge)}  |  Cess 4%: ${money(result.oldRegime.cess)}`,
      `  Total tax payable: ${money(result.oldRegime.total)}`,
      "",
      "New regime",
      `  Standard deduction: ${money(result.newStandard)}`,
      `  Taxable income: ${money(result.newRegime.taxableIncome)}`,
      `  Tax before rebate: ${money(result.newRegime.grossTax)}`,
      `  Section 87A rebate: ${money(result.newRegime.rebate)}`,
      `  Surcharge: ${money(result.newRegime.surcharge)}  |  Cess 4%: ${money(result.newRegime.cess)}`,
      `  Total tax payable: ${money(result.newRegime.total)}`,
      "",
      `Better option: ${result.better === "new" ? "New regime" : "Old regime"} (saves ${money(result.saving)})`,
      "Informational estimate only — confirm with the Income Tax Department or a tax professional.",
    ].join("\n");
  }, [result]);

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
    setAgeGroup(DEFAULTS.ageGroup);
    setPension(DEFAULTS.pension);
    setInterest(DEFAULTS.interest);
    setOtherIncome(DEFAULTS.otherIncome);
    setSalaried(DEFAULTS.salaried);
    setD80c(DEFAULTS.d80c);
    setD80d(DEFAULTS.d80d);
    setD80ttb(DEFAULTS.d80ttb);
    setOtherDeductions(DEFAULTS.otherDeductions);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";

  const winner = result ? (result.better === "new" ? result.newRegime : result.oldRegime) : null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Senior Citizen Income Tax Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Estimate tax for FY 2025-26 (AY 2026-27) using the higher basic exemption limits for
            residents aged 60+ and 80+, and compare the old regime against the new regime.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your details</h2>

            <fieldset className="mt-4">
              <legend className={labelClass}>Age group on the last day of the year</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {AGE_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setAgeGroup(group.id)}
                    aria-pressed={ageGroup === group.id}
                    className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ring-1 transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      ageGroup === group.id
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-[var(--primary)]"
                        : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)]"
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Old regime basic exemption:{" "}
                {money((AGE_GROUPS.find((g) => g.id === ageGroup) || AGE_GROUPS[0]).exemption)}. The
                new regime uses {money(400000)} for every age.
              </p>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="sc-pension">
                  Salary / pension income (Rs)
                </label>
                <input
                  id="sc-pension"
                  className={inputClass}
                  inputMode="numeric"
                  value={pension}
                  onChange={(event) => setPension(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="sc-interest">
                  Interest income (Rs)
                </label>
                <input
                  id="sc-interest"
                  className={inputClass}
                  inputMode="numeric"
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="sc-other-income">
                  Other income — rent, dividends, etc. (Rs)
                </label>
                <input
                  id="sc-other-income"
                  className={inputClass}
                  inputMode="numeric"
                  value={otherIncome}
                  onChange={(event) => setOtherIncome(event.target.value)}
                />
              </div>
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm">
              <input
                id="sc-salaried"
                type="checkbox"
                checked={salaried}
                onChange={(event) => setSalaried(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span>
                This income includes salary or pension (claims standard deduction of{" "}
                {money(50000)} old / {money(75000)} new)
              </span>
            </label>

            <h3 className="mt-6 text-sm font-semibold">Old-regime deductions</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="sc-80c">
                  Section 80C (max {money(150000)})
                </label>
                <input
                  id="sc-80c"
                  className={inputClass}
                  inputMode="numeric"
                  value={d80c}
                  onChange={(event) => setD80c(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="sc-80d">
                  Section 80D health insurance (max {money(d80dCap)})
                </label>
                <input
                  id="sc-80d"
                  className={inputClass}
                  inputMode="numeric"
                  value={d80d}
                  onChange={(event) => setD80d(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="sc-80ttb">
                  Section 80TTB interest {ageGroup === "below60" ? "(60+ only)" : `(max ${money(50000)})`}
                </label>
                <input
                  id="sc-80ttb"
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)]`}
                  inputMode="numeric"
                  value={d80ttb}
                  onChange={(event) => setD80ttb(event.target.value)}
                  disabled={ageGroup === "below60"}
                  aria-describedby={ageGroup === "below60" ? "sc-80ttb-note" : undefined}
                />
                {ageGroup === "below60" ? (
                  <p id="sc-80ttb-note" className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Not available below age 60. Savings-account interest may qualify for the separate
                    Section 80TTA deduction (up to Rs 10,000) — enter it under &ldquo;Other
                    deductions&rdquo; if it applies to you.
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="sc-other-ded">
                  Other deductions (80G, 80TTA, etc.)
                </label>
                <input
                  id="sc-other-ded"
                  className={inputClass}
                  inputMode="numeric"
                  value={otherDeductions}
                  onChange={(event) => setOtherDeductions(event.target.value)}
                />
              </div>
            </div>

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
                aria-label="Copy tax calculation result to clipboard"
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
            <h2 className="text-base font-semibold">Estimated tax</h2>
            {result ? (
              <>
                <div aria-live="polite" aria-atomic="true">
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    Lowest tax — {result.better === "new" ? "new regime" : "old regime"}
                  </p>
                  <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                    {money(winner.total)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--success)]">
                    {result.saving > 0
                      ? `Saves ${money(result.saving)} versus the other regime`
                      : "Both regimes cost the same"}
                  </p>
                </div>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Gross total income" value={money(result.grossTotal)} />
                  <Row
                    label="Basic exemption (old regime)"
                    value={money(result.group.exemption)}
                  />
                  <Row label="Effective tax rate" value={`${winner.effectiveRate.toFixed(2)}%`} />
                </dl>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <RegimeCard
                    title="Old regime"
                    highlight={result.better === "old"}
                    standard={result.oldStandard}
                    deductions={result.chapterVia}
                    data={result.oldRegime}
                  />
                  <RegimeCard
                    title="New regime"
                    highlight={result.better === "new"}
                    standard={result.newStandard}
                    deductions={0}
                    data={result.newRegime}
                  />
                </div>

                <div className="mt-5 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                  Higher exemption limits of {money(300000)} (60-79) and {money(500000)} (80+) apply
                  only under the old regime. Figures are an informational estimate for FY 2025-26 and
                  exclude special-rate income such as capital gains.
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see your tax estimate.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function RegimeCard({ title, highlight, standard, deductions, data }) {
  return (
    <div
      className={`rounded-lg p-4 ring-1 ${
        highlight ? "ring-[var(--primary)] bg-[var(--muted)]" : "ring-[var(--border)]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-2xl font-bold">{money(data.total)}</p>
      <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
        <li className="flex justify-between gap-2">
          <span>Standard deduction</span>
          <span>{money(standard)}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Chapter VI-A</span>
          <span>{money(deductions)}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Taxable income</span>
          <span>{money(data.taxableIncome)}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Tax before rebate</span>
          <span>{money(data.grossTax)}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Section 87A rebate</span>
          <span>-{money(data.rebate)}</span>
        </li>
        {data.surcharge > 0 ? (
          <li className="flex justify-between gap-2">
            <span>Surcharge</span>
            <span>{money(data.surcharge)}</span>
          </li>
        ) : null}
        <li className="flex justify-between gap-2">
          <span>Health &amp; education cess 4%</span>
          <span>{money(data.cess)}</span>
        </li>
      </ul>
    </div>
  );
}
