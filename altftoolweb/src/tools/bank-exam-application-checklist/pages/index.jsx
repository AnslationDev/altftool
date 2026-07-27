"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CATEGORIES,
  EXAMS,
  buildBankExamChecklist,
  computeChecklistProgress,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const RELAXATION_OPTIONS = [
  { key: "pwbd", label: "Person with Benchmark Disability (40% or more)" },
  { key: "exServiceman", label: "Ex-serviceman" },
  { key: "jkDomicile", label: "Domiciled in J&K, 1980-1989" },
  { key: "widowDivorced", label: "Widow / divorced woman, not remarried" },
];

const DEFAULTS = {
  examId: "ibps-po",
  dob: "2000-05-15",
  cutoffDate: "2025-08-01",
  categoryId: "general",
};

const DEFAULT_FLAGS = {
  pwbd: false,
  exServiceman: false,
  jkDomicile: false,
  widowDivorced: false,
};

export default function ToolHome() {
  const [examId, setExamId] = useState(DEFAULTS.examId);
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [cutoffDate, setCutoffDate] = useState(DEFAULTS.cutoffDate);
  const [categoryId, setCategoryId] = useState(DEFAULTS.categoryId);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [doneIds, setDoneIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const toggleDone = (id) =>
    setDoneIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () => buildBankExamChecklist({ examId, dob, cutoffDate, categoryId, ...flags }),
    [examId, dob, cutoffDate, categoryId, flags],
  );

  const hasError = Boolean(result.error);

  const progress = useMemo(
    () => computeChecklistProgress(hasError ? [] : result.checklist, doneIds),
    [hasError, result, doneIds],
  );

  const groups = useMemo(() => {
    if (hasError) return [];
    const map = new Map();
    result.checklist.forEach((item) => {
      const key = item.group || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Bank Exam Application Checklist — ${result.exam.label}`,
      `Cut-off date: ${cutoffDate}`,
      `Age on cut-off: ${result.age.years}y ${result.age.months}m ${result.age.days}d`,
      `Age window: ${result.minAge} to ${result.effectiveMaxAge} years (base ${result.baseMaxAge} + ${result.relaxation.years} relaxation)`,
      `Acceptable date of birth: ${result.earliestDob} to ${result.latestDob}`,
      `Verdict: ${result.verdict}`,
      "",
      "Checklist:",
    ];
    groups.forEach((group) => {
      lines.push(`-- ${group.name} --`);
      group.items.forEach((item) =>
        lines.push(`[${doneIds.includes(item.id) ? "x" : " "}] ${item.label}`),
      );
    });
    return lines.join("\n");
  }, [hasError, result, groups, doneIds, cutoffDate]);

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
    setExamId(DEFAULTS.examId);
    setDob(DEFAULTS.dob);
    setCutoffDate(DEFAULTS.cutoffDate);
    setCategoryId(DEFAULTS.categoryId);
    setFlags(DEFAULT_FLAGS);
    setDoneIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          IBPS &amp; SBI
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bank Exam Application Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The age bar is checked first, the way the notification states it — as a date-of-birth
          range on the cut-off date. Then every field, upload spec and certificate the online form
          will ask for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bea-exam">
              Exam
            </label>
            <select
              id="bea-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
            >
              {EXAMS.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bea-category">
              Category
            </label>
            <select
              id="bea-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bea-dob">
              Date of birth (as on the Class 10 certificate)
            </label>
            <input
              id="bea-dob"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bea-cutoff">
              Cut-off date from the notification
            </label>
            <input
              id="bea-cutoff"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cutoffDate}
              onChange={(event) => setCutoffDate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Further relaxation claimed
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {RELAXATION_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`bea-f-${option.key}`}>
                <input
                  id={`bea-f-${option.key}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[option.key]}
                  onChange={() => toggleFlag(option.key)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            The widow and divorced-woman relaxation is applied to clerical-cadre posts only.
          </p>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Age on the cut-off date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${result.age.years}y ${result.age.months}m ${result.age.days}d`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? "Fix the dates above to see the verdict." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the application checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Age window after relaxation", hasError ? DASH : `${result.minAge} to ${result.effectiveMaxAge} years`],
            ["Base upper limit", hasError ? DASH : `${result.baseMaxAge} years`],
            ["Relaxation added", hasError ? DASH : `${result.relaxation.years} years`],
            ["Earliest acceptable date of birth", hasError ? DASH : result.earliestDob],
            ["Latest acceptable date of birth", hasError ? DASH : result.latestDob],
            ["Checklist items done", hasError ? DASH : `${progress.done} of ${progress.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.relaxation.parts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.relaxation.parts.map((part) => (
              <li
                key={part.label}
                className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                {part.label} +{part.years}y
              </li>
            ))}
          </ul>
        )}

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${progress.percent} percent of the checklist is done`}
            >
              <span
                className={`block h-full ${progress.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {progress.percent}% ready — {result.exam.qualification}.
            </p>
          </div>
        )}
      </section>

      {!hasError && !result.eligible && (
        <section
          className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
          <p className="text-sm leading-6 text-[var(--danger)]">
            {result.tooYoung
              ? `You reach ${result.minAge} only after this cut-off date. No category relaxation lowers a minimum age — the next cycle's cut-off is the one to aim at.`
              : `The notification would accept a date of birth from ${result.earliestDob} onwards. Check whether a further relaxation applies to you before giving up on this cycle.`}
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Scanned upload specification</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Upload</th>
                  <th className="py-2 pr-3 font-semibold">Dimensions</th>
                  <th className="py-2 font-semibold">File size</th>
                </tr>
              </thead>
              <tbody>
                {result.uploads.map((spec) => (
                  <tr key={spec.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{spec.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {spec.detail}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{spec.pixels}</td>
                    <td className="py-2.5 whitespace-nowrap">{spec.sizeKb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Format: {result.uploadFormat}. Declaration text: &ldquo;{result.declarationText}&rdquo;
          </p>
        </section>
      )}

      {!hasError &&
        groups.map((group) => (
          <section
            key={group.name}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.name}</h2>
            <ul className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <label className={CHECK_ROW} htmlFor={`bea-i-${item.id}`}>
                    <input
                      id={`bea-i-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={doneIds.includes(item.id)}
                      onChange={() => toggleDone(item.id)}
                    />
                    <span className="min-w-0">
                      {item.label}
                      {item.required === false && (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">optional</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Age bands, cut-off dates, fees and upload specifications are set afresh
        in every recruitment cycle — read the notification PDF for the cycle you are applying to,
        and treat its wording as the authority over anything shown here.
      </p>
    </main>
  );
}
