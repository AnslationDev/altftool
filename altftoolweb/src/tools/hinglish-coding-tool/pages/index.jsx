"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw, Search } from "lucide-react";

import {
  LEVELS,
  QUIZ_OPTION_COUNT,
  TOPICS,
  buildQuizQuestion,
  searchDictionary,
  topicCounts,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const COUNTS = topicCounts();

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [level, setLevel] = useState("all");
  const [quizSeed, setQuizSeed] = useState(0);
  const [picked, setPicked] = useState("");
  const [score, setScore] = useState({ asked: 0, right: 0 });
  const [copied, setCopied] = useState("");

  const search = useMemo(() => searchDictionary({ query, topic, level }), [query, topic, level]);
  const hasError = Boolean(search.error);
  const results = hasError ? [] : search.results;

  const quiz = useMemo(() => buildQuizQuestion(quizSeed, results), [quizSeed, results]);
  const quizError = Boolean(quiz.error);

  const answer = (id) => {
    if (picked) return;
    setPicked(id);
    setScore((prev) => ({ asked: prev.asked + 1, right: prev.right + (id === quiz.answerId ? 1 : 0) }));
  };

  const nextQuestion = () => {
    setPicked("");
    setQuizSeed((prev) => prev + 1);
  };

  const reset = () => {
    setQuery("");
    setTopic("all");
    setLevel("all");
    setQuizSeed(0);
    setPicked("");
    setScore({ asked: 0, right: 0 });
    setCopied("");
  };

  const copyEntry = async (entry) => {
    const text = [
      `${entry.term} (${TOPICS[entry.topic]}, ${LEVELS[entry.level]})`,
      `English: ${entry.english}`,
      `Hinglish: ${entry.hinglish}`,
      `Analogy: ${entry.analogy}`,
      `Example: ${entry.example}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(entry.id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Hinglish dictionary
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Hinglish Coding Dictionary</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every programming term with three explanations: the precise English definition, the same
          idea in everyday Hinglish, and a roz-marra analogy that makes it stick. Search it, filter
          it by topic and level, or test yourself with the quiz.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="query">
              Search a term, definition or analogy
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="query"
                className={`${INPUT_CLASS} pl-9`}
                type="search"
                placeholder="closure, git rebase, recursion…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPicked("");
                }}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="topic">
              Topic
            </label>
            <select
              id="topic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setPicked("");
              }}
            >
              {Object.entries(TOPICS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({COUNTS[key] ?? 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="level">
              Level
            </label>
            <select
              id="level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => {
                setLevel(event.target.value);
                setPicked("");
              }}
            >
              {Object.entries(LEVELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {search.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Terms matching your filters
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : search.matched}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the filters to see terms." : `out of ${search.total} in the dictionary`}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset filters and quiz score" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Quiz questions answered", String(score.asked)],
            ["Correct answers", String(score.right)],
            [
              "Accuracy",
              score.asked === 0 ? DASH : `${Math.round((score.right / score.asked) * 100)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Quiz: which term is this Hinglish line describing?</h2>
        {quizError ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]" role="alert">
            {quiz.error}
          </p>
        ) : (
          <>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">{quiz.prompt}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {quiz.options.map((option) => {
                const isAnswer = option.id === quiz.answerId;
                const chosen = picked === option.id;
                const state = !picked
                  ? "border-[var(--border)] bg-[var(--background)]"
                  : isAnswer
                    ? "border-[var(--success)] bg-[var(--muted)] text-[var(--success)]"
                    : chosen
                      ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]";
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => answer(option.id)}
                      disabled={Boolean(picked)}
                      aria-label={`Answer: ${option.term}`}
                      className={`min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${state}`}
                    >
                      {option.term}
                    </button>
                  </li>
                );
              })}
            </ul>
            {picked && (
              <div className="mt-3 rounded-md border border-[var(--border)] px-3 py-3 text-sm">
                <p className="font-semibold">
                  {picked === quiz.answerId ? "Sahi jawab!" : "Not quite."}
                </p>
                <p className="mt-1 text-[var(--muted-foreground)]">{quiz.english}</p>
                <p className="mt-1 text-[var(--muted-foreground)]">{quiz.analogy}</p>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={nextQuestion} className={GHOST_BTN} aria-label="Show the next quiz question">
                Next question
              </button>
              <span className="self-center text-xs text-[var(--muted-foreground)]">
                {QUIZ_OPTION_COUNT} options, drawn from the {search.matched} terms currently filtered.
              </span>
            </div>
          </>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">
          {hasError ? "Dictionary" : `${search.matched} term${search.matched === 1 ? "" : "s"}`}
        </h2>
        {!hasError && results.length === 0 && (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
            Nothing matched “{query}”. Try a shorter word, or clear the topic filter.
          </p>
        )}
        <ul className="mt-3 space-y-4">
          {results.map((entry) => (
            <li key={entry.id} className={CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{entry.term}</h3>
                  <p className="mt-1 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    {TOPICS[entry.topic]} · {LEVELS[entry.level]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyEntry(entry)}
                  aria-label={`Copy the explanation of ${entry.term}`}
                  className={GHOST_BTN}
                >
                  {copied === entry.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === entry.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    English
                  </dt>
                  <dd className="mt-1 leading-6">{entry.english}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    Hinglish
                  </dt>
                  <dd className="mt-1 leading-6 font-semibold">{entry.hinglish}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    Analogy
                  </dt>
                  <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">{entry.analogy}</dd>
                </div>
              </dl>
              <div className="mt-3 overflow-x-auto">
                <pre className="w-full rounded-md bg-[var(--muted)] p-3 text-xs leading-5">
                  <code>{entry.example}</code>
                </pre>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hinglish here means Hindi written in the Latin alphabet, mixed with the English words
        developers actually use at work — the way concepts get explained in an Indian classroom or
        on a team call. The English definitions stay precise so you can carry them into interviews
        and documentation.
      </p>
    </main>
  );
}
