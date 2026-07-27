"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lightbulb, RotateCcw } from "lucide-react";

import {
  LED_EFFICACY_PRESETS,
  SOURCE_TYPES,
  buildChart,
  convertToLed,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const w = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)} W`;
const lm = (value) => `${NUM0.format(Number.isFinite(value) ? value : 0)} lm`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sourceId: "incandescent",
  oldWatts: "60",
  ledEfficacy: "100",
  bulbCount: "10",
  hoursPerDay: "5",
  tariff: "8",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sourceId, setSourceId] = useState(DEFAULTS.sourceId);
  const [oldWatts, setOldWatts] = useState(DEFAULTS.oldWatts);
  const [ledEfficacy, setLedEfficacy] = useState(DEFAULTS.ledEfficacy);
  const [bulbCount, setBulbCount] = useState(DEFAULTS.bulbCount);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertToLed({
        sourceId,
        oldWatts: toNumber(oldWatts),
        ledEfficacy: toNumber(ledEfficacy),
        bulbCount: toNumber(bulbCount),
        hoursPerDay: toNumber(hoursPerDay),
        tariff: toNumber(tariff),
      }),
    [sourceId, oldWatts, ledEfficacy, bulbCount, hoursPerDay, tariff],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const chart = useMemo(() => buildChart(toNumber(ledEfficacy)), [ledEfficacy]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "LED Wattage Replacement",
      `Replacing: ${oldWatts} W ${result.sourceLabel}`,
      `Light output: ${lm(result.lumens)} (old lamp ${NUM1.format(result.oldEfficacy)} lm/W)`,
      `Buy an LED of about ${w(result.ledWatts)} at ${result.ledEfficacy} lm/W`,
      `Saves ${w(result.wattsSavedEach)} per bulb — ${NUM1.format(result.savingPct)}% less power`,
      `${bulbCount} bulb(s) at ${hoursPerDay} h/day: ${NUM0.format(result.yearlyOldKwh)} kWh becomes ${NUM0.format(result.yearlyLedKwh)} kWh a year`,
      `Saving: ${NUM0.format(result.yearlyKwhSaved)} kWh, about ${money(result.yearlyCostSaved)} a year`,
    ].join("\n");
  }, [hasError, result, oldWatts, bulbCount, hoursPerDay]);

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
    setSourceId(DEFAULTS.sourceId);
    setOldWatts(DEFAULTS.oldWatts);
    setLedEfficacy(DEFAULTS.ledEfficacy);
    setBulbCount(DEFAULTS.bulbCount);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setTariff(DEFAULTS.tariff);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Lighting design
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">LED Wattage Replacement Chart</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bulbs match on light output, not on watts. Enter the old filament, halogen or CFL wattage
          and this converts it to lumens, then to the LED wattage that gives the same brightness.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lw-source">
              What are you replacing?
            </label>
            <select
              id="lw-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
            >
              {SOURCE_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lw-watts">
              Old bulb wattage (W)
            </label>
            <input
              id="lw-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="1"
              value={oldWatts}
              onChange={(event) => setOldWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lw-eff">
              LED efficacy (lumens per watt)
            </label>
            <input
              id="lw-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="250"
              step="5"
              value={ledEfficacy}
              onChange={(event) => setLedEfficacy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lw-count">
              How many bulbs
            </label>
            <input
              id="lw-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={bulbCount}
              onChange={(event) => setBulbCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lw-hours">
              Hours lit per day
            </label>
            <input
              id="lw-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lw-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="lw-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LED_EFFICACY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setLedEfficacy(String(preset.value))}
              aria-pressed={String(preset.value) === ledEfficacy}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Buy an LED of about
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : w(result.ledWatts)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `Look for ${lm(result.lumens)} on the box — that is the number that matters`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the LED replacement result"
              className={GHOST_BTN}
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
            ["Light output to match", hasError ? dash : lm(result.lumens)],
            [
              "Old lamp efficacy",
              hasError ? dash : `${NUM1.format(result.oldEfficacy)} lm/W (${result.sourceLabel})`,
            ],
            ["LED efficacy used", hasError ? dash : `${NUM0.format(result.ledEfficacy)} lm/W`],
            [
              "Power saved per bulb",
              hasError ? dash : `${w(result.wattsSavedEach)} (${NUM1.format(result.savingPct)}% less)`,
            ],
            ["Power saved across all bulbs", hasError ? dash : w(result.wattsSavedTotal)],
            ["Units a year on the old bulbs", hasError ? dash : `${NUM0.format(result.yearlyOldKwh)} kWh`],
            ["Units a year on LED", hasError ? dash : `${NUM0.format(result.yearlyLedKwh)} kWh`],
            ["Units saved a year", hasError ? dash : `${NUM0.format(result.yearlyKwhSaved)} kWh`],
            ["Bill saved a year", hasError ? dash : money(result.yearlyCostSaved)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Filament to LED, at {NUM0.format(toNumber(ledEfficacy) || 0)} lm/W</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Old bulb</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Light output</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">LED</th>
                <th scope="col" className="py-2 text-right font-semibold">Saving</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((row) => (
                <tr key={row.oldWatts} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.oldWatts} W</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{lm(row.lumens)}</td>
                  <td className="py-2 pr-3 text-right font-semibold text-[var(--primary)]">
                    {w(row.ledWatts)}
                  </td>
                  <td className="py-2 text-right">{NUM0.format(row.savingPct)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Incandescent lumen figures are the equivalence values used in the US FTC Lighting Facts and
          ENERGY STAR replacement guidance, which is where the familiar 60 W = 800 lumens pairing comes
          from. Filament efficacy rises with wattage, so the table is interpolated between anchors
          rather than scaled from a single ratio.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Match the lumens first, then check colour temperature (2700-3000 K for warm white, 4000 K
        neutral, 6500 K cool daylight) and the beam angle — an LED that throws light in a narrow cone
        can look dimmer than a filament bulb of the same lumen rating. For dimmed circuits, buy a lamp
        marked dimmable and check it against your dimmer type.
      </p>
    </main>
  );
}
