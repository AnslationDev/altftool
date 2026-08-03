"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import { computeWeightedGrade, GRADE_SCALES, requiredOnRemaining } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const DEFAULT_ITEMS = [
  { id: "i1", name: "Homework", weight: "20", score: "95" },
  { id: "i2", name: "Midterm exam", weight: "30", score: "82" },
  { id: "i3", name: "Final exam", weight: "50", score: "" },
];

const DEFAULTS = { scaleId: "plus-minus", target: "90" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const two = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
// GPA is always shown to one decimal place, everywhere it appears on the
// page — otherwise a whole-number GPA (e.g. exactly 4.0) renders as "4" in
// the results card but "4.0" in the scale reference table below it.
const gpa = (v) => (Number.isFinite(v) ? v.toFixed(1) : DASH);

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [scaleId, setScaleId] = useState(DEFAULTS.scaleId);
  const [target, setTarget] = useState(DEFAULTS.target);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const libItems = useMemo(
    () =>
      items.map((item) => ({
        name: item.name,
        weight: Number(item.weight),
        score: item.score.trim() === "" ? null : Number(item.score),
      })),
    [items],
  );

  const grade = useMemo(() => computeWeightedGrade({ items: libItems, scaleId }), [libItems, scaleId]);
  const needed = useMemo(
    () => requiredOnRemaining({ items: libItems, targetPercent: Number(target), scaleId }),
    [libItems, target, scaleId],
  );

  const error = grade.error || null;

  function updateItem(id, field, value) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((current) => [...current, { id: `i-${Date.now()}-${current.length}`, name: `Assessment ${current.length + 1}`, weight: "10", score: "" }]);
  }

  function removeItem(id) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  }

  function reset() {
    if (
      !window.confirm(
        "Reset every field? This will replace your assessments, scale and target with the example course and cannot be undone.",
      )
    ) {
      return;
    }
    setItems(DEFAULT_ITEMS);
    setScaleId(DEFAULTS.scaleId);
    setTarget(DEFAULTS.target);
  }

  function copyResult() {
    if (error) return;
    const lines = [
      `Weighted grade: ${two(grade.currentPercent)}% (${grade.currentLetter}, ${gpa(grade.currentGpa)} GPA) on work graded so far`,
      `Projected if nothing else is submitted: ${two(grade.projectedPercent)}% (${grade.projectedLetter})`,
      `Graded weight: ${two(grade.gradedWeight)} of ${two(grade.totalWeight)}; grade points banked: ${two(grade.pointsEarned)}`,
      `Highest still reachable: ${two(grade.maxPossiblePercent)}%`,
      needed.error ? needed.error : `To finish on ${two(needed.targetPercent)}% you need ${two(needed.neededPercent)}% across the remaining ${two(needed.remainingWeight)} weight`,
    ];
    copy("result", lines.join("\n"), { label: "grade summary" });
  }

  const activeScale = GRADE_SCALES.find((s) => s.id === scaleId) ?? GRADE_SCALES[0];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <GraduationCap className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Weighted Grade Calculator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Leave a score blank to mark it ungraded — the calculator then works out what that assessment has to earn.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="grid gap-4">
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Assessment</th>
                  <th scope="col" className="px-3 py-2 font-medium">Weight</th>
                  <th scope="col" className="px-3 py-2 font-medium">Score %</th>
                  <th scope="col" className="px-3 py-2 font-medium"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`wg-name-${item.id}`}>
                        Name of assessment {index + 1}
                      </label>
                      <input id={`wg-name-${item.id}`} className={INPUT_CLASS} value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`wg-weight-${item.id}`}>
                        Weight of {item.name || `assessment ${index + 1}`}
                      </label>
                      <input id={`wg-weight-${item.id}`} className={`${INPUT_CLASS} w-24`} value={item.weight} onChange={(e) => updateItem(item.id, "weight", e.target.value)} inputMode="decimal" />
                    </td>
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`wg-score-${item.id}`}>
                        Score for {item.name || `assessment ${index + 1}`}, blank if not yet graded
                      </label>
                      <input
                        id={`wg-score-${item.id}`}
                        className={`${INPUT_CLASS} w-24`}
                        value={item.score}
                        placeholder="ungraded"
                        onChange={(e) => updateItem(item.id, "score", e.target.value)}
                        inputMode="decimal"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name || `assessment ${index + 1}`}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className={GHOST_BTN} onClick={addItem} aria-label="Add another assessment row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add assessment
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wg-scale">
                Grade scale
              </label>
              <select id="wg-scale" className={`mt-1 ${INPUT_CLASS}`} value={scaleId} onChange={(e) => setScaleId(e.target.value)}>
                {GRADE_SCALES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wg-target">
                Target final grade (%)
              </label>
              <input id="wg-target" className={`mt-1 ${INPUT_CLASS}`} value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied the grade summary to the clipboard" : "Copy the grade summary to the clipboard"}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the calculator to its example course">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </section>

        <section className="grid gap-4">
          <div
            className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {error ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-sm text-[var(--muted-foreground)]">Grade on work graded so far</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {error ? DASH : `${two(grade.currentPercent)}%`}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--success)]">
              {error ? DASH : `${grade.currentLetter} · ${gpa(grade.currentGpa)} on the 4.0 scale`}
            </p>

            <dl className="mt-4">
              <Row label="Weight graded" value={error ? DASH : `${two(grade.gradedWeight)} of ${two(grade.totalWeight)}`} />
              <Row label="Grade points banked" value={error ? DASH : two(grade.pointsEarned)} />
              <Row label="Projected if nothing else is submitted" value={error ? DASH : `${two(grade.projectedPercent)}% (${grade.projectedLetter})`} />
              <Row label="Highest grade still reachable" value={error ? DASH : `${two(grade.maxPossiblePercent)}%`} />
              <Row label="Weights total 100?" value={error ? DASH : grade.weightsSumTo100 ? "Yes" : `No — they total ${two(grade.totalWeight)}`} />
            </dl>
          </div>

          <div
            className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="text-sm font-semibold text-[var(--foreground)]">To finish on {two(Number(target))}%</h2>
            {needed.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {needed.error}
              </p>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                  {two(needed.neededPercent)}%
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  average across the remaining {two(needed.remainingWeight)} of weight
                </p>
                {needed.impossible ? (
                  <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                    That target is out of reach — even a perfect score on everything left tops out at {two(needed.maxPossiblePercent)}%.
                  </p>
                ) : null}
                {needed.alreadyAchieved ? (
                  <p className="mt-3 text-sm font-semibold text-[var(--success)]">
                    Already secured — even a zero on the rest keeps you at or above this target.
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">{activeScale.label}</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead className="text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">Letter</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">From</th>
                    <th scope="col" className="py-2 text-right font-medium">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {activeScale.scale.map((band) => (
                    <tr key={band.letter} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-3 text-[var(--foreground)]">{band.letter}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--foreground)]">{band.min}%</td>
                      <td className="py-2 text-right tabular-nums text-[var(--foreground)]">{gpa(band.gpa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
