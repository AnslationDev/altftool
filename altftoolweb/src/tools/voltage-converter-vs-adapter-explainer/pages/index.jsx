"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CARRY_LIMIT_W,
  COMMON_MAINS,
  DEVICE_CLASSES,
  decideConverterOrAdapter,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const AMPS = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PERCENT = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const DASH = "—";

const DEFAULTS = {
  mainsId: "eu230",
  deviceMinVoltageV: "100",
  deviceMaxVoltageV: "240",
  deviceFrequency: "both",
  deviceWatts: "65",
  deviceClass: "electronic",
  plugShapeDiffers: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const TOGGLE_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

/** Parse a form field: blank stays blank (NaN) so the library reports it, not a silent zero. */
const parseField = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [mainsId, setMainsId] = useState(DEFAULTS.mainsId);
  const [deviceMinVoltageV, setDeviceMinVoltageV] = useState(DEFAULTS.deviceMinVoltageV);
  const [deviceMaxVoltageV, setDeviceMaxVoltageV] = useState(DEFAULTS.deviceMaxVoltageV);
  const [deviceFrequency, setDeviceFrequency] = useState(DEFAULTS.deviceFrequency);
  const [deviceWatts, setDeviceWatts] = useState(DEFAULTS.deviceWatts);
  const [deviceClass, setDeviceClass] = useState(DEFAULTS.deviceClass);
  const [plugShapeDiffers, setPlugShapeDiffers] = useState(DEFAULTS.plugShapeDiffers);
  const [copied, setCopied] = useState(false);

  const mains = useMemo(
    () => COMMON_MAINS.find((entry) => entry.id === mainsId) ?? COMMON_MAINS[0],
    [mainsId],
  );

  const result = useMemo(
    () =>
      decideConverterOrAdapter({
        destinationVoltageV: mains.voltageV,
        destinationFrequencyHz: mains.frequencyHz,
        deviceMinVoltageV: parseField(deviceMinVoltageV),
        deviceMaxVoltageV: parseField(deviceMaxVoltageV),
        deviceFrequency,
        deviceWatts: parseField(deviceWatts),
        deviceClass,
        plugShapeDiffers,
      }),
    [
      mains,
      deviceMinVoltageV,
      deviceMaxVoltageV,
      deviceFrequency,
      deviceWatts,
      deviceClass,
      plugShapeDiffers,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Voltage converter vs adapter ${DASH} ${result.verdict}`,
      `Destination: ${mains.label} ${DASH} ${mains.voltageV} V, ${mains.frequencyHz} Hz`,
      `Appliance label: ${deviceMinVoltageV}-${deviceMaxVoltageV} V, ${deviceFrequency === "both" ? "50/60" : deviceFrequency} Hz, ${deviceWatts} W`,
      `Dual voltage: ${result.dualVoltage ? "yes" : "no"}`,
      result.converterNeeded
        ? `Converter: ${result.converterDirection}, at least ${Math.ceil(result.requiredVA)} VA (${result.headroomFactor}x nameplate)`
        : "Converter: not needed",
      `Plug adapter: ${result.adapterNeeded ? "yes" : "no"}`,
      "",
      ...result.actions.map((action) => `- ${action}`),
    ].join("\n");
  }, [ok, result, mains, deviceMinVoltageV, deviceMaxVoltageV, deviceFrequency, deviceWatts]);

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
    setMainsId(DEFAULTS.mainsId);
    setDeviceMinVoltageV(DEFAULTS.deviceMinVoltageV);
    setDeviceMaxVoltageV(DEFAULTS.deviceMaxVoltageV);
    setDeviceFrequency(DEFAULTS.deviceFrequency);
    setDeviceWatts(DEFAULTS.deviceWatts);
    setDeviceClass(DEFAULTS.deviceClass);
    setPlugShapeDiffers(DEFAULTS.plugShapeDiffers);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Power adapters
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Voltage Converter vs Adapter Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A plug adapter changes the pin shape and nothing else. A converter or transformer changes
          the voltage. Copy the input range off your appliance label — something like
          &ldquo;INPUT: 100-240V ~ 50/60Hz&rdquo; — and this tells you which one you actually need
          and how big it has to be.
        </p>
      </header>

      <section className={CARD} aria-labelledby="vc-inputs">
        <h2 id="vc-inputs" className="text-base font-semibold">
          Destination and appliance label
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vc-mains">
              Where you are going
            </label>
            <select
              id="vc-mains"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mainsId}
              onChange={(event) => setMainsId(event.target.value)}
            >
              {COMMON_MAINS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.voltageV} V, {entry.frequencyHz} Hz
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-min">
              Label voltage: from (V)
            </label>
            <input
              id="vc-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={deviceMinVoltageV}
              onChange={(event) => setDeviceMinVoltageV(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-max">
              Label voltage: to (V)
            </label>
            <input
              id="vc-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={deviceMaxVoltageV}
              onChange={(event) => setDeviceMaxVoltageV(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-freq">
              Label frequency
            </label>
            <select
              id="vc-freq"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deviceFrequency}
              onChange={(event) => setDeviceFrequency(event.target.value)}
            >
              <option value="both">50/60 Hz (both)</option>
              <option value="50">50 Hz only</option>
              <option value="60">60 Hz only</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-watts">
              Rated power (W)
            </label>
            <input
              id="vc-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20000"
              step="1"
              value={deviceWatts}
              onChange={(event) => setDeviceWatts(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vc-class">
              What kind of appliance is it
            </label>
            <select
              id="vc-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deviceClass}
              onChange={(event) => setDeviceClass(event.target.value)}
            >
              {DEVICE_CLASSES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={TOGGLE_ROW} htmlFor="vc-plug">
              <input
                id="vc-plug"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={plugShapeDiffers}
                onChange={(event) => setPlugShapeDiffers(event.target.checked)}
              />
              The socket shape is different from home
            </label>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="vc-verdict">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="vc-verdict"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Verdict
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.verdict : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${mains.voltageV} V / ${mains.frequencyHz} Hz destination · ${result.dualVoltage ? "dual-voltage" : "single-voltage"} appliance`
                : "Fix the highlighted input to see the verdict."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the converter and adapter verdict"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Plug adapter needed", ok ? (result.adapterNeeded ? "Yes" : "No") : DASH],
            ["Voltage converter needed", ok ? (result.converterNeeded ? "Yes" : "No") : DASH],
            [
              "Converter direction",
              ok ? (result.converterDirection ? result.converterDirection : "Not applicable") : DASH,
            ],
            [
              "Minimum converter rating",
              ok
                ? result.converterNeeded
                  ? `${WHOLE.format(Math.ceil(result.requiredVA))} VA (${result.headroomFactor}× nameplate)`
                  : "Not applicable"
                : DASH,
            ],
            [
              "Acceptable converter type",
              ok
                ? result.converterType === "none"
                  ? "None needed"
                  : result.converterType === "transformer-only"
                    ? "Wound transformer only"
                    : "Chopping travel converter or transformer"
                : DASH,
            ],
            [
              "Current drawn at the wall",
              ok ? `${AMPS.format(result.currentWallA)} A at ${mains.voltageV} V` : DASH,
            ],
            [
              "Current on the appliance side",
              ok ? `${AMPS.format(result.currentDeviceA)} A at ${result.deviceNominalV} V` : DASH,
            ],
            [
              "Frequency match",
              ok
                ? result.frequencyOk
                  ? `Matches the ${mains.frequencyHz} Hz supply`
                  : `Label is ${deviceFrequency} Hz on a ${mains.frequencyHz} Hz supply`
                : DASH,
            ],
            [
              "Motor speed on this supply",
              ok
                ? result.frequencyOk
                  ? "Unchanged"
                  : `${PERCENT.format(result.speedChangePercent)}% versus rated speed`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <ul className="mt-4 space-y-2 text-sm">
            {result.actions.map((action) => (
              <li
                key={action}
                className="rounded-md bg-[var(--muted)] px-3 py-2 leading-5 text-[var(--foreground)]"
              >
                {action}
              </li>
            ))}
          </ul>
        ) : null}

        {ok && result.converterNeeded && result.converterType === "transformer-only" ? (
          <p className="mt-4 flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Do not run this on a cheap chopping travel converter. {result.deviceClass.note}
            </span>
          </p>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="vc-difference">
        <h2 id="vc-difference" className="text-base font-semibold">
          Adapter, converter, transformer
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Device
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  What it changes
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Use it for
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Plug adapter",
                  "Pin shape only — volts and hertz pass straight through",
                  "Any appliance whose label already covers the destination voltage",
                ],
                [
                  "Travel converter (chopping)",
                  "Roughly halves RMS voltage by cutting the waveform",
                  "Bare heating elements only, for the short duty it is rated for",
                ],
                [
                  "Transformer",
                  "Steps voltage up or down with a clean sine wave",
                  "Electronics, motors and anything left running unattended",
                ],
              ].map(([device, changes, useFor]) => (
                <tr key={device} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{device}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{changes}</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{useFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Neither device changes frequency: a 50 Hz supply stays 50 Hz. Above about{" "}
          {WHOLE.format(CARRY_LIMIT_W)} W a transformer becomes heavy and expensive enough that
          buying the appliance locally is usually cheaper than carrying one.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always read the figures off the appliance or its power brick rather than guessing. Where a
        label gives a VA or amp rating instead of watts, use the VA figure. Sizing here uses the
        usual headroom rules of thumb — 1.25× for resistive loads, 1.5× for electronics and 3× for
        motors — and does not replace the manufacturer&apos;s own instructions.
      </p>
    </main>
  );
}
