"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  FEPA_GRITS,
  FINISHES,
  MATERIALS,
  MAX_STEP_RATIO,
  START_TASKS,
  convertGrit,
  planSanding,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const num0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULTS = {
  material: "hardwood",
  task: "planed",
  finish: "oil",
  area: "6",
  rate: "6",
  coverage: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const CONVERSION_ROWS = FEPA_GRITS.map((entry) => {
  const converted = convertGrit(entry.grade, "fepa");
  return {
    grade: entry.grade,
    micron: entry.micron,
    cami: converted.error ? DASH : converted.to.grade,
    camiMicron: converted.error ? null : converted.to.micron,
    identical: converted.error ? false : converted.identical,
  };
});

export default function ToolHome() {
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [task, setTask] = useState(DEFAULTS.task);
  const [finish, setFinish] = useState(DEFAULTS.finish);
  const [area, setArea] = useState(DEFAULTS.area);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [coverage, setCoverage] = useState(DEFAULTS.coverage);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planSanding({
        material,
        task,
        finish,
        areaM2: toNumber(area),
        minutesPerM2PerPass: toNumber(rate),
        m2PerSheet: toNumber(coverage),
      }),
    [material, task, finish, area, rate, coverage],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Sandpaper Grit Sequence",
      `${result.material.label}, ${result.task.label.toLowerCase()}, finishing with ${result.finish.label.toLowerCase()}`,
      `Sequence: ${result.sequence.map((s) => s.grade).join(" → ")}`,
      `CAMI equivalents: ${result.sequence.map((s) => s.cami ?? "?").join(" → ")}`,
      `${result.steps} grits over ${result.areaM2} m²`,
      `About ${Math.round(result.totalMinutes)} minutes and ${result.totalSheets} sheets (${result.sheetsPerGrit} per grit)`,
      result.finish.why,
      result.material.caution,
    ].join("\n");
  }, [failed, result]);

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
    setMaterial(DEFAULTS.material);
    setTask(DEFAULTS.task);
    setFinish(DEFAULTS.finish);
    setArea(DEFAULTS.area);
    setRate(DEFAULTS.rate);
    setCoverage(DEFAULTS.coverage);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Abrasives
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sandpaper Grit Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every grit exists to erase the scratches of the one before it. Skip too far and the finer
          paper polishes the ridges while the valleys stay — invisible on bare timber, obvious the
          moment stain or oil goes on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-material">
              Material
            </label>
            <select
              id="sg-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            >
              {MATERIALS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-task">
              Condition it is in now
            </label>
            <select
              id="sg-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={task}
              onChange={(event) => setTask(event.target.value)}
            >
              {START_TASKS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Starts at {START_TASKS.find((entry) => entry.id === task).start}, unless the material
              is too delicate for it.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-finish">
              What goes on afterwards
            </label>
            <select
              id="sg-finish"
              className={`mt-2 ${INPUT_CLASS}`}
              value={finish}
              onChange={(event) => setFinish(event.target.value)}
            >
              {FINISHES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Stops at {FINISHES.find((entry) => entry.id === finish).stop}.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-area">
              Area to sand (m²)
            </label>
            <input
              id="sg-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-rate">
              Minutes per m², per grit
            </label>
            <input
              id="sg-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              About 6 with a random-orbit sander, considerably more by hand.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-coverage">
              m² one sheet or disc lasts
            </label>
            <input
              id="sg-coverage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Coarse grits stripping paint clog far faster than fine ones on bare timber, so buy
              extra of the first grade.
            </p>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Grit sequence
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.sequence.map((entry) => entry.grade).join(" → ")}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Adjust the choices above."
                : `${result.steps} grits, about ${num0(result.totalMinutes)} minutes over ${result.areaM2} m²`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the grit sequence"
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

        {!failed && (
          <>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                result.floorApplied
                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                  : "bg-[var(--success-soft)] text-[var(--success)]"
              }`}
            >
              {result.verdict}
            </p>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
              {result.material.caution}
            </p>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Number of grits", failed ? DASH : num0(result.steps)],
            ["Starting grade", failed ? DASH : result.startGrade],
            ["Finishing grade", failed ? DASH : result.finish.stop],
            [
              "Particle size, coarse to fine",
              failed ? DASH : `${num1(result.coarsestMicron)} → ${num1(result.finestMicron)} µm`,
            ],
            ["Total reduction", failed ? DASH : `${num1(result.reductionFactor)}×`],
            ["Sanding time", failed ? DASH : `${num0(result.totalMinutes)} min`],
            ["Sheets per grit", failed ? DASH : num0(result.sheetsPerGrit)],
            ["Sheets in total", failed ? DASH : num0(result.totalSheets)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Step by step</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Step
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    FEPA
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    CAMI
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Particle
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Sheets
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.sequence.map((entry, index) => (
                  <tr key={entry.grade} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2 pr-3 font-semibold">{entry.grade}</td>
                    <td className="py-2 pr-3">{entry.cami ?? DASH}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {num1(entry.micron)} µm
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{result.sheetsPerGrit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={HINT_CLASS}>
            Each step drops the particle size by no more than {MAX_STEP_RATIO}×, and never skips
            more than one grade. Vacuum or wipe between grits — one stray coarse particle dragged
            under a fine sheet undoes the whole step.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">FEPA to CAMI conversion</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The two standards agree up to about 220 and diverge sharply after it. Matched here on
          average particle diameter, which is how both are defined.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  FEPA (P)
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  µm
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  CAMI
                </th>
                <th scope="col" className="py-2 font-semibold">
                  µm
                </th>
              </tr>
            </thead>
            <tbody>
              {CONVERSION_ROWS.map((row) => (
                <tr key={row.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.grade}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{num1(row.micron)}</td>
                  <td className={`py-2 pr-3 ${row.identical ? "" : "text-[var(--warning)]"}`}>
                    {row.cami}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {row.camiMicron === null ? DASH : num1(row.camiMicron)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={HINT_CLASS}>
          Amber entries are pairs that share a name or look adjacent but differ by more than 5% in
          particle size — CAMI 400 is closer to P800 than to P400.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Times and sheet counts are planning estimates from the rate you enter, not measurements —
        stripping old oil paint eats abrasive far faster than smoothing bare timber. Wear eye
        protection and a fitted dust mask: wood dust is a recognised respiratory hazard, and paint
        applied before the late 1970s may contain lead, which must not be dry-sanded at all.
      </p>
    </main>
  );
}
