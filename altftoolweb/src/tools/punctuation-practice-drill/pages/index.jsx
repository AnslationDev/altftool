"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Quote, RotateCcw, Shuffle } from "lucide-react";

import {
  DEFAULT_DRILL_LENGTH,
  TOPICS,
  buildDrill,
  drillProgress,
  gradeAnswer,
  summarizeScore,
  topicBreakdown,
} from "../lib";

const LENGTH_CHOICES = [5, 10, 15, 25];
const START_SEED = 20260728;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState("all");
  const [length, setLength] = useState(String(DEFAULT_DRILL_LENGTH));
  const [seed, setSeed] = useState(START_SEED);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const drill = useMemo(
    () => buildDrill({ topic, count: Number(length), seed }),
    [topic, length, seed],
  );

  const questions = drill.error ? [] : drill.questions;
  const current = questions[index] || null;
  const finished = !drill.error && index >= questions.length;

  const feedback = useMemo(() => {
    if (!checked || !current || selected === null) return null;
    return gradeAnswer(current, selected);
  }, [checked, current, selected]);

  const progress = useMemo(
    () => drillProgress({ answered: answeredCount, total: questions.length }),
    [answeredCount, questions.length],
  );

  const score = useMemo(
    () => summarizeScore({ correct: correctCount, total: answeredCount }),
    [correctCount, answeredCount],
  );

  const breakdown = useMemo(() => topicBreakdown(questions), [questions]);

  const restart = (nextSeed) => {
    setSeed(nextSeed);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setCopied(false);
  };

  const changeTopic = (value) => {
    setTopic(value);
    restart(seed + 1);
  };

  const changeLength = (value) => {
    setLength(value);
    restart(seed + 1);
  };

  const checkAnswer = () => {
    if (selected === null || checked || !current) return;
    const result = gradeAnswer(current, selected);
    if (result.error) return;
    setChecked(true);
    setAnsweredCount((value) => value + 1);
    if (result.isCorrect) setCorrectCount((value) => value + 1);
  };

  const nextQuestion = () => {
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  };

  const summaryText = useMemo(() => {
    if (score.error) return "";
    return [
      "Punctuation Practice Drill",
      `Topic: ${TOPICS.find((entry) => entry.id === topic)?.label ?? topic}`,
      `Score: ${score.correct} of ${score.total} (${score.percent}%)`,
      `Band: ${score.band}`,
      score.message,
    ].join("\n");
  }, [score, topic]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Quote className="h-4 w-4" aria-hidden="true" />
          Grammar drill
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Punctuation Practice Drill</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the correctly punctuated version of each sentence. Every answer reveals the rule it
          tests — comma splices, the pair rule for non-restrictive clauses, apostrophe possessives,
          colons after complete clauses and more.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="punct-topic">
              Topic
            </label>
            <select
              id="punct-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={topic}
              onChange={(event) => changeTopic(event.target.value)}
            >
              {TOPICS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="punct-length">
              Questions per round
            </label>
            <select
              id="punct-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={length}
              onChange={(event) => changeLength(event.target.value)}
            >
              {LENGTH_CHOICES.map((value) => (
                <option key={value} value={String(value)}>
                  {value} questions
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => restart(seed + 1)} className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New round
          </button>
          <button
            type="button"
            onClick={() => {
              setTopic("all");
              setLength(String(DEFAULT_DRILL_LENGTH));
              restart(START_SEED);
            }}
            aria-label="Reset topic, length and score"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {drill.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {drill.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Score so far
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {score.error ? DASH : `${score.percent}%`}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {score.error ? "Answer a question to start scoring." : `${score.correct} of ${score.total} correct · ${score.band}`}
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy punctuation drill score"
                className={GHOST_BTN}
                disabled={Boolean(score.error)}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy score"}
              </button>
            </div>

            <div className="mt-4">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Progress: ${progress.label} questions answered`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {progress.label} answered in this round
              </p>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Correct", score.error ? DASH : String(score.correct)],
                ["Incorrect", score.error ? DASH : String(score.incorrect)],
                ["Questions in round", String(questions.length)],
                ["Topics covered", breakdown.length ? breakdown.map((entry) => `${entry.label} (${entry.count})`).join(", ") : DASH],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {finished ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Round complete</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {score.error ? "No questions were answered." : score.message}
              </p>
              <button type="button" onClick={() => restart(seed + 1)} className={`mt-4 ${PRIMARY_BTN}`}>
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                Start a new round
              </button>
            </section>
          ) : (
            current && (
              <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Question {index + 1} of {questions.length} ·{" "}
                  {TOPICS.find((entry) => entry.id === current.topic)?.label ?? current.topic}
                </p>
                <h2 className="mt-2 text-base font-semibold">{current.prompt}</h2>

                <fieldset className="mt-4 grid gap-2">
                  <legend className="sr-only">{current.prompt}</legend>
                  {current.options.map((option, optionIndex) => {
                    const isPicked = selected === optionIndex;
                    const isAnswer = checked && optionIndex === current.answerIndex;
                    const isWrongPick = checked && isPicked && optionIndex !== current.answerIndex;
                    const tone = isAnswer
                      ? "border-[var(--success)] text-[var(--success)]"
                      : isWrongPick
                        ? "border-[var(--danger)] text-[var(--danger)]"
                        : isPicked
                          ? "border-[var(--primary)]"
                          : "border-[var(--border)]";
                    return (
                      <label
                        key={option}
                        htmlFor={`${current.id}-opt-${optionIndex}`}
                        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border bg-[var(--background)] px-3 py-3 text-sm leading-6 transition ${tone}`}
                      >
                        <input
                          id={`${current.id}-opt-${optionIndex}`}
                          type="radio"
                          name={`${current.id}-choice`}
                          className="mt-1 h-4 w-4 accent-[var(--primary)]"
                          checked={isPicked}
                          disabled={checked}
                          onChange={() => setSelected(optionIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </fieldset>

                {feedback && !feedback.error && (
                  <div
                    className={`mt-4 rounded-md px-3 py-3 text-sm leading-6 ${
                      feedback.isCorrect
                        ? "bg-[var(--muted)] text-[var(--foreground)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                    role="status"
                  >
                    <p className="font-semibold">
                      {feedback.isCorrect ? "Correct." : `Not quite. The correct version is: ${feedback.answer}`}
                    </p>
                    <p className="mt-1">{feedback.rule}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {checked ? (
                    <button type="button" onClick={nextQuestion} className={PRIMARY_BTN}>
                      {index + 1 >= questions.length ? "See results" : "Next question"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={checkAnswer}
                      className={PRIMARY_BTN}
                      disabled={selected === null}
                    >
                      Check answer
                    </button>
                  )}
                </div>
              </section>
            )
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Items follow mainstream English usage guidance. Where British and American house styles
        differ — quotation-mark nesting, the serial comma — the drill avoids the disputed cases or
        names the style in the question.
      </p>
    </main>
  );
}
