"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Eye, Play, RotateCcw, Square } from "lucide-react";

import {
  animationTiming,
  buildDurationCurve,
  estimateAftereffect,
  formatSeconds,
  getPattern,
  MAE_PATTERNS,
  MAX_ADAPTATION_SECONDS,
  MAX_SPEED_DEG_PER_SEC,
  MIN_ADAPTATION_SECONDS,
  MIN_SPEED_DEG_PER_SEC,
  OPTIMAL_SPEED_DEG_PER_SEC,
  RECOMMENDED_ADAPTATION_SECONDS,
} from "../lib";

const DEFAULTS = {
  pattern: "spiral",
  adaptation: String(RECOMMENDED_ADAPTATION_SECONDS),
  speed: String(OPTIMAL_SPEED_DEG_PER_SEC),
  contrast: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const STAGE_CSS = `
@keyframes mae-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes mae-slide { from { transform: translateY(0); } to { transform: translateY(48px); } }
@keyframes mae-zoom { from { transform: scale(1); } to { transform: scale(1.6); } }
.mae-layer { position: absolute; inset: -30%; will-change: transform; }
.mae-anim-rotate { animation: mae-spin linear infinite; }
.mae-anim-translate { animation: mae-slide linear infinite; }
.mae-anim-scale { animation: mae-zoom linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .mae-anim-rotate, .mae-anim-translate, .mae-anim-scale { animation: none; }
}
`;

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function patternBackground(key) {
  if (key === "waterfall") {
    return "repeating-linear-gradient(to bottom, var(--foreground) 0 24px, var(--card) 24px 48px)";
  }
  if (key === "radial") {
    return "repeating-radial-gradient(circle at center, var(--foreground) 0 16px, var(--card) 16px 32px)";
  }
  if (key === "wheel") {
    return "repeating-conic-gradient(from 0deg at center, var(--foreground) 0deg 10deg, var(--card) 10deg 20deg)";
  }
  return "repeating-conic-gradient(from 0deg at center, var(--foreground) 0deg 6deg, var(--card) 6deg 12deg)";
}

export default function ToolHome() {
  const [patternKey, setPatternKey] = useState(DEFAULTS.pattern);
  const [adaptation, setAdaptation] = useState(DEFAULTS.adaptation);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [phase, setPhase] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(Number(DEFAULTS.adaptation));
  const [copied, setCopied] = useState(false);

  const timerRef = useRef(null);

  const adaptationSeconds = toNumber(adaptation);
  const speedValue = toNumber(speed);
  const contrastValue = toNumber(contrast);

  const pattern = getPattern(patternKey);

  const result = useMemo(
    () =>
      estimateAftereffect({
        adaptationSeconds,
        speedDegPerSec: speedValue,
        contrast: contrastValue,
      }),
    [adaptationSeconds, speedValue, contrastValue],
  );

  const timing = useMemo(() => animationTiming(patternKey, speedValue), [patternKey, speedValue]);

  const curve = useMemo(
    () => (result.error ? [] : buildDurationCurve(speedValue, contrastValue)),
    [result, speedValue, contrastValue],
  );

  const hasError = Boolean(result.error);

  useEffect(() => {
    if (phase !== "adapting") return undefined;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setPhase("test");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [phase]);

  const start = () => {
    if (hasError) return;
    setSecondsLeft(Math.round(adaptationSeconds));
    setPhase("adapting");
  };

  const stop = () => {
    setPhase("idle");
    setSecondsLeft(Math.round(Number.isFinite(adaptationSeconds) ? adaptationSeconds : 0));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Motion Aftereffect Illusion",
      `Pattern: ${pattern.label}`,
      `Adaptation: ${Math.round(adaptationSeconds)} s at ${speedValue} deg/s, contrast ${contrastValue}`,
      `Predicted aftereffect: ${formatSeconds(result.seconds)}`,
      `Speed tuning multiplier: ${result.speedFactor.toFixed(2)}`,
      `Contrast multiplier: ${result.contrastFactor.toFixed(2)}`,
      `What to expect: ${pattern.aftereffect}`,
    ].join("\n");
  }, [hasError, pattern, adaptationSeconds, speedValue, contrastValue, result]);

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
    setPatternKey(DEFAULTS.pattern);
    setAdaptation(DEFAULTS.adaptation);
    setSpeed(DEFAULTS.speed);
    setContrast(DEFAULTS.contrast);
    setPhase("idle");
    setSecondsLeft(Number(DEFAULTS.adaptation));
    setCopied(false);
  };

  const animating = phase === "adapting";
  const layerStyle = {
    backgroundImage: patternBackground(patternKey),
    opacity: Number.isFinite(contrastValue) ? Math.min(1, Math.max(0.05, contrastValue)) : 1,
    animationDuration: `${timing.cycleSeconds.toFixed(3)}s`,
    animationPlayState: animating ? "running" : "paused",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{STAGE_CSS}</style>

      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Visual neuroscience demo
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Motion Aftereffect Illusion
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stare at the centre of a moving pattern for half a minute, then look away. Direction
          selective neurons in V1 and MT adapt, and a stationary scene appears to drift the opposite
          way — the waterfall illusion described by Robert Addams in 1834.
        </p>
      </header>

      <p
        role="note"
        className="mb-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
      >
        Skip this demo if you have photosensitive epilepsy, migraine with visual aura, or feel
        dizzy. The aftereffect is harmless and fades on its own within a minute.
      </p>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mae-pattern">
              Adapting pattern
            </label>
            <select
              id="mae-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternKey}
              onChange={(event) => {
                setPatternKey(event.target.value);
                setPhase("idle");
              }}
            >
              {MAE_PATTERNS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{pattern.adaptDescription}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mae-adaptation">
              Adaptation time (seconds)
            </label>
            <input
              id="mae-adaptation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_ADAPTATION_SECONDS}
              max={MAX_ADAPTATION_SECONDS}
              step="5"
              value={adaptation}
              onChange={(event) => {
                setAdaptation(event.target.value);
                setPhase("idle");
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mae-speed">
              Drift speed (degrees of visual angle per second)
            </label>
            <input
              id="mae-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_SPEED_DEG_PER_SEC}
              max={MAX_SPEED_DEG_PER_SEC}
              step="0.5"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mae-contrast">
              Pattern contrast (0.05 to 1)
            </label>
            <input
              id="mae-contrast"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.05"
              max="1"
              step="0.05"
              value={contrast}
              onChange={(event) => setContrast(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={start}
            disabled={hasError || animating}
            className={PRIMARY_BTN}
            aria-label="Start the adaptation period"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {phase === "test" ? "Run again" : "Start adapting"}
          </button>
          <button type="button" onClick={stop} className={GHOST_BTN} aria-label="Stop the animation">
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)]">
          <div className={`mae-layer mae-anim-${pattern.motion}`} style={layerStyle} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-[var(--card)] px-3 py-1 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)]">
              {animating ? `${secondsLeft}s — keep looking here` : phase === "test" ? "Look away now" : "Fixation point"}
            </span>
          </div>
        </div>

        {phase === "test" && (
          <div className="mt-5">
            <h2 className="text-base font-semibold">Test pattern — it should appear to move</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{pattern.aftereffect}</p>
            <div
              className="mt-3 h-40 w-full rounded-lg border border-[var(--border)]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--muted) 0 12px, var(--card) 12px 24px)",
              }}
            />
          </div>
        )}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Predicted aftereffect duration
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatSeconds(result.seconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the settings above to get a prediction."
                : `after ${Math.round(adaptationSeconds)} s of adaptation`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the illusion settings and prediction"
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
            <button type="button" onClick={reset} aria-label="Reset all settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Speed tuning multiplier", hasError ? DASH : result.speedFactor.toFixed(2)],
            ["Contrast multiplier", hasError ? DASH : result.contrastFactor.toFixed(2)],
            [
              "Strength vs the strongest setting",
              hasError ? DASH : `${Math.round(result.strengthPercent)}%`,
            ],
            ["One animation cycle takes", `${timing.cycleSeconds.toFixed(2)} s`],
            ["Rotation rate at mid-radius", `${Math.round(timing.rotationDegPerSec)}°/s`],
            ["Expected illusion", pattern.aftereffect],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && curve.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How adaptation time changes the effect</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The aftereffect grows with the logarithm of adaptation time, so the first 30 seconds buy
            most of the effect and the next 90 add little.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Adaptation</th>
                  <th scope="col" className="py-2 text-right font-semibold">Aftereffect lasts</th>
                </tr>
              </thead>
              <tbody>
                {curve.map((row) => (
                  <tr key={row.adaptationSeconds} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.adaptationSeconds} s</td>
                    <td className="py-2 text-right">{formatSeconds(row.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Predicted durations are a model, not a measurement: they combine the classic logarithmic
        adaptation-duration function with the known band-pass speed tuning (peak near{" "}
        {OPTIMAL_SPEED_DEG_PER_SEC}°/s) and Naka-Rushton contrast saturation of motion-sensitive
        neurons. Your own aftereffect will vary. If your system is set to reduce motion, the pattern
        stays still.
      </p>
    </main>
  );
}
