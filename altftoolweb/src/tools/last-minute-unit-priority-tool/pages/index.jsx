"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListOrdered, Plus, RotateCcw, Trash2 } from "lucide-react";

import { prioritizeUnits } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const COVERAGE_LABEL = {
  full: "Study fully",
  partial: "Partial pass",
  skip: "Skip for now",
};

const DEFAULT_STATE = {
  hoursAvailable: "10",
  units: [
    { id: 1, name: "Unit 1 — Basics", marks: "12", readiness: "80", hours: "2" },
    { id: 2, name: "Unit 2 — Core theory", marks: "20", readiness: "40", hours: "5" },
    { id: 3, name: "Unit 3 — Numericals", marks: "18", readiness: "20", hours: "6" },
    { id: 4, name: "Unit 4 — Applications", marks: "15", readiness: "50", hours: "4" },
    { id: 5, name: "Unit 5 — Short notes", marks: "5", readiness: "10", hours: "3" },
  ],
  nextId: 6,
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const { hoursAvailable, units } = state;

  const setHours = (event) => {
    const { value } = event.target;
    setState((prev) => ({ ...prev, hoursAvailable: value }));
  };

  const setUnit = (id, key) => (event) => {
    const { value } = event.target;
    setState((prev) => ({
      ...prev,
      units: prev.units.map((unit) => (unit.id === id ? { ...unit, [key]: value } : unit)),
    }));
  };

  const addUnit = () => {
    setState((prev) => ({
      ...prev,
      units: [
        ...prev.units,
        { id: prev.nextId, name: "", marks: "10", readiness: "0", hours: "3" },
      ],
      nextId: prev.nextId + 1,
    }));
  };

  const removeUnit = (id) => {
    setState((prev) => ({ ...prev, units: prev.units.filter((unit) => unit.id !== id) }));
  };

  const result = useMemo(
    () => prioritizeUnits({ units, hoursAvailable }),
    [units, hoursAvailable],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Last-minute study plan — ${result.hoursAvailable}h available (${result.hoursNeededTotal}h needed for everything)`,
      `Expected gain: ${result.plannedGain} of ${result.totalRecoverable} recoverable marks (${result.captureRatePercent}%)`,
      ...result.plan.map(
        (row) =>
          `${row.rank}. ${row.name} — ${COVERAGE_LABEL[row.coverage]}, ${row.allocatedHours}h of ${row.hoursNeeded}h (${row.priority} marks/h, ~${row.expectedGain} marks)`,
      ),
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
    setState(DEFAULT_STATE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Last Minute Unit Priority Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Each unit is scored by marks recoverable per study hour, then your remaining hours are
          allocated greedily from the top — the standard value-density rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lup-hours">
              Study hours left before the paper
            </label>
            <input
              id="lup-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={hoursAvailable}
              onChange={setHours}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-4">
          {units.map((unit, index) => (
            <li key={unit.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`lup-name-${unit.id}`}>
                    Unit {index + 1} — name
                  </label>
                  <input
                    id={`lup-name-${unit.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. Unit 3 — Thermodynamics"
                    value={unit.name}
                    onChange={setUnit(unit.id, "name")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`lup-marks-${unit.id}`}>
                    Marks in the paper
                  </label>
                  <input
                    id={`lup-marks-${unit.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={unit.marks}
                    onChange={setUnit(unit.id, "marks")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`lup-hoursneeded-${unit.id}`}>
                    Hours to master it
                  </label>
                  <input
                    id={`lup-hoursneeded-${unit.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.5"
                    step="0.5"
                    value={unit.hours}
                    onChange={setUnit(unit.id, "hours")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`lup-ready-${unit.id}`}>
                    Already prepared: {unit.readiness || 0}%
                  </label>
                  <input
                    id={`lup-ready-${unit.id}`}
                    className="mt-2 h-11 w-full accent-[var(--primary)]"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={unit.readiness}
                    onChange={setUnit(unit.id, "readiness")}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeUnit(unit.id)}
                aria-label={`Remove unit ${unit.name || index + 1}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addUnit} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add unit
        </button>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Expected marks gained
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `~${result.plannedGain}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `Of ${result.totalRecoverable} recoverable marks across all units (${result.captureRatePercent}% captured with ${result.hoursUsed}h of study).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the study priority plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example units" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? null : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Unit</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks/h</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Give it</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">~Gain</th>
                  <th scope="col" className="py-2 text-right font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {result.plan.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.rank}</td>
                    <td className="py-2 pr-3">
                      {row.name}
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.marks} marks · {row.readiness}% ready · needs {row.hoursNeeded}h
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{row.priority}</td>
                    <td className="py-2 pr-3 text-right">{row.allocatedHours}h</td>
                    <td className="py-2 pr-3 text-right">{row.expectedGain}</td>
                    <td className={`py-2 text-right font-semibold ${row.coverage === "skip" ? "text-[var(--danger)]" : row.coverage === "full" ? "text-[var(--success)]" : ""}`}>
                      {COVERAGE_LABEL[row.coverage]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The ranking is the fractional-knapsack value-density rule: recoverable marks ÷ hours
        needed. Partial-study gains assume marks scale linearly with hours, which real learning
        only approximates — treat the plan as a prioritiser, not a guarantee.
      </p>
    </main>
  );
}
