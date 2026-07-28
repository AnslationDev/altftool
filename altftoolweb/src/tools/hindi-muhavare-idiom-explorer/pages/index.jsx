"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, Copy, RotateCcw, Search, SkipForward } from "lucide-react";

import {
  EXAM_TAGS,
  THEMES,
  TOTAL_IDIOMS,
  buildQuiz,
  checkQuiz,
  filterIdioms,
  idiomOfTheDay,
  quizScore,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function localTodayIso() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function ToolHome() {
  const [theme, setTheme] = useState("All");
  const [exam, setExam] = useState("All");
  const [query, setQuery] = useState("");
  const [today] = useState(localTodayIso);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRound, setQuizRound] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  const [attempted, setAttempted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const daily = useMemo(() => idiomOfTheDay(today), [today]);
  const list = useMemo(() => filterIdioms({ theme, exam, query }), [theme, exam, query]);
  const quiz = useMemo(
    () => buildQuiz({ index: quizIndex, round: quizRound, theme, exam }),
    [quizIndex, quizRound, theme, exam],
  );
  const score = useMemo(
    () => quizScore({ attempted, correct: correctCount }),
    [attempted, correctCount],
  );

  const dailyError = daily.error || null;
  const quizError = quiz.error || null;

  const summary = useMemo(() => {
    if (dailyError) return "";
    return [
      "Hindi Muhavare Explorer",
      `मुहावरा: ${daily.idiom} (${daily.roman})`,
      `शाब्दिक अर्थ: ${daily.literal}`,
      `अर्थ: ${daily.meaningHi}`,
      `Meaning: ${daily.meaningEn}`,
      `वाक्य प्रयोग: ${daily.exampleHi}`,
      `Example: ${daily.exampleEn}`,
      `Level: ${daily.exam}`,
    ].join("\n");
  }, [daily, dailyError]);

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

  const answer = (optionIndex) => {
    if (quizError || revealed) return;
    const verdict = checkQuiz({ selectedIndex: optionIndex, answerIndex: quiz.answerIndex });
    if (verdict.error) return;
    setSelected(optionIndex);
    setRevealed(true);
    setAttempted(attempted + 1);
    if (verdict.correct) setCorrectCount(correctCount + 1);
  };

  const nextQuestion = () => {
    setQuizIndex(quizIndex + 1);
    setQuizRound(quizRound + 1);
    setSelected(-1);
    setRevealed(false);
  };

  const reset = () => {
    setTheme("All");
    setExam("All");
    setQuery("");
    setQuizIndex(0);
    setQuizRound(0);
    setSelected(-1);
    setRevealed(false);
    setAttempted(0);
    setCorrectCount(0);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          हिंदी मुहावरे
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hindi Muhavare Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {TOTAL_IDIOMS} widely taught muhavare with their literal sense, real meaning in Hindi and
          English, a usage sentence and the exam level they usually appear at — plus a four-option
          meaning quiz built from the same set.
        </p>
      </header>

      {dailyError ? (
        <p
          role="alert"
          className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {dailyError}
        </p>
      ) : null}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Muhavara of the day
            </p>
            <p className="mt-1 break-words text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {dailyError ? DASH : daily.idiom}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {dailyError ? DASH : `${daily.roman} · ${daily.exam}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the muhavara of the day with its meaning"
              className={GHOST_BTN}
              disabled={Boolean(dailyError)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset filters and quiz score"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["शाब्दिक अर्थ (literal)", dailyError ? DASH : daily.literal],
            ["अर्थ", dailyError ? DASH : daily.meaningHi],
            ["Meaning", dailyError ? DASH : daily.meaningEn],
            ["वाक्य प्रयोग", dailyError ? DASH : daily.exampleHi],
            ["Example in English", dailyError ? DASH : daily.exampleEn],
            ["Theme", dailyError ? DASH : daily.theme],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:max-w-[62%] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Filter the collection</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-theme">
              Theme
            </label>
            <select
              id="hm-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value);
                setQuizIndex(0);
                setSelected(-1);
                setRevealed(false);
              }}
            >
              <option value="All">All themes</option>
              {THEMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-exam">
              Exam level
            </label>
            <select
              id="hm-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exam}
              onChange={(event) => {
                setExam(event.target.value);
                setQuizIndex(0);
                setSelected(-1);
                setRevealed(false);
              }}
            >
              <option value="All">All levels</option>
              {EXAM_TAGS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="hm-search">
          Search idiom, transliteration or meaning
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          <input
            id="hm-search"
            className={`${INPUT_CLASS} pl-9`}
            type="search"
            value={query}
            placeholder="regret, नाक, hāth"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Meaning quiz</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {score.correct} / {score.attempted} correct · {score.accuracyPct}% accuracy
          </p>
        </div>

        {quizError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {quizError}
          </p>
        ) : (
          <>
            <p className="mt-4 text-2xl font-semibold">{quiz.idiom}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {quiz.roman} · literally &quot;{quiz.literal}&quot;
            </p>
            <ul className="mt-4 grid gap-2">
              {quiz.options.map((option, optionIndex) => {
                const isAnswer = revealed && optionIndex === quiz.answerIndex;
                const isWrongPick = revealed && optionIndex === selected && !isAnswer;
                const tone = isAnswer
                  ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                  : isWrongPick
                    ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => answer(optionIndex)}
                      disabled={revealed}
                      className={`w-full min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${tone}`}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
            {revealed ? (
              <div className="mt-4 rounded-md border border-[var(--border)] px-3 py-3 text-sm" role="status">
                <p className="font-semibold">
                  {selected === quiz.answerIndex ? "Correct." : "Not quite."}
                </p>
                <p className="mt-1">{quiz.exampleHi}</p>
                <p className="mt-1 text-[var(--muted-foreground)]">{quiz.exampleEn}</p>
              </div>
            ) : null}
            <div className="mt-4">
              <button type="button" className={GHOST_BTN} onClick={nextQuestion}>
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Next idiom
              </button>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Browse muhavare
          <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
            {list.length} of {TOTAL_IDIOMS}
          </span>
        </h2>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {list.map((entry) => (
            <li key={entry.idiom} className="py-4">
              <p className="text-lg font-semibold">
                {entry.idiom}{" "}
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  {entry.roman}
                </span>
              </p>
              <p className="mt-1 text-sm">{entry.meaningHi}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{entry.meaningEn}</p>
              <p className="mt-2 text-sm">{entry.exampleHi}</p>
              <p className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[var(--muted)] px-2 py-1 font-semibold text-[var(--muted-foreground)]">
                  {entry.theme}
                </span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-1 font-semibold text-[var(--muted-foreground)]">
                  {entry.exam}
                </span>
              </p>
            </li>
          ))}
          {list.length === 0 ? (
            <li className="py-3 text-sm text-[var(--muted-foreground)]">
              No muhavara matches that filter.
            </li>
          ) : null}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A muhavara is a phrase that changes shape to fit its sentence and never stands alone; a
        lokokti or kahavat is a complete saying used as it is. Every entry here is a muhavara, which
        is why each one is shown inside a sentence.
      </p>
    </main>
  );
}
