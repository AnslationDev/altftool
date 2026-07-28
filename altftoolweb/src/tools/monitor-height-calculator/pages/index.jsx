"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw } from "lucide-react";

import {
  ASPECT_RATIOS,
  CENTRE_GAZE_MAX_DEG,
  CENTRE_GAZE_MIN_DEG,
  DISTANCE_MAX_CM,
  DISTANCE_MIN_CM,
  calculateMonitorHeight,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  eyeMode: "stature",
  heightCm: "175",
  seatHeightCm: "45",
  eyeHeightCm: "124",
  posture: "seated",
  screenInches: "27",
  aspect: "16:9",
  viewingDistanceCm: "65",
  deskHeightCm: "74",
  panelBottomAboveDeskCm: "12",
  bifocals: false,
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

export default function ToolHome() {
  const [eyeMode, setEyeMode] = useState(DEFAULTS.eyeMode);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [seatHeightCm, setSeatHeightCm] = useState(DEFAULTS.seatHeightCm);
  const [eyeHeightCm, setEyeHeightCm] = useState(DEFAULTS.eyeHeightCm);
  const [posture, setPosture] = useState(DEFAULTS.posture);
  const [screenInches, setScreenInches] = useState(DEFAULTS.screenInches);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [viewingDistanceCm, setViewingDistanceCm] = useState(DEFAULTS.viewingDistanceCm);
  const [deskHeightCm, setDeskHeightCm] = useState(DEFAULTS.deskHeightCm);
  const [panelBottomAboveDeskCm, setPanelBottomAboveDeskCm] = useState(
    DEFAULTS.panelBottomAboveDeskCm,
  );
  const [bifocals, setBifocals] = useState(DEFAULTS.bifocals);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateMonitorHeight({
        eyeMode,
        eyeHeightCm,
        heightCm,
        seatHeightCm,
        standing: posture === "standing",
        screenInches,
        aspect,
        viewingDistanceCm,
        deskHeightCm,
        panelBottomAboveDeskCm,
        bifocals,
      }),
    [
      eyeMode,
      eyeHeightCm,
      heightCm,
      seatHeightCm,
      posture,
      screenInches,
      aspect,
      viewingDistanceCm,
      deskHeightCm,
      panelBottomAboveDeskCm,
      bifocals,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Monitor Height Calculator",
      `Eye height: ${cm(result.eyeHeightCm)} above the floor`,
      `Panel height: ${cm(result.screenHeightCm)}`,
      `Top of screen: ${cm(result.recommendedTopCm)} (band ${cm(result.topLowCm)}–${cm(result.topHighCm)})`,
      `Centre of screen: ${cm(result.recommendedCentreCm)}`,
      `Bottom of picture: ${cm(result.recommendedBottomCm)}`,
      `Downward gaze to centre: ${deg(result.resultingGazeDeg)}`,
      `Change from where it is now: ${result.adjustCm >= 0 ? "raise" : "lower"} ${cm(Math.abs(result.adjustCm))}`,
      `Suggested viewing distance: ${cm(result.suggestedDistanceCm)}`,
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
    setEyeMode(DEFAULTS.eyeMode);
    setHeightCm(DEFAULTS.heightCm);
    setSeatHeightCm(DEFAULTS.seatHeightCm);
    setEyeHeightCm(DEFAULTS.eyeHeightCm);
    setPosture(DEFAULTS.posture);
    setScreenInches(DEFAULTS.screenInches);
    setAspect(DEFAULTS.aspect);
    setViewingDistanceCm(DEFAULTS.viewingDistanceCm);
    setDeskHeightCm(DEFAULTS.deskHeightCm);
    setPanelBottomAboveDeskCm(DEFAULTS.panelBottomAboveDeskCm);
    setBifocals(DEFAULTS.bifocals);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monitor Height Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Where the top, centre and bottom of your screen should sit above the floor — solved against
          both published rules: top of the picture at or just below eye height, and centre of the
          picture {CENTRE_GAZE_MIN_DEG}–{CENTRE_GAZE_MAX_DEG}° below horizontal.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your eye height</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mhc-mode">
              How to work it out
            </label>
            <select
              id="mhc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={eyeMode}
              onChange={(event) => setEyeMode(event.target.value)}
            >
              <option value="stature">Estimate it from my body height</option>
              <option value="measured">I have measured it (floor to eye)</option>
            </select>
          </div>

          {eyeMode === "measured" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="mhc-eye">
                Eye height above the floor (cm)
              </label>
              <input
                id="mhc-eye"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="60"
                max="220"
                step="0.5"
                value={eyeHeightCm}
                onChange={(event) => setEyeHeightCm(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="mhc-height">
                  Your height (cm)
                </label>
                <input
                  id="mhc-height"
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
                <label className={LABEL_CLASS} htmlFor="mhc-posture">
                  Seated or standing
                </label>
                <select
                  id="mhc-posture"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={posture}
                  onChange={(event) => setPosture(event.target.value)}
                >
                  <option value="seated">Seated</option>
                  <option value="standing">Standing</option>
                </select>
              </div>
              {posture === "seated" && (
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor="mhc-seat">
                    Seat height, floor to cushion (cm)
                  </label>
                  <input
                    id="mhc-seat"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="30"
                    max="80"
                    step="0.5"
                    value={seatHeightCm}
                    onChange={(event) => setSeatHeightCm(event.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Screen and desk</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mhc-diagonal">
              Screen size (inches, diagonal)
            </label>
            <input
              id="mhc-diagonal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="60"
              step="0.5"
              value={screenInches}
              onChange={(event) => setScreenInches(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mhc-aspect">
              Aspect ratio
            </label>
            <select
              id="mhc-aspect"
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
            <label className={LABEL_CLASS} htmlFor="mhc-distance">
              Eye-to-screen distance (cm)
            </label>
            <input
              id="mhc-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="150"
              step="1"
              value={viewingDistanceCm}
              onChange={(event) => setViewingDistanceCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mhc-desk">
              Desk height, floor to surface (cm)
            </label>
            <input
              id="mhc-desk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="130"
              step="0.5"
              value={deskHeightCm}
              onChange={(event) => setDeskHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mhc-gap">
              Desk to bottom of the picture, right now (cm)
            </label>
            <input
              id="mhc-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="0.5"
              value={panelBottomAboveDeskCm}
              onChange={(event) => setPanelBottomAboveDeskCm(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
          htmlFor="mhc-bifocals"
        >
          <input
            id="mhc-bifocals"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            checked={bifocals}
            onChange={(event) => setBifocals(event.target.checked)}
          />
          I wear bifocals or progressive lenses
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Top of the picture, above the floor
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : cm(result.recommendedTopCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your heights."
                : result.raiseNeeded
                  ? `Raise the screen by ${cm(result.adjustCm)}`
                  : result.lowerNeeded
                    ? `Lower the screen by ${cm(Math.abs(result.adjustCm))}`
                    : "Your screen is already at the right height"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy monitor height measurements"
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
            ["Your eye height", hasError ? DASH : cm(result.eyeHeightCm)],
            ["Visible panel height", hasError ? DASH : cm(result.screenHeightCm)],
            [
              "Acceptable band for the top edge",
              hasError ? DASH : `${cm(result.topLowCm)} – ${cm(result.topHighCm)}`,
            ],
            ["Centre of the picture", hasError ? DASH : cm(result.recommendedCentreCm)],
            ["Bottom of the picture", hasError ? DASH : cm(result.recommendedBottomCm)],
            ["Downward gaze to centre", hasError ? DASH : deg(result.resultingGazeDeg)],
            [
              "Where it sits now (top / gaze)",
              hasError ? DASH : `${cm(result.currentTopCm)} / ${deg(result.currentGazeDeg)}`,
            ],
            [
              "Suggested viewing distance",
              hasError
                ? DASH
                : `${cm(result.suggestedDistanceCm)}${result.distanceInBand ? "" : " — yours is outside the band"}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.bifocalDropCm > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Bifocal and progressive wearers read through the lower part of the lens, so the screen is
            dropped a further {cm(result.bifocalDropCm)}. The gaze angle is deliberately steeper than
            the {CENTRE_GAZE_MIN_DEG}–{CENTRE_GAZE_MAX_DEG}° range — that is the trade you make to
            avoid tipping your head back.
          </p>
        )}

        {!hasError && result.bifocalDropCm === 0 && !result.rulesAgree && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs leading-5 font-medium text-[var(--warning)]">
            At {cm(result.recommendedTopCm)} the centre of this screen sits at{" "}
            {deg(result.resultingGazeDeg)}, outside the {CENTRE_GAZE_MIN_DEG}–{CENTRE_GAZE_MAX_DEG}°
            band. To satisfy the gaze rule instead, put the top edge between{" "}
            {cm(result.gazeRuleTopLowCm)} and {cm(result.gazeRuleTopHighCm)} — tall or very wide
            panels usually need this compromise.
          </p>
        )}

        {!hasError && !result.distanceInBand && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            ANSI/HFES 100 puts the comfortable viewing distance between {DISTANCE_MIN_CM} cm and{" "}
            {DISTANCE_MAX_CM} cm. A useful starting point is roughly the screen&apos;s own diagonal —{" "}
            {cm(result.screenDiagonalCm)} for this panel.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Eye height estimated from body height uses 50th-percentile adult
        proportions — measure it if you can, since seat cushion compression and torso length vary a
        lot. If you get persistent headaches, blurred vision or neck pain at the screen, see an
        optometrist or doctor rather than adjusting the monitor again.
      </p>
    </main>
  );
}
