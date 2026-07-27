"use client";

import { useMemo, useState } from "react";
import { BookMarked, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BOARD_RULES,
  MAX_OTHER_SUBJECTS,
  SUBJECT_MAX,
  computeCiscePercentage,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  board: "icse",
  english: "89",
  others: [
    { name: "Mathematics", marks: "95" },
    { name: "Science", marks: "92" },
    { name: "Hindi", marks: "90" },
    { name: "History & Civics", marks: "85" },
    { name: "Geography", marks: "78" },
    { name: "Computer Applications", marks: "74" },
  ],
};

const makeRow = () => ({ name: "", marks: "" });

export default function ToolHome() {
  const [board, setBoard] = useState(DEFAULTS.board);
  const [english, setEnglish] = useState(DEFAULTS.english);
  const [others, setOthers] = useState(DEFAULTS.others);
  const [copied, setCopied] = useState(false);

  const rules = BOARD_RULES[board];

  const result = useMemo(
    () => computeCiscePercentage({ board, english, others }),
    [board, english, others],
  );
  const hasError = Boolean(result.error);

  const updateRow = (index, patch) => {
    setOthers((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setOthers((prev) => (prev.length >= MAX_OTHER_SUBJECTS ? prev : [...prev, makeRow()]));
  };

  const removeRow = (index) => {
    setOthers((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${result.boardLabel} percentage: ${NUM.format(result.percent)}%`,
      `English (compulsory): ${NUM.format(result.english)}/${SUBJECT_MAX}`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${NUM.format(row.marks)}/${SUBJECT_MAX}${row.counted ? " (counted)" : " (dropped)"}`,
      ),
      `Formula: (English + best ${result.countedSubjects - 1} others) ÷ ${result.countedSubjects} = ${NUM.format(result.countedTotal)} ÷ ${result.countedSubjects}`,
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
    setBoard(DEFAULTS.board);
    setEnglish(DEFAULTS.english);
    setOthers(DEFAULTS.others);
    setCopied(false);
  };

  const statusLine = hasError
    ? "Fix the input above to see a result."
    : !result.allPassed
      ? `Below the ${result.passPercent}% pass mark in: ${result.failedSubjects.join(", ")}.`
      : `English + best ${result.countedSubjects - 1} other subjects, averaged over ${result.countedSubjects}.`;

  const stats = hasError
    ? [
        ["Marks counted", DASH],
        ["Subjects counted", DASH],
        ["Pass mark per subject", DASH],
        ["Subjects below the pass mark", DASH],
      ]
    : [
        ["Marks counted", `${NUM.format(result.countedTotal)} / ${result.countedSubjects * SUBJECT_MAX}`],
        ["Subjects counted", `English + ${result.countedSubjects - 1} best others`],
        ["Pass mark per subject", `${result.passPercent}%`],
        [
          "Subjects below the pass mark",
          result.allPassed ? "None" : result.failedSubjects.join(", "),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookMarked className="h-4 w-4" aria-hidden="true" />
          CISCE boards
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ICSE Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          CISCE computes the aggregate with English compulsory plus your best other subjects —
          best 4 for ICSE (five subjects averaged) and best 3 for ISC (four subjects averaged).
          Enter marks out of {SUBJECT_MAX} and the tool applies the rule exactly.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cisce-board">
              Examination
            </label>
            <select
              id="cisce-board"
              className={`mt-2 ${INPUT_CLASS}`}
              value={board}
              onChange={(event) => setBoard(event.target.value)}
            >
              {Object.values(BOARD_RULES).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} — English + best {option.bestOthers}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cisce-english">
              English marks (compulsory, out of {SUBJECT_MAX})
            </label>
            <input
              id="cisce-english"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={SUBJECT_MAX}
              step="1"
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {others.map((row, index) => (
            <fieldset key={index} className="rounded-lg border border-[var(--border)] p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Other subject {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cisce-name-${index}`}>
                    Subject name (optional)
                  </label>
                  <input
                    id={`cisce-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Subject ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cisce-marks-${index}`}>
                    Marks (out of {SUBJECT_MAX})
                  </label>
                  <input
                    id={`cisce-marks-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={SUBJECT_MAX}
                    step="1"
                    value={row.marks}
                    onChange={(event) => updateRow(index, { marks: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={others.length <= 1}
                aria-label={`Remove other subject ${index + 1}`}
                className={`mt-3 ${GHOST_BTN} disabled:opacity-50`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={others.length >= MAX_OTHER_SUBJECTS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject ({others.length}/{MAX_OTHER_SUBJECTS})
        </button>
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
              {rules.label} percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.percent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{statusLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the ICSE or ISC percentage result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Marks
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Counted
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Pass ({result.passPercent}%)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold">English (compulsory)</td>
                  <td className="py-2 pr-3 text-right">
                    {NUM.format(result.english)} / {SUBJECT_MAX}
                  </td>
                  <td className="py-2 pr-3 text-right">Always</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      result.englishPassed ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {result.englishPassed ? "Pass" : "Fail"}
                  </td>
                </tr>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(row.marks)} / {SUBJECT_MAX}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.counted ? "Yes" : "Dropped"}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.passed ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.passed ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The English-plus-best-subjects aggregate and the pass marks (33% for
        ICSE, 35% for ISC since the 2019 examinations) follow CISCE&apos;s rules; the council&apos;s
        official statement of marks is the authoritative record for admissions.
      </p>
    </main>
  );
}
