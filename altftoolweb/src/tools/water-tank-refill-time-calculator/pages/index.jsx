"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { PUMP_PRESETS, computeRefill } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";

const DEFAULTS = {
  capacity: "1000",
  level: "20",
  flow: "40",
  draw: "0",
  head: "12",
  efficiency: "60",
  tariff: "8",
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

const formatDuration = (hours, minutes) => {
  if (hours === 0 && minutes === 0) return "Already full";
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
};

export default function ToolHome() {
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [level, setLevel] = useState(DEFAULTS.level);
  const [flow, setFlow] = useState(DEFAULTS.flow);
  const [draw, setDraw] = useState(DEFAULTS.draw);
  const [head, setHead] = useState(DEFAULTS.head);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRefill({
        capacityLitres: toNumber(capacity),
        currentLevelPct: toNumber(level),
        pumpFlowLpm: toNumber(flow),
        drawLpm: toNumber(draw),
        totalHeadM: toNumber(head),
        efficiencyPct: toNumber(efficiency),
        tariffPerKwh: toNumber(tariff),
      }),
    [capacity, level, flow, draw, head, efficiency, tariff],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Water Tank Refill Time",
      `Tank: ${NUM.format(toNumber(capacity))} L, currently ${level}% full`,
      `Litres to fill: ${NUM.format(result.litresToFill)} L`,
      `Net fill rate: ${NUM2.format(result.netFlowLpm)} L/min`,
      `Time to fill: ${formatDuration(result.hours, result.minutes)}`,
      `Pump input power: ${NUM.format(result.inputWatts)} W (${NUM2.format(result.inputHp)} HP)`,
      `Energy used: ${NUM3.format(result.energyKwh)} kWh`,
      `Cost per fill: ${INR.format(result.cost)}`,
    ].join("\n");
  }, [hasError, result, capacity, level]);

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
    setCapacity(DEFAULTS.capacity);
    setLevel(DEFAULTS.level);
    setFlow(DEFAULTS.flow);
    setDraw(DEFAULTS.draw);
    setHead(DEFAULTS.head);
    setEfficiency(DEFAULTS.efficiency);
    setTariff(DEFAULTS.tariff);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setFlow(String(preset.lpm));
    setHead(String(preset.head));
  };

  const rows = hasError
    ? [
        ["Litres still to fill", DASH],
        ["Net fill rate", DASH],
        ["Fill rate per hour", DASH],
        ["Hydraulic power at the water", DASH],
        ["Electrical input power", DASH],
        ["Energy per fill", DASH],
        ["Cost per fill", DASH],
        ["Litres drawn off while filling", DASH],
      ]
    : [
        ["Litres still to fill", `${NUM.format(result.litresToFill)} L`],
        ["Net fill rate", `${NUM2.format(result.netFlowLpm)} L/min`],
        ["Fill rate per hour", `${NUM.format(result.litresPerHour)} L/h`],
        ["Hydraulic power at the water", `${NUM.format(result.hydraulicWatts)} W`],
        [
          "Electrical input power",
          `${NUM.format(result.inputWatts)} W · ${NUM2.format(result.inputHp)} HP`,
        ],
        ["Energy per fill", `${NUM3.format(result.energyKwh)} kWh`],
        ["Cost per fill", INR.format(result.cost)],
        ["Litres drawn off while filling", `${NUM.format(result.litresDrawnWhileFilling)} L`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Pump &amp; fill
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Water Tank Refill Time Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the tank size, the pump&apos;s discharge and the lift, and get the minutes to fill
          plus the units and rupees each fill costs — so you know when to switch the pump off.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-capacity">
              Tank capacity (litres)
            </label>
            <input
              id="refill-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-level">
              Current level (% full)
            </label>
            <input
              id="refill-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-flow">
              Pump discharge (litres/minute)
            </label>
            <input
              id="refill-flow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={flow}
              onChange={(event) => setFlow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-draw">
              Taps running while filling (L/min)
            </label>
            <input
              id="refill-draw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={draw}
              onChange={(event) => setDraw(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-head">
              Total head — lift plus losses (m)
            </label>
            <input
              id="refill-head"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={head}
              onChange={(event) => setHead(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="refill-efficiency">
              Wire-to-water efficiency (%)
            </label>
            <input
              id="refill-efficiency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="5"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="refill-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="refill-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Common pumps</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PUMP_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
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
              Time to fill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.hours, result.minutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a fill time."
                : `${NUM.format(result.litresToFill)} L at ${NUM2.format(result.netFlowLpm)} L/min`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy refill time result"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. A pump&apos;s real discharge falls as head rises, so read the flow
        off the pump curve at your actual lift rather than the headline rating on the box.
      </p>
    </main>
  );
}
