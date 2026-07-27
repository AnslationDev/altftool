"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SprayCan } from "lucide-react";

import { DUST_LEVELS, NEARBY_SOURCES, computeCleaningPlan } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : "—");
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : "—");

const DEFAULTS = {
  annualKwh: "7300",
  tariff: "8",
  dustLevel: "arid",
  nearbySource: "none",
  tiltDeg: "20",
  rainIntervalDays: "45",
  costPerClean: "500",
  cleaningInterval: "35",
  daysSinceClean: "10",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeCleaningPlan({
        annualKwh: num(form.annualKwh),
        tariff: num(form.tariff),
        dustLevel: form.dustLevel,
        nearbySource: form.nearbySource,
        tiltDeg: num(form.tiltDeg),
        rainIntervalDays: num(form.rainIntervalDays),
        costPerClean: num(form.costPerClean),
        cleaningInterval: num(form.cleaningInterval),
        daysSinceClean: num(form.daysSinceClean),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Solar Panel Cleaning Planner",
      `Soiling rate: ${n2(result.ratePctPerDay)}% of output lost per dry day`,
      `Right now: ${n1(result.currentLossPct)}% down, losing ${money(result.valueLostToday)} a day`,
      result.overdue ? "Overdue — wash it" : `Next wash due in ${result.daysUntilDue} days`,
      `At a ${n0(result.effectiveInterval)}-day interval: ${n1(result.avgLossPct)}% average loss, ${n0(result.annualKwhLost)} kWh (${money(result.annualValueLost)}) a year`,
      `Paid washes: ${n1(result.paidWashesPerYear)}/year costing ${money(result.annualCleaningCost)}`,
      `Total cost of soiling + cleaning: ${money(result.annualTotalCost)}/year`,
      `Cost-optimal interval: every ${n0(result.recommendedInterval)} days (${money(result.recTotalCost)}/year)`,
      `Leaving it to rain alone would cost ${money(result.neverTotalCost)}/year`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SprayCan className="h-4 w-4" aria-hidden="true" />
          Array upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Solar Panel Cleaning Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Dust costs you units every dry day, and washing costs money. This works out how fast your
          array fouls, what that is worth in rupees, and the interval where the two costs balance —
          rather than guessing at &ldquo;once a month&rdquo;.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your system</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cl-kwh">
              Annual generation when clean (kWh)
            </label>
            <input
              id="cl-kwh"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="100"
              value={form.annualKwh}
              onChange={set("annualKwh")}
            />
            <p className={HINT}>Roughly 1,400 kWh per kW of panels across most of India.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="cl-tariff">
              Value of a unit (₹ per kWh)
            </label>
            <input
              id="cl-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.tariff}
              onChange={set("tariff")}
            />
            <p className={HINT}>Your tariff if you self-consume, the export rate if you feed in.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="cl-tilt">
              Panel tilt (degrees from flat)
            </label>
            <input
              id="cl-tilt"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="90"
              step="1"
              value={form.tiltDeg}
              onChange={set("tiltDeg")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cl-cost">
              Cost of one cleaning (₹)
            </label>
            <input
              id="cl-cost"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.costPerClean}
              onChange={set("costPerClean")}
            />
            <p className={HINT}>Enter 0 if you wash them yourself and value your time at nothing.</p>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Your location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="cl-dust">
              How dusty is the area?
            </label>
            <select id="cl-dust" className={INPUT} value={form.dustLevel} onChange={set("dustLevel")}>
              {Object.values(DUST_LEVELS).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} — {level.hint}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="cl-source">
              Anything upwind of the array?
            </label>
            <select id="cl-source" className={INPUT} value={form.nearbySource} onChange={set("nearbySource")}>
              {Object.values(NEARBY_SOURCES).map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="cl-rain">
              Days between rain of 10 mm or more
            </label>
            <input
              id="cl-rain"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="365"
              step="1"
              value={form.rainIntervalDays}
              onChange={set("rainIntervalDays")}
            />
            <p className={HINT}>Averaged over the year. Lighter rain smears rather than washes.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="cl-interval">
              Your current cleaning interval (days)
            </label>
            <input
              id="cl-interval"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.cleaningInterval}
              onChange={set("cleaningInterval")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="cl-since">
              Days since the last wash
            </label>
            <input
              id="cl-since"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.daysSinceClean}
              onChange={set("daysSinceClean")}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Wash the panels every
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${n0(result.recommendedInterval)} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a schedule"
                : `Soiling ${n2(result.ratePctPerDay)}%/day · ${result.dustLabel.toLowerCase()} · ${result.tiltLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy solar panel cleaning plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.overdue
                ? "bg-[var(--warning-soft)] text-[var(--foreground)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.overdue
              ? `Overdue. At ${n1(result.currentLossPct)}% soiling you are giving away ${money(result.valueLostToday)} a day.`
              : `Next wash due in ${result.daysUntilDue} days. Currently ${n1(result.currentLossPct)}% down, ${money(result.valueLostToday)} a day.`}
          </p>
        )}

        {!hasError && result.rainCapsInterval && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Rain arrives every {n0(result.effectiveInterval)} days on average and washes the array for
            free, so a longer manual interval than that changes nothing.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Soiling rate", hasError ? "—" : `${n2(result.ratePctPerDay)}% of output per dry day`],
            ["Loss right now", hasError ? "—" : `${n1(result.currentLossPct)}% (${n2(result.kwhLostToday)} kWh/day)`],
            ["Average loss at your interval", hasError ? "—" : `${n1(result.avgLossPct)}%`],
            ["Units lost per year", hasError ? "—" : `${n0(result.annualKwhLost)} kWh`],
            ["Value of those units", hasError ? "—" : `${money(result.annualValueLost)}/year`],
            ["Washes rain does for you", hasError ? "—" : `${n1(result.freeWashesPerYear)}/year`],
            ["Washes you pay for", hasError ? "—" : `${n1(result.paidWashesPerYear)}/year · ${money(result.annualCleaningCost)}`],
            ["Total cost at your interval", hasError ? "—" : `${money(result.annualTotalCost)}/year`],
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
          <h2 className="text-base font-semibold">Compare the three options</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Plan
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Avg loss
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Wash cost
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Total / year
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    `Your plan — every ${n0(result.effectiveInterval)} days`,
                    result.avgLossPct,
                    result.annualCleaningCost,
                    result.annualTotalCost,
                  ],
                  [
                    `Cost-optimal — every ${n0(result.recommendedInterval)} days`,
                    result.recAvgLossPct,
                    result.recCleaningCost,
                    result.recTotalCost,
                  ],
                  ["Let rain do it all", result.neverAvgLossPct, 0, result.neverTotalCost],
                ].map(([label, loss, wash, total]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{label}</td>
                    <td className="py-2 pr-3 text-right">{n1(loss)}%</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(wash)}</td>
                    <td className="py-2 text-right font-semibold">{money(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {result.savingVsCurrent > 1
              ? `Moving to the optimal interval saves about ${money(result.savingVsCurrent)} a year.`
              : result.savingVsCurrent < -1
                ? `Your current interval already beats the modelled optimum by ${money(-result.savingVsCurrent)} a year.`
                : "Your current interval is already within a rupee or two of the optimum."}
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning model, not a measurement. Bird droppings, a single fallen leaf or cement splatter
        cause localised hot spots and disproportionate loss that no average rate captures, so
        inspect after storms. Wash early morning or evening with soft water and a soft brush — cold
        water on hot glass can crack it, and never walk on modules or reach near live cabling.
      </p>
    </main>
  );
}
