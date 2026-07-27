"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShowerHead } from "lucide-react";

import { SHOWER_PRESETS, compareBathing } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  flow: "9",
  minutes: "8",
  buckets: "2",
  bucketLitres: "15",
  inlet: "25",
  bath: "40",
  efficiency: "90",
  tariff: "8",
  waterRate: "25",
  people: "4",
  bathsPerDay: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [flow, setFlow] = useState(DEFAULTS.flow);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [buckets, setBuckets] = useState(DEFAULTS.buckets);
  const [bucketLitres, setBucketLitres] = useState(DEFAULTS.bucketLitres);
  const [inlet, setInlet] = useState(DEFAULTS.inlet);
  const [bath, setBath] = useState(DEFAULTS.bath);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [waterRate, setWaterRate] = useState(DEFAULTS.waterRate);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [bathsPerDay, setBathsPerDay] = useState(DEFAULTS.bathsPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareBathing({
        showerFlowLpm: toNumber(flow),
        showerMinutes: toNumber(minutes),
        buckets: toNumber(buckets),
        bucketLitres: toNumber(bucketLitres),
        inletTempC: toNumber(inlet),
        bathTempC: toNumber(bath),
        heaterEfficiency: toNumber(efficiency),
        tariffPerKwh: toNumber(tariff),
        waterRatePerKl: toNumber(waterRate),
        people: toNumber(people),
        bathsPerDay: toNumber(bathsPerDay),
      }),
    [
      flow,
      minutes,
      buckets,
      bucketLitres,
      inlet,
      bath,
      efficiency,
      tariff,
      waterRate,
      people,
      bathsPerDay,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Shower vs Bucket Bath",
      `Shower: ${NUM.format(result.shower.litres)} L, ${NUM2.format(result.shower.kwh)} kWh, ${INR2.format(result.shower.totalCost)} per bath`,
      `Bucket bath: ${NUM.format(result.bucket.litres)} L, ${NUM2.format(result.bucket.kwh)} kWh, ${INR2.format(result.bucket.totalCost)} per bath`,
      `Water saved per bath by bucket: ${NUM.format(result.litresSavedPerBath)} L (${NUM1.format(result.savingSharePct)}%)`,
      `One bucket bath equals ${NUM1.format(result.equivalentShowerMinutes)} minutes of this shower`,
      `Household of ${people}: ${NUM.format(result.showerMonthly.litres)} L a month showering vs ${NUM.format(result.bucketMonthly.litres)} L with buckets`,
      `Yearly saving if you switch: ${NUM.format(result.litresSavedPerYear)} L and ${INR.format(result.costSavedPerYear)}`,
    ].join("\n");
  }, [hasError, result, people]);

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
    setFlow(DEFAULTS.flow);
    setMinutes(DEFAULTS.minutes);
    setBuckets(DEFAULTS.buckets);
    setBucketLitres(DEFAULTS.bucketLitres);
    setInlet(DEFAULTS.inlet);
    setBath(DEFAULTS.bath);
    setEfficiency(DEFAULTS.efficiency);
    setTariff(DEFAULTS.tariff);
    setWaterRate(DEFAULTS.waterRate);
    setPeople(DEFAULTS.people);
    setBathsPerDay(DEFAULTS.bathsPerDay);
    setCopied(false);
  };

  const tableRows = hasError
    ? []
    : [
        ["Per bath", result.shower, result.bucket],
        ["Household per day", result.showerDaily, result.bucketDaily],
        ["Household per month", result.showerMonthly, result.bucketMonthly],
        ["Household per year", result.showerYearly, result.bucketYearly],
      ];

  const rows = hasError
    ? [
        ["Litres per shower", DASH],
        ["Litres per bucket bath", DASH],
        ["Water saved per bath", DASH],
        ["One bucket bath equals", DASH],
        ["Temperature rise applied", DASH],
        ["Geyser units per shower", DASH],
        ["Cost per shower", DASH],
        ["Yearly water saved by switching", DASH],
        ["Yearly money saved by switching", DASH],
      ]
    : [
        ["Litres per shower", `${NUM.format(result.shower.litres)} L`],
        ["Litres per bucket bath", `${NUM.format(result.bucket.litres)} L`],
        [
          "Water saved per bath",
          `${NUM.format(result.litresSavedPerBath)} L (${NUM1.format(result.savingSharePct)}%)`,
        ],
        ["One bucket bath equals", `${NUM1.format(result.equivalentShowerMinutes)} min of shower`],
        ["Temperature rise applied", `${NUM1.format(result.deltaT)} °C`],
        ["Geyser units per shower", `${NUM2.format(result.shower.kwh)} kWh`],
        ["Cost per shower", `${INR2.format(result.shower.totalCost)} (water + power)`],
        ["Yearly water saved by switching", `${NUM.format(result.litresSavedPerYear)} L`],
        ["Yearly money saved by switching", INR.format(result.costSavedPerYear)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShowerHead className="h-4 w-4" aria-hidden="true" />
          Bathing water
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Shower Water Usage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put a shower and a bucket bath side by side on litres, geyser units and rupees — for one
          bath and for the whole household over a month and a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-flow">
              Shower flow rate (L/min)
            </label>
            <input
              id="shower-flow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={flow}
              onChange={(event) => setFlow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-minutes">
              Shower time (minutes)
            </label>
            <input
              id="shower-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-buckets">
              Buckets per bucket bath
            </label>
            <input
              id="shower-buckets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={buckets}
              onChange={(event) => setBuckets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-bucket-size">
              Bucket size (litres)
            </label>
            <input
              id="shower-bucket-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={bucketLitres}
              onChange={(event) => setBucketLitres(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-inlet">
              Cold inlet temperature (°C)
            </label>
            <input
              id="shower-inlet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={inlet}
              onChange={(event) => setInlet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-bath-temp">
              Bathing temperature (°C)
            </label>
            <input
              id="shower-bath-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={bath}
              onChange={(event) => setBath(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-efficiency">
              Water heater efficiency (%)
            </label>
            <input
              id="shower-efficiency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="shower-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-water-rate">
              Water cost (₹ per kilolitre)
            </label>
            <input
              id="shower-water-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={waterRate}
              onChange={(event) => setWaterRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shower-people">
              People in the household
            </label>
            <input
              id="shower-people"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="shower-baths">
              Baths per person per day
            </label>
            <input
              id="shower-baths"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={bathsPerDay}
              onChange={(event) => setBathsPerDay(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Shower fittings</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SHOWER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.note}
                onClick={() => setFlow(String(preset.lpm))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.lpm} L/min · {preset.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Water per shower
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.shower.litres)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a comparison."
                : `A bucket bath uses ${NUM.format(result.bucket.litres)} L — a difference of ${NUM.format(result.litresSavedPerBath)} L`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy shower water usage result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shower vs bucket, side by side</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Period
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Shower litres
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Bucket litres
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Shower cost
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Bucket cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, showerRow, bucketRow]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(showerRow.litres)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--success)]">
                      {NUM.format(bucketRow.litres)}
                    </td>
                    <td className="py-2 pr-3 text-right">{INR2.format(showerRow.totalCost)}</td>
                    <td className="py-2 text-right text-[var(--success)]">
                      {INR2.format(bucketRow.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Measure your own shower by timing how long it takes to fill a
        known bucket — flow varies a lot with pressure, and that one measurement makes every figure
        here yours rather than typical.
      </p>
    </main>
  );
}
