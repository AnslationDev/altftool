"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingBag } from "lucide-react";
import {
  MIN_ACCEPTABLE_DPI,
  PLATEN_SIZES,
  TOTE_SIZES,
  buildPreviewGeometry,
  buildToteRun,
  checkResolution,
  computeTotePlacement,
} from "../lib";

const DEFAULTS = {
  sizeKey: "classic",
  platenKey: "none",
  sideMargin: "1",
  handleStitchDrop: "3",
  clearanceBelowHandles: "1",
  bottomClearance: "2",
  ratioWidth: "1",
  ratioHeight: "1",
  dpi: "300",
  verticalAlign: "center",
  filePixelWidth: "2400",
  filePixelHeight: "2400",
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

const CLEARANCE_FIELDS = [
  ["sideMargin", "Clear of each side seam (in)"],
  ["handleStitchDrop", "Handle stitching ends this far below the top (in)"],
  ["clearanceBelowHandles", "Extra clear space below the handles (in)"],
  ["bottomClearance", "Clear above the base seam (in)"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const options = useMemo(
    () => ({
      platenKey: values.platenKey,
      sideMargin: toNumber(values.sideMargin),
      handleStitchDrop: toNumber(values.handleStitchDrop),
      clearanceBelowHandles: toNumber(values.clearanceBelowHandles),
      bottomClearance: toNumber(values.bottomClearance),
      designRatioWidth: toNumber(values.ratioWidth),
      designRatioHeight: toNumber(values.ratioHeight),
      dpi: toNumber(values.dpi),
      verticalAlign: values.verticalAlign,
    }),
    [values],
  );

  const placement = useMemo(
    () => computeTotePlacement({ ...options, sizeKey: values.sizeKey }),
    [options, values.sizeKey],
  );

  const ok = !placement.error;

  const run = useMemo(() => buildToteRun(options), [options]);
  const preview = useMemo(() => buildPreviewGeometry(placement), [placement]);

  const resolution = useMemo(
    () =>
      ok
        ? checkResolution({
            pixelWidth: toNumber(values.filePixelWidth),
            pixelHeight: toNumber(values.filePixelHeight),
            printWidth: placement.designWidth,
            printHeight: placement.designHeight,
          })
        : { error: placement.error },
    [ok, placement, values.filePixelWidth, values.filePixelHeight],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Tote placement — ${placement.tote.label} (${placement.tote.width} x ${placement.tote.height} in, ${placement.tote.gussetDepth} in gusset)`,
      `Safe print area: ${inches(placement.usableWidth)} x ${inches(placement.usableHeight)}`,
      `Artwork fits ${inches(placement.designWidth)} x ${inches(placement.designHeight)}`,
      `Place it ${inches(placement.topOffset)} from the top edge and ${inches(placement.leftOffset)} from the left edge`,
      `Export at ${placement.dpi} DPI: ${NUM0.format(placement.pixelWidth)} x ${NUM0.format(placement.pixelHeight)} px`,
      `Gusset wrap allowed for: ${inches(placement.gussetWrap)}`,
    ].join("\n");
  }, [ok, placement]);

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
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Merch and print
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tote Bag Artwork Placement Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Totes lose print space at both ends: the handle stitching at the top and, on a box-bottom
          bag, roughly half the gusset that folds under to make the base. This works out what is
          genuinely left and where to put the artwork.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-size">
              Tote size
            </label>
            <select
              id="tb-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.sizeKey}
              onChange={setField("sizeKey")}
            >
              {TOTE_SIZES.map((size) => (
                <option key={size.key} value={size.key}>
                  {size.label} — {size.width} x {size.height} in, {size.gussetDepth} in gusset
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-platen">
              Press platen
            </label>
            <select
              id="tb-platen"
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
          {CLEARANCE_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`tb-${key}`}>
                {label}
              </label>
              <input
                id={`tb-${key}`}
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
            <label className={LABEL_CLASS} htmlFor="tb-ratio-w">
              Artwork width ratio
            </label>
            <input
              id="tb-ratio-w"
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
            <label className={LABEL_CLASS} htmlFor="tb-ratio-h">
              Artwork height ratio
            </label>
            <input
              id="tb-ratio-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="1"
              value={values.ratioHeight}
              onChange={setField("ratioHeight")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-align">
              Vertical position
            </label>
            <select
              id="tb-align"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.verticalAlign}
              onChange={setField("verticalAlign")}
            >
              <option value="center">Centred in the safe area</option>
              <option value="top">Aligned to the top of the safe area</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-dpi">
              Export resolution (DPI)
            </label>
            <input
              id="tb-dpi"
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
        </div>
      </section>

      {placement.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {placement.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Safe print area
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? `${NUM2.format(placement.usableWidth)} x ${NUM2.format(placement.usableHeight)} in`
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Width limited by the ${placement.widthLimitedBy}, height limited by the ${placement.heightLimitedBy}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tote placement result"
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
              "Artwork fits",
              ok ? `${inches(placement.designWidth)} x ${inches(placement.designHeight)}` : DASH,
            ],
            ["Measure from the top edge", ok ? inches(placement.topOffset) : DASH],
            ["Measure from the left edge", ok ? inches(placement.leftOffset) : DASH],
            ["Gap left below the artwork", ok ? inches(placement.bottomOffset) : DASH],
            ["Reserved for handles at the top", ok ? inches(placement.topReserved) : DASH],
            ["Reserved at the base (incl. gusset wrap)", ok ? inches(placement.bottomReserved) : DASH],
            [
              `Export at ${values.dpi} DPI`,
              ok
                ? `${NUM0.format(placement.pixelWidth)} x ${NUM0.format(placement.pixelHeight)} px`
                : DASH,
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
              To scale on the flat front panel
            </p>
            <div
              className="relative mx-auto w-full max-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              style={{ aspectRatio: String(preview.panelAspectRatio) }}
              role="img"
              aria-label={`Artwork ${NUM2.format(placement.designWidth)} by ${NUM2.format(placement.designHeight)} inches placed ${NUM2.format(placement.topOffset)} inches from the top of a ${placement.tote.label}`}
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
                  top: `${preview.designTopPercent}%`,
                  width: `${preview.designWidthPercent}%`,
                  height: `${preview.designHeightPercent}%`,
                }}
              />
              <span
                className="absolute inset-x-0 bottom-0 border-t border-dotted border-[var(--muted-foreground)]"
                style={{ height: `${preview.gussetPercent}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Dashed box is the safe area, filled box is your artwork, the dotted strip at the base is
              the part that folds under.
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every tote size with these clearances</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tote
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Safe area
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Artwork fits
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  From top
                </th>
              </tr>
            </thead>
            <tbody>
              {run.rows.map((row) =>
                row.error ? (
                  <tr key={row.tote.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.tote.label}</td>
                    <td className="py-2 text-[var(--danger)]" colSpan={3}>
                      {row.error}
                    </td>
                  </tr>
                ) : (
                  <tr key={row.tote.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.tote.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.usableWidth)} x {NUM2.format(row.usableHeight)} in
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {NUM2.format(row.designWidth)} x {NUM2.format(row.designHeight)} in
                    </td>
                    <td className="py-2 text-right">{NUM2.format(row.topOffset)} in</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Is your file sharp enough?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-file-w">
              Artwork file width (px)
            </label>
            <input
              id="tb-file-w"
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
            <label className={LABEL_CLASS} htmlFor="tb-file-h">
              Artwork file height (px)
            </label>
            <input
              id="tb-file-h"
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
            At the fitted size this file lands at{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {NUM0.format(resolution.effectiveDpi)} DPI
            </span>
            {resolution.idealEnough
              ? " — sharp enough for canvas or cotton."
              : resolution.goodEnough
                ? ` — above the ${MIN_ACCEPTABLE_DPI} DPI floor but not a full 300 DPI export.`
                : ` — below the ${MIN_ACCEPTABLE_DPI} DPI floor, so expect a soft print.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Blank dimensions and handle positions vary between suppliers. Measure the actual bag flat
        before sending artwork, and ask your printer to confirm the platen and the base fold.
      </p>
    </main>
  );
}
