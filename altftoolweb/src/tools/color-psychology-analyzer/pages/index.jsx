"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, Palette, RotateCcw } from "lucide-react";

import {
  DEFAULT_HEX,
  CONTRAST_AA_LARGE,
  CONTRAST_AA_NORMAL,
  CONTRAST_AAA_NORMAL,
  analyzeColor,
  analyzePair,
  WHITE_HEX,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const HARMONY_LABELS = [
  ["complementary", "Complementary (+180°)"],
  ["analogous", "Analogous (±30°)"],
  ["triadic", "Triadic (+120°, +240°)"],
  ["splitComplementary", "Split complementary (+150°, +210°)"],
];

const ratioFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ToolHome() {
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [textColor, setTextColor] = useState(WHITE_HEX);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeColor(hex), [hex]);
  const pair = useMemo(() => analyzePair(textColor, hex), [textColor, hex]);

  const swatchStyle = result.error ? undefined : { backgroundColor: result.hex };
  const previewStyle = result.error || pair.error ? undefined : { backgroundColor: result.hex, color: pair.foreground };

  const summary = result.error
    ? ""
    : [
        `Colour: ${result.hex}`,
        `Family: ${result.familyLabel} (${result.temperature})`,
        `HSL: ${result.hsl.h}°, ${result.hsl.s}%, ${result.hsl.l}%`,
        `Associations: ${result.emotions.join(", ")}`,
        `Contrast on white: ${result.contrastOnWhite}:1 — on black: ${result.contrastOnBlack}:1`,
        `Best text colour on it: ${result.bestTextOn} (${result.bestTextRatio}:1)`,
        "",
        "Branding note:",
        result.brandNote,
        "",
        "Cultural meanings:",
        ...result.cultures.map(([place, meaning]) => `- ${place}: ${meaning}`),
      ].join("\n");

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setHex(DEFAULT_HEX);
    setTextColor(WHITE_HEX);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Palette className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Colour Psychology Analyzer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a hex colour to see its emotional associations, branding fit, cultural readings in
          other markets, and its WCAG 2.1 contrast behaviour.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="cpa-hex">
            Colour (hex)
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="cpa-hex"
              type="text"
              inputMode="text"
              spellCheck={false}
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              className={INPUT_CLASS}
            />
            <input
              type="color"
              aria-label="Pick the colour visually"
              value={result.error ? DEFAULT_HEX : result.hex}
              onChange={(event) => setHex(event.target.value.toUpperCase())}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="cpa-text">
            Text colour placed on it
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="cpa-text"
              type="text"
              inputMode="text"
              spellCheck={false}
              value={textColor}
              onChange={(event) => setTextColor(event.target.value)}
              className={INPUT_CLASS}
            />
            <input
              type="color"
              aria-label="Pick the text colour visually"
              value={pair.error ? DEFAULT_HEX : pair.foreground}
              onChange={(event) => setTextColor(event.target.value.toUpperCase())}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 shrink-0 rounded-lg border border-[var(--border)]"
              style={swatchStyle}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Psychological family</p>
              <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                {result.error ? DASH : result.familyLabel}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.error ? DASH : `${result.hex} · ${result.temperature}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the colour psychology summary"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the default colour" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Hue / saturation / lightness", result.error ? DASH : `${result.hsl.h}° · ${result.hsl.s}% · ${result.hsl.l}%`],
            ["RGB", result.error ? DASH : `${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b}`],
            ["Relative luminance", result.error ? DASH : String(result.luminance)],
            ["Contrast on white", result.error ? DASH : `${ratioFormat.format(result.contrastOnWhite)}:1`],
            ["Contrast on black", result.error ? DASH : `${ratioFormat.format(result.contrastOnBlack)}:1`],
            [
              "Best text colour on it",
              result.error ? DASH : `${result.bestTextOn} (${ratioFormat.format(result.bestTextRatio)}:1)`,
            ],
            [
              "WCAG verdict for body text",
              result.error
                ? DASH
                : result.passesAaaBodyText
                  ? `AAA (>= ${CONTRAST_AAA_NORMAL}:1)`
                  : result.passesAaBodyText
                    ? `AA (>= ${CONTRAST_AA_NORMAL}:1)`
                    : result.passesAaLargeText
                      ? `Large text only (>= ${CONTRAST_AA_LARGE}:1)`
                      : "Fails AA at every size",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && !pair.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Readability preview</h2>
          <div
            className="mt-3 rounded-lg border border-[var(--border)] p-4 text-sm leading-6"
            style={previewStyle}
          >
            The quick brown fox jumps over the lazy dog — {pair.ratio}:1
          </div>
          <p
            className={
              pair.aaBody
                ? "mt-3 text-sm font-semibold text-[var(--success)]"
                : "mt-3 text-sm font-semibold text-[var(--danger)]"
            }
          >
            {pair.verdict}
          </p>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">What this colour signals</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.emotions.map((emotion) => (
              <li
                key={emotion}
                className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                {emotion}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.brandNote}</p>
          {result.industries.length > 0 && (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Common in: </span>
              {result.industries.join(", ")}
            </p>
          )}
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Think twice about: </span>
            {result.avoid}
          </p>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <Globe className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Cultural meanings
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Market</th>
                  <th scope="col" className="py-2 font-semibold">Reading</th>
                </tr>
              </thead>
              <tbody>
                {result.cultures.map(([place, meaning]) => (
                  <tr key={place} className="border-b border-[var(--border)] align-top">
                    <th scope="row" className="py-2.5 pr-4 font-semibold text-[var(--foreground)]">
                      {place}
                    </th>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Palette partners</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {HARMONY_LABELS.map(([key, label]) => (
              <div key={key}>
                <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.harmonies[key].map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setHex(swatch)}
                      aria-label={`Analyse ${swatch}`}
                      className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs font-mono text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <span
                        className="h-6 w-6 rounded border border-[var(--border)]"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                      {swatch}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contrast figures follow WCAG 2.1: 4.5:1 for body text, 3:1 for large text and for
        non-text UI. Cultural readings are general guidance — validate with people in the market
        before shipping a rebrand.
      </p>
    </main>
  );
}
