"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  KERALA_GRADES,
  KERALA_PASS_PERCENT,
  KERALA_SCOPES,
  computeKeralaResult,
  marksNeededInRemaining,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const num = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NAMES = ["English", "Malayalam", "Physics", "Chemistry", "Mathematics", "Biology"];

const buildDefaults = (scope) => {
  const max = scope === "combined" ? "200" : "100";
  const marks =
    scope === "combined"
      ? ["180", "172", "190", "165", "158", "176"]
      : ["90", "86", "95", "82", "79", "88"];
  return NAMES.map((name, index) => ({
    id: index + 1,
    name,
    marks: marks[index],
    max,
  }));
};

export default function ToolHome() {
  const [scope, setScope] = useState("combined");
  const [subjects, setSubjects] = useState(() => buildDefaults("combined"));
  const [nextId, setNextId] = useState(7);
  const [remainingMax, setRemainingMax] = useState("0");
  const [target, setTarget] = useState("90");
  const [copied, setCopied] = useState(false);

  const scopeRecord = KERALA_SCOPES.find((item) => item.value === scope) || KERALA_SCOPES[0];
  const result = useMemo(() => computeKeralaResult({ scope, subjects }), [scope, subjects]);
  const ok = !result.error;

  const projection = useMemo(() => {
    if (!ok) return { error: "Fix the marksheet above first." };
    return marksNeededInRemaining({
      obtainedSoFar: result.totalObtained,
      maxSoFar: result.totalMax,
      remainingMax,
      targetPercent: target,
    });
  }, [ok, result.totalObtained, result.totalMax, remainingMax, target]);

  const switchScope = (value) => {
    setScope(value);
    setSubjects(buildDefaults(value));
    setNextId(7);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Kerala higher secondary — ${result.scopeLabel}`,
      `Total: ${num(result.totalObtained)} / ${num(result.totalMax)}`,
      `Percentage: ${pct(result.percentage)}`,
      `Overall grade: ${result.overallGrade}`,
      `GPA: ${NUM2.format(result.gpa)} of 9`,
      `Subjects below D+: ${result.belowPassCount}`,
    ].join("\n");
  }, [ok, result]);

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
    switchScope("combined");
    setRemainingMax("0");
    setTarget("90");
  };

  const updateSubject = (id, key, value) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSubject = () => {
    setSubjects((rows) => [
      ...rows,
      {
        id: nextId,
        name: `Subject ${rows.length + 1}`,
        marks: scope === "combined" ? "150" : "75",
        max: scope === "combined" ? "200" : "100",
      },
    ]);
    setNextId((current) => current + 1);
  };

  const removeSubject = (id) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Kerala DHSE
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kerala Plus Two Percentage Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Kerala publishes grades rather than a percentage, so the figure most application forms
          want has to be rebuilt from the marks. Enter your subjects and this gives the
          percentage, each letter grade on the nine-point scale, and the GPA.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div role="group" aria-label="Which total" className="grid gap-2 sm:grid-cols-2">
          {KERALA_SCOPES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={scope === item.value}
              onClick={() => switchScope(item.value)}
              className={
                scope === item.value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{scopeRecord.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Subject marks</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Use the subject total that already includes continuous evaluation and practical marks —
          the figure printed against the subject on your marksheet.
        </p>

        <div className="mt-4 grid gap-4">
          {subjects.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`kl-name-${row.id}`}>
                    Subject {index + 1} name
                  </label>
                  <input
                    id={`kl-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateSubject(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`kl-marks-${row.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`kl-marks-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={row.marks}
                    onChange={(event) => updateSubject(row.id, "marks", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`kl-max-${row.id}`}>
                    Maximum marks
                  </label>
                  <input
                    id={`kl-max-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={row.max}
                    onChange={(event) => updateSubject(row.id, "max", event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSubject(row.id)}
                  disabled={subjects.length < 2}
                  aria-label={`Remove subject ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSubject} className={`${GHOST_BTN} mt-4`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </button>
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
              Percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.percentage) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.totalObtained)} out of ${num(result.totalMax)} — overall grade ${result.overallGrade}`
                : "Fix the marksheet above to see a percentage"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Kerala result summary"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
              aria-label="Reset every input"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total marks obtained", ok ? num(result.totalObtained) : "—"],
            ["Grand total", ok ? num(result.totalMax) : "—"],
            ["Usual grand total for this scope", num(scopeRecord.grandTotal)],
            ["Overall letter grade", ok ? `${result.overallGrade} — ${result.overallGradeLabel}` : "—"],
            [
              "GPA (mean grade point)",
              ok ? `${NUM2.format(result.gpa)} of 9` : "—",
            ],
            [
              "Total grade points",
              ok ? `${num(result.totalGradePoints)} of ${num(result.maxGradePoints)}` : "—",
            ],
            ["All A+ (full A plus)", ok ? (result.allA ? "Yes" : "No") : "—"],
            [
              `Subjects below D+ (${KERALA_PASS_PERCENT}%)`,
              ok ? (result.belowPassCount === 0 ? "None" : result.belowPass.join(", ")) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Grade for each subject</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Marks
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Percent
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Grade
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Point
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3">
                      {num(row.marks)} / {num(row.max)}
                    </td>
                    <td className="py-2 pr-3">{pct(row.percent)}</td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        row.passed ? "text-[var(--foreground)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.grade}
                      {row.passed ? "" : ` (short by ${NUM2.format(row.shortfall)})`}
                    </td>
                    <td className="py-2">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Subjects still to be written</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          If some papers are still pending, put their combined maximum here to see what they must
          score for the overall percentage to reach your target.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-remaining">
              Maximum marks still pending
            </label>
            <input
              id="kl-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={remainingMax}
              onChange={(event) => setRemainingMax(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kl-target">
              Target overall percentage
            </label>
            <input
              id="kl-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
        </div>

        {projection.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {projection.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Overall total the target needs", num(projection.requiredTotal)],
              [
                "Marks needed from the pending papers",
                projection.alreadyReached ? "Already reached" : num(projection.needed),
              ],
              [
                "Possible within the pending maximum",
                projection.alreadyReached ? "Yes" : projection.achievable ? "Yes" : "No",
              ],
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
        <h2 className="text-base font-semibold">Kerala grade scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Percentage
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
              {KERALA_GRADES.map((grade) => (
                <tr key={grade.code} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{grade.code}</td>
                  <td className="py-2 pr-3">
                    {grade.min === 0 ? "Below 20" : `${grade.min} and above`}
                  </td>
                  <td className="py-2 pr-3">{grade.point}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{grade.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Kerala also requires the theory component of each subject to clear the
        D+ minimum on its own, separately from continuous evaluation marks, so a comfortable
        subject total does not by itself guarantee a pass. Check your grade card.
      </p>
    </main>
  );
}
