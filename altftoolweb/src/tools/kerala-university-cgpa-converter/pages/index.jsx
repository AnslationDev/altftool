"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  KERALA_GRADE_BANDS,
  SCALE_OPTIONS,
  keralaCgpaFromSemesters,
  keralaGpaToPercentage,
  keralaPercentageToGpa,
  requiredSgpaForTarget,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const gp = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SEMESTERS = [
  { sgpa: "7.2", credits: "20" },
  { sgpa: "8.0", credits: "24" },
];

export default function ToolHome() {
  const [scaleId, setScaleId] = useState("10");
  const [mode, setMode] = useState("toPercent");
  const [gpaInput, setGpaInput] = useState("7.6");
  const [percentInput, setPercentInput] = useState("76");
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [target, setTarget] = useState({
    currentCgpa: "7",
    creditsDone: "80",
    creditsRemaining: "40",
    targetCgpa: "7.5",
  });
  const [copied, setCopied] = useState(false);

  const scaleMax = useMemo(
    () => (SCALE_OPTIONS.find((option) => option.id === scaleId) || SCALE_OPTIONS[0]).max,
    [scaleId],
  );

  const forward = useMemo(
    () => keralaGpaToPercentage({ cgpa: gpaInput, scaleMax }),
    [gpaInput, scaleMax],
  );
  const reverse = useMemo(
    () => keralaPercentageToGpa({ percentage: percentInput, scaleMax }),
    [percentInput, scaleMax],
  );
  const aggregate = useMemo(
    () => keralaCgpaFromSemesters(semesters, scaleMax),
    [semesters, scaleMax],
  );
  const goal = useMemo(
    () => requiredSgpaForTarget({ ...target, scaleMax }),
    [target, scaleMax],
  );

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "Kerala University CGPA to percentage",
        `Scale: out of ${forward.scaleMax}`,
        `CGPA / SGPA: ${gp(forward.gpa)}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Letter grade: ${forward.grade} (${forward.gradeLabel})`,
      ].join("\n");
    }
    return [
      "Kerala University percentage to CGPA",
      `Scale: out of ${reverse.scaleMax}`,
      `Percentage: ${pct(reverse.percentage)}`,
      `Equivalent grade point average: ${gp(reverse.gpa)}`,
      `Letter grade: ${reverse.grade} (${reverse.gradeLabel})`,
    ].join("\n");
  }, [ok, mode, forward, reverse]);

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
    setScaleId("10");
    setMode("toPercent");
    setGpaInput("7.6");
    setPercentInput("76");
    setSemesters(DEFAULT_SEMESTERS);
    setTarget({ currentCgpa: "7", creditsDone: "80", creditsRemaining: "40", targetCgpa: "7.5" });
    setCopied(false);
  };

  const updateSemester = (index, key, value) =>
    setSemesters((rows) =>
      rows.map((row, position) => (position === index ? { ...row, [key]: value } : row)),
    );

  const addSemester = () => setSemesters((rows) => [...rows, { sgpa: "", credits: "20" }]);
  const removeSemester = (index) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((_, position) => position !== index) : rows));

  const setTargetField = (key, value) =>
    setTarget((current) => ({ ...current, [key]: value }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          University of Kerala
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kerala University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Equivalent marks are a proportion of the scale: percentage = CGPA &divide; scale maximum
          &times; 100. On the current 10 point mark list that is simply CGPA &times; 10, so set the
          scale to match the ceiling printed on your own mark list before reading the answer.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-5">
          <label className={LABEL_CLASS} htmlFor="ku-scale">
            Grade point scale on your mark list
          </label>
          <select
            id="ku-scale"
            className={`mt-2 ${INPUT_CLASS}`}
            value={scaleId}
            onChange={(event) => setScaleId(event.target.value)}
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div role="group" aria-label="Conversion direction" className="mb-5 grid gap-2 sm:grid-cols-2">
          {[
            ["toPercent", "CGPA to percentage"],
            ["toCgpa", "Percentage to CGPA"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={
                mode === value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "toPercent" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="ku-gpa">
              CGPA or SGPA (out of {scaleMax})
            </label>
            <input
              id="ku-gpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={scaleMax}
              step="0.01"
              value={gpaInput}
              onChange={(event) => setGpaInput(event.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="ku-percent">
              Percentage of marks
            </label>
            <input
              id="ku-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={percentInput}
              onChange={(event) => setPercentInput(event.target.value)}
            />
          </div>
        )}
      </section>

      {active.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {mode === "toPercent" ? "Equivalent percentage" : "Equivalent grade point average"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (mode === "toPercent" ? pct(forward.percentage) : gp(reverse.gpa)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Calculated as ${active.formula}` : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the conversion result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(mode === "toPercent"
            ? [
                ["Grade point average entered", ok ? gp(forward.gpa) : "—"],
                ["Scale maximum", ok ? String(forward.scaleMax) : "—"],
                ["Equivalent percentage", ok ? pct(forward.percentage) : "—"],
                ["Letter grade", ok ? `${forward.grade} — ${forward.gradeLabel}` : "—"],
                ["Above the pass line", ok ? (forward.passing ? "Yes" : "No") : "—"],
              ]
            : [
                ["Percentage entered", ok ? pct(reverse.percentage) : "—"],
                ["Equivalent grade point average", ok ? gp(reverse.gpa) : "—"],
                ["Scale maximum", ok ? String(reverse.scaleMax) : "—"],
                ["Letter grade", ok ? `${reverse.grade} — ${reverse.gradeLabel}` : "—"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">CGPA from semester SGPAs</h2>
        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={`sem-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ku-sgpa-${index}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`ku-sgpa-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={scaleMax}
                  step="0.01"
                  value={row.sgpa}
                  onChange={(event) => updateSemester(index, "sgpa", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ku-cred-${index}`}>
                  Credits
                </label>
                <input
                  id={`ku-cred-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(index, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSemester(index)}
                disabled={semesters.length < 2}
                aria-label={`Remove semester ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSemester} className={`${GHOST_BTN} mt-3`}>
          Add semester
        </button>

        {aggregate.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {aggregate.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Credit weighted CGPA", gp(aggregate.cgpa)],
              ["Total credits", NUM1.format(aggregate.totalCredits)],
              ["Equivalent percentage", pct(aggregate.percentage)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">SGPA still needed for a target CGPA</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["currentCgpa", `Current CGPA (out of ${scaleMax})`, "0.01"],
            ["creditsDone", "Credits already completed", "0.5"],
            ["creditsRemaining", "Credits still to take", "0.5"],
            ["targetCgpa", `Target CGPA (out of ${scaleMax})`, "0.01"],
          ].map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`ku-goal-${key}`}>
                {label}
              </label>
              <input
                id={`ku-goal-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={target[key]}
                onChange={(event) => setTargetField(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        {goal.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {goal.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-3xl font-semibold text-[var(--primary)]">
              {goal.alreadyAchieved
                ? "Already reached"
                : goal.achievable
                  ? gp(goal.requiredSgpa)
                  : "Out of reach"}
            </p>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Average SGPA needed on remaining credits", goal.achievable ? gp(goal.requiredSgpa) : gp(goal.rawRequired)],
                ["Equivalent percentage in those courses", goal.achievable ? pct(goal.requiredPercentage) : "—"],
                ["Best CGPA still possible", gp(goal.bestPossibleCgpa)],
                ["Total credits in the programme", NUM1.format(goal.totalCredits)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {!goal.achievable && (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Even a perfect {scaleMax} in every remaining credit lands at{" "}
                {gp(goal.bestPossibleCgpa)}, so this target cannot be met from here.
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Letter grades on the 10 point scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Marks
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Point
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {KERALA_GRADE_BANDS.map((row) => (
                <tr key={row.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {row.minMarks} &ndash; {row.maxMarks === 100 ? "100" : `below ${row.maxMarks}`}
                  </td>
                  <td className="py-2 pr-3 font-semibold">{row.grade}</td>
                  <td className="py-2 pr-3">{row.point}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion. Scales and pass floors differ between Kerala regulations and
        programmes, so read the ceiling and the pass mark off your own mark list, and ask the
        university for a certified equivalence when a form demands one.
      </p>
    </main>
  );
}
