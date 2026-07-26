"use client";

import { useMemo, useState } from "react";
import { Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SUBJECTS = [
  { id: 1, name: "English", obtained: "78", total: "100" },
  { id: 2, name: "Mathematics", obtained: "91", total: "100" },
  { id: 3, name: "Science", obtained: "84", total: "100" },
  { id: 4, name: "Social Science", obtained: "72", total: "100" },
  { id: 5, name: "Second Language", obtained: "88", total: "100" },
];

const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numPlain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** Indian CBSE-style grade bands, applied to the aggregate percentage. */
function gradeFor(percent) {
  if (percent >= 91) return { grade: "A1", note: "Outstanding" };
  if (percent >= 81) return { grade: "A2", note: "Excellent" };
  if (percent >= 71) return { grade: "B1", note: "Very good" };
  if (percent >= 61) return { grade: "B2", note: "Good" };
  if (percent >= 51) return { grade: "C1", note: "Above average" };
  if (percent >= 41) return { grade: "C2", note: "Average" };
  if (percent >= 33) return { grade: "D", note: "Pass" };
  return { grade: "E", note: "Needs improvement" };
}

export default function ToolHome() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [nextId, setNextId] = useState(6);
  const [passMark, setPassMark] = useState("33");
  const [copied, setCopied] = useState(false);

  const updateSubject = (id, field, value) => {
    setSubjects((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addSubject = () => {
    setSubjects((prev) => [
      ...prev,
      { id: nextId, name: `Subject ${prev.length + 1}`, obtained: "", total: "100" },
    ]);
    setNextId((n) => n + 1);
  };

  const removeSubject = (id) => {
    setSubjects((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const reset = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setNextId(6);
    setPassMark("33");
  };

  const result = useMemo(() => {
    const errors = [];
    let sumObtained = 0;
    let sumTotal = 0;
    const rows = [];

    const passPercent = Math.min(100, Math.max(0, Number(passMark) || 0));

    subjects.forEach((row, index) => {
      const label = row.name.trim() || `Subject ${index + 1}`;
      const hasObtained = row.obtained !== "" && row.obtained !== null;
      const hasTotal = row.total !== "" && row.total !== null;
      if (!hasObtained || !hasTotal) return;

      const obtained = Number(row.obtained);
      const total = Number(row.total);

      if (!Number.isFinite(obtained) || !Number.isFinite(total)) {
        errors.push(`${label}: marks must be numbers.`);
        return;
      }
      if (total <= 0) {
        errors.push(`${label}: total marks must be greater than 0.`);
        return;
      }
      if (obtained < 0) {
        errors.push(`${label}: obtained marks cannot be negative.`);
        return;
      }
      if (obtained > total) {
        errors.push(`${label}: obtained marks (${numPlain.format(obtained)}) cannot exceed total (${numPlain.format(total)}).`);
        return;
      }

      sumObtained += obtained;
      sumTotal += total;
      const percent = (obtained / total) * 100;
      rows.push({
        id: row.id,
        label,
        obtained,
        total,
        percent,
        passed: percent >= passPercent,
      });
    });

    const percentage = sumTotal > 0 ? (sumObtained / sumTotal) * 100 : 0;
    const failing = rows.filter((r) => !r.passed);

    return {
      errors,
      rows,
      sumObtained,
      sumTotal,
      percentage,
      passPercent,
      failing,
      ready: sumTotal > 0,
      ...gradeFor(percentage),
    };
  }, [subjects, passMark]);

  const reportText = useMemo(() => {
    if (!result.ready) return "";
    const lines = [
      "Marks Percentage Calculator",
      `Total obtained: ${numPlain.format(result.sumObtained)} / ${numPlain.format(result.sumTotal)}`,
      `Percentage: ${num2.format(result.percentage)}%`,
      `Grade band: ${result.grade} (${result.note})`,
      `Pass mark used: ${numPlain.format(result.passPercent)}%`,
      "",
      "Subject-wise:",
      ...result.rows.map(
        (r) =>
          `- ${r.label}: ${numPlain.format(r.obtained)}/${numPlain.format(r.total)} = ${num2.format(r.percent)}%${r.passed ? "" : " (below pass mark)"}`
      ),
    ];
    return lines.join("\n");
  }, [result]);

  const copyResult = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Exam results
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Marks Percentage Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Add every subject with its obtained and maximum marks. The aggregate percentage is
            total obtained divided by total maximum, multiplied by 100.
          </p>
        </header>

        <section
          aria-label="Subject marks"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="space-y-4">
            {subjects.map((row, index) => (
              <div
                key={row.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label
                    htmlFor={`subject-name-${row.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Subject {index + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSubject(row.id)}
                    disabled={subjects.length <= 1}
                    aria-label={`Remove subject ${index + 1}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <input
                  id={`subject-name-${row.id}`}
                  type="text"
                  value={row.name}
                  onChange={(e) => updateSubject(row.id, "name", e.target.value)}
                  placeholder="Subject name"
                  className={INPUT_CLASS}
                />

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`obtained-${row.id}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Marks obtained
                    </label>
                    <input
                      id={`obtained-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.25"
                      value={row.obtained}
                      onChange={(e) => updateSubject(row.id, "obtained", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor={`total-${row.id}`} className="mb-1 block text-sm font-medium">
                      Maximum marks
                    </label>
                    <input
                      id={`total-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      value={row.total}
                      onChange={(e) => updateSubject(row.id, "total", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pass-mark" className="mb-1 block text-sm font-medium">
                Pass mark per subject (%)
              </label>
              <input
                id="pass-mark"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={passMark}
                onChange={(e) => setPassMark(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="button" onClick={addSubject} className={PRIMARY_BTN}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add subject
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all subjects to defaults"
                className={GHOST_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </section>

        {result.errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 space-y-1 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <section
          aria-label="Percentage result"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Aggregate percentage
              </p>
              <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
                {result.ready ? `${num2.format(result.percentage)}%` : "--"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.ready
                  ? `Grade ${result.grade} - ${result.note}`
                  : "Enter marks for at least one subject."}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={!result.ready}
              aria-label="Copy percentage result to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Total marks obtained</dt>
              <dd className="font-semibold">{numPlain.format(result.sumObtained)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Total maximum marks</dt>
              <dd className="font-semibold">{numPlain.format(result.sumTotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Subjects counted</dt>
              <dd className="font-semibold">{result.rows.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-[var(--muted-foreground)]">Subjects below pass mark</dt>
              <dd
                className={`font-semibold ${
                  result.failing.length > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
                }`}
              >
                {result.failing.length}
              </dd>
            </div>
          </dl>

          {result.rows.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Subject-wise percentage
              </p>
              <ul className="space-y-2">
                {result.rows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{row.label}</span>
                      <span
                        className={`font-semibold ${
                          row.passed ? "text-[var(--foreground)]" : "text-[var(--danger)]"
                        }`}
                      >
                        {num2.format(row.percent)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                      <span>
                        {numPlain.format(row.obtained)} / {numPlain.format(row.total)}
                      </span>
                      <span>{row.passed ? "Pass" : "Below pass mark"}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${Math.min(100, Math.max(0, row.percent))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
