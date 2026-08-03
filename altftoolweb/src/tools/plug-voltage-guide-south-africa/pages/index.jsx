"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plug, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  assessSouthAfricanPower,
  MAINS_FREQUENCY_HZ,
  MAINS_VOLTAGE_V,
  PLUG_TYPES,
  SOCKET_TYPES,
  SUPPLY_MAX_V,
  SUPPLY_MIN_V,
  TYPE_M_SOCKET_A,
  TYPE_N_SOCKET_A,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 });
const DASH = "—";

const amps = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} A` : DASH);

const DEFAULTS = {
  plugType: "C",
  minV: "100",
  maxV: "240",
  freq: "both",
  watts: "65",
};

const PRESETS = [
  { label: "Laptop charger", plugType: "C", minV: "100", maxV: "240", freq: "both", watts: "65" },
  { label: "Phone charger", plugType: "C", minV: "100", maxV: "240", freq: "both", watts: "20" },
  { label: "US hair dryer", plugType: "A", minV: "120", maxV: "120", freq: "60", watts: "1875" },
  { label: "Kettle", plugType: "G", minV: "220", maxV: "240", freq: "50", watts: "2200" },
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
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      assessSouthAfricanPower({
        plugType,
        deviceMinVoltageV: toNum(minV),
        deviceMaxVoltageV: toNum(maxV),
        deviceFrequency: freq,
        deviceWatts: toNum(deviceWatts),
      }),
    [plugType, minV, maxV, freq, deviceWatts],
  );

  const hasError = Boolean(result.error);
  const fittingCodes = hasError ? [] : result.fittingSockets.map((socket) => socket.code);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Plug and Voltage Guide for South Africa",
      `South African mains: ${MAINS_VOLTAGE_V} V, ${MAINS_FREQUENCY_HZ} Hz, SANS 164-1 (type M) and SANS 164-2 (type N)`,
      `Your plug: ${result.plug.name}`,
      `Verdict: ${result.verdict}`,
      `Sockets it enters: ${result.fittingSockets.length > 0 ? result.fittingSockets.map((s) => s.label).join("; ") : "none"}`,
      `Voltage converter needed: ${result.converterNeeded ? `yes (${result.converterDirection})` : "no"}`,
      `Current at ${MAINS_VOLTAGE_V} V: ${amps(result.currentA)}`,
      ...result.actions.map((a) => `- ${a}`),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "South Africa plug and voltage verdict" });
  };

  const reset = () => {
    setPlugType(DEFAULTS.plugType);
    setMinV(DEFAULTS.minV);
    setMaxV(DEFAULTS.maxV);
    setFreq(DEFAULTS.freq);
    setDeviceWatts(DEFAULTS.watts);
  };

  const applyPreset = (preset) => {
    setPlugType(preset.plugType);
    setMinV(preset.minV);
    setMaxV(preset.maxV);
    setFreq(preset.freq);
    setDeviceWatts(preset.watts);
  };

  const rows = [
    ["Travel adapter needed", hasError ? DASH : result.adapterNeeded ? "Yes" : "No"],
    [
      "Sockets your plug enters",
      hasError ? DASH : result.fittingSockets.length > 0 ? result.fittingSockets.map((s) => s.label).join(", ") : "None",
    ],
    [
      "Works in an old type M outlet",
      hasError ? DASH : fittingCodes.includes("M") ? "Yes" : "No — that is the big three-round-pin socket",
    ],
    [
      "Voltage converter needed",
      hasError ? DASH : result.converterNeeded ? `Yes — ${result.converterDirection}` : "No",
    ],
    ["50 Hz compatible", hasError ? DASH : result.frequencyOk ? "Yes" : "No"],
    [`Current drawn at ${MAINS_VOLTAGE_V} V`, hasError ? DASH : amps(result.currentA)],
    [
      `Ceiling on a ${TYPE_M_SOCKET_A} A type M socket`,
      hasError ? DASH : `${NUM0.format(result.maxWattsOnTypeM)} W`,
    ],
    [
      `Ceiling on a ${TYPE_N_SOCKET_A} A type N socket`,
      hasError ? DASH : `${NUM0.format(result.maxWattsOnTypeN)} W`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          South Africa · 230 V · 50 Hz
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Plug and Voltage Guide for South Africa
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          South Africa runs {MAINS_VOLTAGE_V} V at {MAINS_FREQUENCY_HZ} Hz and is halfway through swapping the big
          SANS 164-1 type M socket for the slimmer SANS 164-2 type N. Enter your device to see which of those outlets
          will actually take it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="za-plug">
              Plug on your device
            </label>
            <select
              id="za-plug"
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
            <label className={LABEL_CLASS} htmlFor="za-minv">
              Label minimum voltage (V)
            </label>
            <input
              id="za-minv"
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
            <label className={LABEL_CLASS} htmlFor="za-maxv">
              Label maximum voltage (V)
            </label>
            <input
              id="za-maxv"
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
            <label className={LABEL_CLASS} htmlFor="za-freq">
              Label frequency
            </label>
            <select
              id="za-freq"
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
            <label className={LABEL_CLASS} htmlFor="za-watts">
              Rated power (W)
            </label>
            <input
              id="za-watts"
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
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict for South Africa
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{hasError ? DASH : result.verdict}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to get a verdict." : result.adapterNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the South Africa plug and voltage verdict"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
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
        <h2 className="text-lg font-semibold">Sockets you will meet in South Africa</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Socket
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Rating
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Takes your plug
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it looks like
                </th>
              </tr>
            </thead>
            <tbody>
              {SOCKET_TYPES.map((socket) => (
                <tr key={socket.code} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-4 font-semibold">{socket.label}</td>
                  <td className="py-2.5 pr-4">{socket.ratedCurrentA} A</td>
                  <td className="py-2.5 pr-4">
                    {hasError ? DASH : fittingCodes.includes(socket.code) ? "Yes" : "No"}
                  </td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{socket.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Current is taken as watts divided by {MAINS_VOLTAGE_V} V at unity power factor; motors and older transformers
        draw a little more. The tool plans for the supply sitting anywhere between about {NUM0.format(SUPPLY_MIN_V)} V
        and {NUM0.format(SUPPLY_MAX_V)} V rather than exactly nominal. This is general travel guidance, not an
        electrical inspection — ask a registered electrician about anything unusual.
      </p>
    </main>
  );
}
