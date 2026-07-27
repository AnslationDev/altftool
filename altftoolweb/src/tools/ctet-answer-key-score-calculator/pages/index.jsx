"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import {
  PAPERS,
  QUALIFYING_PERCENT,
  TOTAL_MARKS,
  scoreCtet,
  sectionsFor,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

/** Default entries showing a realistic attempt so a result is on screen at first paint. */
const DEFAULT_RESPONSES = {
  cdp: { correct: "22", wrong: "6" },
  lang1: { correct: "24", wrong: "4" },
  lang2: { correct: "21", wrong: "7" },
  maths: { correct: "18", wrong: "9" },
  evs: { correct: "20", wrong: "8" },
  mathsci: { correct: "40", wrong: "15" },
  social: { correct: "40", wrong: "15" },
};

const DEFAULTS = { paper: "paper1", track: "mathsci", category: "general" };

export default function ToolHome() {
  const [paper, setPaper] = useState(DEFAULTS.paper);
  const [track, setTrack] = useState(DEFAULTS.track);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [responses, setResponses] = useState(DEFAULT_RESPONSES);
  const [copied, setCopied] = useState(false);

  const sections = sectionsFor(paper, track);

  const setCount = (sectionKey, field, raw) => {
    setResponses((current) => ({
      ...current,
      [sectionKey]: { ...current[sectionKey], [field]: raw },
    }));
  };

  const result = useMemo(() => {
    const numeric = {};
    for (const section of sections) {
      const entry = responses[section.key] ?? { correct: "", wrong: "" };
      numeric[section.key] = {
        correct: entry.correct === "" ? 0 : Number(entry.correct),
        wrong: entry.wrong === "" ? 0 : Number(entry.wrong),
      };
    }
    return scoreCtet({ paper, track, responses: numeric, category });
  }, [paper, track, category, responses, sections]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `CTET ${PAPERS[paper].label} — estimated score`,
      `Score: ${result.score} / ${TOTAL_MARKS} (${result.percentage}%)`,
      `Correct: ${result.correct}, wrong: ${result.wrong}, unattempted: ${result.unattempted}`,
      `Qualifying mark (${result.qualifyingPercent}%): ${result.qualifyingMarks}`,
      result.qualified
        ? "Qualified on this answer key."
        : `Falls short by ${result.marksNeeded} mark${result.marksNeeded === 1 ? "" : "s"}.`,
      "",
      ...result.sections.map(
        (row) => `${row.label}: ${row.marks}/${row.questions} (${row.sectionPercent}%)`,
      ),
    ].join("\n");
  }, [hasError, result, paper]);

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
    setPaper(DEFAULTS.paper);
    setTrack(DEFAULTS.track);
    setCategory(DEFAULTS.category);
    setResponses(DEFAULT_RESPONSES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          No negative marking
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          CTET Answer Key Score Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your correct and wrong answers per section against the CBSE answer key. Every
          question carries 1 mark, wrong answers cost nothing, and the qualifying line is 90 of
          150 marks (60%) — 55% where the reserved-category relaxation applies.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ctet-paper">
              Paper
            </label>
            <select
              id="ctet-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paper}
              onChange={(event) => setPaper(event.target.value)}
            >
              {Object.values(PAPERS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {paper === "paper2" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ctet-track">
                Subject block
              </label>
              <select
                id="ctet-track"
                className={`mt-2 ${INPUT_CLASS}`}
                value={track}
                onChange={(event) => setTrack(event.target.value)}
              >
                {PAPERS.paper2.tracks.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="ctet-category">
              Qualifying standard
            </label>
            <select
              id="ctet-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="general">General — {QUALIFYING_PERCENT.general}%</option>
              <option value="reserved">
                Reserved category with relaxation — {QUALIFYING_PERCENT.reserved}%
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <p className={LABEL_CLASS}>Answers per section (from the response sheet)</p>
          <div className="mt-3 grid gap-4">
            {sections.map((section) => (
              <fieldset
                key={section.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <legend className="px-1 text-sm font-semibold">
                  {section.label} · {section.questions} questions
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`ctet-${section.key}-correct`}>
                      Correct
                    </label>
                    <input
                      id={`ctet-${section.key}-correct`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max={section.questions}
                      step="1"
                      value={responses[section.key]?.correct ?? ""}
                      onChange={(event) => setCount(section.key, "correct", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`ctet-${section.key}-wrong`}>
                      Wrong
                    </label>
                    <input
                      id={`ctet-${section.key}-wrong`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max={section.questions}
                      step="1"
                      value={responses[section.key]?.wrong ?? ""}
                      onChange={(event) => setCount(section.key, "wrong", event.target.value)}
                    />
                  </div>
                </div>
              </fieldset>
            ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.score} / ${TOTAL_MARKS}`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.qualified
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError
                ? "Fix the input above to see a result."
                : result.qualified
                  ? `Clears the ${result.qualifyingPercent}% line of ${result.qualifyingMarks} marks`
                  : `Short of the ${result.qualifyingPercent}% line by ${result.marksNeeded} mark${result.marksNeeded === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the CTET score result"
              className={GHOST_BTN}
              disabled={hasError}
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
          {(hasError
            ? [
                ["Percentage", DASH],
                ["Correct / wrong / unattempted", DASH],
                ["Accuracy on attempted", DASH],
                ["Qualifying marks", DASH],
              ]
            : [
                ["Percentage", `${result.percentage}%`],
                [
                  "Correct / wrong / unattempted",
                  `${NUM.format(result.correct)} / ${NUM.format(result.wrong)} / ${NUM.format(result.unattempted)}`,
                ],
                ["Accuracy on attempted", `${result.accuracy}%`],
                [
                  `Qualifying marks (${result.qualifyingPercent}%)`,
                  `${result.qualifyingMarks}${result.exactQualifyingMarks !== result.qualifyingMarks ? ` (exact ${result.exactQualifyingMarks})` : ""}`,
                ],
                ["Marks forgone by leaving blanks", NUM.format(result.marksForgone)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Section breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">%</th>
                  <th scope="col" className="py-2 text-right font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {result.sections.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {row.marks}/{row.questions}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.sectionPercent}%</td>
                    <td className="py-2 text-right">{row.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.weakest ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Strongest section: <span className="font-semibold text-[var(--foreground)]">{result.strongest.label}</span> ({result.strongest.sectionPercent}%). Weakest:{" "}
              <span className="font-semibold text-[var(--foreground)]">{result.weakest.label}</span> ({result.weakest.sectionPercent}%).
              {result.unattempted > 0
                ? " With no negative marking, attempting every question costs nothing."
                : ""}
            </p>
          ) : null}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate based on the provisional or final answer key you counted against. CBSE may drop
        questions or change keys after objections, which shifts everyone&apos;s score — the marks
        in your official scorecard prevail.
      </p>
    </main>
  );
}
