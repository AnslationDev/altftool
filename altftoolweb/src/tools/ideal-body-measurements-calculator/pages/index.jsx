"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt } from "lucide-react";

import {
  computeIdealMeasurements,
  resolveLengthCm,
  GOLDEN_RATIO,
  WAIST_HEIGHT_HEALTH_MAX,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DASH = "—";

const DEFAULTS = {
  unit: "in",
  method: "mccallum",
  wrist: "7",
  ankle: "9",
  knee: "15",
  head: "22.5",
  pelvis: "36",
  height: "70",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [wrist, setWrist] = useState(DEFAULTS.wrist);
  const [ankle, setAnkle] = useState(DEFAULTS.ankle);
  const [knee, setKnee] = useState(DEFAULTS.knee);
  const [head, setHead] = useState(DEFAULTS.head);
  const [pelvis, setPelvis] = useState(DEFAULTS.pelvis);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const asCm = (value) => resolveLengthCm({ unit, value: toNumber(value) });
    return computeIdealMeasurements({
      method,
      wristCm: asCm(wrist),
      ankleCm: asCm(ankle),
      kneeCm: asCm(knee),
      headCm: asCm(head),
      pelvisCm: asCm(pelvis),
      heightCm: asCm(height),
    });
  }, [unit, method, wrist, ankle, knee, head, pelvis, height]);

  const ok = !result.error;
  const suffix = unit === "in" ? "in" : "cm";
  const show = (row) => (unit === "in" ? NUM2.format(row.inches) : NUM1.format(row.cm));
  const showValue = (cm, inches) => (unit === "in" ? NUM2.format(inches) : NUM1.format(cm));

  const buildSummary = () => {
    if (!ok) return "";
    const lines = [
      "Ideal Body Measurements Calculator",
      `Method: ${method === "reeves" ? "Steve Reeves joint ratios" : "McCallum wrist ratios"}`,
      `Wrist: ${showValue(result.wristCm, result.wristInches)} ${suffix}`,
      ...result.measurements.map((row) => `${row.label}: ${show(row)} ${suffix} (${row.note})`),
      `Shoulder target at golden ratio: ${showValue(result.shoulderCm, result.shoulderInches)} ${suffix}`,
    ];
    if (Number.isFinite(result.waistHeightRatio)) {
      lines.push(`Target waist-to-height ratio: ${NUM2.format(result.waistHeightRatio)}`);
    }
    return lines.join("\n");
  };

  const copyResult = async () => {
    const summary = buildSummary();
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
    setUnit(DEFAULTS.unit);
    setMethod(DEFAULTS.method);
    setWrist(DEFAULTS.wrist);
    setAnkle(DEFAULTS.ankle);
    setKnee(DEFAULTS.knee);
    setHead(DEFAULTS.head);
    setPelvis(DEFAULTS.pelvis);
    setHeight(DEFAULTS.height);
    setCopied(false);
  };

  const reevesFields = [
    { id: "ideal-ankle", label: "Ankle girth", value: ankle, set: setAnkle },
    { id: "ideal-knee", label: "Knee girth", value: knee, set: setKnee },
    { id: "ideal-head", label: "Head girth", value: head, set: setHead },
    { id: "ideal-pelvis", label: "Pelvis girth", value: pelvis, set: setPelvis },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Shirt className="h-4 w-4" aria-hidden="true" />
          Body composition
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Ideal Body Measurements Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Classic physique proportion targets for chest, waist, arms, thighs and more, scaled from
          your own skeleton using McCallum&apos;s wrist ratios or Steve Reeves&apos; joint ratios.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ideal-method">
              Proportion system
            </label>
            <select
              id="ideal-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="mccallum">McCallum — everything from the wrist</option>
              <option value="reeves">Reeves — each muscle from its joint</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ideal-unit">
              Units
            </label>
            <select
              id="ideal-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="in">Inches</option>
              <option value="cm">Centimetres</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ideal-wrist">
              Wrist girth ({suffix})
            </label>
            <input
              id="ideal-wrist"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={unit === "in" ? "0.05" : "0.1"}
              value={wrist}
              onChange={(event) => setWrist(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ideal-height">
              Height ({suffix}) — optional
            </label>
            <input
              id="ideal-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={unit === "in" ? "0.5" : "1"}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>

          {method === "reeves" &&
            reevesFields.map((field) => (
              <div key={field.id}>
                <label className={LABEL_CLASS} htmlFor={field.id}>
                  {field.label} ({suffix})
                </label>
                <input
                  id={field.id}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={unit === "in" ? "0.05" : "0.1"}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                />
              </div>
            ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Measure joints with the tape snug over bone — wrist just past the wrist bone, ankle at its
          narrowest, knee across the middle of the kneecap with the leg straight, head above the
          brows, pelvis around the hip bones.
        </p>
      </section>

      {result.error && (
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
              Target chest
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${showValue(result.chestCm, result.chestInches)} ${suffix}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Chest-to-waist ratio ${NUM2.format(result.chestToWaist)} · shoulder target ${showValue(
                    result.shoulderCm,
                    result.shoulderInches,
                  )} ${suffix} at the golden ratio of ${NUM2.format(GOLDEN_RATIO)}`
                : "Fix the input above to see the proportion targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy ideal body measurement targets"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {(ok
            ? result.measurements.map((row) => [row.label, `${show(row)} ${suffix}`, row.note])
            : [
                ["Chest", DASH, ""],
                ["Waist", DASH, ""],
                ["Upper arm", DASH, ""],
                ["Thigh", DASH, ""],
              ]
          ).map(([label, value, note]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt>
                <span className="text-[var(--muted-foreground)]">{label}</span>
                {note ? (
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">({note})</span>
                ) : null}
              </dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.waistHeightOk !== null && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-xs leading-5 ${
              result.waistHeightOk
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {result.waistHeightOk
              ? `This waist target is ${NUM2.format(result.waistHeightRatio)} of your height, inside the "keep your waist to less than half your height" guideline of ${NUM2.format(WAIST_HEIGHT_HEALTH_MAX)}.`
              : `This waist target works out at ${NUM2.format(result.waistHeightRatio)} of your height, above the "keep your waist to less than half your height" guideline of ${NUM2.format(WAIST_HEIGHT_HEALTH_MAX)}. Aim below ${showValue(result.maxHealthyWaistCm, result.maxHealthyWaistInches)} ${suffix} instead.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are aesthetic proportion systems from mid-century physical culture, not health
        standards, and they say nothing about body fat, strength or wellbeing. Informational only —
        talk to a coach, clinician or registered dietitian before chasing a measurement.
      </p>
    </main>
  );
}
