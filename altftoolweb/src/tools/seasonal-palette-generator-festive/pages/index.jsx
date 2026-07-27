"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import {
  MAX_VARIATION,
  SEASONS,
  formatPaletteCss,
  formatPaletteText,
  generateSeasonalPalette,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const HASH = "#";
const DASH = "—";

export default function ToolHome() {
  const [seasonId, setSeasonId] = useState("winterHoliday");
  const [hueShift, setHueShift] = useState("0");
  const [variation, setVariation] = useState(0);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () => generateSeasonalPalette({ seasonId, hueShift: Number(hueShift), variation }),
    [seasonId, hueShift, variation],
  );

  const hasError = Boolean(palette.error);
  const cssText = useMemo(() => (hasError ? "" : formatPaletteCss(palette)), [palette, hasError]);
  const plainText = useMemo(() => (hasError ? "" : formatPaletteText(palette)), [palette, hasError]);

  const copy = async (kind, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setSeasonId("winterHoliday");
    setHueShift("0");
    setVariation(0);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Seasonal campaigns
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Festive Seasonal Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a season, rotate the base hue, and get a six-role campaign palette with every text and
          background pairing checked against WCAG contrast thresholds.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="palette-season">
              Season
            </label>
            <select
              id="palette-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seasonId}
              onChange={(event) => {
                setSeasonId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(SEASONS).map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="palette-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="palette-hue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-180"
              max="180"
              step="5"
              value={hueShift}
              onChange={(event) => {
                setHueShift(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="palette-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="palette-variation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_VARIATION}
              step="1"
              value={variation}
              onChange={(event) => {
                setVariation(Number(event.target.value));
                setCopied("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setVariation((current) => (current + 1) % (MAX_VARIATION + 1));
              setCopied("");
            }}
            className={PRIMARY_BTN}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Next variation
          </button>
          <button type="button" onClick={reset} aria-label="Reset the generator" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {palette.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pairings meeting WCAG AA for body text
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.accessiblePairs} / ${palette.totalPairs}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.seasonLabel} · variation ${palette.variation} · base hue ${Math.round(palette.baseHue)}°`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", cssText)}
              disabled={hasError}
              aria-label="Copy the palette as CSS custom properties"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "css" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "css" ? "Copied!" : "Copy CSS"}
            </button>
            <button
              type="button"
              onClick={() => copy("text", plainText)}
              disabled={hasError}
              aria-label="Copy the palette and contrast audit as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>
        {!hasError ? (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.note}</p>
        ) : null}
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Swatches</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.swatches.map((swatch) => (
                <div key={swatch.role} className="rounded-lg border border-[var(--border)] p-3">
                  <div
                    aria-hidden="true"
                    className="h-16 w-full rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: HASH + swatch.hex }}
                  />
                  <p className="mt-2 text-sm font-semibold">{swatch.label}</p>
                  <p className="font-mono text-xs text-[var(--muted-foreground)]">
                    {HASH}
                    {swatch.hex} · hsl({swatch.hsl.h} {swatch.hsl.s}% {swatch.hsl.l}%)
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Best text on it: {swatch.bestText} at {swatch.bestTextRatio}:1
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Contrast audit</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Pairing</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Ratio</th>
                    <th scope="col" className="py-2 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {palette.pairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.ratio}:1</td>
                      <td
                        className={
                          pair.passesBody
                            ? "py-2 font-semibold text-[var(--success)]"
                            : "py-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {pair.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              WCAG 2.x asks for 4.5:1 for body text, 3:1 for large text (24px regular or 18.66px
              bold) and 3:1 for interface components such as button borders.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">CSS variables</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {cssText}
            </pre>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contrast ratios use the WCAG 2.x relative-luminance formula on sRGB values. Check the final
        artwork in context too — thin type, gradients and photographic backgrounds can fail even when
        the flat swatches pass.
      </p>
    </main>
  );
}
