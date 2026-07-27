"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  BASIS_GRADES,
  GSM_REFERENCE,
  PAPER_BULKS,
  SHEET_PRESETS,
  basisWeightToGsm,
  computePaperJob,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  width: "210",
  height: "297",
  unit: "mm",
  gsm: "80",
  sheets: "500",
  bulkId: "uncoated",
  packaging: "120",
  lb: "20",
  gradeId: "bond",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [gsm, setGsm] = useState(DEFAULTS.gsm);
  const [sheets, setSheets] = useState(DEFAULTS.sheets);
  const [bulkId, setBulkId] = useState(DEFAULTS.bulkId);
  const [packaging, setPackaging] = useState(DEFAULTS.packaging);
  const [lb, setLb] = useState(DEFAULTS.lb);
  const [gradeId, setGradeId] = useState(DEFAULTS.gradeId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePaperJob({
        width: toNumber(width),
        height: toNumber(height),
        unit,
        gsm: toNumber(gsm),
        sheets: toNumber(sheets),
        bulkId,
        packagingG: toNumber(packaging),
      }),
    [width, height, unit, gsm, sheets, bulkId, packaging],
  );

  const converted = useMemo(() => basisWeightToGsm(toNumber(lb), gradeId), [lb, gradeId]);

  const hasError = Boolean(result.error);

  const applyPreset = (preset) => {
    setUnit("mm");
    setWidth(String(preset.w));
    setHeight(String(preset.h));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GSM Paper Weight Calculator",
      `Sheet: ${width} x ${height} ${unit} at ${INT.format(toNumber(gsm))} GSM`,
      `Sheet area: ${NUM4.format(result.areaSqm)} sq m`,
      `Weight of one sheet: ${NUM3.format(result.perSheetG)} g`,
      `Weight of a 500-sheet ream: ${NUM3.format(result.reamKg)} kg`,
      `Sheets per kilogram: ${NUM1.format(result.sheetsPerKg)}`,
      `Run of ${INT.format(result.sheetCount)} sheets: ${NUM3.format(result.paperKg)} kg of paper`,
      `With packaging: ${NUM3.format(result.totalKg)} kg`,
      `Caliper: ${NUM1.format(result.caliperMicron)} microns (${result.bulkLabel})`,
      `Stack height: ${NUM1.format(result.stackMm)} mm`,
      `Courier billable weight: ${NUM2.format(result.billableKg)} kg`,
    ].join("\n");
  }, [hasError, result, width, height, unit, gsm]);

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
    setGsm(DEFAULTS.gsm);
    setSheets(DEFAULTS.sheets);
    setBulkId(DEFAULTS.bulkId);
    setPackaging(DEFAULTS.packaging);
    setLb(DEFAULTS.lb);
    setGradeId(DEFAULTS.gradeId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Paper weight
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          GSM Paper Weight Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          GSM is grams per square metre, so a sheet weighs its area in square metres times its GSM.
          Enter a sheet size and a run length to get sheet weight, ream weight, stack height and the
          parcel weight a courier will bill.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap gap-2">
          {SHEET_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={CHIP_BTN}
            >
              {preset.label.split(" (")[0]}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-width">
              Sheet width
            </label>
            <input
              id="gsm-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-height">
              Sheet height
            </label>
            <input
              id="gsm-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-unit">
              Size unit
            </label>
            <select
              id="gsm-unit"
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
            <label className={LABEL_CLASS} htmlFor="gsm-value">
              Paper weight (GSM)
            </label>
            <input
              id="gsm-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={gsm}
              onChange={(event) => setGsm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-sheets">
              Number of sheets
            </label>
            <input
              id="gsm-sheets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={sheets}
              onChange={(event) => setSheets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-bulk">
              Paper type (sets caliper)
            </label>
            <select
              id="gsm-bulk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bulkId}
              onChange={(event) => setBulkId(event.target.value)}
            >
              {PAPER_BULKS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gsm-packaging">
              Packaging weight (g)
            </label>
            <input
              id="gsm-packaging"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={packaging}
              onChange={(event) => setPackaging(event.target.value)}
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
              Weight of one sheet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM3.format(result.perSheetG)} g`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the weight."
                : `${NUM4.format(result.areaSqm)} sq m of ${INT.format(toNumber(gsm))} GSM stock`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy paper weight result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Weight of a 500-sheet ream", hasError ? DASH : `${NUM3.format(result.reamKg)} kg`],
            ["Sheets per kilogram", hasError ? DASH : NUM1.format(result.sheetsPerKg)],
            [
              "Paper weight for the run",
              hasError
                ? DASH
                : `${NUM3.format(result.paperKg)} kg for ${INT.format(result.sheetCount)} sheets`,
            ],
            ["Packaging added", hasError ? DASH : `${INT.format(result.packagingG)} g`],
            ["Parcel weight", hasError ? DASH : `${NUM3.format(result.totalKg)} kg`],
            [
              "Caliper of one sheet",
              hasError
                ? DASH
                : `${NUM1.format(result.caliperMicron)} microns (bulk ${NUM2.format(result.bulk)})`,
            ],
            [
              "Stack height of the run",
              hasError
                ? DASH
                : `${NUM1.format(result.stackMm)} mm (${NUM1.format(result.stackCm)} cm)`,
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
        <h2 className="text-base font-semibold">US pound basis weight to GSM</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-lb">
              Basis weight (lb)
            </label>
            <input
              id="gsm-lb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={lb}
              onChange={(event) => setLb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gsm-grade">
              Paper grade
            </label>
            <select
              id="gsm-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gradeId}
              onChange={(event) => setGradeId(event.target.value)}
            >
              {BASIS_GRADES.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.label} ({grade.basisIn[0]} x {grade.basisIn[1]} in)
                </option>
              ))}
            </select>
          </div>
        </div>
        {converted.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {converted.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {lb} lb {converted.grade.label} equals{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {NUM1.format(converted.gsm)} GSM
            </span>
            .
          </p>
        )}

        <h3 className="mt-5 text-sm font-semibold">
          {hasError
            ? "Basis-weight equivalents"
            : `${INT.format(toNumber(gsm))} GSM in every US grade`}
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Basis weight
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.basisEquivalents.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.pounds)} lb
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What each GSM is normally used for</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  GSM
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Typical use
                </th>
              </tr>
            </thead>
            <tbody>
              {GSM_REFERENCE.map((row) => (
                <tr key={row.gsm} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    <button
                      type="button"
                      className={CHIP_BTN}
                      onClick={() => setGsm(String(row.gsm))}
                    >
                      {row.gsm} GSM
                    </button>
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sheet and ream weights from GSM are exact; caliper and stack height depend on the mill&apos;s
        bulk figure and on how tightly the stack is pressed, so treat those as estimates. Courier
        billable weight uses the common divisor of 5000 — confirm the divisor on your rate card.
      </p>
    </main>
  );
}
