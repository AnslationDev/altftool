"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldQuestion, Shuffle } from "lucide-react";
import {
  COMMON_QUESTIONS,
  compareToHonestAnswer,
  generateAnswers,
  MAX_COUNT,
  MAX_LENGTH,
  MAX_WORDS,
  MIN_LENGTH,
  MIN_WORDS,
  nextSeed,
  RISK_LABELS,
  STYLES,
} from "../lib";

const DEFAULTS = {
  seed: 1746821,
  style: "passphrase",
  words: "5",
  length: "16",
  count: "4",
  question: "first-pet",
};

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [words, setWords] = useState(DEFAULTS.words);
  const [length, setLength] = useState(DEFAULTS.length);
  const [count, setCount] = useState(DEFAULTS.count);
  const [questionId, setQuestionId] = useState(DEFAULTS.question);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      generateAnswers({
        seed,
        style,
        wordCount: words.trim() === "" ? Number.NaN : Number(words),
        length: length.trim() === "" ? Number.NaN : Number(length),
        count: count.trim() === "" ? Number.NaN : Number(count),
      }),
    [seed, style, words, length, count],
  );

  const hasError = Boolean(result.error);

  const comparison = useMemo(
    () =>
      hasError
        ? { error: result.error }
        : compareToHonestAnswer({ questionId, generatedBits: result.entropyBits }),
    [hasError, result, questionId],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Security question answers — ${result.styleLabel}`,
      `Strength: ${result.entropyBits} bits (${result.bandLabel}), ${result.combinations} possible answers`,
      `Recipe: ${result.recipe}`,
      "",
      ...result.answers.map((answer, index) => `${index + 1}. ${answer}`),
      "",
      "Store these in your password manager next to the question they answer. Never reuse one across sites.",
    ].join("\n");
  }, [hasError, result]);

  const copyText = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setSeed(DEFAULTS.seed);
    setStyle(DEFAULTS.style);
    setWords(DEFAULTS.words);
    setLength(DEFAULTS.length);
    setCount(DEFAULTS.count);
    setQuestionId(DEFAULTS.question);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldQuestion className="h-4 w-4" aria-hidden="true" />
          Account recovery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Security Question Answer Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your real mother&apos;s maiden name is a public record, not a secret. Generate a false
          answer instead, store it with the account, and the question stops being a back door.
          Everything is generated in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset className="border-0 p-0">
          <legend className={LABEL_CLASS}>Answer style</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {Object.values(STYLES).map((option) => (
              <label
                key={option.id}
                htmlFor={`sq-style-${option.id}`}
                className={`flex min-h-11 cursor-pointer flex-col justify-center rounded-md border p-3 transition ${
                  style === option.id
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    id={`sq-style-${option.id}`}
                    type="radio"
                    name="sq-style"
                    value={option.id}
                    checked={style === option.id}
                    onChange={() => {
                      setStyle(option.id);
                      setCopied("");
                    }}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  <span className="text-sm font-semibold">{option.label}</span>
                </span>
                <span className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {option.hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {style === "passphrase" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="sq-words">
                Words per answer ({MIN_WORDS}–{MAX_WORDS})
              </label>
              <input
                id="sq-words"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_WORDS}
                max={MAX_WORDS}
                step="1"
                value={words}
                onChange={(event) => {
                  setWords(event.target.value);
                  setCopied("");
                }}
              />
            </div>
          )}
          {style === "random" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="sq-length">
                Characters per answer ({MIN_LENGTH}–{MAX_LENGTH})
              </label>
              <input
                id="sq-length"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                step="1"
                value={length}
                onChange={(event) => {
                  setLength(event.target.value);
                  setCopied("");
                }}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="sq-count">
              How many answers (1–{MAX_COUNT})
            </label>
            <input
              id="sq-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_COUNT}
              step="1"
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setCopied("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSeed((current) => nextSeed(current));
              setCopied("");
            }}
            aria-label="Generate a fresh set of answers"
            className={PRIMARY_BTN}
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New answers
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset all options to their defaults"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Strength of each answer
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.entropyBits} bits`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.bandLabel} — ${result.bandNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(summary, "all")}
              aria-label="Copy all generated answers"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "all" ? "Copied!" : "Copy all"}
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Style", hasError ? DASH : result.styleLabel],
            ["How it is built", hasError ? DASH : result.recipe],
            ["Possible answers", hasError ? DASH : result.combinations],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <ul className="mt-5 space-y-2">
            {result.answers.map((answer, index) => (
              <li
                key={answer}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span className="min-w-0 font-mono text-sm break-all">{answer}</span>
                <button
                  type="button"
                  onClick={() => copyText(answer, `a${index}`)}
                  aria-label={`Copy answer ${index + 1}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied === `a${index}` ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Compare with the honest answer</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="sq-question">
            Question you are being asked
          </label>
          <select
            id="sq-question"
            className={`mt-2 ${INPUT_CLASS}`}
            value={questionId}
            onChange={(event) => setQuestionId(event.target.value)}
          >
            {COMMON_QUESTIONS.map((question) => (
              <option key={question.id} value={question.id}>
                {question.text}
              </option>
            ))}
          </select>
        </div>

        {comparison.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {comparison.error}
          </p>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Honest answer, roughly", `${comparison.honestBits} bits`],
                ["Generated answer", `${comparison.generatedBits} bits`],
                ["Harder to guess by", `${comparison.timesHarder}x`],
                ["Why the real answer leaks", comparison.question.why],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How researchable each question is</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Question
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Exposure
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Honest answer
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMON_QUESTIONS.map((question) => (
                <tr key={question.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{question.text}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {RISK_LABELS[question.risk]}
                  </td>
                  <td className="py-2 text-right font-semibold">~{question.guessBits} bits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A false answer only helps if you can produce it later — record it in your password manager
        beside the account and the exact question wording. Some banks and government services
        verify identity by phone using these answers, so keep the wording readable if you may have
        to say it aloud. Informational only, not security or legal advice.
      </p>
    </main>
  );
}
