"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import { REFLECTANCES, ROOM_PRESETS, matchBrightness } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  lux: "500",
  reflectance: "0.5",
  ratio: "1.5",
  maxNits: "350",
  currentPercent: "70",
};

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [lux, setLux] = useState(DEFAULTS.lux);
  const [reflectance, setReflectance] = useState(DEFAULTS.reflectance);
  const [ratio, setRatio] = useState(DEFAULTS.ratio);
  const [maxNits, setMaxNits] = useState(DEFAULTS.maxNits);
  const [currentPercent, setCurrentPercent] = useState(DEFAULTS.currentPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      matchBrightness({
        roomLux: toNumber(lux),
        reflectance: toNumber(reflectance),
        targetRatio: toNumber(ratio),
        monitorMaxNits: toNumber(maxNits),
        currentPercent: toNumber(currentPercent),
      }),
    [lux, reflectance, ratio, maxNits, currentPercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Monitor Brightness Match Guide",
      `Room light: ${result.roomLux} lux, wall reflectance ${result.reflectance}`,
      `Surround luminance: ${result.surroundNits} cd/m2`,
      `Recommended screen luminance: ${result.recommendedNits} cd/m2`,
      `Brightness slider: about ${result.sliderPercent}% on a ${result.monitorMaxNits} nit panel`,
      `Basis: ${result.basis}`,
      `Comfortable band: ${result.bandMinNits} to ${result.bandMaxNits} cd/m2`,
      result.currentRatio !== null
        ? `Right now: ${result.currentNits} cd/m2, a ${result.currentRatio}:1 screen-to-surround ratio`
        : `Right now: ${result.currentNits} cd/m2`,
      result.verdict,
    ].join("\n");
  }, [result, hasError]);

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
    setLux(DEFAULTS.lux);
    setReflectance(DEFAULTS.reflectance);
    setRatio(DEFAULTS.ratio);
    setMaxNits(DEFAULTS.maxNits);
    setCurrentPercent(DEFAULTS.currentPercent);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Brightness slider position", DASH],
        ["Surround (wall) luminance", DASH],
        ["Why this number", DASH],
        ["Comfortable band", DASH],
        ["Your screen right now", DASH],
        ["Current screen : surround ratio", DASH],
        ["Ergonomic ratio limits", DASH],
        ["ISO 3664 floor / preferred", DASH],
      ]
    : [
        ["Brightness slider position", `about ${result.sliderPercent}%`],
        ["Surround (wall) luminance", `${NUM.format(result.surroundNits)} cd/m²`],
        ["Why this number", result.basis],
        [
          "Comfortable band",
          `${INT.format(result.bandMinNits)} – ${INT.format(result.bandMaxNits)} cd/m²`,
        ],
        ["Your screen right now", `${INT.format(result.currentNits)} cd/m²`],
        [
          "Current screen : surround ratio",
          result.currentRatio !== null ? `${NUM.format(result.currentRatio)} : 1` : "No room light to compare",
        ],
        [
          "Ergonomic ratio limits",
          `${result.maxSurroundRatio}:1 immediate surround, ${result.maxFieldRatio}:1 wider field`,
        ],
        [
          "ISO 3664 floor / preferred",
          `${result.minDisplayLuminance} / ${result.preferredDisplayLuminance} cd/m²`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monitor Brightness Match Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts the light in your room into the luminance of the wall behind the screen, then
          gives the screen brightness that keeps the two within the 3:1 ratio ergonomic standards ask
          for — without dropping below the ISO 3664 floor of 80 cd/m².
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-lux">
              Room light (lux)
            </label>
            <input
              id="mb-lux"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={lux}
              onChange={(event) => setLux(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-reflect">
              Wall / desk behind the screen
            </label>
            <select
              id="mb-reflect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reflectance}
              onChange={(event) => setReflectance(event.target.value)}
            >
              {REFLECTANCES.map((item) => (
                <option key={item.id} value={String(item.value)}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-ratio">
              Target screen : surround ratio
            </label>
            <input
              id="mb-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="3"
              step="0.1"
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mb-max">
              Panel peak brightness (nits)
            </label>
            <input
              id="mb-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={maxNits}
              onChange={(event) => setMaxNits(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mb-current">
              Your brightness slider right now (%)
            </label>
            <input
              id="mb-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={currentPercent}
              onChange={(event) => setCurrentPercent(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ROOM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setLux(String(preset.lux));
                setCopied(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.lux} lux
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          No light meter? A phone light-meter app or the ambient sensor readout works. Rough guides:{" "}
          {ROOM_PRESETS.map((preset) => `${preset.label} ≈ ${preset.lux} lux`).join("; ")}.
        </p>
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
              Recommended screen luminance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${INT.format(result.recommendedNits)} cd/m²`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a target."
                : `roughly the ${result.sliderPercent}% mark on a ${INT.format(result.monitorMaxNits)} nit panel`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the brightness recommendation"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The slider percentage assumes a roughly linear backlight response, so
        treat it as a starting point and trust your eyes over the number. Persistent glare headaches
        or eye pain deserve an eye examination rather than another brightness tweak.
      </p>
    </main>
  );
}
