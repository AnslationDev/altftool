"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Frame, RotateCcw } from "lucide-react";
import {
  HOODIE_SIZES,
  MIN_ACCEPTABLE_DPI,
  PANELS,
  PLATEN_SIZES,
  buildPreviewGeometry,
  buildSizeRun,
  checkResolution,
  computeHoodieArea,
  resolvePlacements,
} from "../lib";

const DEFAULTS = {
  sizeKey: "L",
  panel: "front",
  platenKey: "14x16",
  sideMargin: "1",
  neckDrop: "3.5",
  pocketTopFromHem: "10",
  pocketClearance: "1",
  hemMargin: "3",
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

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

const MEASURE_FIELDS = [
  ["sideMargin", "Clear of each side seam (in)"],
  ["neckDrop", "Top of print below the hood seam (in)"],
  ["pocketTopFromHem", "Pocket top seam above the hem (in)"],
  ["pocketClearance", "Clear above the pocket seam (in)"],
  ["hemMargin", "Clear above the waistband, back print (in)"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const options = useMemo(
    () => ({
      panel: values.panel,
      platenKey: values.platenKey,
      sideMargin: toNumber(values.sideMargin),
      neckDrop: toNumber(values.neckDrop),
      pocketTopFromHem: toNumber(values.pocketTopFromHem),
      pocketClearance: toNumber(values.pocketClearance),
      hemMargin: toNumber(values.hemMargin),
      designRatioWidth: toNumber(values.ratioWidth),
      designRatioHeight: toNumber(values.ratioHeight),
      dpi: toNumber(values.dpi),
    }),
    [values],
  );

  const area = useMemo(
    () => computeHoodieArea({ ...options, sizeKey: values.sizeKey }),
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

  const panelLabel = PANELS.find((item) => item.key === values.panel)?.label ?? values.panel;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Hoodie placement — ${area.size.label}, ${panelLabel}`,
      `Usable area: ${inches(area.usableWidth)} x ${inches(area.usableHeight)}`,
      `Capped by the platen at ${inches(area.maxWidth)} x ${inches(area.maxHeight)}`,
      `Artwork fits ${inches(area.designWidth)} x ${inches(area.designHeight)}`,
      `Top edge ${inches(area.topOffset)} below the hood seam, ${inches(area.leftOffset)} in from the left edge`,
      `Export at ${area.dpi} DPI: ${NUM0.format(area.pixelWidth)} x ${NUM0.format(area.pixelHeight)} px`,
    ].join("\n");
  }, [ok, area, panelLabel]);

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
          <Frame className="h-4 w-4" aria-hidden="true" />
          Merch and print
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hoodie Print Placement Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A front print on a hoodie has to finish above the kangaroo pocket seam, which is why the
          same design that fits a tee will not fit here. Work out the real area, front and back, and
          the measurements to mark on the garment.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hd-size">
              Hoodie size
            </label>
            <select
              id="hd-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.sizeKey}
              onChange={setField("sizeKey")}
            >
              {HOODIE_SIZES.map((size) => (
                <option key={size.key} value={size.key}>
                  {size.label} — {size.chestWidth} x {size.bodyLength} in flat
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hd-panel">
              Panel
            </label>
            <select
              id="hd-panel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.panel}
              onChange={setField("panel")}
            >
              {PANELS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hd-platen">
              Press platen
            </label>
            <select
              id="hd-platen"
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
            <label className={LABEL_CLASS} htmlFor="hd-dpi">
              Export resolution (DPI)
            </label>
            <input
              id="hd-dpi"
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
          {MEASURE_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`hd-${key}`}>
                {label}
              </label>
              <input
                id={`hd-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={values[key]}
                onChange={setField(key)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="hd-ratio-w">
              Artwork width ratio
            </label>
            <input
              id="hd-ratio-w"
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
            <label className={LABEL_CLASS} htmlFor="hd-ratio-h">
              Artwork height ratio
            </label>
            <input
              id="hd-ratio-h"
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
              Artwork fits
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? `${NUM2.format(area.designWidth)} x ${NUM2.format(area.designHeight)} in`
                : DASH}
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
              aria-label="Copy hoodie placement result"
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
              "Usable area on this panel",
              ok ? `${inches(area.usableWidth)} x ${inches(area.usableHeight)}` : DASH,
            ],
            [
              "After the platen cap",
              ok ? `${inches(area.maxWidth)} x ${inches(area.maxHeight)}` : DASH,
            ],
            ["Top edge below the hood seam", ok ? inches(area.topOffset) : DASH],
            ["In from the left edge", ok ? inches(area.leftOffset) : DASH],
            [
              "Gap left above the pocket seam",
              ok && area.gapAbovePocket !== null ? inches(area.gapAbovePocket) : DASH,
            ],
            [
              `Export at ${values.dpi} DPI`,
              ok ? `${NUM0.format(area.pixelWidth)} x ${NUM0.format(area.pixelHeight)} px` : DASH,
            ],
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
              To scale on the flat panel
            </p>
            <div
              className="relative mx-auto w-full max-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              style={{ aspectRatio: String(preview.panelAspectRatio) }}
              role="img"
              aria-label={`Artwork ${NUM2.format(area.designWidth)} by ${NUM2.format(area.designHeight)} inches placed ${NUM2.format(area.topOffset)} inches below the hood seam on an ${area.size.label} hoodie`}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-sm border border-dashed border-[var(--primary)]"
                style={{
                  top: `${preview.safeTopPercent}%`,
                  width: `${preview.safeWidthPercent}%`,
                  height: `${preview.safeHeightPercent}%`,
                }}
              />
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-sm bg-[var(--primary)]/30"
                style={{
                  top: `${preview.safeTopPercent}%`,
                  width: `${preview.designWidthPercent}%`,
                  height: `${preview.designHeightPercent}%`,
                }}
              />
              <span
                className="absolute inset-x-0 bottom-0 border-t border-dotted border-[var(--muted-foreground)]"
                style={{ height: `${preview.bottomReservedPercent}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Dashed box is the safe area, filled box is your artwork, the dotted strip is the pocket
              or hem zone you cannot print on.
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every size on this panel</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Usable area
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
              {run.rows.map((row) =>
                row.error ? (
                  <tr key={row.size.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.size.label}</td>
                    <td className="py-2 text-[var(--danger)]" colSpan={3}>
                      {row.error}
                    </td>
                  </tr>
                ) : (
                  <tr key={row.size.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.size.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.usableWidth)} x {NUM2.format(row.usableHeight)} in
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {NUM2.format(row.designWidth)} x {NUM2.format(row.designHeight)} in
                    </td>
                    <td className="py-2 text-right">
                      {NUM0.format(row.pixelWidth)} x {NUM0.format(row.pixelHeight)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Placement measurements</h2>
        {placements.error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {placements.rows.map((row) => (
              <li
                key={row.key}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {inches(row.topOffset)} from the {row.landmark.toLowerCase()} · max{" "}
                    {inches(row.maxWidth)} wide
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{row.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Is your file sharp enough?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hd-file-w">
              Artwork file width (px)
            </label>
            <input
              id="hd-file-w"
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
            <label className={LABEL_CLASS} htmlFor="hd-file-h">
              Artwork file height (px)
            </label>
            <input
              id="hd-file-h"
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
              ? " — sharp enough for fleece."
              : resolution.goodEnough
                ? ` — above the ${MIN_ACCEPTABLE_DPI} DPI floor but softer than a 300 DPI export.`
                : ` — below the ${MIN_ACCEPTABLE_DPI} DPI floor, so the print will look soft.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pocket position, hood construction and body length vary a lot between blanks. Measure the
        actual hoodie flat, especially the pocket seam, and confirm platen sizes with your printer
        before sending artwork.
      </p>
    </main>
  );
}
