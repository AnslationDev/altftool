"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  BEST_OF_COUNT,
  CBSE_PASS_PERCENT,
  DEFAULT_SUBJECT_MAX,
  MAX_SUBJECTS,
  computeBestOfFive,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: "r1", name: "English Core", marks: "75", isLanguage: true, eligible: true },
  { id: "r2", name: "Physics", marks: "88", isLanguage: false, eligible: true },
  { id: "r3", name: "Chemistry", marks: "82", isLanguage: false, eligible: true },
  { id: "r4", name: "Mathematics", marks: "95", isLanguage: false, eligible: true },
  { id: "r5", name: "Computer Science", marks: "91", isLanguage: false, eligible: true },
  { id: "r6", name: "Physical Education", marks: "68", isLanguage: false, eligible: true },
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [targetPercent, setTargetPercent] = useState("90");
  const [nextId, setNextId] = useState(7);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () =>
      computeBestOfFive({
        subjects: rows.map((row) => ({
          name: row.name,
          marks: toNumber(row.marks),
          maxMarks: DEFAULT_SUBJECT_MAX,
          isLanguage: row.isLanguage,
          eligible: row.eligible,
        })),
        targetPercent: targetPercent === "" ? null : toNumber(targetPercent),
      }),
    [rows, targetPercent],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, field, value) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const setLanguage = (id) =>
    setRows((current) => current.map((row) => ({ ...row, isLanguage: row.id === id })));

  const addRow = () => {
    setRows((current) =>
      current.length >= MAX_SUBJECTS
        ? current
        : [
            ...current,
            {
              // `nextId` only ever increases, unlike `current.length` (which can repeat a
              // number after a remove-then-add cycle) — using it here keeps default subject
              // names unique so two rows never end up sharing a name.
              id: `r${nextId}`,
              name: `Subject ${nextId}`,
              marks: "70",
              isLanguage: false,
              eligible: true,
            },
          ],
    );
    setNextId((value) => value + 1);
  };

  const removeRow = (id) =>
    setRows((current) => (current.length > BEST_OF_COUNT ? current.filter((row) => row.id !== id) : current));

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "CBSE Best of Five",
      `Best of five: ${result.totalMarks} / ${result.totalMax} = ${pct(result.percentage)}`,
      `Counted: ${result.selected.map((row) => `${row.name} ${row.marks}`).join(", ")}`,
    ];
    if (result.excluded.length > 0) {
      lines.push(`Dropped: ${result.excluded.map((row) => `${row.name} ${row.marks}`).join(", ")}`);
    }
    lines.push(
      result.bestOfFiveAdvantage >= 0
        ? `All subjects counted: ${pct(result.allSubjectPercent)} (best of five is ${num(result.bestOfFiveAdvantage)} points higher)`
        : `All subjects counted: ${pct(result.allSubjectPercent)} (best of five is ${num(Math.abs(result.bestOfFiveAdvantage))} points lower)`,
    );
    if (result.target && !result.target.error) {
      lines.push(
        result.target.met
          ? `Target of ${result.target.percent}% met.`
          : `Target of ${result.target.percent}% needs ${result.target.marksNeeded} marks — ${result.target.shortfall} short.`,
      );
    }
    lines.push("", result.verdict);
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = () => copyToClipboard("result", summary, { label: "CBSE best of five result" });

  const reset = () => {
    if (!window.confirm("Reset all subjects and the target percentage? This clears everything you've entered.")) {
      return;
    }
    setRows(DEFAULT_ROWS);
    setTargetPercent("90");
    resetCopyState();
  };

  // Keyed by row index (not name) — subject names are free-text and not guaranteed unique
  // (e.g. two rows both left at a default "Subject N" name), so a name-based lookup could
  // show a dropped subject as "counted" whenever two rows share a name.
  const countedIndexes = new Set(hasError ? [] : result.selected.map((row) => row.index));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          CBSE Class 12
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          CBSE Best Of Five Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          CBSE prints subject marks, not an aggregate. The percentage colleges ask for is the
          compulsory language plus your four highest scoring subjects, out of 500. Enter every
          subject you offered, including the sixth, and see which one drops out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your subjects</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each subject is marked out of {DEFAULT_SUBJECT_MAX}. Pick the one compulsory language —
          it is counted whatever it scores.
        </p>

        <div className="mt-4 grid gap-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-md border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bo5-name-${row.id}`}>
                    Subject {index + 1}
                  </label>
                  <input
                    id={`bo5-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bo5-marks-${row.id}`}>
                    Marks
                  </label>
                  <input
                    id={`bo5-marks-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={DEFAULT_SUBJECT_MAX}
                    step="1"
                    value={row.marks}
                    onChange={(event) => updateRow(row.id, "marks", event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label
                  className="flex min-h-11 items-center gap-2 text-sm"
                  htmlFor={`bo5-lang-${row.id}`}
                >
                  <input
                    id={`bo5-lang-${row.id}`}
                    type="radio"
                    name="bo5-language"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={row.isLanguage}
                    onChange={() => setLanguage(row.id)}
                  />
                  <span>Compulsory language</span>
                </label>
                <label
                  className="flex min-h-11 items-center gap-2 text-sm"
                  htmlFor={`bo5-elig-${row.id}`}
                  title={
                    row.isLanguage
                      ? "The compulsory language is always counted, whatever it scores — it cannot be dropped."
                      : undefined
                  }
                >
                  <input
                    id={`bo5-elig-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)] disabled:opacity-50"
                    checked={row.isLanguage ? true : row.eligible}
                    disabled={row.isLanguage}
                    onChange={(event) => updateRow(row.id, "eligible", event.target.checked)}
                  />
                  <span>{row.isLanguage ? "Always counted (compulsory language)" : "Counts towards the aggregate"}</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.name || `subject ${index + 1}`}`}
                  disabled={rows.length <= BEST_OF_COUNT}
                  className={`${GHOST_BTN} ml-auto px-3 disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_SUBJECTS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-40`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a subject
        </button>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="bo5-target">
            Percentage you are aiming at (optional)
          </label>
          <input
            id="bo5-target"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.5"
            value={targetPercent}
            onChange={(event) => setTargetPercent(event.target.value)}
          />
          {!hasError && result.target?.error ? (
            <p role="alert" className="mt-2 text-sm font-medium text-[var(--danger)]">
              {result.target.error} The rest of the result below still reflects your subjects.
            </p>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Best of five percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.percentage)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the result."
                : `${num(result.totalMarks)} out of ${num(result.totalMax)} across ${BEST_OF_COUNT} subjects`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied best of five result" : "Copy best of five result"}
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total of the five counted subjects", hasError ? DASH : num(result.totalMarks)],
            [
              "Counting every subject instead",
              hasError
                ? DASH
                : `${pct(result.allSubjectPercent)} (${num(result.allSubjectMarks)} of ${num(result.allSubjectMax)})`,
            ],
            [
              !hasError && result.bestOfFiveAdvantage < 0
                ? "Change from dropping the weakest (a loss here)"
                : "Gain from dropping the weakest",
              hasError ? DASH : `${num(result.bestOfFiveAdvantage)} percentage points`,
            ],
            [
              "Subject dropped",
              hasError
                ? DASH
                : result.excluded.length === 0
                  ? "none — only five subjects entered"
                  : result.excluded.map((row) => `${row.name} (${num(row.marks)})`).join(", "),
            ],
            [
              "Marks the dropped subject needed to get in",
              hasError || result.marksToDisplace === null ? DASH : num(result.marksToDisplace),
            ],
            [
              "Every subject above the pass mark",
              hasError ? DASH : result.allPassed ? `Yes (${CBSE_PASS_PERCENT}% each)` : `No — ${result.failedSubjects.map((row) => row.name).join(", ")}`,
            ],
            ...(hasError || !result.target || result.target.error
              ? []
              : [
                  [
                    `Marks needed for ${num(result.target.percent)}%`,
                    result.target.met
                      ? "already reached"
                      : `${num(result.target.marksNeeded)} (${num(result.target.shortfall)} short)`,
                  ],
                  [
                    "That is an average per subject of",
                    num(result.target.averagePerSubject),
                  ],
                ]),
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}
      </section>

      {!hasError && (
        <section
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          aria-live="polite"
          role="status"
        >
          <h2 className="text-base font-semibold">Which subjects were counted</h2>
          <div className="mt-4 -mx-1 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="px-1 py-2 font-semibold">Subject</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Marks</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Percent</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">In aggregate</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-t border-[var(--border)]">
                    <th scope="row" className="px-1 py-3 text-left font-semibold">
                      {row.name}
                      {row.isLanguage ? (
                        <span className="ml-2 rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                          language
                        </span>
                      ) : null}
                    </th>
                    <td className="px-1 py-3 text-right">{num(row.marks)}</td>
                    <td className="px-1 py-3 text-right">{pct(row.percent)}</td>
                    <td className="px-1 py-3 text-right">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          countedIndexes.has(row.index)
                            ? "bg-[var(--success-soft)] text-[var(--success)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {countedIndexes.has(row.index) ? "counted" : "dropped"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Which subjects an institution allows in the aggregate differs — several
        universities publish lists of eligible subjects and apply a deduction when a subject outside
        the list is used. Read the prospectus of the course you are applying to before quoting a
        best-of-five percentage on a form.
      </p>
    </main>
  );
}
