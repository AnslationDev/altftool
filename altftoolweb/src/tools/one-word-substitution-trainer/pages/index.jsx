"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, Shuffle } from "lucide-react";

import { CATEGORIES, ITEMS, buildRound, categoryCounts, gradeRound } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const OPTION =
  "min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const OPTION_ON =
  "min-h-11 w-full rounded-md border border-[var(--primary)] bg-[var(--muted)] px-3 py-2 text-left text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULT_COUNT = "10";
const DEFAULT_ROUND = "1";

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export default function ToolHome() {
  const [countInput, setCountInput] = useState(DEFAULT_COUNT);
  const [roundInput, setRoundInput] = useState(DEFAULT_ROUND);
  const [category, setCategory] = useState("all");
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => categoryCounts(), []);
  const round = useMemo(
    () => buildRound({ count: countInput, seed: roundInput, category }),
    [countInput, roundInput, category]
  );
  const grade = useMemo(
    () => (round.error ? { error: round.error } : gradeRound(round.questions, answers)),
    [round, answers]
  );

  const failed = Boolean(round.error || grade.error);
  const errorText = round.error || grade.error || "";

  const startFresh = () => {
    setAnswers({});
    setChecked(false);
    setCopied(false);
  };

  const newRound = () => {
    const current = Number(roundInput);
    setRoundInput(String(Number.isFinite(current) ? Math.trunc(current) + 1 : 1));
    startFresh();
  };

  const reset = () => {
    setCountInput(DEFAULT_COUNT);
    setRoundInput(DEFAULT_ROUND);
    setCategory("all");
    startFresh();
  };

  const summary = useMemo(() => {
    if (failed || !checked) return "";
    return [
      "One Word Substitution Trainer",
      `Round ${round.seed} · ${categoryLabel(round.category === "all" ? "all" : round.category)}`,
      `Score: ${grade.correct}/${grade.total} (${grade.percent}%)`,
      grade.band,
      "",
      ...grade.rows.map(
        (row) => `${row.correct ? "correct" : "wrong"} — ${row.definition} = ${row.answer}`
      ),
    ].join("\n");
  }, [failed, checked, round, grade]);

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

  const bigNumber = failed
    ? DASH
    : checked
      ? `${grade.correct} / ${grade.total}`
      : `${grade.answered} / ${grade.total}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Vocabulary drill
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          One Word Substitution Trainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {ITEMS.length} exam substitutions in multiple-choice form. Wrong options come from the
          same word family, and every answer names the root it is built on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ows-count">
              Questions in this round
            </label>
            <input
              id="ows-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={ITEMS.length}
              step="1"
              value={countInput}
              onChange={(event) => {
                setCountInput(event.target.value);
                startFresh();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ows-round">
              Round number
            </label>
            <input
              id="ows-round"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={roundInput}
              onChange={(event) => {
                setRoundInput(event.target.value);
                startFresh();
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ows-category">
              Word family
            </label>
            <select
              id="ows-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                startFresh();
              }}
            >
              <option value="all">All families ({ITEMS.length})</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({counts[item.id] ?? 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={newRound} className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New round
          </button>
          <button
            type="button"
            onClick={() => setChecked(true)}
            className={PRIMARY_BTN}
            disabled={failed}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Check answers
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {checked ? "Score" : "Answered"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{bigNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the round result"
              className={GHOST_BTN}
              disabled={!summary}
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
              aria-label="Reset the trainer to its starting state"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {errorText}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Questions in round", failed ? DASH : String(grade.total)],
            ["Word family", failed ? DASH : round.category === "all" ? "All families" : categoryLabel(round.category)],
            ["Answered", failed ? DASH : String(grade.answered)],
            ["Correct", failed || !checked ? DASH : String(grade.correct)],
            ["Percentage", failed || !checked ? DASH : `${grade.percent}%`],
            ["Verdict", failed || !checked ? DASH : grade.band],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {failed ? null : (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Choose the single word for each phrase</h2>
          <ol className="mt-3 grid gap-3">
            {grade.rows.map((row, index) => (
              <li
                key={row.id}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Question {index + 1}
                </p>
                <p className="mt-1 text-base font-semibold leading-snug">{row.definition}</p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {row.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={row.chosen === option}
                      onClick={() =>
                        setAnswers((current) => ({ ...current, [row.id]: option }))
                      }
                      className={row.chosen === option ? OPTION_ON : OPTION}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {checked ? (
                  <div className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                    <p
                      className={
                        row.correct
                          ? "font-semibold text-[var(--success)]"
                          : "font-semibold text-[var(--danger)]"
                      }
                    >
                      {row.correct ? `Correct — ${row.answer}` : `Answer: ${row.answer}`}
                    </p>
                    <p className="mt-1 text-[var(--muted-foreground)]">{row.note}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Usage notes follow standard British and Indian English. Where a phrase has more than one
        accepted answer, the form most often set in Indian competitive papers is used.
      </p>
    </main>
  );
}
