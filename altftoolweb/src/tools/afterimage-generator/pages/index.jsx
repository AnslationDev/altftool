"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, RotateCcw } from "lucide-react";

import {
  ADAPTATION_TAU_SECONDS,
  DECAY_TAU_SECONDS,
  fadeAt,
  MAX_STARE_SECONDS,
  predictAfterimage,
  REVEAL_FIELD_HEX,
  STIMULUS_SWATCHES,
} from "../lib";

const DEFAULTS = {
  hex: STIMULUS_SWATCHES[0].hex,
  stare: "20",
  model: "inverse",
};

/** Animation cadence for the stare countdown and the fade, in milliseconds. */
const TICK_MS = 100;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [hex, setHex] = useState(DEFAULTS.hex);
  const [stare, setStare] = useState(DEFAULTS.stare);
  const [model, setModel] = useState(DEFAULTS.model);
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [revealElapsed, setRevealElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const rawStareSeconds = toNumber(stare);
  // Clamp before it feeds the live countdown so the experiment can never run
  // longer than the cap this tool advertises (predictAfterimage clamps the
  // same way internally, so the reported "adaptation after Ns" always
  // matches how long the countdown actually ran).
  const stareSeconds = Number.isFinite(rawStareSeconds)
    ? Math.min(rawStareSeconds, MAX_STARE_SECONDS)
    : rawStareSeconds;

  const result = useMemo(
    () => predictAfterimage({ hex, stareSeconds }),
    [hex, stareSeconds],
  );
  const hasError = Boolean(result.error);

  const afterimageHex = hasError
    ? null
    : model === "inverse"
      ? result.inverseHex
      : result.rotatedHex;

  useEffect(() => {
    if (phase !== "staring") return undefined;
    const id = setInterval(() => {
      setElapsed((value) => value + TICK_MS / 1000);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "staring") return;
    if (!Number.isFinite(stareSeconds) || elapsed >= stareSeconds) {
      setPhase("reveal");
      setRevealElapsed(0);
    }
  }, [phase, elapsed, stareSeconds]);

  useEffect(() => {
    if (phase !== "reveal" || hasError) return undefined;
    const startStrength = result.strength;
    const id = setInterval(() => {
      setRevealElapsed((value) => {
        const next = value + TICK_MS / 1000;
        // Stop ticking once the modelled fade has fully settled instead of
        // re-rendering forever while the tab sits open on the reveal field.
        if (fadeAt(startStrength, next) <= 0) {
          clearInterval(id);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, hasError, result.strength]);

  const fade = hasError ? 0 : fadeAt(result.strength, revealElapsed);
  const remaining = Math.max(0, (Number.isFinite(stareSeconds) ? stareSeconds : 0) - elapsed);

  const startStare = () => {
    setElapsed(0);
    setRevealElapsed(0);
    setPhase("staring");
  };

  const stop = () => {
    setPhase("idle");
    setElapsed(0);
    setRevealElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Afterimage Generator",
      `Stimulus: ${result.stimulusHex} (hue ${NUM.format(result.stimulusHue)}°)`,
      `sRGB inverse afterimage: ${result.inverseHex} (${result.inverseHueName})`,
      `Hue-rotated complement: ${result.rotatedHex} (${result.rotatedHueName})`,
      `Contrast with the white reveal field: ${NUM.format(result.contrastWithWhite)}:1`,
      `Relative luminance: ${NUM.format(result.luminance)}`,
      `Dominant opponent axis: ${result.opponent.dominantAxis} — ${result.opponent.dominantPole}`,
      `Modelled adaptation after ${NUM.format(result.stareSeconds)}s: ${PCT.format(result.strengthPercent)}%`,
      `Modelled visible fade time: ${NUM.format(result.visibleSeconds)}s`,
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
    setHex(DEFAULTS.hex);
    setStare(DEFAULTS.stare);
    setModel(DEFAULTS.model);
    stop();
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Visual experiment
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Afterimage Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stare at a saturated patch, then look at the white field: the colour that appears is the
          complement. Pick a stimulus and the tool computes both complements — the sRGB inverse and
          the 180° hue rotation — before you run the experiment yourself.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stimulus-hex">
              Stimulus colour
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="stimulus-hex"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                type="color"
                value={result.error ? DEFAULTS.hex : result.stimulusHex}
                onChange={(event) => setHex(event.target.value)}
                disabled={phase !== "idle"}
              />
              <input
                id="stimulus-hex-text"
                aria-label="Stimulus colour as a hex code"
                className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
                type="text"
                value={hex}
                onChange={(event) => setHex(event.target.value)}
                disabled={phase !== "idle"}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stare-seconds">
              Staring time (seconds, max {MAX_STARE_SECONDS})
            </label>
            <input
              id="stare-seconds"
              className={`mt-2 ${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_STARE_SECONDS}
              step="1"
              value={stare}
              onChange={(event) => setStare(event.target.value)}
              disabled={phase !== "idle"}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="model">
              Complement model
            </label>
            <select
              id="model"
              className={`mt-2 ${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
              value={model}
              onChange={(event) => setModel(event.target.value)}
              disabled={phase !== "idle"}
            >
              <option value="inverse">sRGB inverse (255 − channel) — photographic negative</option>
              <option value="rotated">Hue + 180° in HSL — designer&apos;s complement</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Preset stimuli</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {STIMULUS_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => setHex(swatch.hex)}
                aria-label={`Use the ${swatch.name} stimulus, afterimage ${swatch.afterimage}`}
                className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <span
                  className="h-5 w-5 rounded-full border border-[var(--border)]"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                {swatch.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startStare}
            disabled={hasError}
            aria-label="Start the staring experiment"
            className={PRIMARY_BTN}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {phase === "idle" ? "Start experiment" : "Restart"}
          </button>
          <button type="button" onClick={stop} aria-label="Stop the experiment" className={GHOST_BTN}>
            Stop
          </button>
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

      {phase !== "idle" && !hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div
            className="flex aspect-video w-full items-center justify-center rounded-lg border border-[var(--border)]"
            style={{
              backgroundColor: phase === "staring" ? result.stimulusHex : REVEAL_FIELD_HEX,
            }}
            aria-live="polite"
            aria-label={
              phase === "staring"
                ? "Stimulus field — keep your eyes on the centre dot"
                : "White reveal field — the afterimage appears here"
            }
          >
            {phase === "staring" ? (
              <span
                className="h-4 w-4 rounded-full border-2 border-[var(--card)]"
                style={{ backgroundColor: result.inverseHex }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="h-24 w-24 rounded-full"
                style={{ backgroundColor: afterimageHex, opacity: fade }}
                aria-hidden="true"
              />
            )}
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {phase === "staring"
              ? `Hold your gaze on the centre dot — ${NUM.format(remaining)}s left.`
              : `Now look at the white field. Modelled strength remaining: ${PCT.format(fade * 100)}%.`}
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Predicted afterimage colour
            </p>
            <p className="mt-1 flex items-center gap-3 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? (
                DASH
              ) : (
                <>
                  <span
                    className="inline-block h-10 w-10 rounded-lg border border-[var(--border)]"
                    style={{ backgroundColor: afterimageHex }}
                    aria-hidden="true"
                  />
                  <span className="uppercase">{afterimageHex}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Enter a valid hex colour to see the complement."
                : `Reads as ${model === "inverse" ? result.inverseHueName : result.rotatedHueName}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the afterimage colour details to clipboard"
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
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Stimulus colour", hasError ? DASH : result.stimulusHex.toUpperCase()],
            ["sRGB inverse", hasError ? DASH : result.inverseHex.toUpperCase()],
            ["Hue + 180° complement", hasError ? DASH : result.rotatedHex.toUpperCase()],
            ["Stimulus hue", hasError ? DASH : `${NUM.format(result.stimulusHue)}°`],
            [
              "Stimulus saturation",
              hasError ? DASH : `${PCT.format(result.stimulusSaturation * 100)}%`,
            ],
            ["Relative luminance (WCAG)", hasError ? DASH : NUM.format(result.luminance)],
            [
              "Contrast against the white field",
              hasError ? DASH : `${NUM.format(result.contrastWithWhite)}:1`,
            ],
            ["Dominant opponent axis", hasError ? DASH : result.opponent.dominantAxis],
            ["Which way it leans", hasError ? DASH : result.opponent.dominantPole],
            [
              `Modelled adaptation after ${hasError ? DASH : NUM.format(result.stareSeconds)}s`,
              hasError ? DASH : `${PCT.format(result.strengthPercent)}%`,
            ],
            [
              "Modelled fade time",
              hasError ? DASH : `${NUM.format(result.visibleSeconds)}s`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.weakStimulus && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This swatch is pale, very dark or nearly grey, so it drives the opponent channels weakly
            and the afterimage will be faint. Try a saturated mid-lightness colour.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The build-up and fade curves are display models with time constants of{" "}
        {ADAPTATION_TAU_SECONDS}s and {DECAY_TAU_SECONDS}s — they animate the demo, they are not a
        measurement of your eyes. Skip this experiment if you are photosensitive or prone to
        migraine, and do not stare at a bright screen in a dark room.
      </p>
    </main>
  );
}
