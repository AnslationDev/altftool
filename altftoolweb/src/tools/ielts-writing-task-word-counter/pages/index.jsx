"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import { TASKS, analyzeWriting } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_TEXT =
  "The chart illustrates the proportion of households with internet access in three European countries between 2000 and 2020.\n\nOverall, access rose sharply in all three countries, with the fastest growth occurring in the first decade. By the end of the period the gap between the countries had narrowed considerably.\n\nIn 2000, fewer than half of households in each country were connected, and the figure for the lowest country stood at just 20 percent. Over the following ten years every country at least doubled its share, and by 2020 all three had passed 85 percent.";

const DEFAULTS = {
  taskId: "task1",
  text: SAMPLE_TEXT,
};

const DASH = "—";

export default function ToolHome() {
  const [taskId, setTaskId] = useState(DEFAULTS.taskId);
  const [text, setText] = useState(DEFAULTS.text);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeWriting({ text, taskId }), [text, taskId]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `IELTS Writing ${result.task.label} word count`,
      `Words: ${NUM.format(result.words)} (minimum ${result.task.minimum})`,
      result.meetsMinimum
        ? `Minimum met — ${NUM.format(result.surplus)} words above it`
        : `Below minimum by ${NUM.format(result.shortfall)} words`,
      `Paragraphs: ${NUM.format(result.paragraphCount)}`,
      `Sentences: ${NUM.format(result.sentences)}`,
      `Average words per sentence: ${NUM.format(result.avgWordsPerSentence)}`,
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
    setTaskId(DEFAULTS.taskId);
    setText(DEFAULTS.text);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Required minimum", DASH],
        ["Paragraphs", DASH],
        ["Sentences", DASH],
        ["Average words per sentence", DASH],
      ]
    : [
        ["Required minimum", `${result.task.minimum} words`],
        [
          result.meetsMinimum ? "Above minimum by" : "Below minimum by",
          `${NUM.format(result.meetsMinimum ? result.surplus : result.shortfall)} words`,
        ],
        ["Paragraphs", NUM.format(result.paragraphCount)],
        ["Sentences", NUM.format(result.sentences)],
        ["Average words per sentence", NUM.format(result.avgWordsPerSentence)],
        ["Average words per paragraph", NUM.format(result.avgWordsPerParagraph)],
        ["Characters (no spaces)", NUM.format(result.characters)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          IELTS Writing Task Word Counter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your words against the IELTS minimums — 150 for Task 1 and 250 for Task 2 — with
          hyphenated compounds counted as one word, plus paragraph and sentence structure analysis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div className="sm:max-w-xs">
            <label className={LABEL_CLASS} htmlFor="iw-task">
              Writing task
            </label>
            <select
              id="iw-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
            >
              {TASKS.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label} — minimum {task.minimum} words
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-text">
              Your answer
            </label>
            <textarea
              id="iw-text"
              rows={10}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste or type your Task 1 report or Task 2 essay here…"
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Word count
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && !result.meetsMinimum
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : NUM.format(result.words)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.meetsMinimum
                  ? result.overRecommended
                    ? `Minimum met. You are past the practical ${result.task.recommendedMax}-word range — extra length earns nothing and costs checking time.`
                    : "Minimum met — under-length penalties do not apply."
                  : `Below the ${result.task.minimum}-word minimum — under-length answers lose marks on Task ${taskId === "task1" ? "Achievement" : "Response"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the word count result"
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
              aria-label="Reset the text and task"
              className={PRIMARY_BTN}
            >
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

        {!hasError && result.paragraphCount > 0 ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">Paragraph breakdown</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {result.paragraphs.map((paragraph) => (
                <li
                  key={paragraph.index}
                  className="flex items-center justify-between gap-4 rounded-md bg-[var(--muted)] px-3 py-2"
                >
                  <span className="truncate text-[var(--muted-foreground)]">
                    {paragraph.index}. {paragraph.preview}
                  </span>
                  <span className="shrink-0 font-semibold">{paragraph.words} words</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Counting follows examiner practice — every word counts, hyphenated compounds count once. In
        the paper-based test you must estimate by lines, so knowing your average words per line from
        practice like this is what makes that estimate reliable.
      </p>
    </main>
  );
}
