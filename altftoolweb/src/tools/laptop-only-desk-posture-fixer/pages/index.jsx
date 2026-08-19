"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Laptop, RotateCcw } from "lucide-react";

import {
  ASPECT_RATIOS,
  LAPTOP_DISTANCE_MAX_CM,
  LAPTOP_DISTANCE_MIN_CM,
  analyseLaptopSetup,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  heightCm: "170",
  seatHeightCm: "45",
  deskHeightCm: "74",
  laptopInches: "14",
  aspect: "16:10",
  viewingDistanceCm: "55",
  hasExternalKeyboard: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const cm = (value) => `${NUM.format(value)} cm`;
const deg = (value) => `${NUM.format(value)}°`;
const kg = (value) => `${NUM.format(value)} kg`;

export default function ToolHome() {
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [seatHeightCm, setSeatHeightCm] = useState(DEFAULTS.seatHeightCm);
  const [deskHeightCm, setDeskHeightCm] = useState(DEFAULTS.deskHeightCm);
  const [laptopInches, setLaptopInches] = useState(DEFAULTS.laptopInches);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [viewingDistanceCm, setViewingDistanceCm] = useState(DEFAULTS.viewingDistanceCm);
  const [hasExternalKeyboard, setHasExternalKeyboard] = useState(DEFAULTS.hasExternalKeyboard);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseLaptopSetup({
        heightCm,
        seatHeightCm,
        deskHeightCm,
        laptopInches,
        aspect,
        viewingDistanceCm,
        hasExternalKeyboard,
      }),
    [
      heightCm,
      seatHeightCm,
      deskHeightCm,
      laptopInches,
      aspect,
      viewingDistanceCm,
      hasExternalKeyboard,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Laptop-Only Desk Posture Fixer",
      `Raise the laptop by: ${cm(result.riserCm)}`,
      `Seated eye height: ${cm(result.seatedEyeHeightCm)}`,
      `Target top-of-screen height: ${cm(result.targetTopHeightCm)} (now ${cm(result.currentTopHeightCm)})`,
      `Gaze angle: ${deg(result.gazeNowDeg)} now -> ${deg(result.gazeFixedDeg)} after the fix`,
      `Estimated cervical load: ${kg(result.loadNowKg)} -> ${kg(result.loadFixedKg)}`,
      `Desk vs seated elbow height: ${result.deskDeltaCm > 0 ? "+" : ""}${NUM.format(result.deskDeltaCm)} cm`,
      `Separate keyboard needed: ${result.needsExternalKeyboard ? "yes" : "no"}`,
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
    setHeightCm(DEFAULTS.heightCm);
    setSeatHeightCm(DEFAULTS.seatHeightCm);
    setDeskHeightCm(DEFAULTS.deskHeightCm);
    setLaptopInches(DEFAULTS.laptopInches);
    setAspect(DEFAULTS.aspect);
    setViewingDistanceCm(DEFAULTS.viewingDistanceCm);
    setHasExternalKeyboard(DEFAULTS.hasExternalKeyboard);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Laptop className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Laptop-Only Desk Posture Fixer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A laptop screen and keyboard are joined together, so one of them is always in the wrong
          place. This works out exactly how far the screen has to come up, what that does to your
          neck angle, and whether your chair or desk needs to move too.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-height">
              Your height (cm)
            </label>
            <input
              id="lodpf-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-seat">
              Seat height, floor to cushion (cm)
            </label>
            <input
              id="lodpf-seat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="70"
              step="0.5"
              value={seatHeightCm}
              onChange={(event) => setSeatHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-desk">
              Desk height, floor to surface (cm)
            </label>
            <input
              id="lodpf-desk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="120"
              step="0.5"
              value={deskHeightCm}
              onChange={(event) => setDeskHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-diagonal">
              Screen size (inches, diagonal)
            </label>
            <input
              id="lodpf-diagonal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="20"
              step="0.1"
              value={laptopInches}
              onChange={(event) => setLaptopInches(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-aspect">
              Screen aspect ratio
            </label>
            <select
              id="lodpf-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspect}
              onChange={(event) => setAspect(event.target.value)}
            >
              {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lodpf-distance">
              Eye-to-screen distance (cm)
            </label>
            <input
              id="lodpf-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="120"
              step="1"
              value={viewingDistanceCm}
              onChange={(event) => setViewingDistanceCm(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
          htmlFor="lodpf-keyboard"
        >
          <input
            id="lodpf-keyboard"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            checked={hasExternalKeyboard}
            onChange={(event) => setHasExternalKeyboard(event.target.checked)}
          />
          I already have a separate keyboard and mouse
        </label>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Raise the laptop by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : cm(result.riserCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your numbers."
                : result.riserCm > 0
                  ? `Puts the top of the screen at ${cm(result.targetTopHeightCm)} above the floor`
                  : `Already ${cm(result.riserAlreadyHighCm)} above the target — no riser needed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy laptop posture measurements"
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
            ["Seated eye height", hasError ? DASH : cm(result.seatedEyeHeightCm)],
            ["Seated elbow height", hasError ? DASH : cm(result.seatedElbowHeightCm)],
            ["Top of screen now", hasError ? DASH : cm(result.currentTopHeightCm)],
            ["Top of screen target", hasError ? DASH : cm(result.targetTopHeightCm)],
            [
              "Downward gaze angle",
              hasError ? DASH : `${deg(result.gazeNowDeg)} → ${deg(result.gazeFixedDeg)}`,
            ],
            [
              "Estimated cervical load",
              hasError ? DASH : `${kg(result.loadNowKg)} → ${kg(result.loadFixedKg)}`,
            ],
            [
              "Desk vs your elbow height",
              hasError
                ? DASH
                : result.deskTooHigh
                  ? `${cm(result.deskDeltaCm)} too high`
                  : result.deskTooLow
                    ? `${cm(Math.abs(result.deskDeltaCm))} too low`
                    : "Within range",
            ],
            [
              "Viewing distance",
              hasError
                ? DASH
                : result.distanceInRange
                  ? `In the ${LAPTOP_DISTANCE_MIN_CM}–${LAPTOP_DISTANCE_MAX_CM} cm band`
                  : `Outside the ${LAPTOP_DISTANCE_MIN_CM}–${LAPTOP_DISTANCE_MAX_CM} cm band`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.loadSavedKg > 0 && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-xs font-medium text-[var(--success)]">
            Lifting the screen drops the estimated load your neck muscles hold by about{" "}
            {kg(result.loadSavedKg)}, based on the head-tilt figures published by Hansraj (2014).
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What to change, in order</h2>
          <ol className="mt-3 space-y-3">
            {result.fixes.map((fix, index) => (
              <li key={fix.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{fix.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {fix.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Eye and elbow heights are proportional estimates from 50th-percentile
        adult body dimensions, and the cervical load figure assumes your head tilts by roughly the
        same angle as your gaze — treat it as a comparison between two set-ups, not a measurement.
        See a physiotherapist or doctor about persistent neck, shoulder or arm pain, numbness or
        tingling.
      </p>
    </main>
  );
}
