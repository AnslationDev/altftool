"use client";

import { useMemo, useState } from "react";
import { Aperture, Check, Copy, RotateCcw } from "lucide-react";

import {
  angleForSameExposure,
  COMMON_FPS,
  computeShutter,
  MAINS_FREQUENCIES,
  NATURAL_ANGLE,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DEFAULTS = {
  mode: "angle",
  angle: "180",
  denominator: "48",
  fps: "24",
  mainsHz: "50",
  targetFps: "48",
};

const PRESET_ANGLES = [45, 90, 144, 172.8, 180, 270, 360];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [denominator, setDenominator] = useState(DEFAULTS.denominator);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [mainsHz, setMainsHz] = useState(DEFAULTS.mainsHz);
  const [targetFps, setTargetFps] = useState(DEFAULTS.targetFps);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeShutter({
        mode,
        angle: Number(angle),
        denominator: Number(denominator),
        fps: Number(fps),
        mainsHz: Number(mainsHz),
      }),
    [mode, angle, denominator, fps, mainsHz],
  );

  const error = result.error || null;

  const ramp = useMemo(
    () => (error ? null : angleForSameExposure(result.angleDeg, result.fps, Number(targetFps))),
    [error, result, targetFps],
  );

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Motion Blur Shutter Angle Calculator",
      `Frame rate: ${NUM3.format(result.fps)} fps`,
      `Shutter angle: ${NUM2.format(result.angleDeg)}°`,
      `Shutter speed: ${result.shutterLabel}`,
      `Exposure: ${NUM3.format(result.exposureMs)} ms of a ${NUM3.format(result.frameIntervalMs)} ms frame (${NUM1.format(result.exposurePct)}%)`,
      `Versus 180°: ${NUM2.format(result.stopsFromNatural)} stops`,
      `Mains ${NUM.format(result.mainsHz)} Hz: ${NUM3.format(result.mainsCycles)} cycles — ${result.isFlickerSafe ? "flicker safe" : "can band"}`,
      result.character,
    ].join("\n");
  }, [error, result]);

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
    setAngle(DEFAULTS.angle);
    setDenominator(DEFAULTS.denominator);
    setFps(DEFAULTS.fps);
    setMainsHz(DEFAULTS.mainsHz);
    setTargetFps(DEFAULTS.targetFps);
    setCopied(false);
  };

  const headlineLabel = mode === "angle" ? "Shutter speed" : "Shutter angle";
  const headlineValue = error
    ? "—"
    : mode === "angle"
      ? result.shutterLabel
      : `${NUM2.format(result.angleDeg)}°`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Aperture className="h-4 w-4" aria-hidden="true" />
          Cinematography
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Motion Blur Shutter Angle Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert between shutter angle and shutter speed at any frame rate, see how far you are
          from the {NATURAL_ANGLE}-degree rule, and find the angles that will not band under mains
          lighting.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["angle", "I know the angle"],
            ["speed", "I know the shutter speed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={mode === value ? `${PRIMARY_BTN} px-3` : CHIP_BTN}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "angle" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mbsa-angle">
                Shutter angle (degrees)
              </label>
              <input
                id="mbsa-angle"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="360"
                step="0.1"
                value={angle}
                onChange={(event) => setAngle(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="mbsa-denom">
                Shutter speed — 1 over
              </label>
              <input
                id="mbsa-denom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={denominator}
                onChange={(event) => setDenominator(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="mbsa-fps">
              Frame rate (fps)
            </label>
            <input
              id="mbsa-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.001"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mbsa-mains">
              Mains frequency
            </label>
            <select
              id="mbsa-mains"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mainsHz}
              onChange={(event) => setMainsHz(event.target.value)}
            >
              {MAINS_FREQUENCIES.map((hz) => (
                <option key={hz} value={String(hz)}>
                  {hz} Hz
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mbsa-target">
              Ramp to this frame rate
            </label>
            <input
              id="mbsa-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={targetFps}
              onChange={(event) => setTargetFps(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_FPS.map((value) => (
            <button key={value} type="button" onClick={() => setFps(String(value))} className={CHIP_BTN}>
              {value} fps
            </button>
          ))}
        </div>
        {mode === "angle" ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_ANGLES.map((value) => (
              <button key={value} type="button" onClick={() => setAngle(String(value))} className={CHIP_BTN}>
                {value}°
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headlineValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the input above to convert." : result.character}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the shutter calculation"
              className={GHOST_BTN}
              disabled={!summary}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Shutter angle", error ? "—" : `${NUM2.format(result.angleDeg)}°`],
            ["Shutter speed", error ? "—" : result.shutterLabel],
            ["Exposure time", error ? "—" : `${NUM3.format(result.exposureMs)} ms`],
            ["Frame interval", error ? "—" : `${NUM3.format(result.frameIntervalMs)} ms`],
            ["Shutter open for", error ? "—" : `${NUM1.format(result.exposurePct)}% of the frame`],
            [
              `Exposure versus ${NATURAL_ANGLE}°`,
              error
                ? "—"
                : `${result.stopsFromNatural >= 0 ? "+" : ""}${NUM2.format(result.stopsFromNatural)} stops (${NATURAL_ANGLE}° would be 1/${NUM2.format(result.naturalDenominator)} s)`,
            ],
            [
              "Nearest dial setting",
              error
                ? "—"
                : `1/${NUM.format(result.nearestStandardDenominator)} s = ${NUM1.format(result.nearestStandardAngle)}°`,
            ],
            [
              `Mains cycles per exposure at ${error ? "—" : NUM.format(result.mainsHz)} Hz`,
              error ? "—" : `${NUM3.format(result.mainsCycles)} — ${result.isFlickerSafe ? "flicker safe" : "may band"}`,
            ],
            [
              "Same exposure at the ramp rate",
              error || !ramp
                ? "—"
                : ramp.impossible
                  ? `Needs ${NUM1.format(ramp.needed)}° — impossible, open up or add light instead`
                  : `${NUM1.format(ramp.angle)}°`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Shutter is open for ${NUM1.format(result.exposurePct)} percent of each frame`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.exposurePct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Teal is the exposed portion of each frame · grey is the dark period between frames
            </p>
          </div>
        ) : null}

        {!error && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            Flicker-free angles at {NUM3.format(result.fps)} fps under {NUM.format(result.mainsHz)} Hz
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Each of these exposes for a whole number of mains cycles, so LED and fluorescent sources
            average out instead of banding.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Shutter angle</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Shutter speed</th>
                  <th scope="col" className="py-2 text-right font-semibold">Mains cycles</th>
                </tr>
              </thead>
              <tbody>
                {result.flickerSafe.length === 0 ? (
                  <tr>
                    <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                      No whole-cycle exposure fits inside one frame at this frame rate.
                    </td>
                  </tr>
                ) : (
                  result.flickerSafe.map((option) => (
                    <tr key={option.cycles} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{NUM1.format(option.angle)}°</td>
                      <td className="py-2 pr-3 text-right">1/{NUM2.format(option.denominator)} s</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{NUM.format(option.cycles)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Many cameras label shutter speed rather than angle, and some round the displayed value.
        Modern dimmed LED fixtures can flicker at rates unrelated to mains frequency, so shoot a
        test clip at your working shutter before committing to a setup.
      </p>
    </main>
  );
}
