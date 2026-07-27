"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";
import {
  GARMENT_SIZES,
  MIN_ACCEPTABLE_DPI,
  PLATEN_SIZES,
  buildPreviewGeometry,
  buildSizeRun,
  checkResolution,
  computePrintArea,
  resolvePlacements,
} from "../lib";

const DEFAULTS = {
  sizeKey: "L",
  platenKey: "14x16",
  sideMargin: "1",
  hemMargin: "3",
  collarDrop: "3",
  ratioWidth: "4",
  ratioHeight: "5",
  dpi: "300",
  filePixelWidth: "3000",
  filePixelHeight: "3750",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const inches = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} in` : DASH);
const px = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} px` : DASH);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const options = useMemo(
    () => ({
      platenKey: values.platenKey,
      sideMargin: toNumber(values.sideMargin),
      hemMargin: toNumber(values.hemMargin),
      collarDrop: toNumber(values.collarDrop),
      designRatioWidth: toNumber(values.ratioWidth),
      designRatioHeight: toNumber(values.ratioHeight),
      dpi: toNumber(values.dpi),
    }),
    [values],
  );

  const area = useMemo(
    () => computePrintArea({ ...options, sizeKey: values.sizeKey }),
    [options, values.sizeKey],
  );

  const ok = !area.error;

  const run = useMemo(() => buildSizeRun(options), [options]);
  const placements = useMemo(() => resolvePlacements(area), [area]);
  const preview = useMemo(() => buildPreviewGeometry(area), [area]);

  const resolution = useMemo(
    () =>
      ok
        ? checkResolution({
            pixelWidth: toNumber(values.filePixelWidth),
            pixelHeight: toNumber(values.filePixelHeight),
            printWidth: area.designWidth,
            printHeight: area.designHeight,
          })
        : { error: area.error },
    [ok, area, values.filePixelWidth, values.filePixelHeight],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `T-shirt print area — ${area.size.label} on a ${area.platen.label}`,
      `Garment allows ${inches(area.garmentWidth)} x ${inches(area.garmentHeight)}`,
      `Maximum print area: ${inches(area.maxWidth)} x ${inches(area.maxHeight)}`,
      `Design at ${values.ratioWidth}:${values.ratioHeight} fits ${inches(area.designWidth)} x ${inches(area.designHeight)}`,
      `Export at ${area.dpi} DPI: ${px(area.pixelWidth)} x ${px(area.pixelHeight)}`,
      `Top edge sits ${inches(area.topEdgeBelowCollar)} below the collar seam`,
    ].join("\n");
  }, [ok, area, values.ratioWidth, values.ratioHeight]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Merch and print
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          T Shirt Print Area Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The smaller of two limits decides your print: the garment once seam and hem clearances come
          off, and the press platen. This works out both, fits your artwork inside, and gives the
          pixel size to export.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-size">
              Garment size
            </label>
            <select
              id="ts-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.sizeKey}
              onChange={setField("sizeKey")}
            >
              {GARMENT_SIZES.map((size) => (
                <option key={size.key} value={size.key}>
                  {size.label} — {size.chestWidth} x {size.bodyLength} in flat
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-platen">
              Platen / press area
            </label>
            <select
              id="ts-platen"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.platenKey}
              onChange={setField("platenKey")}
            >
              {PLATEN_SIZES.map((platen) => (
                <option key={platen.key} value={platen.key}>
                  {platen.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-side">
              Clearance from each side seam (in)
            </label>
            <input
              id="ts-side"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={values.sideMargin}
              onChange={setField("sideMargin")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-hem">
              Clearance above the hem (in)
            </label>
            <input
              id="ts-hem"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={values.hemMargin}
              onChange={setField("hemMargin")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-collar">
              Top edge below the collar seam (in)
            </label>
            <input
              id="ts-collar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={values.collarDrop}
              onChange={setField("collarDrop")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-dpi">
              Export resolution (DPI)
            </label>
            <input
              id="ts-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="72"
              max="1200"
              step="50"
              value={values.dpi}
              onChange={setField("dpi")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-ratio-w">
              Artwork width ratio
            </label>
            <input
              id="ts-ratio-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="1"
              value={values.ratioWidth}
              onChange={setField("ratioWidth")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-ratio-h">
              Artwork height ratio
            </label>
            <input
              id="ts-ratio-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="1"
              value={values.ratioHeight}
              onChange={setField("ratioHeight")}
            />
          </div>
        </div>
      </section>

      {area.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {area.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Maximum print area
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM2.format(area.maxWidth)} x ${NUM2.format(area.maxHeight)} in` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Width limited by the ${area.widthLimitedBy}, height limited by the ${area.heightLimitedBy}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy print area result"
              className={GHOST_BTN}
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
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Garment allows",
              ok ? `${inches(area.garmentWidth)} x ${inches(area.garmentHeight)}` : DASH,
            ],
            [
              "Your artwork fits",
              ok ? `${inches(area.designWidth)} x ${inches(area.designHeight)}` : DASH,
            ],
            ["Printed area", ok ? `${NUM2.format(area.designAreaSqIn)} sq in` : DASH],
            [
              `Export at ${values.dpi} DPI`,
              ok ? `${px(area.pixelWidth)} x ${px(area.pixelHeight)}` : DASH,
            ],
            ["Top edge below the collar seam", ok ? inches(area.topEdgeBelowCollar) : DASH],
            ["Bottom edge above the hem", ok ? inches(area.bottomEdgeAboveHem) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !preview.error ? (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              To scale on the garment front
            </p>
            <div
              className="relative mx-auto w-full max-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              style={{ aspectRatio: String(preview.garmentAspectRatio) }}
              role="img"
              aria-label={`Print of ${NUM2.format(area.designWidth)} by ${NUM2.format(area.designHeight)} inches placed ${NUM2.format(area.collarDrop)} inches below the collar on an ${area.size.label} tee`}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-sm border border-dashed border-[var(--primary)]"
                style={{
                  top: `${preview.printTopPercent}%`,
                  width: `${preview.maxWidthPercent}%`,
                  height: `${preview.maxHeightPercent}%`,
                }}
              />
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-sm bg-[var(--primary)]/30"
                style={{
                  top: `${preview.printTopPercent}%`,
                  width: `${preview.printWidthPercent}%`,
                  height: `${preview.printHeightPercent}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Dashed box is the maximum area; filled box is your artwork.
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every size on this platen</h2>
        {run.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {run.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Max area
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Artwork fits
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Export px
                  </th>
                </tr>
              </thead>
              <tbody>
                {run.rows.map((row) => (
                  <tr key={row.size.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.size.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.maxWidth)} x {NUM2.format(row.maxHeight)} in
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {NUM2.format(row.designWidth)} x {NUM2.format(row.designHeight)} in
                    </td>
                    <td className="py-2 text-right">
                      {NUM0.format(row.pixelWidth)} x {NUM0.format(row.pixelHeight)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Standard placements</h2>
        {placements.error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Placement
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Measured from
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Top offset
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Max width
                  </th>
                </tr>
              </thead>
              <tbody>
                {placements.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.landmark}</td>
                    <td className="py-2 pr-3 text-right">{inches(row.topOffset)}</td>
                    <td className="py-2 text-right">{inches(row.maxWidth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Is your file sharp enough?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-file-w">
              Artwork file width (px)
            </label>
            <input
              id="ts-file-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={values.filePixelWidth}
              onChange={setField("filePixelWidth")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-file-h">
              Artwork file height (px)
            </label>
            <input
              id="ts-file-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={values.filePixelHeight}
              onChange={setField("filePixelHeight")}
            />
          </div>
        </div>
        {resolution.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {resolution.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            At the fitted print size this file lands at{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {NUM0.format(resolution.effectiveDpi)} DPI
            </span>
            {resolution.idealEnough
              ? " — comfortably sharp for garment printing."
              : resolution.goodEnough
                ? ` — above the ${MIN_ACCEPTABLE_DPI} DPI floor but softer than a 300 DPI export.`
                : ` — below the ${MIN_ACCEPTABLE_DPI} DPI floor, so the print will look soft.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Garment measurements follow a typical unisex heavy-cotton tee chart and placements follow
        common decorator conventions. Always check the actual spec sheet for the blank you are using
        and confirm the platen size with your printer before sending artwork.
      </p>
    </main>
  );
}
