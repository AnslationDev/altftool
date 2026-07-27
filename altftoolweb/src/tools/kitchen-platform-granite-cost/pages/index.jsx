"use client";

import { useMemo, useState } from "react";
import { Check, ChefHat, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_FRONT_BAND_INCHES,
  DEFAULT_PLATFORM_DEPTH_FT,
  DEFAULT_SKIRTING_INCHES,
  DEFAULT_WASTAGE_PCT,
  estimateGraniteCost,
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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const sqft = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} sq ft` : DASH);

const DEFAULTS = {
  runningFeet: "12",
  depth: String(DEFAULT_PLATFORM_DEPTH_FT),
  skirting: String(DEFAULT_SKIRTING_INCHES),
  band: String(DEFAULT_FRONT_BAND_INCHES),
  wastage: String(DEFAULT_WASTAGE_PCT),
  rate: "180",
  polishFeet: "12",
  polishRate: "60",
  sinks: "1",
  sinkRate: "1200",
  sinkLength: "24",
  sinkWidth: "18",
  hobs: "1",
  hobRate: "800",
  fittingRate: "90",
  transport: "800",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      estimateGraniteCost({
        runningFeet: toNum(values.runningFeet),
        platformDepthFt: toNum(values.depth),
        skirtingInches: toNum(values.skirting),
        frontBandInches: toNum(values.band),
        wastagePct: toNum(values.wastage),
        ratePerSqft: toNum(values.rate),
        polishRunningFeet: toNum(values.polishFeet),
        polishRatePerFoot: toNum(values.polishRate),
        sinkCutouts: toNum(values.sinks),
        sinkCutoutRate: toNum(values.sinkRate),
        sinkLengthInches: toNum(values.sinkLength),
        sinkWidthInches: toNum(values.sinkWidth),
        hobCutouts: toNum(values.hobs),
        hobCutoutRate: toNum(values.hobRate),
        fittingRatePerFoot: toNum(values.fittingRate),
        transportCost: toNum(values.transport),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Counter top area", DASH],
        ["Skirting area", DASH],
        ["Front band area", DASH],
        ["Area before wastage", DASH],
        ["Wastage allowance", DASH],
        ["Granite to order", DASH],
        ["Granite", DASH],
        ["Edge polishing", DASH],
        ["Sink cutouts", DASH],
        ["Hob cutouts", DASH],
        ["Fabrication and fitting", DASH],
        ["Transport", DASH],
        ["Cost per running foot", DASH],
        ["Cost per square foot ordered", DASH],
        ["Usable sink offcut", DASH],
      ]
    : [
        ["Counter top area", sqft(result.platformArea)],
        ["Skirting area", sqft(result.skirtingArea)],
        ["Front band area", sqft(result.frontBandArea)],
        ["Area before wastage", sqft(result.netArea)],
        ["Wastage allowance", sqft(result.wastageArea)],
        ["Granite to order", sqft(result.orderArea)],
        ...result.items.map(([label, value]) => [label, money(value)]),
        ["Cost per running foot", money2(result.costPerRunningFoot)],
        ["Cost per square foot ordered", money2(result.costPerSqft)],
        ["Usable sink offcut", sqft(result.sinkOffcutSqft)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kitchen Platform Granite Cost",
      `Total: ${money(result.total)} for ${sqft(result.orderArea)} of granite`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ...result.notes.map((note) => `Note: ${note}`),
    ].join("\n");
  }, [hasError, result, rows]);

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

  const sizeFields = [
    ["kpg-rft", "Counter length (running feet)", "runningFeet", "0.5"],
    ["kpg-depth", "Platform depth (feet)", "depth", "0.25"],
    ["kpg-skirting", "Skirting height against the wall (inches)", "skirting", "1"],
    ["kpg-band", "Front band height (inches)", "band", "0.5"],
    ["kpg-wastage", "Wastage allowance (%)", "wastage", "1"],
    ["kpg-rate", "Granite rate (₹ per sq ft)", "rate", "10"],
  ];

  const cutFields = [
    ["kpg-polishfeet", "Edges to polish (running feet)", "polishFeet", "0.5"],
    ["kpg-polishrate", "Polishing rate (₹ per rft)", "polishRate", "5"],
    ["kpg-sinks", "Sink cutouts", "sinks", "1"],
    ["kpg-sinkrate", "Sink cutout charge (₹ each)", "sinkRate", "50"],
    ["kpg-sinklength", "Sink cutout length (inches)", "sinkLength", "1"],
    ["kpg-sinkwidth", "Sink cutout width (inches)", "sinkWidth", "1"],
    ["kpg-hobs", "Hob cutouts", "hobs", "1"],
    ["kpg-hobrate", "Hob cutout charge (₹ each)", "hobRate", "50"],
  ];

  const jobFields = [
    ["kpg-fitting", "Fabrication and fitting (₹ per rft)", "fittingRate", "10"],
    ["kpg-transport", "Transport (₹)", "transport", "50"],
  ];

  const groups = [
    ["Counter measurements", sizeFields],
    ["Cutouts and edges", cutFields],
    ["Labour and delivery", jobFields],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ChefHat className="h-4 w-4" aria-hidden="true" />
          Kitchen platform
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kitchen Platform Granite Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counters are quoted in running feet, granite is sold in square feet, and the skirting,
          wastage and cutouts sit between the two. This does that conversion and prices the job.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {groups.map(([title, fields], groupIndex) => (
          <div
            key={title}
            className={groupIndex === 0 ? "" : "mt-5 border-t border-[var(--border)] pt-5"}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              {title}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {fields.map(([id, label, key, step]) => (
                <div key={id}>
                  <label className={LABEL_CLASS} htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={step}
                    value={values[key]}
                    onChange={set(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
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
              Total platform cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${sqft(result.orderArea)} of granite, ${money2(result.costPerRunningFoot)} per running foot all-in`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy granite platform estimate"
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
          </div>
        </div>

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Measure the counter after the base units are in place, not from the drawing — walls are
        rarely square and the difference shows in a stone top. Granite rates move with variety,
        thickness and finish, and fabrication rates are local, so replace the defaults with the
        figures from the quotation you are checking.
      </p>
    </main>
  );
}
