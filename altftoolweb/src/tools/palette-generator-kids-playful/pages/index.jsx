"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import {
  MAX_VARIATION,
  MODES,
  TARGETS,
  THEMES,
  formatPaletteCss,
  formatPaletteText,
  generateKidsPalette,
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
  themeId: "rainbow",
  mode: "light",
  targetId: "aa",
  hueShift: "0",
  variation: 0,
};

export default function ToolHome() {
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [targetId, setTargetId] = useState(DEFAULTS.targetId);
  const [hueShift, setHueShift] = useState(DEFAULTS.hueShift);
  const [variation, setVariation] = useState(DEFAULTS.variation);
  const [copied, setCopied] = useState("");

  const palette = useMemo(
    () =>
      generateKidsPalette({
        themeId,
        mode,
        targetId,
        hueShift: hueShift === "" ? Number.NaN : Number(hueShift),
        variation,
      }),
    [themeId, mode, targetId, hueShift, variation],
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
    setThemeId(DEFAULTS.themeId);
    setMode(DEFAULTS.mode);
    setTargetId(DEFAULTS.targetId);
    setHueShift(DEFAULTS.hueShift);
    setVariation(DEFAULTS.variation);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Vibe palettes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kids Playful Palette Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cheerful themed colours for blocks and illustrations, each paired with a text-safe sibling
          that has been walked to your chosen WCAG contrast ratio against the page.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kid-theme">
              Theme
            </label>
            <select
              id="kid-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={themeId}
              onChange={(event) => {
                setThemeId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(THEMES).map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-mode">
              Page ground
            </label>
            <select
              id="kid-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(MODES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-target">
              Contrast target
            </label>
            <select
              id="kid-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetId}
              onChange={(event) => {
                setTargetId(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(TARGETS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-hue">
              Hue rotation (degrees)
            </label>
            <input
              id="kid-hue"
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
            <label className={LABEL_CLASS} htmlFor="kid-variation">
              Variation (0-{MAX_VARIATION})
            </label>
            <input
              id="kid-variation"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Hues repaired to the target as text
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${palette.repairedTexts} / ${palette.totalColours}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${palette.themeLabel} · ${palette.modeLabel} · target ${palette.targetRatio}:1`}
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
              aria-label="Copy the palette and contrast figures as text"
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
        {hasError ? null : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Page
              </dt>
              <dd className="mt-1 font-mono text-sm">
                {HASH}
                {palette.ground.hex}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Body ink
              </dt>
              <dd className="mt-1 font-mono text-sm">
                {HASH}
                {palette.ink.hex} · {palette.ink.ratio}:1
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Fills with a readable label
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {palette.readableFills} / {palette.totalColours}
              </dd>
            </div>
          </dl>
        )}
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{palette.note}</p>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Colours</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {palette.colours.map((colour) => (
                <div key={colour.name} className="rounded-lg border border-[var(--border)] p-3">
                  <div
                    className="flex h-20 w-full items-center justify-center rounded-md border border-[var(--border)] text-sm font-bold"
                    style={{
                      backgroundColor: HASH + colour.fillHex,
                      color: HASH + colour.labelOnFill.hex,
                    }}
                  >
                    {colour.name}
                  </div>
                  <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
                    Fill {HASH}
                    {colour.fillHex} · {colour.fillOnGroundRatio}:1 on page
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Best label: {colour.labelOnFill.name} at {colour.labelOnFill.ratio}:1 (
                    {colour.labelOnFillLevel})
                  </p>
                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: HASH + colour.textSafeHex }}
                  >
                    Text-safe {HASH}
                    {colour.textSafeHex}
                  </p>
                  <p
                    className={
                      colour.textSafeAchieved
                        ? "text-xs text-[var(--success)]"
                        : "text-xs text-[var(--danger)]"
                    }
                  >
                    {colour.textSafeRatio}:1 on page
                    {colour.textSafeAchieved
                      ? ` · lightness moved ${colour.textSafeShift}%`
                      : " · best this hue can reach"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Contrast table</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Colour
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Fill on page
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Text-safe on page
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Fill usable for
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {palette.colours.map((colour) => (
                    <tr key={colour.name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{colour.name}</td>
                      <td className="py-2 pr-3 text-right">{colour.fillOnGroundRatio}:1</td>
                      <td
                        className={
                          colour.textSafeAchieved
                            ? "py-2 pr-3 text-right font-semibold text-[var(--success)]"
                            : "py-2 pr-3 text-right font-semibold text-[var(--danger)]"
                        }
                      >
                        {colour.textSafeRatio}:1
                      </td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {colour.fillUsableAsLargeText
                          ? "Large text and borders"
                          : colour.fillUsableAsUiBorder
                            ? "Borders and icons"
                            : "Blocks and illustration only"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              WCAG 2.x asks for 4.5:1 on body text, 3:1 on large text (24px regular or 18.66px bold)
              and 3:1 on interface components such as borders and icons.
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
        Contrast is only one part of readability. Children's material also needs generous type size,
        short lines and meaning that does not depend on colour alone — test the finished layout, not
        just the swatches.
      </p>
    </main>
  );
}
