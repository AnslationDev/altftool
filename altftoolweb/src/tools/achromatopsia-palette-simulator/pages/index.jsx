"use client";

import { useMemo, useState } from "react";
import { Check, Contrast, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_PALETTE, GREY_MODELS, rgbToHex, simulatePalette } from "../lib";

const buildDefaults = () =>
  DEFAULT_PALETTE.map((entry) => ({ name: entry.name, value: rgbToHex(entry.rgb) }));

const MID_GREY = rgbToHex([128, 128, 128]);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const LEVEL_CLASS = {
  critical: "text-[var(--danger)]",
  fail: "text-[var(--danger)]",
  warn: "text-[var(--foreground)]",
  pass: "text-[var(--success)]",
  best: "text-[var(--success)]",
};

export default function ToolHome() {
  const [rows, setRows] = useState(buildDefaults);
  const [model, setModel] = useState("luminance");
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => simulatePalette({ colors: rows, model }), [rows, model]);
  const hasError = Boolean(report.error);
  const dash = "—";

  const updateRow = (index, patch) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((current) =>
      current.length >= 12
        ? current
        : [...current, { name: `Colour ${current.length + 1}`, value: MID_GREY }],
    );
  };

  const removeRow = (index) => {
    setRows((current) => (current.length <= 2 ? current : current.filter((_, i) => i !== index)));
  };

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Achromatopsia palette check — ${report.modelLabel}`,
      report.summary,
      "",
      ...report.swatches.map((swatch) => `${swatch.name}: ${swatch.hex} -> ${swatch.greyHex}`),
      "",
      "Pairs, worst first:",
      ...report.pairs.map(
        (pair) =>
          `${pair.a} / ${pair.b}: ${pair.greyRatio.toFixed(2)}:1 in grey (${pair.colourRatio.toFixed(2)}:1 in colour) — ${pair.label}`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRows(buildDefaults());
    setModel("luminance");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Contrast className="h-4 w-4" aria-hidden="true" />
          Colour vision
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Achromatopsia Palette Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Strip every trace of hue from your palette and see which colours collapse into the same
          grey. Each pair is scored with the WCAG contrast formula against the 3:1 and 4.5:1
          thresholds.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="grey-model">
            Greyscale model
          </label>
          <select
            id="grey-model"
            className={`mt-2 ${INPUT_CLASS}`}
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {GREY_MODELS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {GREY_MODELS.find((item) => item.key === model)?.note}
          </p>
        </div>

        <ul className="mt-5 space-y-3">
          {rows.map((row, index) => (
            <li key={`row-${index}`} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`swatch-name-${index}`}>
                    Name
                  </label>
                  <input
                    id={`swatch-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`swatch-value-${index}`}>
                    Hex value
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      aria-label={`Colour picker for ${row.name || `colour ${index + 1}`}`}
                      className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)]"
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(row.value) ? row.value : MID_GREY}
                      onChange={(event) => updateRow(index, { value: event.target.value })}
                    />
                    <input
                      id={`swatch-value-${index}`}
                      className={INPUT_CLASS}
                      type="text"
                      value={row.value}
                      onChange={(event) => updateRow(index, { value: event.target.value })}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Remove ${row.name || `colour ${index + 1}`}`}
                disabled={rows.length <= 2}
                className="min-h-11 self-end rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= 12}
          className={`mt-4 ${GHOST_BTN}`}
        >
          Add colour
        </button>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pairs that collapse
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${report.collisions}/${report.pairCount}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : report.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the greyscale contrast report"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the palette" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Worst pair in greyscale", dash],
                ["Pairs below 3:1", dash],
                ["Pairs below 4.5:1", dash],
                ["Model used", dash],
              ]
            : [
                [
                  "Worst pair in greyscale",
                  `${report.worst.a} / ${report.worst.b} — ${report.worst.greyRatio.toFixed(2)}:1`,
                ],
                ["Pairs below 3:1", `${report.belowUi} of ${report.pairCount}`],
                ["Pairs below 4.5:1", `${report.belowText} of ${report.pairCount}`],
                ["Model used", report.modelLabel],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Colour against no colour</h2>
            <ul className="mt-3 space-y-2">
              {report.swatches.map((swatch) => (
                <li key={swatch.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                    style={{ backgroundColor: swatch.greyHex }}
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block font-semibold">{swatch.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {swatch.hex} → {swatch.greyHex} · luminance {swatch.luminance.toFixed(3)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Every pair, worst first</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Grey
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Colour
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Verdict
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.pairs.map((pair) => (
                    <tr
                      key={`${pair.a}-${pair.b}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3 font-semibold">
                        {pair.a} / {pair.b}
                      </td>
                      <td className="py-2 pr-3 text-right">{pair.greyRatio.toFixed(2)}:1</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {pair.colourRatio.toFixed(2)}:1
                      </td>
                      <td className={`py-2 ${LEVEL_CLASS[pair.level]}`}>{pair.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The WCAG contrast formula already ignores hue, so a pair that passes in colour passes in
        greyscale too. What achromatopsia removes is every distinction carried by hue alone — pair
        colour with shape, position, a label or a pattern wherever meaning depends on it.
      </p>
    </main>
  );
}
