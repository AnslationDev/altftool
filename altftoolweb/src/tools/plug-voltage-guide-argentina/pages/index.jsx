"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plug, RotateCcw } from "lucide-react";

import {
  assessArgentinaPower,
  HEAVY_SOCKET_A,
  MAINS_FREQUENCY_HZ,
  MAINS_VOLTAGE_V,
  PLUG_TYPES,
  SOCKET_TYPES,
  STANDARD_SOCKET_A,
  SUPPLY_MAX_V,
  SUPPLY_MIN_V,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const amps = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} A` : DASH);

const DEFAULTS = {
  plugType: "A",
  minV: "100",
  maxV: "240",
  freq: "both",
  watts: "65",
};

const PRESETS = [
  { label: "Laptop charger", minV: "100", maxV: "240", freq: "both", watts: "65" },
  { label: "Phone charger", minV: "100", maxV: "240", freq: "both", watts: "20" },
  { label: "US hair dryer", minV: "120", maxV: "120", freq: "60", watts: "1875" },
  { label: "Portable heater", minV: "220", maxV: "240", freq: "50", watts: "2000" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [plugType, setPlugType] = useState(DEFAULTS.plugType);
  const [minV, setMinV] = useState(DEFAULTS.minV);
  const [maxV, setMaxV] = useState(DEFAULTS.maxV);
  const [freq, setFreq] = useState(DEFAULTS.freq);
  const [deviceWatts, setDeviceWatts] = useState(DEFAULTS.watts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessArgentinaPower({
        plugType,
        deviceMinVoltageV: toNum(minV),
        deviceMaxVoltageV: toNum(maxV),
        deviceFrequency: freq,
        deviceWatts: toNum(deviceWatts),
      }),
    [plugType, minV, maxV, freq, deviceWatts],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Plug and Voltage Guide for Argentina",
      `Argentina mains: ${MAINS_VOLTAGE_V} V, ${MAINS_FREQUENCY_HZ} Hz, sockets type I and type C`,
      `Your plug: ${result.plug.name}`,
      `Verdict: ${result.verdict}`,
      `Adapter needed: ${result.adapterNeeded ? "yes" : "no"}`,
      `Voltage converter needed: ${result.converterNeeded ? `yes (${result.converterDirection})` : "no"}`,
      `Current at ${MAINS_VOLTAGE_V} V: ${amps(result.currentA)}`,
      ...result.actions.map((a) => `- ${a}`),
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
    setPlugType(DEFAULTS.plugType);
    setMinV(DEFAULTS.minV);
    setMaxV(DEFAULTS.maxV);
    setFreq(DEFAULTS.freq);
    setDeviceWatts(DEFAULTS.watts);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setMinV(preset.minV);
    setMaxV(preset.maxV);
    setFreq(preset.freq);
    setDeviceWatts(preset.watts);
    setCopied(false);
  };

  const rows = [
    ["Travel adapter needed", hasError ? DASH : result.adapterNeeded ? "Yes" : "No"],
    ["Polarity reversed vs your country", hasError ? DASH : result.polarityReversed ? "Yes" : "No"],
    [
      "Voltage converter needed",
      hasError ? DASH : result.converterNeeded ? `Yes — ${result.converterDirection}` : "No",
    ],
    ["50 Hz compatible", hasError ? DASH : result.frequencyOk ? "Yes" : "No"],
    [`Current drawn at ${MAINS_VOLTAGE_V} V`, hasError ? DASH : amps(result.currentA)],
    [
      `Fits a ${STANDARD_SOCKET_A} A wall socket`,
      hasError ? DASH : result.fitsStandardSocket ? "Yes" : `No — needs the ${HEAVY_SOCKET_A} A outlet`,
    ],
    [
      `Ceiling on a ${STANDARD_SOCKET_A} A socket`,
      hasError ? DASH : `${NUM0.format(result.maxWattsOnStandardSocket)} W`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          Argentina · 220 V · 50 Hz
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Plug and Voltage Guide for Argentina</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Argentina runs {MAINS_VOLTAGE_V} V at {MAINS_FREQUENCY_HZ} Hz on the IRAM 2073 type I socket, with round-pin
          type C outlets still in older buildings. Enter what you are carrying to see whether a plug adapter is
          enough.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ar-plug">
              Plug on your device
            </label>
            <select
              id="ar-plug"
              className={`mt-2 ${INPUT_CLASS}`}
              value={plugType}
              onChange={(e) => setPlugType(e.target.value)}
            >
              {PLUG_TYPES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} — {p.where}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ar-minv">
              Label minimum voltage (V)
            </label>
            <input
              id="ar-minv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={minV}
              onChange={(e) => setMinV(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ar-maxv">
              Label maximum voltage (V)
            </label>
            <input
              id="ar-maxv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={maxV}
              onChange={(e) => setMaxV(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ar-freq">
              Label frequency
            </label>
            <select
              id="ar-freq"
              className={`mt-2 ${INPUT_CLASS}`}
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
            >
              <option value="both">50/60 Hz</option>
              <option value="50">50 Hz only</option>
              <option value="60">60 Hz only</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ar-watts">
              Rated power (W)
            </label>
            <input
              id="ar-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={deviceWatts}
              onChange={(e) => setDeviceWatts(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Common devices
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
              </button>
            ))}
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
              Verdict for Argentina
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.verdict}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to get a verdict." : result.adapterNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Argentina plug and voltage verdict"
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

        {!hasError && (
          <ul className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.actions.map((action) => (
              <li key={action} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        )}

        {!hasError && !result.frequencyOk && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.frequencyNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Sockets you will meet in Argentina</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Socket
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Rating
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it looks like
                </th>
              </tr>
            </thead>
            <tbody>
              {SOCKET_TYPES.map((socket) => (
                <tr key={socket.code} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2.5 pr-4 font-semibold">{socket.label}</td>
                  <td className="py-2.5 pr-4">{socket.ratedCurrentA} A</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{socket.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Current is taken as watts divided by {MAINS_VOLTAGE_V} V at unity power factor; motors and older
        transformers draw a little more. The tool plans for the supply sitting anywhere between about{" "}
        {NUM0.format(SUPPLY_MIN_V)} V and {NUM0.format(SUPPLY_MAX_V)} V rather than exactly nominal. This is general
        travel guidance, not an electrical inspection — ask a qualified electrician about anything unusual.
      </p>
    </main>
  );
}
