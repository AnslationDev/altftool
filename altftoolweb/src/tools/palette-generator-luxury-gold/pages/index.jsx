"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, Printer, RotateCcw, Sparkles } from "lucide-react";

import {
  GROUNDS,
  MAX_VARIATION,
  METALS,
  buildFoilGradient,
  formatPaletteCss,
  formatPaletteText,
  generateLuxuryPalette,
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

const DEFAULTS = {
  metalId: "classicGold",
  groundId: "obsidian",
  hueShift: "0",
  variation: 0,
  paperStock: "coated",
};

export default function ToolHome() {
  const [metalId, setMetalId] = useState(DEFAULTS.metalId);
  const [groundId, setGroundId] = useState(DEFAULTS.groundId);
  const [hueShift, setHueShift] = useState(DEFAULTS.hueShift);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [paperStock, setPaperStock] = useState(DEFAULTS.paperStock);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () =>
      generateLuxuryPalette({
        metalId,
        groundId,
        hueShift: hueShift === "" ? Number.NaN : Number(hueShift),
        variation,
        paperStock,
      }),
    [metalId, groundId, hueShift, variation, paperStock],
  );

  const hasError = Boolean(palette.error);
  const cssText = useMemo(() => (hasError ? "" : formatPaletteCss(palette)), [palette, hasError]);
  const plainText = useMemo(() => (hasError ? "" : formatPaletteText(palette)), [palette, hasError]);
  const foilGradient = useMemo(() => (hasError ? "" : buildFoilGradient(palette)), [palette, hasError]);

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
    setMetalId(DEFAULTS.metalId);
    setGroundId(DEFAULTS.groundId);
    setHueShift(DEFAULTS.hueShift);
    setVariation(DEFAULTS.variation);
    setPaperStock(DEFAULTS.paperStock);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gem className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Luxury Gold Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a metal tone and a dark ground to get a six-role palette, every text pairing checked
          against WCAG 2.x, and a CMYK build with an ink-coverage check for foil and litho print.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lux-metal">
              Metal tone
            </label>
            <select
              id="lux-metal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={metalId}
              onChange={(event) => {
                setMetalId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(METALS).map((metal) => (
                <option key={metal.id} value={metal.id}>
                  {metal.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lux-ground">
              Dark ground
            </label>
            <select
              id="lux-ground"
              className={`mt-2 ${INPUT_CLASS}`}
              value={groundId}
              onChange={(event) => {
                setGroundId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(GROUNDS).map((ground) => (
                <option key={ground.id} value={ground.id}>
                  {ground.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lux-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="lux-hue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-180"
              max="180"
              step="2"
              value={hueShift}
              onChange={(event) => {
                setHueShift(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lux-paper">
              Paper stock (ink limit)
            </label>
            <select
              id="lux-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paperStock}
              onChange={(event) => {
                setPaperStock(event.target.value);
                setCopied("");
              }}
            >
              <option value="coated">Coated — 300% limit</option>
              <option value="uncoated">Uncoated — 260% limit</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lux-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="lux-variation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_VARIATION}
              step="1"
              value={variation}
              onChange={(event) => {
                const next = Math.min(MAX_VARIATION, Math.max(0, Number(event.target.value) || 0));
                setVariation(next);
                setCopied("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => {
              setVariation((current) => (current + 1) % (MAX_VARIATION + 1));
              setCopied("");
            }}
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Pairings meeting their WCAG threshold
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.passingPairs} / ${palette.totalPairs}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.metalLabel} on ${palette.groundLabel} · variation ${palette.variation}`}
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
              aria-label="Copy the palette, contrast audit and print builds as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied === "css"
                ? "Copied the palette as CSS to the clipboard."
                : copied === "text"
                  ? "Copied the palette, contrast audit and print builds to the clipboard."
                  : ""}
            </span>
          </div>
        </div>
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.metalNote}</p>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Foil sheen preview</h2>
            <div
              aria-hidden="true"
              className="mt-3 h-20 w-full rounded-lg border border-[var(--border)]"
              style={{ backgroundImage: foilGradient }}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              A banded gradient stands in for the way rolled foil catches light. Copy it from the CSS
              block below as <code className="font-mono">--lux-foil</code>.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                  <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                    CMYK {swatch.cmyk.c}/{swatch.cmyk.m}/{swatch.cmyk.y}/{swatch.cmyk.k} · TAC{" "}
                    <span className={swatch.tacOverLimit ? "text-[var(--danger)]" : undefined}>
                      {swatch.tac}%
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast audit</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pairing
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Ratio
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Needs
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.pairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{pair.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{pair.ratio}:1</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {pair.threshold}:1
                      </td>
                      <td
                        className={
                          pair.passes
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
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print notes
            </h2>
            <dl className="mt-3 grid gap-3">
              {palette.foilNotes.map((note) => (
                <div key={note.role} className="rounded-lg border border-[var(--border)] p-3">
                  <dt className="text-sm font-semibold">{note.label}</dt>
                  <dd className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                    CMYK {note.cmyk.c}/{note.cmyk.m}/{note.cmyk.y}/{note.cmyk.k} · {note.tac}% coverage
                  </dd>
                  <dd
                    className={
                      note.tacOverLimit
                        ? "mt-1 text-xs leading-5 text-[var(--danger)]"
                        : "mt-1 text-xs leading-5 text-[var(--muted-foreground)]"
                    }
                  >
                    {note.advice}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Ink limit in use: {palette.tacLimit}% for {palette.paperStock} stock. For large dark
              areas ask for a rich black of {palette.richBlack.c}C {palette.richBlack.m}M{" "}
              {palette.richBlack.y}Y {palette.richBlack.k}K ({palette.richBlack.tac}% coverage) rather
              than 100K alone.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">CSS variables</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {cssText}
            </pre>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        CMYK values here are the uncalibrated conversion design apps use without an ICC profile.
        Metallic foil is a laid-down leaf, not an ink, so no CMYK build reproduces its flip — send the
        printer a Pantone metallic or a foil reference and ask for a draw-down before the run.
      </p>
    </main>
  );
}
