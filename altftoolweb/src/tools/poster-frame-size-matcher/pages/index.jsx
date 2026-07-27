"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Frame, RotateCcw } from "lucide-react";

import { matchFrames, pixelsForPrint, previewGeometry, UNITS } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const mm = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} mm` : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM1.format(value)}%` : "—");
const px = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} px` : "—");

const UNIT_LABELS = {
  mm: "Millimetres",
  cm: "Centimetres",
  in: "Inches",
  px: "Pixels",
};

const DEFAULTS = {
  width: "3000",
  height: "2000",
  unit: "px",
  dpi: "300",
  mat: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [mat, setMat] = useState(DEFAULTS.mat);
  const [mode, setMode] = useState("fit");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      matchFrames({
        width: Number(width),
        height: Number(height),
        unit,
        dpi: Number(dpi),
        matBorderMm: Number(mat),
      }),
    [width, height, unit, dpi, mat],
  );

  const error = result.error || null;
  const best = error ? null : result.best;
  const preview = best ? previewGeometry(best) : null;
  const neededPixels =
    best && best.fit ? pixelsForPrint(best.fit.printedWmm, best.fit.printedHmm, 300) : null;

  const summary = useMemo(() => {
    if (error || !best) return "";
    return [
      "Poster Frame Size Matcher",
      `Artwork: ${NUM1.format(result.artWidthMm)} × ${NUM1.format(result.artHeightMm)} mm (${result.orientation})`,
      `Aspect ratio: ${result.ratio ? result.ratio.label : "—"}`,
      `Best stock frame: ${best.label} (${best.sizeLabel})`,
      `Ratio mismatch: ${NUM1.format(best.ratioDiffPct)}%`,
      `Fit inside frame: ${NUM1.format(best.fit.printedWmm)} × ${NUM1.format(best.fit.printedHmm)} mm`,
      `Mount border: ${NUM1.format(best.fit.borderSideMm)} mm sides, ${NUM1.format(best.fit.borderTopMm)} mm top and bottom`,
      `Crop needed to fill: ${NUM1.format(best.fill.cropPct)}%`,
      `Exact-ratio frames found: ${result.exactMatchCount}`,
    ].join("\n");
  }, [error, best, result]);

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
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setUnit(DEFAULTS.unit);
    setDpi(DEFAULTS.dpi);
    setMat(DEFAULTS.mat);
    setMode("fit");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Frame className="h-4 w-4" aria-hidden="true" />
          Framing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Poster Frame Size Matcher</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your artwork size and see which off-the-shelf frame matches its shape, how much you
          would crop to fill it, and what mount border you are left with.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pfsm-width">
              Artwork width
            </label>
            <input
              id="pfsm-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pfsm-height">
              Artwork height
            </label>
            <input
              id="pfsm-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pfsm-unit">
              Measured in
            </label>
            <select
              id="pfsm-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((value) => (
                <option key={value} value={value}>
                  {UNIT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pfsm-dpi">
              Print resolution (DPI)
            </label>
            <input
              id="pfsm-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={dpi}
              onChange={(event) => setDpi(event.target.value)}
              disabled={unit !== "px"}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {unit === "px" ? "Used to turn pixels into a physical size." : "Only needed when the size is in pixels."}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pfsm-mat">
              Minimum mount border (mm)
            </label>
            <input
              id="pfsm-mat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={mat}
              onChange={(event) => setMat(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["fit", "Fit whole artwork"],
            ["fill", "Fill and crop"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={
                mode === value
                  ? `${PRIMARY_BTN} px-3`
                  : "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best matching stock frame
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {best ? best.label : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {best
                ? `${best.system} · ${best.sizeLabel} · ${best.exactRatio ? "exact ratio match" : `${NUM1.format(best.ratioDiffPct)}% off your ratio`}`
                : "Fix the input above to see a match."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy frame match result"
              className={GHOST_BTN}
              disabled={!summary}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Artwork size", best ? `${mm(result.artWidthMm)} × ${mm(result.artHeightMm)}` : "—"],
            ["Aspect ratio", best && result.ratio ? `${result.ratio.label} (${result.orientation})` : "—"],
            [
              "Printed size inside the frame",
              best && best.fit ? `${mm(best.fit.printedWmm)} × ${mm(best.fit.printedHmm)}` : "—",
            ],
            [
              "Mount border left over",
              best && best.fit ? `${mm(best.fit.borderSideMm)} sides · ${mm(best.fit.borderTopMm)} top and bottom` : "—",
            ],
            ["Crop needed to fill the frame", best ? pct(best.fill.cropPct) : "—"],
            [
              "Trimmed off when filling",
              best ? `${mm(best.fill.trimWidthMm)} across · ${mm(best.fill.trimHeightMm)} down` : "—",
            ],
            [
              "Resolution at printed size",
              best && best.fit && best.fit.effectiveDpi
                ? `${NUM0.format(best.fit.effectiveDpi)} DPI`
                : "—",
            ],
            [
              "Pixels needed for 300 DPI",
              neededPixels ? `${px(neededPixels.widthPx)} × ${px(neededPixels.heightPx)}` : "—",
            ],
            ["Exact-ratio frames available", best ? NUM0.format(result.exactMatchCount) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {preview ? (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "fit" ? "Artwork fitted inside the frame" : "Artwork enlarged to fill the frame"}
            </p>
            <div
              className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-md border-4 border-[var(--border)] bg-[var(--muted)]"
              style={{ paddingBottom: `${preview.aspectPct}%` }}
              role="img"
              aria-label={
                mode === "fit"
                  ? `Artwork covers ${NUM1.format(preview.fitWidthPct)} percent of the frame width and ${NUM1.format(preview.fitHeightPct)} percent of its height`
                  : `Artwork must be cropped by ${NUM1.format(best.fill.cropPct)} percent to fill the frame`
              }
            >
              <span
                className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)]/70"
                style={{
                  width: `${mode === "fit" ? preview.fitWidthPct : preview.fillWidthPct}%`,
                  height: `${mode === "fit" ? preview.fitHeightPct : preview.fillHeightPct}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Teal block is your artwork · grey is mount board
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Every stock size, closest shape first</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Frame</th>
                <th scope="col" className="py-2 pr-3 font-semibold">System</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Ratio off</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Crop to fill</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Printed size</th>
                <th scope="col" className="py-2 text-right font-semibold">Border</th>
              </tr>
            </thead>
            <tbody>
              {(error ? [] : result.frames).map((frame) => (
                <tr key={frame.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{frame.label}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{frame.system}</td>
                  <td
                    className={`py-2 pr-3 text-right ${frame.exactRatio ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                  >
                    {pct(frame.ratioDiffPct)}
                  </td>
                  <td className="py-2 pr-3 text-right">{pct(frame.fill.cropPct)}</td>
                  <td className="py-2 pr-3 text-right">
                    {frame.fit ? `${NUM1.format(frame.fit.printedWmm)} × ${NUM1.format(frame.fit.printedHmm)}` : "Mount too wide"}
                  </td>
                  <td className="py-2 text-right">{frame.fit ? mm(frame.fit.borderSideMm) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Frame comparison appears once the artwork size is valid.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are frame openings, not outer moulding dimensions. Ready-made frames vary by a
        millimetre or two between brands, so measure the rebate before ordering an exact-fit mount.
      </p>
    </main>
  );
}
