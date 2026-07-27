"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import {
  ALIGNMENT_PRESETS,
  STAGE_TARGETS,
  UNITS,
  convertLevel,
  gainToTarget,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  value: "-18",
  unit: "dbfs",
  alignment: "ebu-r68",
  zeroDbfsDbu: "18",
  target: "-18",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "" || text === "-") return NaN;
  return Number(text);
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [alignment, setAlignment] = useState(DEFAULTS.alignment);
  const [zeroDbfsDbu, setZeroDbfsDbu] = useState(DEFAULTS.zeroDbfsDbu);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertLevel({
        value: toNumber(value),
        unit,
        zeroDbfsDbu: toNumber(zeroDbfsDbu),
      }),
    [value, unit, zeroDbfsDbu],
  );

  const hasError = Boolean(result.error);

  const gain = useMemo(() => {
    if (hasError) return { error: result.error };
    return gainToTarget(result.dbfs, toNumber(target));
  }, [hasError, result, target]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Gain staging conversion",
      `Alignment: 0 dBFS = +${NUM1.format(result.zeroDbfsDbu)} dBu`,
      `${NUM2.format(result.dbfs)} dBFS`,
      `${NUM2.format(result.dbu)} dBu`,
      `${NUM2.format(result.dbv)} dBV`,
      `${NUM3.format(result.volts)} V RMS (${NUM0.format(result.millivolts)} mV)`,
      `${NUM2.format(result.percent)}% of full scale`,
      `16-bit sample ${NUM0.format(result.sample16)} · 24-bit sample ${NUM0.format(result.sample24)}`,
      `Headroom to clipping: ${NUM2.format(result.headroomDb)} dB`,
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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setAlignment(DEFAULTS.alignment);
    setZeroDbfsDbu(DEFAULTS.zeroDbfsDbu);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const applyAlignment = (id) => {
    setAlignment(id);
    const preset = ALIGNMENT_PRESETS.find((p) => p.id === id);
    if (preset) setZeroDbfsDbu(String(preset.zeroDbfsDbu));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Mixing helpers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gain Staging Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a level in any unit and read it back in dBFS, dBu, dBV, volts and percent of full
          scale — tied to the alignment standard your facility works to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-value">
              Level
            </label>
            <input
              id="gs-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-unit">
              Unit
            </label>
            <select
              id="gs-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gs-alignment">
              Alignment standard
            </label>
            <select
              id="gs-alignment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={alignment}
              onChange={(event) => applyAlignment(event.target.value)}
            >
              {ALIGNMENT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-zero">
              0 dBFS equals (dBu)
            </label>
            <input
              id="gs-zero"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={zeroDbfsDbu}
              onChange={(event) => setZeroDbfsDbu(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-target">
              Target level for the gain move (dBFS)
            </label>
            <input
              id="gs-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-144"
              max="0"
              step="0.5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Digital level
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.dbfs)} dBFS`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${NUM2.format(result.headroomDb)} dB of headroom before clipping`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy gain staging conversion"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Analogue level (dBu)", hasError ? DASH : `${NUM2.format(result.dbu)} dBu`],
            ["Analogue level (dBV)", hasError ? DASH : `${NUM2.format(result.dbv)} dBV`],
            [
              "Voltage",
              hasError
                ? DASH
                : `${NUM3.format(result.volts)} V RMS (${NUM0.format(result.millivolts)} mV)`,
            ],
            ["Percent of full scale", hasError ? DASH : `${NUM2.format(result.percent)}%`],
            ["Sample value, 16-bit", hasError ? DASH : NUM0.format(result.sample16)],
            ["Sample value, 24-bit", hasError ? DASH : NUM0.format(result.sample24)],
            [
              "Gain change to reach target",
              hasError || gain.error
                ? DASH
                : `${gain.gainDb >= 0 ? "+" : ""}${NUM2.format(gain.gainDb)} dB (×${NUM2.format(gain.multiplier)})`,
            ],
          ].map(([label, value_]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value_}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where each stage should sit</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Level</th>
                <th scope="col" className="py-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {STAGE_TARGETS.map((stage) => (
                <tr key={stage.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{stage.label}</td>
                  <td className="py-2 pr-3 text-right">{stage.peakDbfs} dBFS</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{stage.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Percent of full scale is the linear sample amplitude, not a DAW fader position — most faders
        use a tapered scale, so 50% on the fader is not 50% amplitude.
      </p>
    </main>
  );
}
