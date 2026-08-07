"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Crop, RotateCcw } from "lucide-react";
import {
  BLEED_PRESETS,
  SIZE_PRESETS,
  STANDARD_PRINT_DPI,
  UNITS,
  computePrintBoxes,
  fromMm,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DEC2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DEC3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DEFAULTS = {
  sizeKey: "a4",
  unit: "mm",
  width: "210",
  height: "297",
  bleedKey: "iso3",
  bleed: "3",
  safeMargin: "5",
  slug: "0",
  dpi: String(STANDARD_PRINT_DPI),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sizeKey, setSizeKey] = useState(DEFAULTS.sizeKey);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [bleedKey, setBleedKey] = useState(DEFAULTS.bleedKey);
  const [bleed, setBleed] = useState(DEFAULTS.bleed);
  const [safeMargin, setSafeMargin] = useState(DEFAULTS.safeMargin);
  const [slug, setSlug] = useState(DEFAULTS.slug);
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePrintBoxes({
        trimWidth: Number(width),
        trimHeight: Number(height),
        unit,
        bleedMm: Number(bleed),
        safeMarginMm: Number(safeMargin),
        slugMm: Number(slug),
        dpi: Number(dpi),
      }),
    [width, height, unit, bleed, safeMargin, slug, dpi],
  );

  const failed = Boolean(result.error);
  const unitShort = UNITS[unit] ? UNITS[unit].short : "mm";

  const applySize = (key) => {
    const preset = SIZE_PRESETS[key];
    if (!preset) return;
    setSizeKey(key);
    const show = (mm) => String(Math.round(fromMm(mm, unit) * 1000) / 1000);
    setWidth(show(preset.width));
    setHeight(show(preset.height));
  };

  const applyBleed = (key) => {
    setBleedKey(key);
    const preset = BLEED_PRESETS[key];
    if (preset) setBleed(String(Math.round(preset.mm * 1000) / 1000));
  };

  const changeUnit = (nextUnit) => {
    if (!UNITS[nextUnit] || nextUnit === unit) return;
    // Keep the physical size identical when the display unit changes.
    const convert = (value) => {
      const mm = Number(value) * UNITS[unit].mmPer;
      if (!Number.isFinite(mm)) return value;
      return String(Math.round((mm / UNITS[nextUnit].mmPer) * 1000) / 1000);
    };
    setWidth(convert(width));
    setHeight(convert(height));
    setUnit(nextUnit);
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Print bleed setup",
      `Trim size: ${result.trim.widthMm} × ${result.trim.heightMm} mm (${result.trim.widthIn} × ${result.trim.heightIn} in)`,
      `Bleed: ${result.bleedMm} mm per edge`,
      `Document / artboard: ${result.document.widthMm} × ${result.document.heightMm} mm`,
      `Safe area: ${result.safe.widthMm} × ${result.safe.heightMm} mm (${result.safeMarginMm} mm margin)`,
      result.slugMm > 0
        ? `Slug area: ${result.slug.widthMm} × ${result.slug.heightMm} mm`
        : "Slug area: none",
      `At ${result.dpi} DPI: ${result.document.widthPx} × ${result.document.heightPx} px document, ${result.trim.widthPx} × ${result.trim.heightPx} px trim`,
      `Points: ${result.document.widthPt} × ${result.document.heightPt} pt document`,
    ].join("\n");
  }, [result, failed]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSizeKey(DEFAULTS.sizeKey);
    setUnit(DEFAULTS.unit);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setBleedKey(DEFAULTS.bleedKey);
    setBleed(DEFAULTS.bleed);
    setSafeMargin(DEFAULTS.safeMargin);
    setSlug(DEFAULTS.slug);
    setDpi(DEFAULTS.dpi);
    setCopied(false);
  };

  const boxRows = failed
    ? []
    : [
        ["Slug (outermost)", result.slug, result.slugMm > 0],
        ["Document / artboard", result.document, true],
        ["Trim (final cut size)", result.trim, true],
        ["Safe area (keep type inside)", result.safe, true],
      ].filter((row) => row[2]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Crop className="h-4 w-4" aria-hidden="true" />
          Print and prepress
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Print Bleed Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the finished trim size and get the artboard, bleed, safe area and slug in
          millimetres, inches, points and pixels — so the document you set up matches what the
          printer expects.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-preset-size">
              Start from a standard size
            </label>
            <select
              id="bleed-preset-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeKey}
              onChange={(event) => applySize(event.target.value)}
            >
              {Object.values(SIZE_PRESETS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-unit">
              Units for width and height
            </label>
            <select
              id="bleed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => changeUnit(event.target.value)}
            >
              {Object.values(UNITS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-width">
              Trim width ({unitShort})
            </label>
            <input
              id="bleed-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-height">
              Trim height ({unitShort})
            </label>
            <input
              id="bleed-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-standard">
              Bleed standard
            </label>
            <select
              id="bleed-standard"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bleedKey}
              onChange={(event) => applyBleed(event.target.value)}
            >
              {Object.values(BLEED_PRESETS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-amount">
              Bleed per edge (mm)
            </label>
            <input
              id="bleed-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={bleed}
              onChange={(event) => setBleed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-safe">
              Safe margin inside trim (mm)
            </label>
            <input
              id="bleed-safe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={safeMargin}
              onChange={(event) => setSafeMargin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-slug">
              Slug outside bleed (mm)
            </label>
            <input
              id="bleed-slug"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bleed-dpi">
              Output resolution (DPI)
            </label>
            <input
              id="bleed-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="2400"
              step="10"
              value={dpi}
              onChange={(event) => setDpi(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Document size to set up
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed
                ? "—"
                : `${DEC2.format(result.document.widthMm)} × ${DEC2.format(result.document.heightMm)} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the boxes."
                : `${NUM.format(result.document.widthPx)} × ${NUM.format(result.document.heightPx)} px at ${NUM.format(result.dpi)} DPI`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Print setup figures copied" : "Copy the print setup figures"}
              className={PRIMARY_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy setup"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Box</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">mm</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">inches</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">points</th>
                <th scope="col" className="py-2 text-right font-semibold">pixels</th>
              </tr>
            </thead>
            <tbody>
              {failed ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              ) : (
                boxRows.map((row) => (
                  <tr key={row[0]} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row[0]}</td>
                    <td className="py-2 pr-3 text-right">
                      {DEC2.format(row[1].widthMm)} × {DEC2.format(row[1].heightMm)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {DEC3.format(row[1].widthIn)} × {DEC3.format(row[1].heightIn)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {DEC2.format(row[1].widthPt)} × {DEC2.format(row[1].heightPt)}
                    </td>
                    <td className="py-2 text-right">
                      {NUM.format(row[1].widthPx)} × {NUM.format(row[1].heightPx)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bleed per edge", failed ? "—" : `${DEC3.format(result.bleedMm)} mm`],
            [
              "Trim guide offset from artboard edge",
              failed ? "—" : `${DEC3.format(result.trimOffsetMm)} mm (${NUM.format(result.trimOffsetPx)} px)`,
            ],
            [
              "Safe guide offset from artboard edge",
              failed ? "—" : `${DEC3.format(result.safeOffsetMm)} mm (${NUM.format(result.safeOffsetPx)} px)`,
            ],
            ["Document megapixels", failed ? "—" : `${DEC2.format(result.documentMegapixels)} MP`],
            ["Flattened 8-bit CMYK size", failed ? "—" : `${DEC2.format(result.flatCmykMb)} MB`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bleed and safe-margin requirements vary between printers and processes. Always check the
        supplied artwork specification before sending a file to press.
      </p>
    </main>
  );
}
