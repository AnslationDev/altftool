"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SquareDashed } from "lucide-react";

import {
  AVERAGE_GLYPH_WIDTH_EM,
  MATERIAL_MIN_GAP_DP,
  WCAG_AAA_MIN_TARGET_PX,
  WCAG_AA_MIN_TARGET_PX,
  computeButtonBox,
  evaluateButtonSpec,
  toCss,
} from "../lib";

const PX = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  fontSizePx: "16",
  lineHeight: "1.25",
  paddingYPx: "8",
  paddingXPx: "16",
  borderPx: "1",
  labelChars: "4",
  glyphWidthEm: String(AVERAGE_GLYPH_WIDTH_EM),
  iconPx: "0",
  iconGapPx: "8",
  gapXPx: "8",
  gapYPx: "8",
  selector: ".button",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const FIELDS = [
  ["btn-font", "Label font size (px)", "fontSizePx", "1", "1"],
  ["btn-lh", "Line height (unitless)", "lineHeight", "0.5", "0.05"],
  ["btn-py", "Vertical padding (px)", "paddingYPx", "0", "1"],
  ["btn-px", "Horizontal padding (px)", "paddingXPx", "0", "1"],
  ["btn-border", "Border width (px)", "borderPx", "0", "1"],
  ["btn-chars", "Label characters (0 for icon only)", "labelChars", "0", "1"],
  ["btn-glyph", "Average glyph width (em)", "glyphWidthEm", "0.1", "0.01"],
  ["btn-icon", "Icon size (px, 0 for none)", "iconPx", "0", "1"],
  ["btn-icongap", "Gap between icon and label (px)", "iconGapPx", "0", "1"],
  ["btn-gapx", "Gap to the next target, across (px)", "gapXPx", "0", "1"],
  ["btn-gapy", "Gap to the next target, down (px)", "gapYPx", "0", "1"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  const box = useMemo(
    () =>
      computeButtonBox({
        fontSizePx: Number(values.fontSizePx),
        lineHeight: Number(values.lineHeight),
        paddingYPx: Number(values.paddingYPx),
        paddingXPx: Number(values.paddingXPx),
        borderPx: Number(values.borderPx),
        labelChars: Number(values.labelChars),
        glyphWidthEm: Number(values.glyphWidthEm),
        iconPx: Number(values.iconPx),
        iconGapPx: Number(values.iconGapPx),
      }),
    [values],
  );

  const report = useMemo(
    () => evaluateButtonSpec({ box, gapXPx: Number(values.gapXPx), gapYPx: Number(values.gapYPx) }),
    [box, values.gapXPx, values.gapYPx],
  );

  const css = useMemo(
    () => (box.error || report.error ? "" : toCss(box, report, values.selector.trim() || ".button")),
    [box, report, values.selector],
  );

  const copyResult = async () => {
    if (!css) return;
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const hasError = Boolean(box.error || report.error);
  const errorMessage = box.error || report.error || "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SquareDashed className="h-4 w-4" aria-hidden="true" />
          Target size
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Button Minimum Size Spec Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn font size, line height, padding and border into the real rendered button box, then check
          it against WCAG {WCAG_AA_MIN_TARGET_PX}px AA, WCAG {WCAG_AAA_MIN_TARGET_PX}px AAA, the Apple
          44pt tap target and Material&apos;s 48dp touch target — including the SC 2.5.8 spacing
          exception.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([id, label, key, min, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="btn-selector">
              CSS selector
            </label>
            <input
              id="btn-selector"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              value={values.selector}
              onChange={(event) => setField("selector", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rendered button box
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PX.format(box.height)} × ${PX.format(box.width)}px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the values above"
                : `Clears ${report.passCount} of ${report.total} standards; strictest is ${report.strictest.name}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the CSS rule" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all values" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <span
              className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]"
              style={{
                height: `${box.height}px`,
                width: `${box.width}px`,
                fontSize: `${box.fontSizePx}px`,
                lineHeight: box.lineHeight,
              }}
            >
              Save
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              Drawn at the computed size, {PX.format(box.height)}px tall
            </span>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Text box height (line-height × font-size)", hasError ? DASH : `${PX.format(box.textHeight)}px`],
            ["Estimated label width", hasError ? DASH : `${PX.format(box.labelWidth)}px`],
            ["Total height", hasError ? DASH : `${PX.format(box.height)}px`],
            ["Total width", hasError ? DASH : `${PX.format(box.width)}px`],
            [
              "Vertical padding to clear the strictest standard",
              hasError ? DASH : `${PX.format(report.recommendedPaddingY)}px per edge`,
            ],
            [
              "Horizontal padding to clear it",
              hasError ? DASH : `${PX.format(report.recommendedPaddingX)}px per edge`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Standard</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Minimum</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Short by</th>
                <th scope="col" className="py-2 text-right font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {hasError
                ? [1, 2, 3, 4].map((key) => (
                    <tr key={key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{DASH}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 text-right">{DASH}</td>
                    </tr>
                  ))
                : report.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{row.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {row.min} {row.unit}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {row.meets
                          ? DASH
                          : `${PX.format(row.heightShortfall)}px tall, ${PX.format(row.widthShortfall)}px wide`}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                            row.passes
                              ? "bg-[var(--success-soft)] text-[var(--success)]"
                              : "bg-[var(--danger-soft)] text-[var(--danger)]"
                          }`}
                        >
                          {row.meets ? "pass" : row.spacingSaves ? "pass (spacing)" : "fail"}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!hasError && report.issues.length > 0 && (
          <ul className="mt-5 space-y-2">
            {report.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {css && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">CSS</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {css}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Label width is estimated from an average glyph advance and will differ from the real string in
        your typeface — measure it if the width is load-bearing. Material asks for at least{" "}
        {MATERIAL_MIN_GAP_DP}dp between touch targets. This is informational guidance, not an
        accessibility audit; test with real assistive technology before claiming conformance.
      </p>
    </main>
  );
}
