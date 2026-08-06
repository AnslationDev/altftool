"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  gross: 1800000,
  deductions: 200000,
  ageBand: "below60",
  salaried: true,
};

/** New regime (Section 115BAC) slabs for FY 2025-26. */
const NEW_SLABS = [
  [400000, 0],
  [800000, 5],
  [1200000, 10],
  [1600000, 15],
  [2000000, 20],
  [2400000, 25],
  [Infinity, 30],
];

const BASIC_EXEMPTION = { below60: 250000, senior: 300000, superSenior: 500000 };

const oldSlabs = (exempt) => [
  [exempt, 0],
  [500000, 5],
  [1000000, 20],
  [Infinity, 30],
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

function slabBreakdown(taxable, slabs) {
  const rows = [];
  let lower = 0;
  let tax = 0;
  for (const [upper, rate] of slabs) {
    const span = Math.min(taxable, upper) - lower;
    if (span > 0) {
      const slabTax = (span * rate) / 100;
      tax += slabTax;
      rows.push({ from: lower, to: upper, rate, amount: span, tax: slabTax });
    }
    if (taxable <= upper) break;
    lower = upper;
  }
  return { rows, tax };
}

function surchargeRate(taxable, regime) {
  if (regime === "old" && taxable > 50000000) return 37;
  if (taxable > 20000000) return 25;
  if (taxable > 10000000) return 15;
  if (taxable > 5000000) return 10;
  return 0;
}

/** Slab tax after the Section 87A rebate (incl. marginal relief in the new regime). */
function taxAfterRebate(taxable, regime, exempt) {
  const { rows, tax } = slabBreakdown(taxable, regime === "new" ? NEW_SLABS : oldSlabs(exempt));
  let rebate = 0;
  if (regime === "new") {
    if (taxable <= 1200000) {
      rebate = Math.min(tax, 60000);
    } else {
      const excess = taxable - 1200000;
      if (tax > excess) rebate = tax - excess;
    }
  } else if (taxable <= 500000) {
    rebate = Math.min(tax, 12500);
  }
  return { rows, gross: tax, rebate, net: tax - rebate };
}

/** Full liability: slab tax, 87A rebate, surcharge (with marginal relief) and 4% cess. */
function computeRegime(taxable, regime, exempt) {
  const base = taxAfterRebate(taxable, regime, exempt);
  const rate = surchargeRate(taxable, regime);
  let surcharge = (base.net * rate) / 100;

  const thresholds =
    regime === "old" ? [5000000, 10000000, 20000000, 50000000] : [5000000, 10000000, 20000000];
  for (const threshold of thresholds) {
    if (taxable > threshold) {
      const atThreshold = taxAfterRebate(threshold, regime, exempt);
      const taxAtThreshold =
        atThreshold.net + (atThreshold.net * surchargeRate(threshold, regime)) / 100;
      const ceiling = taxAtThreshold + (taxable - threshold);
      if (base.net + surcharge > ceiling) surcharge = Math.max(0, ceiling - base.net);
    }
  }

  const cess = (base.net + surcharge) * 0.04;
  const total = base.net + surcharge + cess;
  return {
    ...base,
    surchargeRate: rate,
    surcharge,
    cess,
    total,
    effective: taxable > 0 ? (total / taxable) * 100 : 0,
  };
}

export default function ToolHome() {
  const [gross, setGross] = useState(String(DEFAULTS.gross));
  const [deductions, setDeductions] = useState(String(DEFAULTS.deductions));
  const [ageBand, setAgeBand] = useState(DEFAULTS.ageBand);
  const [salaried, setSalaried] = useState(DEFAULTS.salaried);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();
  const copied = isCopied("result");

  const calc = useMemo(() => {
    const g = toNumber(gross);
    const d = toNumber(deductions);

    if (Number.isNaN(g) || Number.isNaN(d)) {
      return { error: "Enter valid numbers for gross income and deductions." };
    }
    if (g < 0 || d < 0) return { error: "Amounts cannot be negative." };
    if (g > 1000000000) return { error: "Enter a gross income below 100 crore." };
    if (d > g) return { error: "Old-regime deductions cannot exceed your gross income." };

    const exempt = BASIC_EXEMPTION[ageBand];
    const oldStandard = salaried ? 50000 : 0;
    const newStandard = salaried ? 75000 : 0;

    const oldTaxable = Math.max(0, g - oldStandard - d);
    const newTaxable = Math.max(0, g - newStandard);

    const oldTax = computeRegime(Math.round(oldTaxable), "old", exempt);
    const newTax = computeRegime(Math.round(newTaxable), "new", exempt);

    const better = newTax.total <= oldTax.total ? "new" : "old";
    return {
      gross: g,
      deductions: d,
      oldStandard,
      newStandard,
      oldTaxable: Math.round(oldTaxable),
      newTaxable: Math.round(newTaxable),
      oldTax,
      newTax,
      better,
      saving: Math.abs(oldTax.total - newTax.total),
    };
  }, [gross, deductions, ageBand, salaried]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const line = (regime, data, taxable) =>
      [
        `${regime} regime — taxable income ${money(taxable)}`,
        ...data.rows.map(
          (row) =>
            `  ${money(row.from)}–${row.to === Infinity ? "above" : money(row.to)} @ ${row.rate}% on ${money(row.amount)} = ${money(row.tax)}`,
        ),
        `  Slab tax: ${money(data.gross)}`,
        `  Section 87A rebate: -${money(data.rebate)}`,
        `  Surcharge (${data.surchargeRate}%): ${money(data.surcharge)}`,
        `  Health & education cess (4%): ${money(data.cess)}`,
        `  Total tax: ${money(data.total)} (effective ${pct(data.effective)})`,
      ].join("\n");

    return [
      "Income Tax Slab Visualizer — FY 2025-26 (AY 2026-27)",
      `Gross income: ${money(calc.gross)}`,
      "",
      line("Old", calc.oldTax, calc.oldTaxable),
      "",
      line("New", calc.newTax, calc.newTaxable),
      "",
      `Lower tax: ${calc.better === "new" ? "New" : "Old"} regime, by ${money(calc.saving)}`,
    ].join("\n");
  }, [calc]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "slab-by-slab tax breakdown" });
  };

  const reset = () => {
    setGross(String(DEFAULTS.gross));
    setDeductions(String(DEFAULTS.deductions));
    setAgeBand(DEFAULTS.ageBand);
    setSalaried(DEFAULTS.salaried);
    resetCopyState();
  };

  const renderSlabs = (title, data, taxable, tone) => {
    const maxTax = Math.max(1, ...data.rows.map((row) => row.tax));
    return (
      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <span className="text-xs text-[var(--muted-foreground)]">
            Taxable {money(taxable)}
          </span>
        </div>
        <p className={`mt-2 text-3xl font-semibold ${tone}`}>{money(data.total)}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Effective rate {pct(data.effective)} of taxable income
        </p>

        <ul className="mt-4 space-y-3">
          {data.rows.map((row) => (
            <li key={`${title}-${row.from}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  {money(row.from)} – {row.to === Infinity ? "above" : money(row.to)}
                  <span className="ml-1 font-semibold text-[var(--foreground)]">@ {row.rate}%</span>
                </span>
                <span className="shrink-0 font-semibold">{money(row.tax)}</span>
              </div>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${row.rate}% slab contributes ${money(row.tax)}`}
              >
                <span
                  className="block h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(row.tax > 0 ? 3 : 0, (row.tax / maxTax) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {money(row.amount)} of income taxed in this slab
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Slab tax before rebate", money(data.gross)],
            ["Section 87A rebate", `- ${money(data.rebate)}`],
            [`Surcharge (${data.surchargeRate}%)`, money(data.surcharge)],
            ["Health & education cess (4%)", money(data.cess)],
            ["Total tax payable", money(data.total)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          FY 2025-26
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Income Tax Slab Visualizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how much of your tax bill each individual slab creates, side by side for the old and
          new regimes — including the Section 87A rebate, surcharge and 4% cess.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="slab-gross">
              Gross annual income (INR)
            </label>
            <input
              id="slab-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={gross}
              onChange={(event) => setGross(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slab-deductions">
              Old-regime deductions (80C, 80D, HRA…)
            </label>
            <input
              id="slab-deductions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={deductions}
              onChange={(event) => setDeductions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slab-age">
              Age band (sets the old-regime exemption)
            </label>
            <select
              id="slab-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageBand}
              onChange={(event) => setAgeBand(event.target.value)}
            >
              <option value="below60">Below 60 — exemption {"₹"}2,50,000</option>
              <option value="senior">60 to 79 — exemption {"₹"}3,00,000</option>
              <option value="superSenior">80 and above — exemption {"₹"}5,00,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="slab-salaried"
            >
              <input
                id="slab-salaried"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={salaried}
                onChange={(event) => setSalaried(event.target.checked)}
              />
              Salaried / pensioner (standard deduction)
            </label>
          </div>
        </div>
        {salaried && !calc.error && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Standard deduction applied: {money(calc.oldStandard)} in the old regime and{" "}
            {money(calc.newStandard)} in the new regime.
          </p>
        )}
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
                  Lower tax bill
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {calc.better === "new" ? "New regime" : "Old regime"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Saves {money(calc.saving)} versus the other regime
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label={
                    copied
                      ? "Copied! Slab-by-slab tax breakdown copied to clipboard"
                      : "Copy result: slab-by-slab tax breakdown"
                  }
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Old regime total tax", money(calc.oldTax.total)],
                ["New regime total tax", money(calc.newTax.total)],
                ["Old regime taxable income", money(calc.oldTaxable)],
                ["New regime taxable income", money(calc.newTaxable)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {renderSlabs(
              "Old regime slabs",
              calc.oldTax,
              calc.oldTaxable,
              calc.better === "old" ? "text-[var(--success)]" : "text-[var(--foreground)]",
            )}
            {renderSlabs(
              "New regime slabs",
              calc.newTax,
              calc.newTaxable,
              calc.better === "new" ? "text-[var(--success)]" : "text-[var(--foreground)]",
            )}
          </div>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for resident individuals under FY 2025-26 (AY 2026-27) rules. It does
        not model capital gains taxed at special rates, business income set-offs, relief under
        Sections 89 or 90, or state-specific levies. Confirm with a qualified tax professional.
      </p>
    </main>
  );
}
