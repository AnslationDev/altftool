"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanText } from "lucide-react";
import {
  COMFORTABLE_PX,
  MIN_LEGIBLE_PX,
  PLATFORM_PRESETS,
  WEIGHTS,
  checkOgText,
  formatReport,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  width: "1200",
  height: "630",
  headline: "Ship faster with automated release notes",
  subtext: "altftool.com · Product update",
  fontSize: "72",
  subFontSize: "32",
  weight: "bold",
  lineHeight: "1.2",
  paddingX: "80",
  paddingY: "72",
  maxLines: "3",
  renderWidth: "470",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      checkOgText({
        width: Number(form.width),
        height: Number(form.height),
        headline: form.headline,
        subtext: form.subtext,
        fontSize: Number(form.fontSize),
        subFontSize: Number(form.subFontSize),
        weight: form.weight,
        lineHeight: Number(form.lineHeight),
        paddingX: Number(form.paddingX),
        paddingY: Number(form.paddingY),
        maxLines: Number(form.maxLines),
        renderWidth: Number(form.renderWidth),
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const report = useMemo(() => formatReport(result), [result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const numberField = (id, label, key, step, min, max) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={form[key]}
        onChange={(event) => setField(key, event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanText className="h-4 w-4" aria-hidden="true" />
          Share card copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">OG Image Text Fit Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type the headline you want on your share card and see exactly where it wraps, whether it
          clears the safe area every platform crops to, and how many pixels tall it ends up in a
          feed. Widths come from published Helvetica advance metrics, so the wrap is a close match
          for Arial, Inter, Roboto and the usual UI sans stacks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="og-headline">
            Headline
          </label>
          <textarea
            id="og-headline"
            className={`mt-2 ${INPUT_CLASS} h-auto min-h-22 py-3`}
            rows={2}
            value={form.headline}
            onChange={(event) => setField("headline", event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="og-subtext">
            Sub-headline or kicker (optional)
          </label>
          <input
            id="og-subtext"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={form.subtext}
            onChange={(event) => setField("subtext", event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("og-width", "Card width (px)", "width", "10", "200", "4000")}
          {numberField("og-height", "Card height (px)", "height", "10", "200", "4000")}
          {numberField("og-font", "Headline size (px)", "fontSize", "1", "8", "400")}
          {numberField("og-subfont", "Sub-headline size (px)", "subFontSize", "1", "0", "400")}
          {numberField("og-padx", "Horizontal padding (px)", "paddingX", "4", "0")}
          {numberField("og-pady", "Vertical padding (px)", "paddingY", "4", "0")}
          {numberField("og-lh", "Line height (multiplier)", "lineHeight", "0.05", "0.8", "3")}
          {numberField("og-maxlines", "Maximum lines allowed", "maxLines", "1", "1", "12")}

          <div>
            <label className={LABEL_CLASS} htmlFor="og-weight">
              Headline weight
            </label>
            <select
              id="og-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.weight}
              onChange={(event) => setField("weight", event.target.value)}
            >
              {WEIGHTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {numberField("og-render", "Feed render width (px)", "renderWidth", "10", "80", "2000")}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PLATFORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP_BTN}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  width: String(preset.width),
                  height: String(preset.height),
                  renderWidth: String(preset.renderWidth),
                }))
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline in the feed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.renderedHeadlinePx)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to measure the card."
                : `${result.lineCount} line${result.lineCount === 1 ? "" : "s"} of ${result.maxLines} allowed · ${MIN_LEGIBLE_PX} px floor, ${COMFORTABLE_PX} px comfortable`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the share card fit report"
              onClick={copyReport}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          {failed ? (
            <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <svg
              viewBox={`0 0 ${result.width} ${result.height}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`Share card preview. The headline wraps to ${result.lineCount} lines.`}
            >
              <rect
                x="0"
                y="0"
                width={result.width}
                height={result.height}
                fill="var(--card)"
                stroke="var(--border)"
                strokeWidth="2"
              />
              <rect
                x={result.layout.safeBox.x}
                y={result.layout.safeBox.y}
                width={result.layout.safeBox.width}
                height={result.layout.safeBox.height}
                fill="none"
                stroke="var(--success)"
                strokeWidth="3"
                strokeDasharray="14 10"
              />
              <rect
                x={result.layout.contentBox.x}
                y={result.layout.contentBox.y}
                width={result.layout.contentBox.width}
                height={result.layout.contentBox.height}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
              {result.layout.headline.map((line) => (
                <text
                  key={`h-${line.y}`}
                  x={line.x}
                  y={line.y}
                  fontSize={result.layout.headlineFontSize}
                  fontWeight={result.layout.weight === "bold" ? 700 : 400}
                  fontFamily="Helvetica, Arial, sans-serif"
                  fill="var(--foreground)"
                >
                  {line.text}
                </text>
              ))}
              {result.layout.sub.map((line) => (
                <text
                  key={`s-${line.y}`}
                  x={line.x}
                  y={line.y}
                  fontSize={result.layout.subFontSize}
                  fontFamily="Helvetica, Arial, sans-serif"
                  fill="var(--muted-foreground)"
                >
                  {line.text}
                </text>
              ))}
            </svg>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Dashed grey box: your padding. Dashed green box: the area that survives every common
          centre-crop.
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Widest line",
              failed
                ? DASH
                : `${NUM.format(result.widestLine)} px of ${NUM.format(result.contentWidth)} px (${PCT.format(result.fillShare)})`,
            ],
            [
              "Text block height",
              failed
                ? DASH
                : `${NUM.format(result.blockHeight)} px of ${NUM.format(result.contentHeight)} px`,
            ],
            ["Largest headline size that still fits", failed ? DASH : `${result.bestFontSize} px`],
            [
              "Safe area across every crop",
              failed ? DASH : `${NUM.format(result.safeWidth)} × ${NUM.format(result.safeHeight)} px`,
            ],
            ["Sub-headline in the feed", failed ? DASH : `${NUM.format(result.renderedSubPx)} px`],
            ["Card aspect ratio", failed ? DASH : `${result.aspectRatio}:1`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Line by line</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Text</th>
                  <th scope="col" className="py-2 text-right font-semibold">Width</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, index) => (
                  <tr key={line} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                    <td className="py-2 pr-3">{line}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(result.lineWidths[index])} px
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.issues.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold">Notes and risks</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.issues.map((issue) => (
                  <li key={issue} className="border-l-2 border-[var(--primary)] pl-3">
                    {issue}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Line breaks are estimated from Helvetica advance widths. Condensed faces, wide letter
        spacing, variable-font optical sizes and non-Latin scripts will wrap differently — always
        confirm against the real render before publishing.
      </p>
    </main>
  );
}
