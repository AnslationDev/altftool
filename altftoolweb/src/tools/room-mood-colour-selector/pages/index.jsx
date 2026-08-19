"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";
import {
  BRIGHT_LRV_THRESHOLD,
  CONTRAST_AA_LARGE,
  DEPTHS,
  DIRECTIONS,
  HEMISPHERES,
  MOODS,
  buildRoomPalette,
} from "../lib";

const DEFAULTS = {
  mood: "calm",
  direction: "north",
  hemisphere: "north",
  depth: "medium",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (value, decimals = 1) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);

export default function ToolHome() {
  const [mood, setMood] = useState(DEFAULTS.mood);
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [hemisphere, setHemisphere] = useState(DEFAULTS.hemisphere);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), []);

  const palette = useMemo(
    () => buildRoomPalette({ mood, direction, hemisphere, depth }),
    [mood, direction, hemisphere, depth],
  );

  const error = palette.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    const lines = [
      `Room palette — ${palette.mood.label}, ${palette.direction.label.toLowerCase()}, ${palette.depth.label.toLowerCase()}`,
      "",
    ];
    for (const swatch of palette.swatches) {
      lines.push(
        `${swatch.role}${swatch.share ? ` (${swatch.share}%)` : ""}: ${swatch.css} — LRV ${num(swatch.lrv)} — ${swatch.purpose}`,
      );
    }
    lines.push("", `Wall to trim contrast: ${num(palette.wallTrimContrast, 2)}:1`);
    lines.push(`Wall to accent contrast: ${num(palette.wallAccentContrast, 2)}:1`);
    return lines.join("\n");
  }, [error, palette]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMood(DEFAULTS.mood);
    setDirection(DEFAULTS.direction);
    setHemisphere(DEFAULTS.hemisphere);
    setDepth(DEFAULTS.depth);
    setCopied(false);
  };

  const selects = [
    ["room-mood", "Mood you want", mood, setMood, MOODS.map((m) => [m.id, m.label])],
    ["room-direction", "Main window faces", direction, setDirection, DIRECTIONS.map((d) => [d.id, d.label])],
    ["room-hemisphere", "Hemisphere", hemisphere, setHemisphere, HEMISPHERES.map((h) => [h.id, h.label])],
    ["room-depth", "Colour depth", depth, setDepth, DEPTHS.map((d) => [d.id, d.label])],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Home colour
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Room Mood Colour Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the mood you want and say which way the window faces. You get a 60-30-10 palette
          adjusted for that light, with the Light Reflectance Value of every colour and the contrast
          between them worked out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {selects.map(([id, label, value, setter, options]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <select
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                value={value}
                onChange={(event) => {
                  setter(event.target.value);
                  setCopied(false);
                }}
              >
                {options.map(([optionValue, optionLabel]) => (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                ))}
              </select>
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Wall colour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : palette.wall.css}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Choose a mood and a window direction to see a palette."
                : `LRV ${num(palette.wall.lrv)} — reflects about ${num(palette.wall.lrv, 0)}% of the light that hits it`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the room colour palette"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {error ? null : (
          <>
            <div className="mt-5 flex h-16 w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {palette.swatches
                .filter((swatch) => swatch.share > 0)
                .map((swatch) => (
                  <span
                    key={swatch.role}
                    className="block h-full"
                    style={{ width: `${swatch.share}%`, backgroundColor: swatch.css }}
                    role="img"
                    aria-label={`${swatch.role} colour ${swatch.css}, ${swatch.share} percent of the scheme`}
                  />
                ))}
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.swatches.map((swatch) => (
                <li
                  key={swatch.role}
                  className="overflow-hidden rounded-lg ring-1 ring-[var(--border)]"
                >
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: swatch.css }}
                    role="img"
                    aria-label={`${swatch.role} colour ${swatch.css}`}
                  />
                  <div className="bg-[var(--card)] p-3">
                    <p className="text-sm font-semibold">
                      {swatch.role}
                      {swatch.share > 0 ? ` · ${swatch.share}%` : ""}
                      <span className="ml-2 font-mono text-xs text-[var(--muted-foreground)]">{swatch.css}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{swatch.purpose}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--primary)]">
                      LRV {num(swatch.lrv)} · HSL {swatch.hue}°, {swatch.saturation}%, {swatch.lightness}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Light this room gets", error ? DASH : palette.directionDescription],
            ["Wall to trim contrast", error ? DASH : `${num(palette.wallTrimContrast, 2)}:1`],
            ["Wall to accent contrast", error ? DASH : `${num(palette.wallAccentContrast, 2)}:1`],
            [
              "Trim reads against the wall",
              error ? DASH : palette.trimReadsAgainstWall ? `Yes, clears ${CONTRAST_AA_LARGE}:1` : "Barely — pick a whiter trim",
            ],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {palette.lightNote} {palette.mood.note}
          </p>
        ) : null}

        {!error && palette.cautions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {palette.cautions.map((caution) => (
              <li
                key={caution}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {caution}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reading the numbers</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          LRV is the share of light a surface sends back, on a scale where pure black is 0 and pure
          white is 100. It is the relative luminance defined for sRGB — each channel linearised, then
          combined as 0.2126 red, 0.7152 green and 0.0722 blue — so saturated red measures 21 and
          saturated green 72 even though both look vivid. A room with only cool indirect light
          generally wants walls above {BRIGHT_LRV_THRESHOLD}; below {CONTRAST_AA_LARGE}:1 of contrast,
          two colours stop reading as separate shapes from across the room. Always test a sample patch
          on the actual wall and look at it at three times of day — paint shifts more with light than
          any calculation can predict.
        </p>
      </section>
    </main>
  );
}
