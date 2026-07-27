"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SlidersHorizontal } from "lucide-react";
import { INPUT_MODES, REFERENCE_ROWS, convertLevel, dbToAmplitude, dbToPower } from "../lib";

const SIG = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 6 });
const FIX2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (value) => (Number.isFinite(value) ? SIG.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${SIG.format(value)}%` : "—");

const DEFAULTS = { mode: "db", value: "-6" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [value, setValue] = useState(DEFAULTS.value);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertLevel({ mode, value: value.trim() === "" ? NaN : Number(value) }),
    [mode, value],
  );

  const hasError = Boolean(result.error);
  const dash = "—";
  const activeMode = INPUT_MODES.find((item) => item.id === mode) ?? INPUT_MODES[0];
  const dbLabel = hasError ? dash : result.silent ? "−∞ dB" : `${FIX2.format(result.db)} dB`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "dB To Percentage Converter",
      `Level: ${result.silent ? "-inf dB (silence)" : `${FIX2.format(result.db)} dB`}`,
      `Amplitude ratio: ${num(result.amplitudeRatio)}x (${pct(result.amplitudePercent)})`,
      `Power ratio: ${num(result.powerRatio)}x (${pct(result.powerPercent)})`,
      `Perceived loudness: about ${num(result.perceivedLoudnessRatio)}x`,
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
    setMode(DEFAULTS.mode);
    setValue(DEFAULTS.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Gain &amp; level
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">dB To Percentage Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Decibels are a ratio on a log scale: 20·log10 for amplitude, 10·log10 for power. Enter any
          one of them and read the other three, including the linear gain multiplier you would set
          on a Web Audio gain node.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="db-mode">
              I am entering
            </label>
            <select
              id="db-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {INPUT_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="db-value">
              Value ({activeMode.unit})
            </label>
            <input
              id="db-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["-60", "-20", "-12", "-6", "-3", "0", "3", "6"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setMode("db");
                setValue(preset);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} dB
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Amplitude percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : pct(result.amplitudePercent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${dbLabel} · gain multiplier ${num(result.amplitudeRatio)}×`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy decibel conversion result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Decibels", dbLabel],
            ["Amplitude ratio (voltage, sample value)", hasError ? dash : `${num(result.amplitudeRatio)}×`],
            ["Amplitude percentage", hasError ? dash : pct(result.amplitudePercent)],
            ["Power ratio (watts, intensity)", hasError ? dash : `${num(result.powerRatio)}×`],
            ["Power percentage", hasError ? dash : pct(result.powerPercent)],
            [
              "Perceived loudness (10 dB ≈ 2×)",
              hasError ? dash : `about ${num(result.perceivedLoudnessRatio)}×`,
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reference points</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">dB</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Amplitude</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Power</th>
                <th scope="col" className="py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ROWS.map((row) => (
                <tr key={row.db} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{FIX2.format(row.db)}</td>
                  <td className="py-2 pr-3 text-right">{pct(dbToAmplitude(row.db) * 100)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {pct(dbToPower(row.db) * 100)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The amplitude percentage is the multiplier a linear gain stage applies — set a Web Audio
        GainNode to the ratio, not the dB value. A DAW channel fader uses its own travel taper, so
        a fader sitting halfway is not necessarily 50% amplitude.
      </p>
    </main>
  );
}
