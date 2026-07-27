"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tv } from "lucide-react";

import {
  ASPECT_RATIOS,
  MAX_UPWARD_TILT_DEG,
  RESOLUTIONS,
  SMPTE_ANGLE_DEG,
  THX_MAX_ANGLE_DEG,
  THX_RECOMMENDED_ANGLE_DEG,
  analyseSetup,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);
const deg = (value) => (Number.isFinite(value) ? `${NUM.format(value)}°` : DASH);

const DEFAULTS = {
  diagonal: "55",
  resolution: "4k",
  aspect: "16:9",
  distance: "250",
  eyeHeight: "105",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_COPY = {
  ideal: "Ideal — the screen fills the SMPTE-to-THX sweet spot from where you sit.",
  acceptable: "Slightly small — a little under the 30° SMPTE minimum, watchable but not immersive.",
  "too-far": "Too far — the screen fills much less than 30° of your view, so detail is wasted.",
  "too-close": "Too close — over 40° means you have to move your eyes to follow the picture.",
};

export default function ToolHome() {
  const [diagonal, setDiagonal] = useState(DEFAULTS.diagonal);
  const [resolution, setResolution] = useState(DEFAULTS.resolution);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [eyeHeight, setEyeHeight] = useState(DEFAULTS.eyeHeight);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseSetup({
        diagonalIn: diagonal.trim() === "" ? NaN : Number(diagonal),
        resolutionId: resolution,
        aspectId: aspect,
        seatingDistanceCm: distance.trim() === "" ? NaN : Number(distance),
        seatedEyeHeightCm: eyeHeight.trim() === "" ? NaN : Number(eyeHeight),
      }),
    [diagonal, resolution, aspect, distance, eyeHeight],
  );

  const error = result.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "TV Viewing Distance",
      `Screen: ${diagonal}" ${result.aspectLabel}, ${result.resolutionLabel}`,
      `Panel size: ${NUM.format(result.widthCm)} × ${NUM.format(result.heightCm)} cm`,
      `Seating distance: ${NUM.format(result.seatingDistanceCm)} cm (${NUM2.format(result.seatingDistanceM)} m / ${NUM2.format(result.seatingDistanceFt)} ft)`,
      `Viewing angle achieved: ${NUM.format(result.actualAngleDeg)}°`,
      `SMPTE 30° distance: ${NUM.format(result.smpteDistanceCm)} cm`,
      `THX 36° distance: ${NUM.format(result.thxDistanceCm)} cm`,
      `Closest THX 40° distance: ${NUM.format(result.thxClosestCm)} cm`,
      `Pixel acuity limit for ${result.resolutionLabel}: ${NUM.format(result.acuityDistanceCm)} cm`,
      `Ideal screen size from this seat: ${NUM.format(result.idealMinDiagonalIn)}"–${NUM.format(result.idealMaxDiagonalIn)}"`,
      `Mount screen centre at ${NUM.format(result.centreHeightCm)} cm; bottom edge at ${NUM.format(result.bottomHeightCm)} cm`,
    ].join("\n");
  }, [error, result, diagonal]);

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
    setDiagonal(DEFAULTS.diagonal);
    setResolution(DEFAULTS.resolution);
    setAspect(DEFAULTS.aspect);
    setDistance(DEFAULTS.distance);
    setEyeHeight(DEFAULTS.eyeHeight);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Tv className="h-4 w-4" aria-hidden="true" />
          Screen setup
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">TV Viewing Distance Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check whether your TV size and sofa position match the SMPTE {SMPTE_ANGLE_DEG}° and THX{" "}
          {THX_RECOMMENDED_ANGLE_DEG}° viewing angles, how close you must sit to actually see every
          pixel, and where to drill the wall bracket.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tv-diagonal">
              Screen diagonal (inches)
            </label>
            <input
              id="tv-diagonal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="200"
              step="1"
              value={diagonal}
              onChange={(event) => setDiagonal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tv-distance">
              Seating distance from screen (cm)
            </label>
            <input
              id="tv-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tv-resolution">
              Resolution
            </label>
            <select
              id="tv-resolution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
            >
              {RESOLUTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tv-aspect">
              Aspect ratio
            </label>
            <select
              id="tv-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspect}
              onChange={(event) => setAspect(event.target.value)}
            >
              {ASPECT_RATIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tv-eye">
              Seated eye height from floor (cm)
            </label>
            <input
              id="tv-eye"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="200"
              step="1"
              value={eyeHeight}
              onChange={(event) => setEyeHeight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[32, 43, 55, 65, 75, 85].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setDiagonal(String(size))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {size}&quot;
            </button>
          ))}
        </div>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Viewing angle from your seat
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : deg(result.actualAngleDeg)}
            </p>
            <p
              className={`mt-1 text-sm font-medium ${error ? "text-[var(--muted-foreground)]" : result.verdict === "ideal" ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
            >
              {error ? DASH : VERDICT_COPY[result.verdict]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy TV viewing distance result"
              className={GHOST_BTN}
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
            ["Panel width × height", error ? DASH : `${NUM.format(result.widthCm)} × ${NUM.format(result.heightCm)} cm`],
            [
              `Ideal screen size from ${error ? DASH : NUM.format(result.seatingDistanceCm) + " cm"}`,
              error ? DASH : `${NUM.format(result.idealMinDiagonalIn)}" – ${NUM.format(result.idealMaxDiagonalIn)}"`,
            ],
            [`SMPTE ${SMPTE_ANGLE_DEG}° seating distance`, error ? DASH : cm(result.smpteDistanceCm)],
            [`THX ${THX_RECOMMENDED_ANGLE_DEG}° seating distance`, error ? DASH : cm(result.thxDistanceCm)],
            [`Closest sensible seat (THX ${THX_MAX_ANGLE_DEG}°)`, error ? DASH : cm(result.thxClosestCm)],
            [
              "Sit within this to resolve every pixel",
              error ? DASH : cm(result.acuityDistanceCm),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.resolutionFullyUsed
              ? `At ${NUM.format(result.seatingDistanceCm)} cm you are inside the pixel acuity limit, so the full ${result.resolutionLabel} detail is visible.`
              : `At ${NUM.format(result.seatingDistanceCm)} cm you sit beyond the ${NUM.format(result.acuityDistanceCm)} cm acuity limit, so some ${result.resolutionLabel} detail is not resolvable by 20/20 vision. A larger panel or a closer seat recovers it.`}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Wall-mount height</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Screen centre above floor", error ? DASH : cm(result.centreHeightCm)],
            ["Bottom edge of screen", error ? DASH : cm(result.bottomHeightCm)],
            ["Top edge of screen", error ? DASH : cm(result.topHeightCm)],
            ["Upward look to the top edge", error ? DASH : deg(result.topTiltDeg)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!error && !result.tiltWithinComfort ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            You would look more than {MAX_UPWARD_TILT_DEG}° up to reach the top of the screen. Sit
            further back or choose a smaller panel to keep your neck neutral.
          </p>
        ) : null}
        {!error && result.aboveFloorWarning ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The screen is taller than twice your seated eye height, so its bottom edge would fall
            below floor level. Raise the seating or use a smaller screen.
          </p>
        ) : null}
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The centre of the screen is placed level with your eyes when seated, which is the standard
          home-cinema rule. Above a fireplace or console the screen usually ends up too high — a
          tilting bracket only partly compensates.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Distances assume a flat panel viewed head-on with 20/20 vision. Curved screens, corrective
        lenses and personal preference all shift the comfortable range, so treat these as a starting
        point and try the distance with a tape measure before mounting.
      </p>
    </main>
  );
}
