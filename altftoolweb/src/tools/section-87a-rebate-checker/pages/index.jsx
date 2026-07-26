"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, XCircle } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

const OLD_REGIME_SLABS = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const REGIMES = {
  new: {
    id: "new",
    label: "New regime (default)",
    slabs: NEW_REGIME_SLABS,
    threshold: 1200000,
    maxRebate: 60000,
    marginalRelief: true,
    standardDeduction: 75000,
  },
  old: {
    id: "old",
    label: "Old regime",
    slabs: OLD_REGIME_SLABS,
    threshold: 500000,
    maxRebate: 12500,
    marginalRelief: false,
    standardDeduction: 50000,
  },
};

function slabTax(income, slabs) {
  let previous = 0;
  let tax = 0;
  for (const slab of slabs) {
    const band = Math.max(0, Math.min(income, slab.upTo) - previous);
    if (band > 0 && slab.rate > 0) tax += band * slab.rate;
    previous = slab.upTo;
    if (income <= slab.upTo) break;
  }
  return tax;
}

// 111A short-term equity gains are taxed at a flat 20%; 112A long-term equity
// gains at 12.5% on the amount above the ₹1,25,000 annual exemption. Neither
// follows the slabs, so they must be taxed separately from normal income.
const STCG_111A_RATE = 0.2;
const LTCG_112A_RATE = 0.125;
const LTCG_112A_EXEMPTION = 125000;

function specialRateTax(stcg, ltcg) {
  const stcgTax = Math.max(0, stcg) * STCG_111A_RATE;
  const ltcgTax =
    Math.max(0, Math.max(0, ltcg) - LTCG_112A_EXEMPTION) * LTCG_112A_RATE;
  return stcgTax + ltcgTax;
}

function analyse(regimeId, taxableIncome, stcg111a, ltcg112a) {
  const regime = REGIMES[regimeId];
  const income = Math.max(0, taxableIncome);
  const specialIncome = Math.max(0, stcg111a) + Math.max(0, ltcg112a);
  const normalIncome = Math.max(0, income - specialIncome);
  // Rebate is available on tax computed on normal-rate income only.
  const taxOnNormalIncome = slabTax(normalIncome, regime.slabs);
  const grossTax = taxOnNormalIncome + specialRateTax(stcg111a, ltcg112a);
  const rebatableTax = Math.min(grossTax, taxOnNormalIncome);

  let rebate = 0;
  let relief = false;
  let eligible = false;

  if (income <= regime.threshold) {
    eligible = true;
    rebate = Math.min(rebatableTax, regime.maxRebate);
  } else if (regime.marginalRelief) {
    const capped = Math.max(0, grossTax - (income - regime.threshold));
    if (capped > 0) {
      rebate = Math.min(rebatableTax, capped);
      relief = rebate > 0;
    }
  }

  const taxAfterRebate = Math.max(0, grossTax - rebate);
  const cess = taxAfterRebate * 0.04;
  const total = taxAfterRebate + cess;

  return {
    regime,
    income,
    specialIncome,
    grossTax,
    rebate,
    eligible,
    relief,
    taxAfterRebate,
    cess,
    total,
    headroom: Math.max(0, regime.threshold - income),
    zeroTax: total === 0,
  };
}

const DEFAULTS = { regime: "new", income: "1200000", stcg: "0", ltcg: "0" };

export default function ToolHome() {
  const [regimeId, setRegimeId] = useState(DEFAULTS.regime);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [stcg, setStcg] = useState(DEFAULTS.stcg);
  const [ltcg, setLtcg] = useState(DEFAULTS.ltcg);
  const [copied, setCopied] = useState(false);

  const incomeValue = Number(income);
  const stcgValue = Number(stcg);
  const ltcgValue = Number(ltcg);
  const specialValue = stcgValue + ltcgValue;

  const error = useMemo(() => {
    if (
      !Number.isFinite(incomeValue) ||
      !Number.isFinite(stcgValue) ||
      !Number.isFinite(ltcgValue)
    ) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (incomeValue < 0 || stcgValue < 0 || ltcgValue < 0)
      return "Income cannot be negative.";
    if (specialValue > incomeValue) {
      return "Capital gains cannot be more than your total taxable income.";
    }
    return "";
  }, [incomeValue, stcgValue, ltcgValue, specialValue]);

  const result = useMemo(
    () => (error ? null : analyse(regimeId, incomeValue, stcgValue, ltcgValue)),
    [error, incomeValue, regimeId, stcgValue, ltcgValue]
  );

  const other = useMemo(
    () => (error ? null : analyse(regimeId === "new" ? "old" : "new", incomeValue, stcgValue, ltcgValue)),
    [error, incomeValue, regimeId, stcgValue, ltcgValue]
  );

  const report = useMemo(() => {
    if (!result) return "";
    return [
      "Section 87A Rebate Checker (FY 2025-26 / AY 2026-27)",
      `Regime: ${result.regime.label}`,
      `Taxable income: ${money(result.income)}`,
      `Rebate threshold: ${money(result.regime.threshold)}  |  Maximum rebate: ${money(result.regime.maxRebate)}`,
      `Tax before rebate: ${money(result.grossTax)}`,
      `Section 87A rebate: ${money(result.rebate)}${result.relief ? " (marginal relief)" : ""}`,
      `Tax after rebate: ${money(result.taxAfterRebate)}`,
      `Health & education cess 4%: ${money(result.cess)}`,
      `Total tax payable: ${money(result.total)}`,
      result.eligible
        ? `Eligible for the rebate. Headroom left: ${money(result.headroom)}`
        : result.relief
          ? "Above the threshold but marginal relief limits your tax to the income earned above it."
          : "Not eligible — taxable income is above the rebate threshold.",
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
    setRegimeId(DEFAULTS.regime);
    setIncome(DEFAULTS.income);
    setStcg(DEFAULTS.stcg);
    setLtcg(DEFAULTS.ltcg);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Section 87A Rebate Checker
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Enter your taxable income for FY 2025-26 (AY 2026-27) to see whether the Section 87A
            rebate applies, how much tax it cancels, and whether marginal relief keeps your bill
            small just above the threshold.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your income</h2>

            <fieldset className="mt-4">
              <legend className={labelClass}>Tax regime</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.values(REGIMES).map((regime) => (
                  <button
                    key={regime.id}
                    type="button"
                    onClick={() => setRegimeId(regime.id)}
                    aria-pressed={regimeId === regime.id}
                    className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ring-1 transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      regimeId === regime.id
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-[var(--primary)]"
                        : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)]"
                    }`}
                  >
                    {regime.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="r87-income">
                  Total taxable income after deductions (Rs)
                </label>
                <input
                  id="r87-income"
                  className={inputClass}
                  inputMode="numeric"
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="r87-stcg">
                  Of which short-term equity gains — 111A, taxed at 20% (Rs)
                </label>
                <input
                  id="r87-stcg"
                  className={inputClass}
                  inputMode="numeric"
                  value={stcg}
                  onChange={(event) => setStcg(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="r87-ltcg">
                  Of which long-term equity gains — 112A, 12.5% above Rs 1,25,000 (Rs)
                </label>
                <input
                  id="r87-ltcg"
                  className={inputClass}
                  inputMode="numeric"
                  value={ltcg}
                  onChange={(event) => setLtcg(event.target.value)}
                />
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Taxable income means income after the standard deduction of{" "}
              {money(REGIMES[regimeId].standardDeduction)} and any deductions you are claiming. Tax
              on short-term (111A) and long-term (112A) equity gains does not qualify for the 87A
              rebate, so enter it separately.
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
                aria-label="Copy Section 87A rebate result to clipboard"
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
            <h2 className="text-base font-semibold">Rebate result</h2>
            {result ? (
              <>
                <div
                  className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    result.rebate > 0
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                >
                  {result.rebate > 0 ? (
                    <BadgeCheck className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result.eligible
                    ? "Rebate applies"
                    : result.relief
                      ? "Marginal relief applies"
                      : "No rebate"}
                </div>

                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Section 87A rebate</p>
                <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                  {money(result.rebate)}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {result.zeroTax
                    ? "Your tax payable becomes zero."
                    : `Tax payable after rebate and cess: ${money(result.total)}`}
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Taxable income" value={money(result.income)} />
                  <Row label="Rebate threshold" value={money(result.regime.threshold)} />
                  <Row label="Maximum rebate allowed" value={money(result.regime.maxRebate)} />
                  <Row label="Tax before rebate" value={money(result.grossTax)} />
                  <Row label="Less: Section 87A rebate" value={`-${money(result.rebate)}`} />
                  <Row label="Tax after rebate" value={money(result.taxAfterRebate)} />
                  <Row label="Health & education cess (4%)" value={money(result.cess)} />
                  <Row label="Total tax payable" value={money(result.total)} strong />
                </dl>

                {result.eligible ? (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                    You can still earn {money(result.headroom)} more taxable income before crossing
                    the {money(result.regime.threshold)} rebate threshold.
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                    You are {money(result.income - result.regime.threshold)} above the threshold.
                    {result.relief
                      ? " Marginal relief caps your tax at roughly the amount by which income exceeds the threshold."
                      : " Reducing taxable income to the threshold would restore the full rebate."}
                  </p>
                )}

                {other ? (
                  <div className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    Under the {other.regime.label.toLowerCase()}, the same taxable income would give
                    a rebate of {money(other.rebate)} and total tax of {money(other.total)}.
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see your rebate.
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
