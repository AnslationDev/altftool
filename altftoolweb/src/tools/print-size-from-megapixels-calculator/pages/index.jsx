"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Printer, RotateCcw } from "lucide-react";

import {
  QUALITY_LEVELS,
  RESOLUTION_PRESETS,
  computePrintSize,
  ppiForViewingDistance,
  requiredResolution,
} from "../lib";

const IN = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const MP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  pixelWidth: "6000",
  pixelHeight: "4000",
  ppi: "300",
  printWidth: "20",
  printHeight: "16",
  viewingDistance: "18",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [pixelWidth, setPixelWidth] = useState(DEFAULTS.pixelWidth);
  const [pixelHeight, setPixelHeight] = useState(DEFAULTS.pixelHeight);
  const [ppi, setPpi] = useState(DEFAULTS.ppi);
  const [printWidth, setPrintWidth] = useState(DEFAULTS.printWidth);
  const [printHeight, setPrintHeight] = useState(DEFAULTS.printHeight);
  const [viewingDistance, setViewingDistance] = useState(DEFAULTS.viewingDistance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePrintSize({
        pixelWidth: pixelWidth.trim() === "" ? NaN : Number(pixelWidth),
        pixelHeight: pixelHeight.trim() === "" ? NaN : Number(pixelHeight),
        ppi: ppi.trim() === "" ? NaN : Number(ppi),
      }),
    [pixelWidth, pixelHeight, ppi],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const requirement = useMemo(
    () =>
      requiredResolution({
        widthInches: printWidth.trim() === "" ? NaN : Number(printWidth),
        heightInches: printHeight.trim() === "" ? NaN : Number(printHeight),
        ppi: ppi.trim() === "" ? NaN : Number(ppi),
        havePixelWidth: Number(pixelWidth),
        havePixelHeight: Number(pixelHeight),
      }),
    [printWidth, printHeight, ppi, pixelWidth, pixelHeight],
  );

  const acuityPpi = useMemo(
    () => ppiForViewingDistance(viewingDistance.trim() === "" ? NaN : Number(viewingDistance)),
    [viewingDistance],
  );

  const applyPreset = (preset) => {
    setPixelWidth(String(preset.width));
    setPixelHeight(String(preset.height));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Print Size From Megapixels Calculator",
      `Image: ${INT.format(result.pixelWidth)} x ${INT.format(result.pixelHeight)} px (${MP.format(result.megapixels)} MP, ${result.aspect})`,
      `At ${result.ppi} PPI: ${IN.format(result.widthInches)} x ${IN.format(result.heightInches)} inches`,
      `That is ${IN.format(result.widthCm)} x ${IN.format(result.heightCm)} cm`,
      `Sharp from about ${IN.format(result.comfortableViewingInches)} inches away`,
    ].join("\n");
  }, [hasError, result]);

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
    setPixelWidth(DEFAULTS.pixelWidth);
    setPixelHeight(DEFAULTS.pixelHeight);
    setPpi(DEFAULTS.ppi);
    setPrintWidth(DEFAULTS.printWidth);
    setPrintHeight(DEFAULTS.printHeight);
    setViewingDistance(DEFAULTS.viewingDistance);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print resolution
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Print Size From Megapixels Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Print size is pixels divided by PPI, nothing more. Enter your file&apos;s dimensions to see
          the largest print it supports at each quality level — and how many megapixels a target
          size would need.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-w">
              Pixel width
            </label>
            <input
              id="ps-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={pixelWidth}
              onChange={(event) => setPixelWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-h">
              Pixel height
            </label>
            <input
              id="ps-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={pixelHeight}
              onChange={(event) => setPixelHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-ppi">
              Target PPI
            </label>
            <input
              id="ps-ppi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="2400"
              step="10"
              value={ppi}
              onChange={(event) => setPpi(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={CHIP_BTN}
              type="button"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUALITY_LEVELS.map((level) => (
            <button
              key={level.ppi}
              className={CHIP_BTN}
              type="button"
              onClick={() => setPpi(String(level.ppi))}
            >
              {level.ppi} PPI
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="ps-distance">
            Viewing distance (inches)
          </label>
          <input
            id="ps-distance"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={viewingDistance}
            onChange={(event) => setViewingDistance(event.target.value)}
          />
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {acuityPpi === null
              ? "Enter a distance greater than zero."
              : `Beyond about ${IN.format(acuityPpi)} PPI, 20/20 vision cannot resolve extra detail at this distance.`}
          </p>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Print size at {hasError ? dash : `${result.ppi} PPI`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? dash
                : `${IN.format(result.widthInches)} × ${IN.format(result.heightInches)} in`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${IN.format(result.widthCm)} × ${IN.format(result.heightCm)} cm · ${MP.format(result.megapixels)} MP · ${result.aspect}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={GHOST_BTN}
              type="button"
              onClick={copyResult}
              aria-label="Copy print size result"
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button className={PRIMARY_BTN} type="button" onClick={reset} aria-label="Reset all inputs">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Megapixels", hasError ? dash : `${MP.format(result.megapixels)} MP`],
            ["Aspect ratio", hasError ? dash : result.aspect],
            ["Print diagonal", hasError ? dash : `${IN.format(result.diagonalInches)} in`],
            [
              "Sharp from",
              hasError ? dash : `about ${IN.format(result.comfortableViewingInches)} inches away`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Largest print at each quality level</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">PPI</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Inches</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Centimetres</th>
                <th scope="col" className="py-2 font-semibold">Use</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2">{dash}</td>
                </tr>
              ) : (
                result.sizesByQuality.map((row) => (
                  <tr key={row.ppi} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.ppi}</td>
                    <td className="py-2 pr-3 text-right">
                      {IN.format(row.widthInches)} × {IN.format(row.heightInches)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {IN.format(row.widthCm)} × {IN.format(row.heightCm)}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {row.label.split("—")[1]?.trim() ?? row.label}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Do I have enough pixels for this print?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-print-w">
              Print width (inches)
            </label>
            <input
              id="ps-print-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={printWidth}
              onChange={(event) => setPrintWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-print-h">
              Print height (inches)
            </label>
            <input
              id="ps-print-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={printHeight}
              onChange={(event) => setPrintHeight(event.target.value)}
            />
          </div>
        </div>

        {requirement.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {requirement.error}
          </p>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  "Pixels needed",
                  `${INT.format(requirement.needWidth)} × ${INT.format(requirement.needHeight)}`,
                ],
                ["Megapixels needed", `${MP.format(requirement.needMegapixels)} MP`],
                [
                  "PPI you would actually get",
                  requirement.actualPpi === null ? dash : `${IN.format(requirement.actualPpi)} PPI`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {requirement.haveEnough !== null && (
              <p
                className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                  requirement.haveEnough
                    ? "bg-[var(--surface-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                {requirement.haveEnough
                  ? "Your file has enough pixels for this print at the chosen PPI."
                  : `Your file is short — it would need upscaling by about ${IN.format(requirement.upscaleFactor)}× on each side, or you accept the lower PPI shown above.`}
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        PPI describes the image file; DPI describes ink dots on paper and is usually a much larger
        number. Big prints are viewed from further away, so 150 PPI on a metre-wide canvas can look
        every bit as sharp as 300 PPI on an A4 print held at arm&apos;s length.
      </p>
    </main>
  );
}
