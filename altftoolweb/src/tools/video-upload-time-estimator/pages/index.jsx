"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UploadCloud } from "lucide-react";

import {
  CONNECTION_PRESETS,
  DEFAULT_OVERHEAD_PERCENT,
  DEFAULT_UTILISATION_PERCENT,
  SIZE_UNITS,
  SPEED_UNITS,
  comparePresets,
  estimateUploadTime,
  formatDuration,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  size: "5",
  sizeUnit: "GB",
  speed: "40",
  speedUnit: "Mbps",
  overhead: String(DEFAULT_OVERHEAD_PERCENT),
  utilisation: String(DEFAULT_UTILISATION_PERCENT),
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const dash = "—";

export default function ToolHome() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [sizeUnit, setSizeUnit] = useState(DEFAULTS.sizeUnit);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [overhead, setOverhead] = useState(DEFAULTS.overhead);
  const [utilisation, setUtilisation] = useState(DEFAULTS.utilisation);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateUploadTime({
        sizeValue: toNumber(size),
        sizeUnit,
        speedValue: toNumber(speed),
        speedUnit,
        overheadPercent: toNumber(overhead),
        utilisationPercent: toNumber(utilisation),
      }),
    [size, sizeUnit, speed, speedUnit, overhead, utilisation],
  );

  const presets = useMemo(
    () =>
      comparePresets({
        sizeValue: toNumber(size),
        sizeUnit,
        overheadPercent: toNumber(overhead),
        utilisationPercent: toNumber(utilisation),
      }),
    [size, sizeUnit, overhead, utilisation],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Video Upload Time Estimator",
      `File size: ${size} ${sizeUnit} (${NUM0.format(result.fileBytes)} bytes)`,
      `Link speed: ${speed} ${speedUnit}`,
      `Overhead ${overhead}%, utilisation ${utilisation}%`,
      `Effective throughput: ${NUM2.format(result.effectiveMbps)} Mbps (${NUM2.format(result.effectiveMBps)} MB/s)`,
      `Estimated upload time: ${formatDuration(result.seconds)} (${NUM0.format(result.seconds)} seconds)`,
      `Best case at full line rate: ${formatDuration(result.theoreticalSeconds)}`,
    ].join("\n");
  }, [result, size, sizeUnit, speed, speedUnit, overhead, utilisation]);

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
    setSize(DEFAULTS.size);
    setSizeUnit(DEFAULTS.sizeUnit);
    setSpeed(DEFAULTS.speed);
    setSpeedUnit(DEFAULTS.speedUnit);
    setOverhead(DEFAULTS.overhead);
    setUtilisation(DEFAULTS.utilisation);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          Video calculators
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Upload Time Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how long a master file will take to reach YouTube, a client FTP or cloud storage,
          taking the gap between advertised line speed and real throughput into account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-size">
              File size
            </label>
            <input
              id="upload-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={size}
              onChange={(event) => setSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-size-unit">
              Size unit
            </label>
            <select
              id="upload-size-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeUnit}
              onChange={(event) => setSizeUnit(event.target.value)}
            >
              {SIZE_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-speed">
              Upload speed
            </label>
            <input
              id="upload-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-speed-unit">
              Speed unit
            </label>
            <select
              id="upload-speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              {SPEED_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-overhead">
              Protocol overhead (%)
            </label>
            <input
              id="upload-overhead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={overhead}
              onChange={(event) => setOverhead(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upload-utilisation">
              Link utilisation (%)
            </label>
            <input
              id="upload-utilisation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={utilisation}
              onChange={(event) => setUtilisation(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CONNECTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setSpeed(String(preset.mbps));
                setSpeedUnit("Mbps");
              }}
            >
              {preset.name}
            </button>
          ))}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated upload time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : formatDuration(result.seconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see an estimate."
                : `${NUM2.format(result.effectiveMbps)} Mbps of usable throughput`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy upload time estimate"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
              aria-label="Reset the upload estimator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["File size in bytes", result.error ? dash : `${NUM0.format(result.fileBytes)} bytes`],
            ["File size in bits", result.error ? dash : `${NUM0.format(result.fileBits)} bits`],
            ["Advertised line rate", result.error ? dash : `${NUM2.format(result.rawMbps)} Mbps`],
            [
              "Usable throughput",
              result.error
                ? dash
                : `${NUM2.format(result.effectiveMbps)} Mbps (${NUM2.format(result.effectiveMBps)} MB/s)`,
            ],
            [
              "Best case at full line rate",
              result.error ? dash : formatDuration(result.theoreticalSeconds),
            ],
            [
              "Time lost to overhead and contention",
              result.error ? dash : formatDuration(result.lostSeconds),
            ],
            [
              "Files of this size per hour",
              result.error ? dash : NUM2.format(result.filesPerHour),
            ],
            [
              "Transfer efficiency",
              result.error ? dash : `${NUM2.format(result.efficiencyPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Same file on other connections</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Connection
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Typical upload
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {presets.map((preset) => (
                <tr key={preset.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{preset.name}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {preset.mbps} Mbps
                  </td>
                  <td className="py-2 text-right">
                    {preset.seconds === null ? dash : formatDuration(preset.seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Real transfers vary with server-side throttling, Wi-Fi interference,
        multipart chunk sizes and how many other devices share the line. Run a speed test that
        measures upload, not download, and use that figure here.
      </p>
    </main>
  );
}
