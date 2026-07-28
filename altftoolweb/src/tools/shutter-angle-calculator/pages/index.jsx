"use client";

import { useMemo, useState } from "react";
import { Aperture, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMMON_ANGLES,
  COMMON_FPS,
  MAINS_OPTIONS,
  angleTable,
  angleToShutter,
  formatShutterSpeed,
  shutterToAngle,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

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
  mode: "angle",
  angle: "180",
  denominator: "48",
  fps: "24",
  mains: "50",
};

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [denominator, setDenominator] = useState(DEFAULTS.denominator);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [mains, setMains] = useState(DEFAULTS.mains);
  const [copied, setCopied] = useState(false);

  const mainsHz = useMemo(() => {
    const found = MAINS_OPTIONS.find((item) => item.id === mains);
    return found ? found.hz : 50;
  }, [mains]);

  const result = useMemo(() => {
    if (mode === "speed") {
      return shutterToAngle({
        denominator: toNumber(denominator),
        fps: toNumber(fps),
        mainsHz,
      });
    }
    return angleToShutter({ angle: toNumber(angle), fps: toNumber(fps), mainsHz });
  }, [mode, angle, denominator, fps, mainsHz]);

  const table = useMemo(() => angleTable({ fps: toNumber(fps), mainsHz }), [fps, mainsHz]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Shutter Angle Calculator",
      `Frame rate: ${NUM3.format(result.fps)} fps`,
      `Shutter angle: ${NUM2.format(result.angle)} degrees`,
      `Shutter speed: ${formatShutterSpeed(result.denominator)}`,
      `Exposure time: ${NUM3.format(result.exposureMs)} ms of a ${NUM3.format(result.frameIntervalMs)} ms frame`,
      `Exposure vs 180 degrees: ${result.stopsFromNatural >= 0 ? "+" : ""}${NUM2.format(result.stopsFromNatural)} stops`,
      `Flicker under ${result.mainsHz} Hz lighting: ${
        result.flickerSafe ? "safe" : `risky — try ${NUM1.format(result.suggestedAngle)} degrees`
      }`,
    ].join("\n");
  }, [result]);

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
    setMains(DEFAULTS.mains);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Aperture className="h-4 w-4" aria-hidden="true" />
          Recording setup
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Shutter Angle Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a shutter angle into the shutter speed your camera menu asks for, at any frame
          rate — and check whether the result will band under mains-powered lighting.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What do you know?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["angle", "I have the shutter angle"],
              ["speed", "I have the shutter speed"],
            ].map(([value, label]) => {
              const id = `shutter-mode-${value}`;
              return (
                <label
                  key={value}
                  htmlFor={id}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                    mode === value
                      ? "border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name="shutter-mode"
                    className="h-4 w-4 accent-[var(--primary)]"
                    value={value}
                    checked={mode === value}
                    onChange={(event) => setMode(event.target.value)}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {mode === "angle" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="shutter-angle">
                Shutter angle (degrees)
              </label>
              <input
                id="shutter-angle"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="360"
                step="0.1"
                value={angle}
                onChange={(event) => setAngle(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="shutter-denominator">
                Shutter speed — 1 over this number
              </label>
              <input
                id="shutter-denominator"
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
            <label className={LABEL_CLASS} htmlFor="shutter-fps">
              Frame rate (fps)
            </label>
            <input
              id="shutter-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.001"
              list="shutter-fps-list"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
            <datalist id="shutter-fps-list">
              {COMMON_FPS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="shutter-mains">
              Mains frequency where you are shooting
            </label>
            <select
              id="shutter-mains"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mains}
              onChange={(event) => setMains(event.target.value)}
            >
              {MAINS_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "angle" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {COMMON_ANGLES.map((item) => (
              <button
                key={item.angle}
                type="button"
                className={CHIP_BTN}
                onClick={() => setAngle(String(item.angle))}
              >
                {item.angle}&deg;
              </button>
            ))}
          </div>
        )}
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "angle" ? "Shutter speed to dial in" : "Equivalent shutter angle"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error
                ? DASH
                : mode === "angle"
                  ? formatShutterSpeed(result.denominator)
                  : `${NUM2.format(result.angle)}°`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see a result."
                : `${NUM2.format(result.angle)}° at ${NUM3.format(result.fps)} fps`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy shutter angle result"
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
              aria-label="Reset the shutter calculator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Exposure time per frame",
              result.error ? DASH : `${NUM3.format(result.exposureMs)} ms`,
            ],
            ["Frame interval", result.error ? DASH : `${NUM3.format(result.frameIntervalMs)} ms`],
            [
              "Shutter open for",
              result.error ? DASH : `${NUM1.format((result.angle / 360) * 100)}% of the frame`,
            ],
            [
              "Exposure against the 180° rule",
              result.error
                ? DASH
                : `${result.stopsFromNatural >= 0 ? "+" : ""}${NUM2.format(result.stopsFromNatural)} stops`,
            ],
            [
              `Flicker under ${mainsHz} Hz lighting`,
              result.error ? DASH : result.flickerSafe ? "Safe" : "Risk of banding",
            ],
            [
              "Nearest flicker-free angle",
              result.error
                ? DASH
                : result.flickerSafe
                  ? "Already flicker-free"
                  : `${NUM1.format(result.suggestedAngle)}° (${formatShutterSpeed(1 / result.suggestedExposureSeconds)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Every marked angle at {fps || "0"} fps</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Angle
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Speed
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Exposure
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  {mainsHz} Hz
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.angle} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.angle}&deg;</td>
                  <td className="py-2 pr-3 text-right">
                    {row.denominator === null ? DASH : formatShutterSpeed(row.denominator)}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {row.exposureMs === null ? DASH : `${NUM2.format(row.exposureMs)} ms`}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={
                        row.flickerSafe
                          ? "font-semibold text-[var(--success)]"
                          : "text-[var(--muted-foreground)]"
                      }
                    >
                      {row.denominator === null ? DASH : row.flickerSafe ? "Safe" : "Banding"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {COMMON_ANGLES.map((item) => (
            <li key={item.angle}>
              <span className="font-semibold text-[var(--foreground)]">{item.angle}&deg;</span> —{" "}
              {item.note}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The flicker check assumes discharge or non-DC LED lighting running straight off the mains,
        which pulses at twice the supply frequency. Dimmed LEDs, PWM fixtures and screens flicker at
        their own rates, so always confirm on a monitor before rolling.
      </p>
    </main>
  );
}
