"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import {
  DEFAULT_RESOLUTION,
  MATERIALS,
  MAX_DAMPING,
  MAX_SIDE_MM,
  MAX_THICKNESS_MM,
  MIN_DAMPING,
  MIN_SIDE_MM,
  MIN_THICKNESS_MM,
  nodalIntensity,
  simulatePlate,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CANVAS_PIXELS = 480;

const DEFAULTS = {
  frequency: "300",
  side: "200",
  thickness: "1",
  material: "steel",
  damping: "0.02",
};

const hz = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const decimals = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const canvasRef = useRef(null);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [side, setSide] = useState(DEFAULTS.side);
  const [thickness, setThickness] = useState(DEFAULTS.thickness);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [damping, setDamping] = useState(DEFAULTS.damping);
  const [themeTick, setThemeTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      simulatePlate({
        frequencyHz: Number(frequency),
        sideMm: Number(side),
        thicknessMm: Number(thickness),
        materialKey: material,
        dampingRatio: Number(damping),
        resolution: DEFAULT_RESOLUTION,
      }),
    [frequency, side, thickness, material, damping],
  );

  // Redraw when the site theme flips, so the plate keeps using live tokens.
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(() => setThemeTick((tick) => tick + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const styles = getComputedStyle(canvas);
    const surface = styles.getPropertyValue("--background").trim() || "transparent";
    const sand = styles.getPropertyValue("--primary").trim() || "currentColor";

    context.globalAlpha = 1;
    context.fillStyle = surface;
    context.fillRect(0, 0, CANVAS_PIXELS, CANVAS_PIXELS);

    if (result.error) return;

    const { values, size, peak } = result.field;
    const cell = CANVAS_PIXELS / size;
    context.fillStyle = sand;
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const intensity = nodalIntensity(values[row * size + column], peak);
        if (intensity <= 0) continue;
        context.globalAlpha = intensity;
        context.fillRect(column * cell, row * cell, cell + 1, cell + 1);
      }
    }
    context.globalAlpha = 1;
  }, [result, themeTick]);

  const summary = result.error
    ? ""
    : [
        `Chladni plate simulation`,
        `Material: ${result.material.label}`,
        `Plate: ${side} mm square, ${thickness} mm thick`,
        `Drive frequency: ${frequency} Hz`,
        `Nearest mode: (${result.mode.m}, ${result.mode.n}) at ${hz.format(result.modeFrequencyHz)} Hz`,
        `Fundamental (1,1): ${hz.format(result.fundamentalHz)} Hz`,
        `Amplitude factor: ${decimals.format(result.amplitudeFactor)}x (peak ${decimals.format(result.peakAmplitudeFactor)}x)`,
        `Air wavelength: ${decimals.format(result.airWavelengthM)} m`,
      ].join("\n");

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFrequency(DEFAULTS.frequency);
    setSide(DEFAULTS.side);
    setThickness(DEFAULTS.thickness);
    setMaterial(DEFAULTS.material);
    setDamping(DEFAULTS.damping);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Waves className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Cymatics Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Drive a square plate at a frequency and watch where the sand would settle. The pattern is
          the nodal set of the plate&apos;s standing wave, the same figures Chladni drew in 1787.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="cym-frequency">
            Drive frequency (Hz)
          </label>
          <input
            id="cym-frequency"
            type="number"
            min={1}
            max={20000}
            step={1}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="cym-material">
            Plate material
          </label>
          <select
            id="cym-material"
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          >
            {MATERIALS.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="cym-side">
            Plate side (mm)
          </label>
          <input
            id="cym-side"
            type="number"
            min={MIN_SIDE_MM}
            max={MAX_SIDE_MM}
            step={5}
            value={side}
            onChange={(event) => setSide(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="cym-thickness">
            Thickness (mm)
          </label>
          <input
            id="cym-thickness"
            type="number"
            min={MIN_THICKNESS_MM}
            max={MAX_THICKNESS_MM}
            step={0.1}
            value={thickness}
            onChange={(event) => setThickness(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="cym-damping">
            Damping ratio ({damping})
          </label>
          <input
            id="cym-damping"
            type="range"
            min={MIN_DAMPING}
            max={MAX_DAMPING}
            step={0.001}
            value={damping}
            onChange={(event) => setDamping(event.target.value)}
            className="mt-3 h-11 w-full accent-[var(--primary)]"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Lower damping means a sharper resonance and a much larger response at the mode
            frequency.
          </p>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Nearest plate mode</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : `(${result.mode.m}, ${result.mode.n})`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `resonates at ${hz.format(result.modeFrequencyHz)} Hz · ${
                    result.onResonance ? "on resonance" : `${percent.format(result.detunePercent)}% detuned`
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the simulation summary"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plate settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <canvas
            ref={canvasRef}
            width={CANVAS_PIXELS}
            height={CANVAS_PIXELS}
            role="img"
            aria-label={
              result.error
                ? "Plate pattern unavailable because the inputs are invalid"
                : `Chladni pattern for mode ${result.mode.m}, ${result.mode.n}`
            }
            className="mx-auto block aspect-square h-auto w-full max-w-[480px] rounded-lg border border-[var(--border)]"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fundamental (1,1)", result.error ? DASH : `${hz.format(result.fundamentalHz)} Hz`],
            [
              "Response vs static push",
              result.error ? DASH : `${decimals.format(result.amplitudeFactor)}×`,
            ],
            ["Peak possible response", result.error ? DASH : `${decimals.format(result.peakAmplitudeFactor)}×`],
            ["Quality factor Q", result.error ? DASH : decimals.format(result.qualityFactor)],
            ["Flexural rigidity D", result.error ? DASH : `${decimals.format(result.rigidityNm)} N·m`],
            ["Wavelength in air", result.error ? DASH : `${decimals.format(result.airWavelengthM)} m`],
            [
              "Sand coverage",
              result.error ? DASH : `${percent.format(result.field.nodalFraction * 100)}% of the plate`,
            ],
            ["Audible to humans", result.error ? DASH : result.audible ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Frequencies come from Kirchhoff-Love thin-plate theory for a simply supported square plate,
        so a real plate clamped or free at its edges will resonate at different numbers. The figure
        itself is the nodal set of the classic Chladni superposition and is time-independent — the
        sand does not move once it has settled.
      </p>
    </main>
  );
}
