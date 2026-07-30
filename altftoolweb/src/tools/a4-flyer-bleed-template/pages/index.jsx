"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Crop, Download, RotateCcw } from "lucide-react";

import {
  DEFAULT_BLEED_MM,
  DEFAULT_SAFE_MM,
  FOLD_TYPES,
  MAX_BLEED_MM,
  MAX_DPI,
  MAX_SAFE_MM,
  MIN_DPI,
  PAPER_SIZES,
  PRINT_DPI,
  buildTemplateSvg,
  computeFlyerTemplate,
  formatSpecText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sizeId: "a4",
  orientation: "portrait",
  bleedMm: String(DEFAULT_BLEED_MM),
  safeMm: String(DEFAULT_SAFE_MM),
  dpi: String(PRINT_DPI),
  foldId: "none",
  foldAxis: "width",
};

const DASH = "—";

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setFields((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const spec = useMemo(
    () =>
      computeFlyerTemplate({
        sizeId: fields.sizeId,
        orientation: fields.orientation,
        bleedMm: Number(fields.bleedMm),
        safeMm: Number(fields.safeMm),
        dpi: Number(fields.dpi),
        foldId: fields.foldId,
        foldAxis: fields.foldAxis,
      }),
    [fields],
  );

  const hasError = Boolean(spec.error);
  const svg = useMemo(() => (hasError ? "" : buildTemplateSvg(spec)), [spec, hasError]);
  const specText = useMemo(() => (hasError ? "" : formatSpecText(spec)), [spec, hasError]);

  const copyResult = async () => {
    if (!specText) return;
    try {
      await navigator.clipboard.writeText(specText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fields.sizeId}-${fields.orientation}-${fields.foldId}-bleed-template.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFields(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Crop className="h-4 w-4" aria-hidden="true" />
          Print and prepress
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">A4 Flyer Bleed Template</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set up a flyer artboard the way a printer expects it: trim size plus bleed, a safe area for
          type, crop marks and fold panel positions with the tuck allowance already applied.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-size">
              Paper size
            </label>
            <select id="flyer-size" className={`mt-2 ${INPUT_CLASS}`} value={fields.sizeId} onChange={set("sizeId")}>
              {Object.values(PAPER_SIZES).map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-orientation">
              Orientation
            </label>
            <select
              id="flyer-orientation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.orientation}
              onChange={set("orientation")}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-bleed">
              Bleed per edge (mm)
            </label>
            <input
              id="flyer-bleed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_BLEED_MM}
              step="0.5"
              value={fields.bleedMm}
              onChange={set("bleedMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-safe">
              Safe margin per edge (mm)
            </label>
            <input
              id="flyer-safe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_SAFE_MM}
              step="0.5"
              value={fields.safeMm}
              onChange={set("safeMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-dpi">
              Resolution (ppi)
            </label>
            <input
              id="flyer-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DPI}
              max={MAX_DPI}
              step="10"
              value={fields.dpi}
              onChange={set("dpi")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="flyer-fold">
              Fold
            </label>
            <select id="flyer-fold" className={`mt-2 ${INPUT_CLASS}`} value={fields.foldId} onChange={set("foldId")}>
              {Object.values(FOLD_TYPES).map((fold) => (
                <option key={fold.id} value={fold.id}>
                  {fold.label}
                </option>
              ))}
            </select>
          </div>
          {fields.foldId !== "none" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="flyer-axis">
                Fold across
              </label>
              <select id="flyer-axis" className={`mt-2 ${INPUT_CLASS}`} value={fields.foldAxis} onChange={set("foldAxis")}>
                <option value="width">Width (fold lines run top to bottom)</option>
                <option value="height">Height (fold lines run left to right)</option>
              </select>
            </div>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {spec.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Artboard including bleed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${spec.bleedW} × ${spec.bleedH} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above" : `${spec.pxW} × ${spec.pxH} px at ${spec.dpi} ppi`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the artboard specification"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy spec"}
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              disabled={hasError}
              aria-label="Download the guide artboard as SVG"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              SVG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Trim size (final cut)", hasError ? DASH : `${spec.trimW} × ${spec.trimH} mm`],
            ["Bleed per edge", hasError ? DASH : `${spec.bleed} mm`],
            ["Safe / live area for type", hasError ? DASH : `${spec.safeW} × ${spec.safeH} mm`],
            ["Trim area in pixels", hasError ? DASH : `${spec.trimPxW} × ${spec.trimPxH} px`],
            ["Canvas size", hasError ? DASH : `${spec.megapixels} megapixels`],
            ["Fold", hasError ? DASH : spec.foldLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && spec.lowRes ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {spec.dpi} ppi is below the 300 ppi normally required for print. Raise the resolution
            before sending artwork to a press.
          </p>
        ) : null}
      </section>

      {!hasError && spec.panels.length > 1 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fold panels along the {spec.foldAxis}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Panel</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Width (mm)</th>
                  <th scope="col" className="py-2 text-right font-semibold">Fold at (mm)</th>
                </tr>
              </thead>
              <tbody>
                {spec.panels.map((panel, index) => (
                  <tr key={`panel-${index}-${panel}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                    <td className="py-2 pr-3 text-right">{panel}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {spec.folds[index] ?? DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {spec.tuckApplied ? (
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              A {spec.tuckApplied} mm tuck allowance has been taken off the innermost panel so it
              folds inside cleanly on 130-170 gsm stock.
            </p>
          ) : null}
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Guide preview</h2>
          <div
            className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] p-3 [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-[420px]"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <ul className="mt-4 space-y-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
            <li>Magenta outline — bleed edge. Background art must run all the way to it.</li>
            <li>Black dashed rectangle — trim line. This is where the guillotine cuts.</li>
            <li>Cyan dashed rectangle — safe area. Keep text and logos inside it.</li>
            <li>Orange dashed lines — fold positions.</li>
            <li>Short black marks in the margin — crop marks at each trim corner.</li>
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always confirm bleed, margin and fold specs with your printer before final artwork — house
        requirements vary by press, binding and stock weight.
      </p>
    </main>
  );
}
