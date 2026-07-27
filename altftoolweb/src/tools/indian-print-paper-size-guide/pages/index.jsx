"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  PAPER_GROUPS,
  PAPER_SIZES,
  describeSize,
  fitOnSheet,
  findSize,
  sheetWeightGrams,
} from "../lib";

const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const IN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const PT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sizeId: "a4",
  dpi: "300",
  gsm: "80",
  sheetId: "sra3",
  pieceId: "a4",
  gripper: "10",
  gutter: "6",
  query: "",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sizeId, setSizeId] = useState(DEFAULTS.sizeId);
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [gsm, setGsm] = useState(DEFAULTS.gsm);
  const [sheetId, setSheetId] = useState(DEFAULTS.sheetId);
  const [pieceId, setPieceId] = useState(DEFAULTS.pieceId);
  const [gripper, setGripper] = useState(DEFAULTS.gripper);
  const [gutter, setGutter] = useState(DEFAULTS.gutter);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [copied, setCopied] = useState(false);

  const selected = findSize(sizeId) || PAPER_SIZES[0];

  const detail = useMemo(
    () => describeSize(selected.w, selected.h, toNumber(dpi)),
    [selected, dpi],
  );

  const weight = useMemo(() => {
    const g = toNumber(gsm);
    if (!Number.isFinite(g) || g <= 0) return null;
    return sheetWeightGrams(selected.w, selected.h, g);
  }, [selected, gsm]);

  const imposition = useMemo(() => {
    const sheet = findSize(sheetId);
    const piece = findSize(pieceId);
    if (!sheet || !piece) return { error: "Pick a press sheet and a finished piece." };
    return fitOnSheet({
      sheetW: sheet.w,
      sheetH: sheet.h,
      pieceW: piece.w,
      pieceH: piece.h,
      gripper: toNumber(gripper),
      gutter: toNumber(gutter),
    });
  }, [sheetId, pieceId, gripper, gutter]);

  const detailError = Boolean(detail.error);
  const imposeError = Boolean(imposition.error);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAPER_SIZES;
    return PAPER_SIZES.filter(
      (size) =>
        size.name.toLowerCase().includes(q) ||
        size.group.toLowerCase().includes(q) ||
        `${size.w}x${size.h}`.includes(q),
    );
  }, [query]);

  const summary = useMemo(() => {
    if (detailError) return "";
    return [
      `${selected.name} - ${selected.group}`,
      `Millimetres: ${MM.format(detail.mm.w)} x ${MM.format(detail.mm.h)} mm`,
      `Centimetres: ${MM.format(detail.cm.w)} x ${MM.format(detail.cm.h)} cm`,
      `Inches: ${IN.format(detail.inch.w)} x ${IN.format(detail.inch.h)} in`,
      `Points: ${PT.format(detail.points.w)} x ${PT.format(detail.points.h)} pt`,
      `Pixels at ${INT.format(detail.dpi)} DPI: ${INT.format(detail.pixels.w)} x ${INT.format(detail.pixels.h)} px`,
      `CSS pixels at 96 PPI: ${INT.format(detail.cssPx.w)} x ${INT.format(detail.cssPx.h)} px`,
      `Area: ${NUM3.format(detail.areaSqm)} sq m`,
      weight === null ? "" : `Sheet weight at ${INT.format(toNumber(gsm))} GSM: ${NUM3.format(weight)} g`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [detailError, detail, selected, weight, gsm]);

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
    setDpi(DEFAULTS.dpi);
    setGsm(DEFAULTS.gsm);
    setSheetId(DEFAULTS.sheetId);
    setPieceId(DEFAULTS.pieceId);
    setGripper(DEFAULTS.gripper);
    setGutter(DEFAULTS.gutter);
    setQuery(DEFAULTS.query);
    setCopied(false);
  };

  const sizeOptions = PAPER_GROUPS.map((group) => (
    <optgroup key={group} label={group}>
      {PAPER_SIZES.filter((size) => size.group === group).map((size) => (
        <option key={size.id} value={size.id}>
          {size.name}
        </option>
      ))}
    </optgroup>
  ));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Paper reference
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Indian Print Paper Size Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every size an Indian press job runs into — A and B series, legal and foolscap, RA and SRA
          raw sheets, and the British trade names still used in paper markets — in millimetres,
          inches, points and pixels, with an ups-per-sheet check.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ps-size">
              Paper size
            </label>
            <select
              id="ps-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeId}
              onChange={(event) => setSizeId(event.target.value)}
            >
              {sizeOptions}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-dpi">
              Resolution for pixel figures (DPI)
            </label>
            <input
              id="ps-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={dpi}
              onChange={(event) => setDpi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-gsm">
              Paper weight (GSM)
            </label>
            <input
              id="ps-gsm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={gsm}
              onChange={(event) => setGsm(event.target.value)}
            />
          </div>
        </div>
      </section>

      {detailError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {detail.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {selected.name}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {detailError ? DASH : `${MM.format(detail.mm.w)} x ${MM.format(detail.mm.h)} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {detailError
                ? "Fix the input above to see the conversions."
                : `${selected.group} · aspect ratio 1 : ${NUM3.format(detail.aspectRatio)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy paper size conversions"
              className={GHOST_BTN}
              disabled={detailError}
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
              "Centimetres",
              detailError ? DASH : `${MM.format(detail.cm.w)} x ${MM.format(detail.cm.h)} cm`,
            ],
            [
              "Inches",
              detailError ? DASH : `${IN.format(detail.inch.w)} x ${IN.format(detail.inch.h)} in`,
            ],
            [
              "Points (PDF / PostScript)",
              detailError
                ? DASH
                : `${PT.format(detail.points.w)} x ${PT.format(detail.points.h)} pt`,
            ],
            [
              detailError ? "Pixels" : `Pixels at ${INT.format(detail.dpi)} DPI`,
              detailError
                ? DASH
                : `${INT.format(detail.pixels.w)} x ${INT.format(detail.pixels.h)} px`,
            ],
            [
              "CSS pixels at 96 PPI",
              detailError
                ? DASH
                : `${INT.format(detail.cssPx.w)} x ${INT.format(detail.cssPx.h)} px`,
            ],
            ["Area", detailError ? DASH : `${NUM3.format(detail.areaSqm)} sq m`],
            [
              "Weight of one sheet",
              detailError || weight === null ? DASH : `${NUM3.format(weight)} g`,
            ],
            [
              "Weight of a 500-sheet ream",
              detailError || weight === null ? DASH : `${NUM3.format((weight * 500) / 1000)} kg`,
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
        <h2 className="text-base font-semibold">How many fit on a press sheet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-sheet">
              Press sheet
            </label>
            <select
              id="ps-sheet"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheetId}
              onChange={(event) => setSheetId(event.target.value)}
            >
              {sizeOptions}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-piece">
              Finished piece
            </label>
            <select
              id="ps-piece"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pieceId}
              onChange={(event) => setPieceId(event.target.value)}
            >
              {sizeOptions}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-gripper">
              Gripper / edge margin (mm)
            </label>
            <input
              id="ps-gripper"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={gripper}
              onChange={(event) => setGripper(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-gutter">
              Knife gap between pieces (mm)
            </label>
            <input
              id="ps-gutter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={gutter}
              onChange={(event) => setGutter(event.target.value)}
            />
          </div>
        </div>

        {imposeError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {imposition.error}
          </p>
        )}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pieces per sheet (ups)", imposeError ? DASH : INT.format(imposition.ups)],
            [
              "Grid",
              imposeError
                ? DASH
                : `${INT.format(imposition.cols)} across x ${INT.format(imposition.rows)} down${imposition.rotated ? " (piece rotated)" : ""}`,
            ],
            [
              "Usable area after gripper",
              imposeError
                ? DASH
                : `${MM.format(imposition.usableW)} x ${MM.format(imposition.usableH)} mm`,
            ],
            ["Sheet used", imposeError ? DASH : PCT.format(imposition.usedAreaShare)],
            ["Trim waste", imposeError ? DASH : PCT.format(imposition.wasteAreaShare)],
            [
              "Sheets needed for 1,000 pieces",
              imposeError ? DASH : INT.format(imposition.sheetsFor1000),
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
        <h2 className="text-base font-semibold">Full size reference</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="ps-search">
          Search sizes
        </label>
        <input
          id="ps-search"
          className={`mt-2 ${INPUT_CLASS}`}
          type="search"
          placeholder="A4, legal, foolscap, royal, SRA3..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Millimetres
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Inches
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold" colSpan={3}>
                    No size matches that search.
                  </td>
                </tr>
              ) : (
                filtered.map((size) => {
                  const inches = describeSize(size.w, size.h).inch;
                  return (
                    <tr key={size.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {size.name}
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          {size.group}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {MM.format(size.w)} x {MM.format(size.h)}
                      </td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {IN.format(inches.w)} x {IN.format(inches.h)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        ISO 216 sizes are exact as published; trade sheet sizes are nominal and mills cut with a
        tolerance, so measure a sample before planning a tight imposition. Ups counts ignore
        collation, work-and-turn and folding constraints — confirm with your printer.
      </p>
    </main>
  );
}
