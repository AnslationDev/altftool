"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";
import {
  DEFAULT_BASE_COLOR,
  OUTPUT_FORMATS,
  STEPS,
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
  generateScale,
  renderScale,
} from "../lib";

const DASH = "—";

const ratioFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const decimalFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-mono text-sm text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function TailwindColorGeneratorPage() {
  const [color, setColor] = useState(DEFAULT_BASE_COLOR);
  const [name, setName] = useState("brand");
  const [anchor, setAnchor] = useState("500");
  const [format, setFormat] = useState(OUTPUT_FORMATS[0].id);
  const [copied, setCopied] = useState(false);

  const scale = useMemo(
    () => generateScale({ color, name, anchor: Number(anchor) }),
    [color, name, anchor],
  );
  const hasError = Boolean(scale.error);

  const output = useMemo(
    () => (hasError ? "" : renderScale(scale, format)),
    [hasError, scale, format],
  );

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleReset() {
    setColor(DEFAULT_BASE_COLOR);
    setName("brand");
    setAnchor("500");
    setFormat(OUTPUT_FORMATS[0].id);
    setCopied(false);
  }

  const anchorStep = hasError ? null : scale.steps.find((s) => s.isAnchor);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <Palette className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Tailwind Color Generator
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            One base colour becomes a full 50–950 ramp, stepped in OKLCH so the shades look
            evenly spaced rather than mathematically spaced.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="base-color" className="text-sm font-medium text-[var(--foreground)]">
            Base colour
          </label>
          <div className="flex gap-2">
            <input
              id="base-color"
              type="text"
              spellCheck={false}
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setCopied(false);
              }}
              className="h-11 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            <input
              type="color"
              aria-label="Pick the base colour"
              value={hasError ? DEFAULT_BASE_COLOR : scale.baseHex}
              onChange={(e) => {
                setColor(e.target.value);
                setCopied(false);
              }}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="color-name" className="text-sm font-medium text-[var(--foreground)]">
            Colour name in the CSS
          </label>
          <input
            id="color-name"
            type="text"
            spellCheck={false}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setCopied(false);
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="anchor" className="text-sm font-medium text-[var(--foreground)]">
            Which step is your colour?
          </label>
          <select
            id="anchor"
            value={anchor}
            onChange={(e) => {
              setAnchor(e.target.value);
              setCopied(false);
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {STEPS.map((s) => (
              <option key={s} value={String(s)}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="format" className="text-sm font-medium text-[var(--foreground)]">
            Output format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              setCopied(false);
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the generated colour scale"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the default colour"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {scale.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          {hasError ? "Base colour" : `${scale.name}-${scale.anchor}`}
        </p>
        <p className="mt-1 font-mono text-4xl leading-tight font-semibold text-[var(--foreground)]">
          {hasError ? DASH : anchorStep.hex}
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : anchorStep.oklch}
        </p>

        <dl className="mt-4">
          <Row label="Base lightness (OKLCH L)" value={hasError ? DASH : decimalFmt.format(scale.baseL)} />
          <Row label="Base chroma (C)" value={hasError ? DASH : decimalFmt.format(scale.baseC)} />
          <Row label="Hue (H°)" value={hasError ? DASH : decimalFmt.format(scale.baseH)} />
          <Row
            label="Steps clipped into sRGB"
            value={hasError ? DASH : `${scale.clippedSteps} of ${scale.steps.length}`}
          />
        </dl>
        {!hasError && scale.clippedSteps > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {scale.clippedSteps} step{scale.clippedSteps === 1 ? "" : "s"} needed chroma
            reduced to fit inside sRGB. Hue and lightness are unchanged; only saturation was
            given up.
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">The ramp</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {hasError
            ? null
            : scale.steps.map((s) => (
                <div
                  key={s.step}
                  className={`overflow-hidden rounded-xl ring-1 ${
                    s.isAnchor ? "ring-[var(--primary)]" : "ring-[var(--border)]"
                  }`}
                >
                  <div
                    className="flex h-20 items-end justify-between p-2 text-xs font-medium"
                    style={{ backgroundColor: s.hex, color: s.textColor }}
                  >
                    <span>{s.step}</span>
                    <span>{ratioFmt.format(s.textContrast)}</span>
                  </div>
                  <div className="bg-[var(--card)] px-2 py-1.5">
                    <p className="font-mono text-xs text-[var(--foreground)]">{s.hex}</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Contrast against white and black
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Step
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Hex
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  vs white
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  vs black
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Best text
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  WCAG
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : (
                scale.steps.map((s) => (
                  <tr key={s.step} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.step}</td>
                    <td className="px-3 py-2 font-mono text-[var(--muted-foreground)]">
                      {s.hex}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[var(--foreground)]">
                      {ratioFmt.format(s.contrastWhite)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[var(--foreground)]">
                      {ratioFmt.format(s.contrastBlack)}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">{s.textColor}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          s.passesAAA
                            ? "bg-[var(--success-soft)] text-[var(--success)]"
                            : s.passesAA
                              ? "bg-[var(--success-soft)] text-[var(--success)]"
                              : s.passesAALarge
                                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                                : "bg-[var(--danger-soft)] text-[var(--danger)]"
                        }`}
                      >
                        {s.passesAAA
                          ? "AAA"
                          : s.passesAA
                            ? "AA"
                            : s.passesAALarge
                              ? "AA large only"
                              : "fails"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          AA needs {WCAG_AA_NORMAL}:1 for normal text and {WCAG_AA_LARGE}:1 for large text.
          The ratios shown are against pure white and pure black.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">
          {OUTPUT_FORMATS.find((f) => f.id === format)?.label}
        </h2>
        <pre className="max-h-96 overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs whitespace-pre text-[var(--foreground)] ring-1 ring-[var(--border)]">
          {hasError ? DASH : output}
        </pre>
      </section>
    </div>
  );
}
