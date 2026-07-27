"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { THIN_MARGIN_PERCENT, breakEven } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const UNITS = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const units = (value) => UNITS.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  fixedCosts: "200000",
  price: "500",
  variableCost: "300",
  expectedUnits: "1500",
  targetProfit: "100000",
  taxPercent: "0",
  unitName: "unit",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fixedCosts, setFixedCosts] = useState(DEFAULTS.fixedCosts);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [variableCost, setVariableCost] = useState(DEFAULTS.variableCost);
  const [expectedUnits, setExpectedUnits] = useState(DEFAULTS.expectedUnits);
  const [targetProfit, setTargetProfit] = useState(DEFAULTS.targetProfit);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.taxPercent);
  const [unitName, setUnitName] = useState(DEFAULTS.unitName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      breakEven({
        fixedCosts: toNumber(fixedCosts),
        price: toNumber(price),
        variableCost: toNumber(variableCost),
        expectedUnits: toNumber(expectedUnits),
        targetProfit: toNumber(targetProfit),
        taxPercent: toNumber(taxPercent),
      }),
    [fixedCosts, price, variableCost, expectedUnits, targetProfit, taxPercent],
  );

  const ok = !result.error;
  const noun = unitName.trim() || "unit";
  const plural = `${noun}s`;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Break-even analysis",
      `Contribution per ${noun}: ${money(result.contribution)} (${pct(result.marginRatio)} margin)`,
      `Break-even volume: ${units(result.breakEvenUnitsRounded)} ${plural}`,
      `Break-even revenue: ${money(result.breakEvenRevenue)}`,
      `Units for the target profit: ${units(result.targetUnitsRounded)} ${plural}`,
      `At ${units(result.expectedUnits)} ${plural}: operating profit ${money(result.operatingProfit)}`,
      result.marginOfSafetyPercent !== null
        ? `Margin of safety: ${units(result.marginOfSafetyUnits)} ${plural} (${pct(result.marginOfSafetyPercent)})`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, noun, plural]);

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
    setFixedCosts(DEFAULTS.fixedCosts);
    setPrice(DEFAULTS.price);
    setVariableCost(DEFAULTS.variableCost);
    setExpectedUnits(DEFAULTS.expectedUnits);
    setTargetProfit(DEFAULTS.targetProfit);
    setTaxPercent(DEFAULTS.taxPercent);
    setUnitName(DEFAULTS.unitName);
    setCopied(false);
  };

  const safetyWidth =
    ok && result.expectedUnits > 0
      ? Math.max(0, Math.min(100, (result.breakEvenUnits / result.expectedUnits) * 100))
      : 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Small business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Break Even Point Calculator for Small Business
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the volume and revenue at which your fixed costs are fully covered, how far your
          expected sales sit above that line, and what it takes to hit a profit target.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="be-fixed">
              Fixed costs for the period (INR)
            </label>
            <input
              id="be-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={fixedCosts}
              onChange={(event) => setFixedCosts(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Rent, salaries, software, insurance — costs that do not move with volume
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-unitname">
              What you sell
            </label>
            <input
              id="be-unitname"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={unitName}
              onChange={(event) => setUnitName(event.target.value)}
              placeholder="unit, plate, subscription, hour"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-price">
              Selling price per {noun} (INR)
            </label>
            <input
              id="be-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-variable">
              Variable cost per {noun} (INR)
            </label>
            <input
              id="be-variable"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={variableCost}
              onChange={(event) => setVariableCost(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Materials, packaging, payment gateway fee, delivery — costs per sale
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-expected">
              {plural.charAt(0).toUpperCase() + plural.slice(1)} you expect to sell
            </label>
            <input
              id="be-expected"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={expectedUnits}
              onChange={(event) => setExpectedUnits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-target">
              Profit you want for the period (INR)
            </label>
            <input
              id="be-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={targetProfit}
              onChange={(event) => setTargetProfit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-tax">
              Tax on profit (%) — leave 0 for a pre-tax target
            </label>
            <input
              id="be-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="1"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Break-even volume
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${units(result.breakEvenUnitsRounded)} ${plural}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.breakEvenRevenue)} of revenue · about ${num(result.breakEvenPerDay)} ${plural} a day over 30 days`
                : "Correct the inputs above to find your break-even point."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy break-even result"
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

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--success-soft)]"
              role="img"
              aria-label={`Break-even covers ${num(safetyWidth)} percent of expected sales`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${safetyWidth}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {result.expectedUnits > 0
                ? `Break-even uses ${num(safetyWidth)}% of your expected sales; the rest is margin of safety.`
                : "Add your expected sales volume to see the margin of safety."}
            </p>
          </div>
        ) : null}

        {ok && result.thinMargin ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Contribution margin is only {pct(result.marginRatio)}. Below {THIN_MARGIN_PERCENT}% a
            small rise in input cost or a discount campaign can wipe out the profit entirely.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`Contribution per ${noun}`, ok ? money(result.contribution) : DASH],
            ["Contribution margin ratio", ok ? pct(result.marginRatio) : DASH],
            ["Break-even revenue", ok ? money(result.breakEvenRevenue) : DASH],
            [
              `${plural.charAt(0).toUpperCase() + plural.slice(1)} needed for the profit target`,
              ok ? units(result.targetUnitsRounded) : DASH,
            ],
            ["Revenue needed for the profit target", ok ? money(result.targetRevenue) : DASH],
            [
              "Pre-tax profit that target implies",
              ok ? money(result.preTaxTarget) : DASH,
            ],
            ["Revenue at your expected volume", ok ? money(result.expectedRevenue) : DASH],
            ["Total contribution at that volume", ok ? money(result.totalContribution) : DASH],
            ["Operating profit at that volume", ok ? money(result.operatingProfit) : DASH],
            [
              "Margin of safety",
              ok && result.marginOfSafetyPercent !== null
                ? `${units(result.marginOfSafetyUnits)} ${plural} (${pct(result.marginOfSafetyPercent)})`
                : DASH,
            ],
            ["Margin of safety in revenue", ok ? money(result.marginOfSafetyRevenue) : DASH],
            [
              "Degree of operating leverage",
              ok && result.operatingLeverage !== null
                ? `${num(result.operatingLeverage)}x`
                : ok
                  ? "Not meaningful below break-even"
                  : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning model, not accounting or tax advice. It assumes one price, one variable cost and
        fixed costs that stay flat across the whole range — step costs such as a second shift or a
        bigger warehouse move the break-even point upward once you cross them.
      </p>
    </main>
  );
}
