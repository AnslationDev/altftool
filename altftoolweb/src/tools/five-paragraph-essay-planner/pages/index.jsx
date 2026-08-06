"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  MAX_BODY_PARAGRAPHS,
  MIN_BODY_PARAGRAPHS,
  SPEED_PRESETS,
  WORDS_PER_SENTENCE,
  planEssay,
  planToText,
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

const DEFAULTS = {
  totalWords: "800",
  bodyParagraphs: "3",
  draftingWpm: "18",
  thesis: "School uniforms reduce visible peer pressure but do not close the gap they are said to close.",
  points: ["Cost to families", "Peer pressure and belonging", "Identity and self-expression"],
};

const WORD_PRESETS = [250, 500, 800, 1200, 2000];

export default function ToolHome() {
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [bodyParagraphs, setBodyParagraphs] = useState(DEFAULTS.bodyParagraphs);
  const [draftingWpm, setDraftingWpm] = useState(DEFAULTS.draftingWpm);
  const [thesis, setThesis] = useState(DEFAULTS.thesis);
  const [points, setPoints] = useState(DEFAULTS.points);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const bodies = Math.max(
    MIN_BODY_PARAGRAPHS,
    Math.min(MAX_BODY_PARAGRAPHS, Number(bodyParagraphs) || MIN_BODY_PARAGRAPHS),
  );

  const plan = useMemo(
    () =>
      planEssay({
        totalWords: totalWords === "" ? NaN : Number(totalWords),
        bodyParagraphs: bodyParagraphs === "" ? NaN : Number(bodyParagraphs),
        draftingWpm: draftingWpm === "" ? NaN : Number(draftingWpm),
        thesis,
        points,
      }),
    [totalWords, bodyParagraphs, draftingWpm, thesis, points],
  );

  const outline = useMemo(() => planToText(plan), [plan]);
  const hasError = Boolean(plan.error);

  const setPoint = (index, value) => {
    setPoints((current) => {
      const next = [...current];
      while (next.length <= index) next.push("");
      next[index] = value;
      return next;
    });
  };

  const copyResult = () => {
    if (!outline) return;
    copy("outline", outline, { label: "essay outline" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the essay plan? This will clear your thesis statement, body paragraph reasons and all settings, and cannot be undone.",
      )
    ) {
      return;
    }
    setTotalWords(DEFAULTS.totalWords);
    setBodyParagraphs(DEFAULTS.bodyParagraphs);
    setDraftingWpm(DEFAULTS.draftingWpm);
    setThesis(DEFAULTS.thesis);
    setPoints(DEFAULTS.points);
    resetCopyState();
  };

  const stats = hasError
    ? [
        ["Paragraphs", DASH],
        ["Introduction", DASH],
        ["Body (all paragraphs)", DASH],
        ["Conclusion", DASH],
        ["Sentences in total", DASH],
        ["Evidence to gather", DASH],
        ["Planning / drafting / revising", DASH],
      ]
    : [
        ["Paragraphs", `${plan.paragraphCount}${plan.isClassicFive ? " (classic five-paragraph)" : ""}`],
        ["Introduction", `${NUM.format(plan.introWords)} words · ${plan.sections[0].sentences} sentences`],
        ["Body (all paragraphs)", `${NUM.format(plan.bodyWords)} words across ${plan.bodyParagraphs}`],
        [
          "Conclusion",
          `${NUM.format(plan.conclusionWords)} words · ${plan.sections[plan.sections.length - 1].sentences} sentences`,
        ],
        ["Sentences in total", `about ${plan.totalSentences}`],
        ["Evidence to gather", `${plan.totalEvidence} concrete details`],
        [
          "Planning / drafting / revising",
          `${plan.planningMinutes} / ${plan.draftingMinutes} / ${plan.revisingMinutes} min`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Essay structure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Five Paragraph Essay Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it a word target and it splits the essay into an introduction, body paragraphs and a
          conclusion — with a word budget, a sentence count and the number of evidence chunks each
          paragraph needs, plus how long the whole thing should take.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fpe-words">
              Target word count
            </label>
            <input
              id="fpe-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="150"
              max="5000"
              step="50"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fpe-bodies">
              Body paragraphs
            </label>
            <input
              id="fpe-bodies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_BODY_PARAGRAPHS}
              max={MAX_BODY_PARAGRAPHS}
              step="1"
              value={bodyParagraphs}
              onChange={(event) => setBodyParagraphs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fpe-wpm">
              Drafting speed (words per minute)
            </label>
            <input
              id="fpe-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="100"
              step="1"
              value={draftingWpm}
              onChange={(event) => setDraftingWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fpe-speed-preset">
              Or pick a typical speed
            </label>
            <select
              id="fpe-speed-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={SPEED_PRESETS.some((preset) => String(preset.wpm) === draftingWpm) ? draftingWpm : ""}
              onChange={(event) => {
                if (event.target.value) setDraftingWpm(event.target.value);
              }}
            >
              <option value="">Custom</option>
              {SPEED_PRESETS.map((preset) => (
                <option key={preset.id} value={String(preset.wpm)}>
                  {preset.label} ({preset.wpm} wpm)
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fpe-thesis">
              Thesis statement (one arguable sentence)
            </label>
            <textarea
              id="fpe-thesis"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={thesis}
              onChange={(event) => setThesis(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WORD_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTotalWords(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} words
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            One reason per body paragraph
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: bodies }, (_, index) => (
              <div key={`point-${index}`}>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`fpe-point-${index}`}>
                  Body paragraph {index + 1}
                </label>
                <input
                  id={`fpe-point-${index}`}
                  className={`mt-1.5 ${INPUT_CLASS}`}
                  type="text"
                  value={points[index] ?? ""}
                  onChange={(event) => setPoint(index, event.target.value)}
                  placeholder={`Reason ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total time to write
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${plan.totalMinutes} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see the plan."
                : `${NUM.format(plan.totalWords)} words at ${plan.draftingWpm} wpm, including planning and revision`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("outline") ? "Copied the essay outline to clipboard" : "Copy the essay outline"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {isCopied("outline") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("outline") ? "Copied!" : "Copy outline"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Paragraph-by-paragraph plan</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Sentence counts assume an average of {WORDS_PER_SENTENCE} words per sentence.
          </p>
          <div className="mt-4 space-y-3">
            {plan.sections.map((section) => (
              <article
                key={section.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">
                    {section.title}
                    {section.point ? (
                      <span className="font-normal text-[var(--muted-foreground)]"> — {section.point}</span>
                    ) : null}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--primary)]">
                    {NUM.format(section.words)} words · ~{section.sentences} sentences
                  </p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                  {section.moves.map((move) => (
                    <li key={move}>{move}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Word budget by section</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Words</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sentences</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {plan.sections.map((section) => (
                  <tr key={`row-${section.id}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{section.title}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(section.words)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{section.sentences}</td>
                    <td className="py-2 text-right">{section.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Word budgets are guidance, not a rule. If your school, board or university sets its own
        structure or word tolerance, follow that brief first — the five-paragraph shape is a
        scaffold for timed and introductory writing, not a requirement of academic prose.
      </p>
    </main>
  );
}
