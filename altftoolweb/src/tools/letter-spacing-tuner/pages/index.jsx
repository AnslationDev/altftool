"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Type } from "lucide-react";

import {
  DEFAULT_SCALE_SIZES,
  buildTrackingScale,
  computeTracking,
  formatEm,
  toCssRule,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
  signDisplay: "exceptZero",
});
const NUM2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const INT = new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" });

const DEFAULTS = {
  fontSize: "48",
  fontWeight: "700",
  textCase: "normal",
  contrast: "dark-on-light",
  nudge: "0",
  family: "sans",
  sample: "Designed to be read",
};

const FAMILY_STACKS = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
  const [fontWeight, setFontWeight] = useState(DEFAULTS.fontWeight);
  const [textCase, setTextCase] = useState(DEFAULTS.textCase);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [nudge, setNudge] = useState(DEFAULTS.nudge);
  const [family, setFamily] = useState(DEFAULTS.family);
  const [sample, setSample] = useState(DEFAULTS.sample);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTracking({
        fontSizePx: toNumber(fontSize),
        fontWeight: toNumber(fontWeight),
        textCase,
        contrast,
        nudgeThousandths: toNumber(nudge),
      }),
    [fontSize, fontWeight, textCase, contrast, nudge],
  );

  const scale = useMemo(() => {
    if (result.error) return [];
    return buildTrackingScale({
      sizes: DEFAULT_SCALE_SIZES,
      textCase,
      fontWeight: toNumber(fontWeight),
      contrast,
      nudgeThousandths: toNumber(nudge),
    });
  }, [result.error, textCase, fontWeight, contrast, nudge]);

  const cssRule = result.error ? "" : toCssRule(result, ".display");

  const previewStyle = result.error
    ? undefined
    : {
        fontFamily: FAMILY_STACKS[family],
        fontSize: `${result.fontSizePx}px`,
        fontWeight: Number(fontWeight),
        letterSpacing: formatEm(result.trackingEm),
        textTransform: textCase === "uppercase" ? "uppercase" : "none",
        fontVariantCaps: textCase === "small-caps" ? "small-caps" : "normal",
        lineHeight: 1.15,
      };

  const copyCss = async () => {
    if (!cssRule) return;
    try {
      await navigator.clipboard.writeText(cssRule);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFontSize(DEFAULTS.fontSize);
    setFontWeight(DEFAULTS.fontWeight);
    setTextCase(DEFAULTS.textCase);
    setContrast(DEFAULTS.contrast);
    setNudge(DEFAULTS.nudge);
    setFamily(DEFAULTS.family);
    setSample(DEFAULTS.sample);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Typography
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Letter Spacing Tuner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tracking should shrink as type grows. This tool applies the optical tracking curve
          <span className="whitespace-nowrap"> A + B·e^(C·size) </span>
          then corrects for weight, all-caps settings and reversed text, and hands you the CSS.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-size">
              Font size (px)
            </label>
            <input
              id="ls-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="400"
              step="1"
              value={fontSize}
              onChange={(event) => setFontSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-weight">
              Font weight
            </label>
            <select
              id="ls-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fontWeight}
              onChange={(event) => setFontWeight(event.target.value)}
            >
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <option key={weight} value={String(weight)}>
                  {weight}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-case">
              Text case
            </label>
            <select
              id="ls-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={textCase}
              onChange={(event) => setTextCase(event.target.value)}
            >
              <option value="normal">Sentence / title case</option>
              <option value="uppercase">ALL CAPS</option>
              <option value="small-caps">Small caps</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-contrast">
              Contrast
            </label>
            <select
              id="ls-contrast"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contrast}
              onChange={(event) => setContrast(event.target.value)}
            >
              <option value="dark-on-light">Dark text on light</option>
              <option value="light-on-dark">Light text on dark</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-family">
              Preview family
            </label>
            <select
              id="ls-family"
              className={`mt-2 ${INPUT_CLASS}`}
              value={family}
              onChange={(event) => setFamily(event.target.value)}
            >
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ls-nudge">
              Manual nudge (1/1000 em)
            </label>
            <input
              id="ls-nudge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="-200"
              max="200"
              step="1"
              value={nudge}
              onChange={(event) => setNudge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ls-sample">
              Preview text
            </label>
            <input
              id="ls-sample"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sample}
              onChange={(event) => setSample(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Recommended letter-spacing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatEm(result.trackingEm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `${result.label} · ${INT.format(result.trackingThousandths)}/1000 em`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCss}
              aria-label="Copy the letter-spacing CSS rule"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Optical base for this size", result.error ? DASH : `${NUM3.format(result.baseEm)}em`],
            ["Case correction", result.error ? DASH : `${NUM3.format(result.caseAdjustEm)}em`],
            ["Weight correction", result.error ? DASH : `${NUM3.format(result.weightAdjustEm)}em`],
            ["Reversed-text correction", result.error ? DASH : `${NUM3.format(result.contrastAdjustEm)}em`],
            ["Manual nudge", result.error ? DASH : `${NUM3.format(result.nudgeEm)}em`],
            ["Computed value in pixels", result.error ? DASH : `${NUM2.format(result.trackingPx)}px`],
            [
              "Photoshop / InDesign tracking",
              result.error ? DASH : `${INT.format(result.trackingThousandths)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.clamped ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Your nudge pushed the value past the usable range, so it was clamped to{" "}
            {formatEm(result.trackingEm)}.
          </p>
        ) : null}

        {!result.error ? (
          <pre className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--foreground)]">
            <code>{cssRule}</code>
          </pre>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Live preview</h2>
        <div
          className={`mt-3 overflow-x-auto rounded-lg px-4 py-6 ${
            contrast === "light-on-dark"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--background)] text-[var(--foreground)]"
          }`}
        >
          <p style={previewStyle} className="whitespace-nowrap">
            {sample || "Designed to be read"}
          </p>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The preview uses your system sans, serif or mono stack — set the real family in your own
          stylesheet, then re-check the value by eye.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tracking across the size scale</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same weight, case and contrast, applied to a standard size ladder.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  letter-spacing
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Pixels
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  /1000 em
                </th>
              </tr>
            </thead>
            <tbody>
              {scale.map((row) => (
                <tr key={row.fontSizePx} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.fontSizePx}px</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{formatEm(row.trackingEm)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                    {NUM2.format(row.trackingPx)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{INT.format(row.trackingThousandths)}</td>
                </tr>
              ))}
              {scale.length === 0 ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These values are a well-calibrated starting point, not a verdict. Every typeface ships with
        its own sidebearings, so always confirm the setting optically at the size it will actually
        render.
      </p>
    </main>
  );
}
