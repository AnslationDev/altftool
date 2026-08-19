"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";

import {
  CARD_SIZES,
  FOLD_AXES,
  FOLD_TYPES,
  STOCK_GUIDE,
  computeWeddingCardSpec,
} from "../lib";

const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sizeId: "6x9",
  width: "152.4",
  height: "228.6",
  unit: "mm",
  foldId: "bifold",
  foldAxis: "width",
  bleed: "3",
  safe: "5",
  cardGsm: "300",
  insertCount: "1",
  insertGsm: "250",
  envelopeGsm: "120",
  quantity: "200",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const dim = (w, h) => `${MM.format(w)} x ${MM.format(h)} mm`;

export default function ToolHome() {
  const [sizeId, setSizeId] = useState(DEFAULTS.sizeId);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [foldId, setFoldId] = useState(DEFAULTS.foldId);
  const [foldAxis, setFoldAxis] = useState(DEFAULTS.foldAxis);
  const [bleed, setBleed] = useState(DEFAULTS.bleed);
  const [safe, setSafe] = useState(DEFAULTS.safe);
  const [cardGsm, setCardGsm] = useState(DEFAULTS.cardGsm);
  const [insertCount, setInsertCount] = useState(DEFAULTS.insertCount);
  const [insertGsm, setInsertGsm] = useState(DEFAULTS.insertGsm);
  const [envelopeGsm, setEnvelopeGsm] = useState(DEFAULTS.envelopeGsm);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWeddingCardSpec({
        width: toNumber(width),
        height: toNumber(height),
        unit,
        foldId,
        foldAxis,
        bleedMm: toNumber(bleed),
        safeMm: toNumber(safe),
        cardGsm: toNumber(cardGsm),
        insertCount: toNumber(insertCount),
        insertGsm: toNumber(insertGsm),
        envelopeGsm: toNumber(envelopeGsm),
        quantity: toNumber(quantity),
      }),
    [
      width,
      height,
      unit,
      foldId,
      foldAxis,
      bleed,
      safe,
      cardGsm,
      insertCount,
      insertGsm,
      envelopeGsm,
      quantity,
    ],
  );

  const hasError = Boolean(result.error);

  const pickSize = (id) => {
    setSizeId(id);
    const preset = CARD_SIZES.find((size) => size.id === id);
    if (!preset) return;
    setUnit("mm");
    setWidth(String(preset.widthMm));
    setHeight(String(preset.heightMm));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Wedding Card Print Spec (India)",
      `Finished (folded) size: ${dim(result.finishedWidthMm, result.finishedHeightMm)}`,
      `Fold: ${result.foldLabel}`,
      `Flat artwork size: ${dim(result.flatWidthMm, result.flatHeightMm)}`,
      `Document with bleed: ${dim(result.docWidthMm, result.docHeightMm)}`,
      `Safe area: ${dim(result.safeWidthMm, result.safeHeightMm)}`,
      `Envelope internal size: ${dim(result.envelopeWidthMm, result.envelopeHeightMm)}`,
      ...result.insertSizes.map(
        (insert) => `Insert ${insert.index}: ${dim(insert.widthMm, insert.heightMm)}`,
      ),
      `Weight per invitation: ${NUM2.format(result.perInviteGrams)} g`,
      `Order of ${INT.format(result.quantity)}: ${NUM2.format(result.totalKg)} kg, stack ${INT.format(result.stackHeightMm)} mm`,
      `Courier billable weight: ${NUM2.format(result.billableKg)} kg`,
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
    setSizeId(DEFAULTS.sizeId);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setUnit(DEFAULTS.unit);
    setFoldId(DEFAULTS.foldId);
    setFoldAxis(DEFAULTS.foldAxis);
    setBleed(DEFAULTS.bleed);
    setSafe(DEFAULTS.safe);
    setCardGsm(DEFAULTS.cardGsm);
    setInsertCount(DEFAULTS.insertCount);
    setInsertGsm(DEFAULTS.insertGsm);
    setEnvelopeGsm(DEFAULTS.envelopeGsm);
    setQuantity(DEFAULTS.quantity);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Wedding stationery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Wedding Card Print Size Guide India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a trade size, a fold and your paper weights. You get the flat artwork size the press
          needs, the document with bleed, envelope and insert dimensions, and the weight of one
          invitation and of the whole order.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wc-size">
              Trade size
            </label>
            <select
              id="wc-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeId}
              onChange={(event) => pickSize(event.target.value)}
            >
              {CARD_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-width">
              Finished (folded) width
            </label>
            <input
              id="wc-width"
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
            <label className={LABEL_CLASS} htmlFor="wc-height">
              Finished (folded) height
            </label>
            <input
              id="wc-height"
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
            <label className={LABEL_CLASS} htmlFor="wc-unit">
              Size unit
            </label>
            <select
              id="wc-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="mm">Millimetres</option>
              <option value="cm">Centimetres</option>
              <option value="in">Inches</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-fold">
              Fold style
            </label>
            <select
              id="wc-fold"
              className={`mt-2 ${INPUT_CLASS}`}
              value={foldId}
              onChange={(event) => setFoldId(event.target.value)}
            >
              {FOLD_TYPES.map((fold) => (
                <option key={fold.id} value={fold.id}>
                  {fold.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wc-axis">
              Fold direction
            </label>
            <select
              id="wc-axis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={foldAxis}
              onChange={(event) => setFoldAxis(event.target.value)}
            >
              {FOLD_AXES.map((axis) => (
                <option key={axis.id} value={axis.id}>
                  {axis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-bleed">
              Bleed per edge (mm)
            </label>
            <input
              id="wc-bleed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bleed}
              onChange={(event) => setBleed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-safe">
              Safe margin (mm)
            </label>
            <input
              id="wc-safe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={safe}
              onChange={(event) => setSafe(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-card-gsm">
              Card stock (GSM)
            </label>
            <input
              id="wc-card-gsm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={cardGsm}
              onChange={(event) => setCardGsm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-inserts">
              Number of inserts
            </label>
            <input
              id="wc-inserts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={insertCount}
              onChange={(event) => setInsertCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-insert-gsm">
              Insert stock (GSM)
            </label>
            <input
              id="wc-insert-gsm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={insertGsm}
              onChange={(event) => setInsertGsm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wc-env-gsm">
              Envelope stock (GSM)
            </label>
            <input
              id="wc-env-gsm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={envelopeGsm}
              onChange={(event) => setEnvelopeGsm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wc-qty">
              Invitations to print
            </label>
            <input
              id="wc-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="25"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Flat artwork size to set up
            </p>
            <p
              className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl"
              aria-live="polite"
            >
              {hasError ? DASH : dim(result.flatWidthMm, result.flatHeightMm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the artwork size."
                : `${result.foldLabel} - ${result.panels} panel${result.panels > 1 ? "s" : ""} across, folds to ${dim(result.finishedWidthMm, result.finishedHeightMm)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied" : "Copy wedding card print spec"}
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite">
          {[
            ["Document size with bleed", hasError ? DASH : dim(result.docWidthMm, result.docHeightMm)],
            ["Safe area on each panel", hasError ? DASH : dim(result.safeWidthMm, result.safeHeightMm)],
            [
              "Envelope internal size to order",
              hasError ? DASH : dim(result.envelopeWidthMm, result.envelopeHeightMm),
            ],
            [
              "Weight of one invitation",
              hasError ? DASH : `${NUM2.format(result.perInviteGrams)} g`,
            ],
            [
              "- Card weight",
              hasError ? DASH : `${NUM2.format(result.cardWeightG)} g`,
            ],
            [
              "- Insert weight",
              hasError ? DASH : `${NUM2.format(result.insertWeightG)} g`,
            ],
            [
              "- Envelope weight",
              hasError ? DASH : `${NUM2.format(result.envelopeWeightG)} g`,
            ],
            [
              "Thickness of one invitation",
              hasError ? DASH : `${NUM2.format(result.stackPerInviteMm)} mm`,
            ],
            [
              "Total paper weight for the order",
              hasError ? DASH : `${NUM2.format(result.totalKg)} kg`,
            ],
            [
              "Stack height of the order",
              hasError ? DASH : `${INT.format(result.stackHeightMm)} mm`,
            ],
            [
              "Courier billable weight",
              hasError
                ? DASH
                : `${NUM2.format(result.billableKg)} kg (volumetric ${NUM2.format(result.volumetricKg)} kg)`,
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
        <h2 className="text-base font-semibold">Insert card sizes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each insert steps down 6 mm on both sides so the stack fans out when the folder is opened.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Piece
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Trim size
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError || result.insertSizes.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">
                    {hasError ? DASH : "No inserts selected"}
                  </td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.insertSizes.map((insert) => (
                  <tr key={insert.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Insert {insert.index}</td>
                    <td className="py-2 text-right">{dim(insert.widthMm, insert.heightMm)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Paper weights printers usually stock</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Component
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Usual range
                </th>
              </tr>
            </thead>
            <tbody>
              {STOCK_GUIDE.map((row) => (
                <tr key={row.part} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.part}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights are paper-only estimates from GSM and area; foiling, laser-cut waste, ribbons, wax
        seals, tassels and rigid boxes add more. Confirm bleed, envelope tolerance and gutter
        allowance with your printer before releasing files.
      </p>
    </main>
  );
}
