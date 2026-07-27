"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Recycle, RotateCcw } from "lucide-react";

import { BROWN_MATERIALS, TURNING_METHODS, computeCompostBin } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const litres = (value) => (Number.isFinite(value) ? `${INT.format(value)} L` : DASH);
const kg = (value) => (Number.isFinite(value) ? `${NUM.format(value)} kg` : DASH);
const cm = (value) => (Number.isFinite(value) ? `${INT.format(value)} cm` : DASH);

const DEFAULTS = {
  dailyWasteKg: "1",
  brownMaterial: "cocopeat",
  method: "frequent",
  retentionDays: "",
  chambers: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [dailyWasteKg, setDailyWasteKg] = useState(DEFAULTS.dailyWasteKg);
  const [brownMaterial, setBrownMaterial] = useState(DEFAULTS.brownMaterial);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [retentionDays, setRetentionDays] = useState(DEFAULTS.retentionDays);
  const [chambers, setChambers] = useState(DEFAULTS.chambers);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCompostBin({
        dailyWasteKg,
        brownMaterial,
        method,
        retentionDays,
        chambers: Number(chambers),
      }),
    [dailyWasteKg, brownMaterial, method, retentionDays, chambers],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Compost Bin Size Calculator",
      `Kitchen waste: ${kg(result.dailyWasteKg)} per day`,
      `Browns: ${result.brownLabel} at ${result.brownRatio}:1 by volume`,
      `Method: ${result.methodLabel} (${result.retentionDays}-day cycle)`,
      `Total bin volume needed: ${litres(result.binLitres)}`,
      `Split ${result.chambers} ways: ${litres(result.litresPerChamber)} per chamber`,
      `Roughly a ${cm(result.chamberCubeSideCm)} cube per chamber`,
      `Compost per cycle: ${kg(result.compostPerCycleKg)}`,
      `Waste diverted per year: ${kg(result.annualWasteKg)}`,
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
    setDailyWasteKg(DEFAULTS.dailyWasteKg);
    setBrownMaterial(DEFAULTS.brownMaterial);
    setMethod(DEFAULTS.method);
    setRetentionDays(DEFAULTS.retentionDays);
    setChambers(DEFAULTS.chambers);
    setCopied(false);
  };

  const rows = [
    ["Fresh kitchen waste added", hasError ? DASH : `${NUM.format(result.greenLitresPerDay)} L/day`],
    ["Dry browns added", hasError ? DASH : `${NUM.format(result.brownLitresPerDay)} L/day`],
    ["Total daily charge", hasError ? DASH : `${NUM.format(result.chargeLitresPerDay)} L/day`],
    ["Retention cycle", hasError ? DASH : `${INT.format(result.retentionDays)} days`],
    ["Volume lost to decomposition", hasError ? DASH : `${INT.format(result.volumeReductionPct)}%`],
    ["Material in the bin (working volume)", hasError ? DASH : litres(result.workingLitres)],
    ["Headspace for turning", hasError ? DASH : litres(result.headspaceLitres)],
    ["Per chamber", hasError ? DASH : `${litres(result.litresPerChamber)} (about a ${cm(result.chamberCubeSideCm)} cube)`],
    ["Compost harvested each cycle", hasError ? DASH : kg(result.compostPerCycleKg)],
    ["Waste diverted per year", hasError ? DASH : kg(result.annualWasteKg)],
    ["Compost produced per year", hasError ? DASH : kg(result.annualCompostKg)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Home composting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Compost Bin Size Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A compost bin is sized by the volume sitting in it, not by the weight you throw in. Enter
          your daily kitchen waste, the browns you mix in and how often you turn the heap.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="compost-waste">
              Kitchen waste per day (kg)
            </label>
            <input
              id="compost-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={dailyWasteKg}
              onChange={(event) => setDailyWasteKg(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A four-person Indian household typically produces 0.5–1 kg of wet waste a day.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="compost-browns">
              Dry &ldquo;browns&rdquo; you mix in
            </label>
            <select
              id="compost-browns"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brownMaterial}
              onChange={(event) => setBrownMaterial(event.target.value)}
            >
              {BROWN_MATERIALS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {hasError ? " " : `${result.brownRatio}:1 by volume — ${result.brownNote}`}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="compost-method">
              How often you turn it
            </label>
            <select
              id="compost-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => {
                setMethod(event.target.value);
                setRetentionDays("");
              }}
            >
              {TURNING_METHODS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} · {option.days} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="compost-days">
              Cycle length override (days)
            </label>
            <input
              id="compost-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="365"
              step="5"
              placeholder="Use method default"
              value={retentionDays}
              onChange={(event) => setRetentionDays(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="compost-chambers">
              Number of bins or pots in the system
            </label>
            <select
              id="compost-chambers"
              className={`mt-2 ${INPUT_CLASS}`}
              value={chambers}
              onChange={(event) => setChambers(event.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={String(count)}>
                  {count} {count === 1 ? "chamber" : "chambers"}
                </option>
              ))}
            </select>
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
              Total bin volume needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : litres(result.binLitres)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a size."
                : `About a ${cm(result.cubeSideCm)} cube in total, or ${litres(result.litresPerChamber)} in each of ${result.chambers}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy compost bin sizing result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <li
              key={note}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates based on a 0.5 kg per litre bulk density for wet kitchen waste and 25% headspace
        for turning. Actual shrinkage varies with moisture, particle size and how well the heap is
        aerated — size up if you compost garden prunings or festival food waste in bursts.
      </p>
    </main>
  );
}
