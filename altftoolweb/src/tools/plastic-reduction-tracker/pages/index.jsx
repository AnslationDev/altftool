"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Recycle, RotateCcw } from "lucide-react";

import {
  CO2E_KG_PER_KG_PLASTIC,
  GLOBAL_AVG_SINGLE_USE_KG_PER_YEAR,
  PLASTIC_ITEMS,
  computePlasticImpact,
  nextMilestone,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const kg = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)} kg`;
const whole = (value) => NUM0.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_COUNTS = {
  bottle: "6",
  bag: "4",
  cup: "3",
  straw: "2",
  cutlery: "2",
  container: "1",
  sachet: "0",
  wrap: "0",
};
const DEFAULT_WEEKS = "12";

export default function ToolHome() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const numericCounts = {};
    for (const item of PLASTIC_ITEMS) {
      const raw = String(counts[item.id] ?? "").trim();
      numericCounts[item.id] = raw === "" ? 0 : Number(raw);
    }
    const weeksTracked = String(weeks).trim() === "" ? NaN : Number(weeks);
    return computePlasticImpact({ counts: numericCounts, weeksTracked });
  }, [counts, weeks]);

  const milestone = useMemo(
    () => (result.error ? null : nextMilestone(result.trackedKg)),
    [result],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Plastic Reduction Tracker",
      `Items avoided each week: ${whole(result.itemsPerWeek)}`,
      `Plastic avoided per week: ${NUM1.format(result.weeklyGrams)} g`,
      `Plastic avoided so far: ${kg(result.trackedKg)}`,
      `Projected over a year: ${kg(result.annualKg)}`,
      `CO2e avoided per year: ${kg(result.co2eKgPerYear)}`,
      `Equivalent to ${whole(result.bottleEquivalentPerYear)} PET bottles a year`,
      `Money saved per year: ${money(result.moneySavedPerYear)}`,
    ].join("\n");
  }, [result]);

  const setCount = (id, value) => {
    setCounts((previous) => ({ ...previous, [id]: value }));
  };

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
    setCounts(DEFAULT_COUNTS);
    setWeeks(DEFAULT_WEEKS);
    setCopied(false);
  };

  const clearAll = () => {
    const empty = {};
    for (const item of PLASTIC_ITEMS) empty[item.id] = "0";
    setCounts(empty);
    setCopied(false);
  };

  const hasResult = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Waste habit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Plastic Reduction Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the single-use items you refuse in a typical week. The tracker converts them to
          grams of plastic, kilograms of CO2e and rupees saved, then projects the habit over a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Items you avoid in a typical week</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PLASTIC_ITEMS.map((item) => (
            <div key={item.id}>
              <label className={LABEL_CLASS} htmlFor={`plastic-${item.id}`}>
                {item.label}
              </label>
              <input
                id={`plastic-${item.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={counts[item.id] ?? ""}
                onChange={(event) => setCount(item.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {NUM1.format(item.grams)} g each
                {item.inr > 0 ? ` · about ${money(item.inr)} avoided` : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="plastic-weeks">
              Weeks you have kept this up
            </label>
            <input
              id="plastic-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="520"
              step="1"
              value={weeks}
              onChange={(event) => setWeeks(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={clearAll} className={`${GHOST_BTN} w-full`}>
              Clear all counts
            </button>
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
              Plastic avoided so far
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? kg(result.trackedKg) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${whole(result.itemsTracked)} items kept out of the bin over ${whole(result.weeksTracked)} weeks`
                : "Enter your weekly counts to see the total"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy plastic reduction result"
              className={GHOST_BTN}
              disabled={!hasResult}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Plastic avoided each week", hasResult ? `${NUM1.format(result.weeklyGrams)} g` : DASH],
            ["Projected over a full year", hasResult ? kg(result.annualKg) : DASH],
            ["CO2e avoided per year", hasResult ? kg(result.co2eKgPerYear) : DASH],
            [
              "Same as this many PET bottles a year",
              hasResult ? `${whole(result.bottleEquivalentPerYear)} bottles` : DASH,
            ],
            [
              "Share of the average per-person footprint",
              hasResult ? `${NUM1.format(result.shareOfAverageFootprint)}%` : DASH,
            ],
            ["Money saved each week", hasResult ? money(result.moneySavedPerWeek) : DASH],
            ["Money saved per year", hasResult ? money(result.moneySavedPerYear) : DASH],
            ["Biggest contributor", hasResult && result.topContributor ? result.topContributor.label : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasResult && milestone ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={
                milestone.target
                  ? `${NUM1.format(milestone.progressPct)} percent of the way to ${milestone.target} kilograms avoided`
                  : "All milestones reached"
              }
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, milestone.progressPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {milestone.target
                ? `${kg(milestone.remainingKg)} to go before you hit the ${milestone.target} kg milestone.`
                : "Every milestone on the ladder is behind you."}
            </p>
          </div>
        ) : null}
      </section>

      {hasResult && result.breakdown.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the weight comes from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per week</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Grams / week</th>
                  <th scope="col" className="py-2 text-right font-semibold">Kg / year</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{whole(row.count)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.gramsPerWeek)}
                    </td>
                    <td className="py-2 text-right">{NUM1.format(row.kgPerYear)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Item weights are typical averages, and emissions use {CO2E_KG_PER_KG_PLASTIC} kg CO2e per kg
        of virgin plastic (production plus end-of-life). The footprint share compares your total with
        the global average of {GLOBAL_AVG_SINGLE_USE_KG_PER_YEAR} kg of single-use plastic waste per
        person per year. Figures are indicative, not an audited carbon inventory.
      </p>
    </main>
  );
}
