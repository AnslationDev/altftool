"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import {
  CITY_TIERS,
  DEFAULT_WALL_AREA_FACTOR,
  FINISH_GRADES,
  estimatePaintLabour,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  carpetArea: "1000",
  wallFactor: String(DEFAULT_WALL_AREA_FACTOR),
  includeCeiling: true,
  finishGrade: "premium_emulsion",
  cityTier: "tier1",
  withPutty: true,
  ceilingHeight: "10",
  crewSize: "2",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [carpetArea, setCarpetArea] = useState(DEFAULTS.carpetArea);
  const [wallFactor, setWallFactor] = useState(DEFAULTS.wallFactor);
  const [includeCeiling, setIncludeCeiling] = useState(DEFAULTS.includeCeiling);
  const [finishGrade, setFinishGrade] = useState(DEFAULTS.finishGrade);
  const [cityTier, setCityTier] = useState(DEFAULTS.cityTier);
  const [withPutty, setWithPutty] = useState(DEFAULTS.withPutty);
  const [ceilingHeight, setCeilingHeight] = useState(DEFAULTS.ceilingHeight);
  const [crewSize, setCrewSize] = useState(DEFAULTS.crewSize);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const result = useMemo(
    () =>
      estimatePaintLabour({
        carpetAreaSqft: toNumber(carpetArea),
        wallAreaFactor: toNumber(wallFactor),
        includeCeiling,
        finishGrade,
        cityTier,
        withPutty,
        ceilingHeightFt: toNumber(ceilingHeight),
        crewSize: toNumber(crewSize),
      }),
    [carpetArea, wallFactor, includeCeiling, finishGrade, cityTier, withPutty, ceilingHeight, crewSize],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Painter labour estimate (India)",
      `Painted area: ${num(result.paintableArea)} sqft`,
      `Finish: ${result.gradeLabel}`,
      `Location: ${result.tierLabel}`,
      `Labour rate: ${money2(result.effectiveRatePerSqft)} per sqft`,
      `Finish labour: ${money(result.finishCost)}`,
      `Putty labour: ${money(result.puttyCost)}`,
      `Height surcharge: ${money(result.heightSurcharge)}`,
      `Total labour cost: ${money(result.totalLabourCost)}`,
      `Estimated duration: ${num(result.calendarDays)} days with ${crewSize} painters`,
    ].join("\n");
  }, [failed, result, crewSize]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError("");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError("Couldn't copy automatically — select and copy the summary text manually.");
    }
  };

  const reset = () => {
    setCarpetArea(DEFAULTS.carpetArea);
    setWallFactor(DEFAULTS.wallFactor);
    setIncludeCeiling(DEFAULTS.includeCeiling);
    setFinishGrade(DEFAULTS.finishGrade);
    setCityTier(DEFAULTS.cityTier);
    setWithPutty(DEFAULTS.withPutty);
    setCeilingHeight(DEFAULTS.ceilingHeight);
    setCrewSize(DEFAULTS.crewSize);
    setCopied(false);
    setCopyError("");
  };

  const rows = [
    ["Wall area painted", failed ? DASH : `${num(result.wallArea)} sqft`],
    ["Ceiling area painted", failed ? DASH : `${num(result.ceilingArea)} sqft`],
    ["Total painted surface", failed ? DASH : `${num(result.paintableArea)} sqft`],
    ["Finish labour rate", failed ? DASH : `${money2(result.finishRate)} / sqft`],
    ["Putty labour rate", failed ? DASH : `${money2(result.puttyRate)} / sqft`],
    ["Finish application labour", failed ? DASH : money(result.finishCost)],
    ["Putty application labour", failed ? DASH : money(result.puttyCost)],
    ["Scaffolding / height surcharge", failed ? DASH : money(result.heightSurcharge)],
    ["Effective rate on painted area", failed ? DASH : `${money2(result.effectiveRatePerSqft)} / sqft`],
    ["Labour cost per carpet sqft", failed ? DASH : `${money2(result.costPerCarpetSqft)} / sqft`],
    ["Painter-days of work", failed ? DASH : `${num(result.painterDays)} days`],
    ["Duration with your crew", failed ? DASH : `${num(result.calendarDays)} days`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PaintRoller className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Paint Labour Cost Estimator India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what a painting contractor should charge for labour alone — by city tier, finish
          grade, putty work and ceiling height — before you compare quotes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="plc-carpet">
              Carpet area (sqft)
            </label>
            <input
              id="plc-carpet"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={carpetArea}
              onChange={(event) => setCarpetArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="plc-factor">
              Wall area factor (× carpet area)
            </label>
            <input
              id="plc-factor"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="8"
              step="0.1"
              value={wallFactor}
              onChange={(event) => setWallFactor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="plc-grade">
              Finish grade
            </label>
            <select
              id="plc-grade"
              className={FIELD}
              value={finishGrade}
              onChange={(event) => setFinishGrade(event.target.value)}
            >
              {Object.entries(FINISH_GRADES).map(([key, grade]) => (
                <option key={key} value={key}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="plc-tier">
              City tier
            </label>
            <select
              id="plc-tier"
              className={FIELD}
              value={cityTier}
              onChange={(event) => setCityTier(event.target.value)}
            >
              {Object.entries(CITY_TIERS).map(([key, tier]) => (
                <option key={key} value={key}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="plc-height">
              Floor-to-ceiling height (ft)
            </label>
            <input
              id="plc-height"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="6"
              step="0.5"
              value={ceilingHeight}
              onChange={(event) => setCeilingHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="plc-crew">
              Painters on site
            </label>
            <input
              id="plc-crew"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={crewSize}
              onChange={(event) => setCrewSize(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            htmlFor="plc-ceiling"
          >
            <input
              id="plc-ceiling"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeCeiling}
              onChange={(event) => setIncludeCeiling(event.target.checked)}
            />
            Paint the ceiling too
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            htmlFor="plc-putty"
          >
            <input
              id="plc-putty"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={withPutty}
              onChange={(event) => setWithPutty(event.target.checked)}
            />
            Full-wall putty (2 coats)
          </label>
        </div>
      </section>

      {failed && (
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
              Total painter labour cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {failed ? DASH : money(result.totalLabourCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see an estimate."
                : `${money2(result.effectiveRatePerSqft)} per sqft over ${num(result.paintableArea)} sqft of surface`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy painter labour estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <p aria-live="polite" role="status" className="sr-only">
              {copied ? "Painter labour estimate copied to clipboard." : ""}
            </p>
          </div>
        </div>

        {copyError && (
          <p role="alert" className="mt-2 text-xs font-medium text-[var(--danger)]">
            {copyError}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.needsStaging && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Ceilings above 10 ft need staging rather than a step ladder, so a scaffolding surcharge is
            applied to the whole labour bill.
          </p>
        )}
        {!failed && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{result.gradeNote}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Labour only — paint, putty, primer, masking tape and drop sheets are billed separately.
        Rates are indicative market bands for Indian cities and move with local painter day wages, so
        always collect two or three written quotes before you commit.
      </p>
    </main>
  );
}
