"use client";

import { useMemo, useState } from "react";
import { Baseline, Check, Copy, RotateCcw } from "lucide-react";

import {
  IDEAL_CPL,
  MAX_COMFORTABLE_CPL,
  MAX_FONT_SIZE,
  MAX_MEASURE,
  MIN_COMFORTABLE_CPL,
  MIN_FONT_SIZE,
  MIN_MEASURE,
  ROLES,
  computeLineHeight,
  formatLineHeightCss,
  formatLineHeightText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  fontSize: "16",
  measure: "640",
  role: "body",
  charWidthRatio: "0.5",
  baselineUnit: "4",
};

const SAMPLE_TEXT =
  "Typography exists to honour content. A well set paragraph disappears: the reader moves from line to line without noticing the mechanism, because the leading, the measure and the size were chosen together rather than one at a time.";

const DASH = "—";

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const { value } = event.target;
    setFields((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(
    () =>
      computeLineHeight({
        fontSize: Number(fields.fontSize),
        measure: Number(fields.measure),
        role: fields.role,
        charWidthRatio: Number(fields.charWidthRatio),
        baselineUnit: Number(fields.baselineUnit),
      }),
    [fields],
  );

  const hasError = Boolean(result.error);
  const css = useMemo(() => (hasError ? "" : formatLineHeightCss(result)), [result, hasError]);
  const summary = useMemo(() => (hasError ? "" : formatLineHeightText(result)), [result, hasError]);

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
    setFields(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baseline className="h-4 w-4" aria-hidden="true" />
          Typography
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Line Height Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a font size and a column width and get a line height that suits both, along with the
          characters per line, the comfortable measure range and a baseline-grid version.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-size">
              Font size (px)
            </label>
            <input
              id="lh-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step="1"
              value={fields.fontSize}
              onChange={set("fontSize")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-measure">
              Measure / column width (px)
            </label>
            <input
              id="lh-measure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MEASURE}
              max={MAX_MEASURE}
              step="10"
              value={fields.measure}
              onChange={set("measure")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-role">
              Text role
            </label>
            <select id="lh-role" className={`mt-2 ${INPUT_CLASS}`} value={fields.role} onChange={set("role")}>
              {Object.values(ROLES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-charwidth">
              Average character width (× font size)
            </label>
            <input
              id="lh-charwidth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="0.9"
              step="0.01"
              value={fields.charWidthRatio}
              onChange={set("charWidthRatio")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              About 0.42 for condensed faces, 0.5 for a typical sans, 0.58 for wide slabs.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-baseline">
              Baseline grid unit (px)
            </label>
            <input
              id="lh-baseline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="48"
              step="1"
              value={fields.baselineUnit}
              onChange={set("baselineUnit")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended line height
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.ratio}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${result.lineHeightPx}px at ${result.fontSize}px · ${result.roleLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", css)}
              disabled={hasError}
              aria-label="Copy the CSS declarations"
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
              onClick={() => copy("text", summary)}
              disabled={hasError}
              aria-label="Copy the line height recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters per line", hasError ? DASH : `${result.cpl} (${result.measureVerdict})`],
            [
              "Comfortable measure at this size",
              hasError
                ? DASH
                : `${result.minMeasure}-${result.maxMeasure}px, ideal ${result.idealMeasure}px`,
            ],
            [
              `Snapped to a ${hasError ? DASH : result.baselineUnit}px baseline`,
              hasError ? DASH : `${result.snappedPx}px (${result.snappedRatio})`,
            ],
            ["Paragraph spacing", hasError ? DASH : `${result.paragraphSpacingPx}px`],
            [
              "WCAG 1.4.8 line spacing",
              hasError
                ? DASH
                : result.isBodyRole
                  ? result.meetsWcagSpacing
                    ? `Meets the ${result.wcagMinRatio} minimum`
                    : `Below the ${result.wcagMinRatio} minimum`
                  : "Applies to body text, not this role",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.isBodyRole && !result.meetsWcagSpacing ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.ratio} is below the {result.wcagMinRatio} line spacing WCAG 2.x SC 1.4.8 asks for
            in blocks of body text. Narrow the measure or raise the line height.
          </p>
        ) : null}

        {!hasError && result.clamped ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            The calculated value fell outside the sensible range for{" "}
            {result.roleLabel.toLowerCase()}, so it has been held at the nearest limit.
          </p>
        ) : null}

        {!hasError && !result.measureBandApplies ? (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The {MIN_COMFORTABLE_CPL}-{MAX_COMFORTABLE_CPL} character band describes running text, so
            treat the measure verdict as advisory for this role.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Live preview</h2>
            <div className="mt-4 overflow-x-auto">
              <p
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-[var(--foreground)]"
                style={{
                  fontSize: `${result.fontSize}px`,
                  lineHeight: result.ratio,
                  maxWidth: `${result.measure}px`,
                }}
              >
                {SAMPLE_TEXT}
              </p>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Rendered at {result.fontSize}px with a line height of {result.ratio} inside a{" "}
              {result.measure}px column. On a narrow screen the column shrinks, so check the measure
              again at that width.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">CSS</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {css}
            </pre>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Characters per line is estimated from an average glyph advance of{" "}
        {hasError ? DASH : result.charWidthRatio} × the font size, because real width depends on the
        typeface and the language. The ideal of {IDEAL_CPL} characters comes from long-standing
        typographic practice rather than a measured standard — set the type and read it before you
        commit.
      </p>
    </main>
  );
}
