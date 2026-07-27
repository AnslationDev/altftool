"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lightbulb, RotateCcw } from "lucide-react";

import { LAMP_TYPES, computeLedSavings } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : "—");
const num = (v, unit = "") => (Number.isFinite(v) ? `${NUM.format(v)}${unit}` : "—");

const DEFAULTS = {
  currentTypeId: "incandescent",
  currentWatts: "60",
  ledWatts: "9",
  bulbCount: "12",
  hoursPerDay: "5",
  tariff: "8",
  ledPrice: "120",
  currentPrice: "20",
  horizonYears: "5",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => computeLedSavings(form), [form]);
  const error = result.error || "";
  const ok = !error;

  const onTypeChange = (event) => {
    const nextId = event.target.value;
    const type = LAMP_TYPES.find((t) => t.id === nextId);
    setForm((prev) => ({
      ...prev,
      currentTypeId: nextId,
      currentWatts: type ? String(type.typicalWatts) : prev.currentWatts,
    }));
  };

  const useSuggestedLed = () => {
    if (!ok || result.suggestedLedWatts === null) return;
    setForm((prev) => ({ ...prev, ledWatts: result.suggestedLedWatts.toFixed(1) }));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "LED retrofit savings",
      `${form.bulbCount} bulbs, ${form.hoursPerDay} h a day`,
      `Now: ${NUM.format(result.currentKwhPerYear)} kWh a year, ${INR.format(result.currentEnergyCostPerYear)}`,
      `With LEDs: ${NUM.format(result.ledKwhPerYear)} kWh a year, ${INR.format(result.ledEnergyCostPerYear)}`,
      `Electricity saved: ${INR.format(result.energySavingPerYear)} a year (${NUM.format(result.energySavingSharePct)}%)`,
      `Up-front LED cost: ${INR.format(result.upfrontCost)}`,
      result.paybackMonths === null
        ? "Payback: no saving at these wattages"
        : `Payback: ${NUM.format(result.paybackMonths)} months`,
      `Total saved over ${form.horizonYears} years including replacement bulbs: ${INR.format(result.totalSavingOverHorizon)}`,
    ].join("\n");
  }, [ok, result, form]);

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
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">LED vs CFL Bulb Savings</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare what your current bulbs cost in electricity and replacements against an equivalent
          LED fit-out, matched on lumens rather than watts.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="led-type">
              What is fitted now
            </label>
            <select id="led-type" className={INPUT} value={form.currentTypeId} onChange={onTypeChange}>
              {LAMP_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} — {t.efficacy} lm/W, {t.ratedLifeHours} h
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="led-current-watts">
              Watts per existing bulb
            </label>
            <input
              id="led-current-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.currentWatts}
              onChange={set("currentWatts")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="led-watts">
              Watts per replacement LED
            </label>
            <input
              id="led-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={form.ledWatts}
              onChange={set("ledWatts")}
            />
            <button type="button" className={`${CHIP} mt-2`} onClick={useSuggestedLed} disabled={!ok}>
              Match brightness
              {ok && result.suggestedLedWatts !== null
                ? ` (${NUM.format(result.suggestedLedWatts)} W)`
                : ""}
            </button>
          </div>

          <div>
            <label className={LABEL} htmlFor="led-count">
              Number of bulbs in the home
            </label>
            <input
              id="led-count"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={form.bulbCount}
              onChange={set("bulbCount")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="led-hours">
              Average burn hours per bulb per day
            </label>
            <input
              id="led-hours"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={form.hoursPerDay}
              onChange={set("hoursPerDay")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="led-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="led-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="led-price">
              Price of one LED bulb (INR)
            </label>
            <input
              id="led-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.ledPrice}
              onChange={set("ledPrice")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="led-current-price">
              Price of one replacement bulb of the old type (INR)
            </label>
            <input
              id="led-current-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.currentPrice}
              onChange={set("currentPrice")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="led-horizon">
              Comparison horizon (years)
            </label>
            <input
              id="led-horizon"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="1"
              value={form.horizonYears}
              onChange={set("horizonYears")}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Electricity saved per year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.energySavingPerYear) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.paybackMonths === null
                  ? "These LEDs use as much as what is fitted — no saving to pay back"
                  : `${num(result.kwhSavedPerYear)} kWh saved, LEDs repaid in ${num(result.paybackMonths)} months`
                : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy LED savings result"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Measure</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Now</th>
                <th scope="col" className="py-2 text-right font-semibold">With LEDs</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Light output per bulb",
                  ok ? num(result.currentLumensPerBulb, " lm") : "—",
                  ok ? num(result.ledLumensPerBulb, " lm") : "—",
                ],
                [
                  "Energy per year",
                  ok ? `${num(result.currentKwhPerYear)} kWh` : "—",
                  ok ? `${num(result.ledKwhPerYear)} kWh` : "—",
                ],
                [
                  "Electricity per month",
                  ok ? money2(result.currentEnergyCostPerMonth) : "—",
                  ok ? money2(result.ledEnergyCostPerMonth) : "—",
                ],
                [
                  "Electricity per year",
                  ok ? money(result.currentEnergyCostPerYear) : "—",
                  ok ? money(result.ledEnergyCostPerYear) : "—",
                ],
                [
                  "Bulbs used over the horizon",
                  ok ? num(result.currentBulbsOverHorizon) : "—",
                  ok ? num(result.ledBulbsOverHorizon) : "—",
                ],
                [
                  "Bulb spend over the horizon",
                  ok ? money(result.currentBulbCostOverHorizon) : "—",
                  ok ? money(result.ledBulbCostOverHorizon) : "—",
                ],
                [
                  "Total cost over the horizon",
                  ok ? money(result.currentTotalOverHorizon) : "—",
                  ok ? money(result.ledTotalOverHorizon) : "—",
                ],
              ].map(([label, a, b]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{a}</td>
                  <td className="py-2 text-right font-semibold">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Up-front cost of the LEDs", ok ? money(result.upfrontCost) : "—"],
            [
              "Simple payback",
              ok ? (result.paybackMonths === null ? "No payback" : num(result.paybackMonths, " months")) : "—",
            ],
            ["Electricity saved per month", ok ? money2(result.energySavingPerMonth) : "—"],
            ["Share of lighting bill removed", ok ? num(result.energySavingSharePct, "%") : "—"],
            ["Total saved over the horizon", ok ? money(result.totalSavingOverHorizon) : "—"],
            ["Estimated CO2 avoided per year", ok ? `${num(result.co2SavedKgPerYear)} kg` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Replacement bulbs are prorated rather than rounded up, and rated life assumes
        the lamp is run within its stated conditions — enclosed fittings and high ambient
        temperatures shorten LED life considerably.
      </p>
    </main>
  );
}
