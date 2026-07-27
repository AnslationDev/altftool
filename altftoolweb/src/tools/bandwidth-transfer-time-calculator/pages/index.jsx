"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  SIZE_UNITS,
  SPEED_UNITS,
  computeTransferTime,
  formatTransferDuration,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  sizeValue: "50",
  sizeUnit: "GB",
  speedValue: "100",
  speedUnit: "Mbps",
  efficiency: "90",
};

const DASH = "—";

export default function ToolHome() {
  const [sizeValue, setSizeValue] = useState(DEFAULTS.sizeValue);
  const [sizeUnit, setSizeUnit] = useState(DEFAULTS.sizeUnit);
  const [speedValue, setSpeedValue] = useState(DEFAULTS.speedValue);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTransferTime({
        sizeValue: sizeValue.trim() === "" ? NaN : Number(sizeValue),
        sizeUnit,
        speedValue: speedValue.trim() === "" ? NaN : Number(speedValue),
        speedUnit,
        efficiencyPercent: efficiency.trim() === "" ? NaN : Number(efficiency),
      }),
    [sizeValue, sizeUnit, speedValue, speedUnit, efficiency],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bandwidth transfer time",
      `Data: ${sizeValue} ${sizeUnit} at ${speedValue} ${speedUnit}, ${result.efficiencyPercent}% efficiency`,
      `Estimated time: ${formatTransferDuration(result.seconds)}`,
      `Ideal (no overhead): ${formatTransferDuration(result.idealSeconds)}`,
      `Effective throughput: ${NUM.format(result.effectiveMegabytesPerSecond)} MB/s`,
    ].join("\n");
  }, [hasError, result, sizeValue, sizeUnit, speedValue, speedUnit]);

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
    setSizeValue(DEFAULTS.sizeValue);
    setSizeUnit(DEFAULTS.sizeUnit);
    setSpeedValue(DEFAULTS.speedValue);
    setSpeedUnit(DEFAULTS.speedUnit);
    setEfficiency(DEFAULTS.efficiency);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Networking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bandwidth Transfer Time Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          time = size in bits ÷ (link rate × efficiency). Handles the bits-vs-bytes trap — a 100
          Mbps line moves at most 12.5 megabytes per second — plus decimal and binary size units.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="btt-size">
              Data size
            </label>
            <input
              id="btt-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={sizeValue}
              onChange={(event) => setSizeValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="btt-sizeunit">
              Size unit
            </label>
            <select
              id="btt-sizeunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeUnit}
              onChange={(event) => setSizeUnit(event.target.value)}
            >
              {SIZE_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="btt-speed">
              Link speed
            </label>
            <input
              id="btt-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={speedValue}
              onChange={(event) => setSpeedValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="btt-speedunit">
              Speed unit
            </label>
            <select
              id="btt-speedunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              {SPEED_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="btt-eff">
              Protocol efficiency (%)
            </label>
            <input
              id="btt-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              TCP/IP over Ethernet typically delivers 90-95% of the line rate as usable data after
              headers and acknowledgements. Use 100 for the theoretical minimum time.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Estimated transfer time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatTransferDuration(result.seconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `At ${NUM.format(result.effectiveMegabytesPerSecond)} MB/s of effective throughput.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the transfer time result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Ideal time (100% efficiency)", DASH],
                ["Added by overhead", DASH],
                ["Total data", DASH],
                ["Effective throughput", DASH],
              ]
            : [
                ["Ideal time (100% efficiency)", formatTransferDuration(result.idealSeconds)],
                ["Added by overhead", formatTransferDuration(result.overheadSeconds)],
                ["Total data", `${NUM.format(result.totalBytes / 1e9)} GB (${NUM.format(result.totalBits / 1e9)} gigabits)`],
                [
                  "Effective throughput",
                  `${NUM.format(result.effectiveMegabytesPerSecond)} MB/s (${NUM.format(result.effectiveBitsPerSecond / 1e6)} Mbit/s)`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate assumes a sustained, uncontended link. Real transfers also depend on latency and
        TCP window sizing, disk speed at both ends, and competing traffic — treat the result as a
        best-case planning figure.
      </p>
    </main>
  );
}
