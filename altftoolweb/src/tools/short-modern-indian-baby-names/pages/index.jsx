"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_LETTERS,
  MIN_LETTERS,
  availableLetters,
  availableOrigins,
  filterShortNames,
  spellingEase,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  gender: "any",
  origin: "any",
  letters: "any",
  startsWith: "",
  minEase: "0",
  check: "Aarav",
};

const GENDER_LABEL = { boy: "Boy", girl: "Girl", unisex: "Unisex" };
const DASH = "—";

const LETTER_OPTIONS = Array.from(
  { length: MAX_LETTERS - MIN_LETTERS + 1 },
  (_, index) => MIN_LETTERS + index,
);

export default function ToolHome() {
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [letters, setLetters] = useState(DEFAULTS.letters);
  const [startsWith, setStartsWith] = useState(DEFAULTS.startsWith);
  const [minEase, setMinEase] = useState(DEFAULTS.minEase);
  const [check, setCheck] = useState(DEFAULTS.check);
  const [copied, setCopied] = useState(false);

  const origins = useMemo(() => availableOrigins(), []);
  const letterChoices = useMemo(() => availableLetters(), []);

  const result = useMemo(
    () => filterShortNames({ gender, origin, letters, startsWith, minEase: Number(minEase) }),
    [gender, origin, letters, startsWith, minEase],
  );

  const checked = useMemo(() => spellingEase(check), [check]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Short modern Indian baby names",
      `${result.total} names matched (average spelling-ease ${result.averageEase}/100)`,
      "",
      ...result.names.map((n) => `${n.name} (${n.origin}, ${GENDER_LABEL[n.gender]}) — ${n.meaning}`),
    ].join("\n");
  }, [result]);

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
    setGender(DEFAULTS.gender);
    setOrigin(DEFAULTS.origin);
    setLetters(DEFAULTS.letters);
    setStartsWith(DEFAULTS.startsWith);
    setMinEase(DEFAULTS.minEase);
    setCheck(DEFAULTS.check);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Short names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Short Modern Indian Baby Names</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every name here is {MIN_LETTERS} to {MAX_LETTERS} letters long. Each one carries a
          spelling-ease score that deducts points for the things that actually cause misspellings in
          romanised Indian names: optional doubled vowels, aspirated digraphs, doubled consonants and
          a y doing a vowel&apos;s work.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="short-gender">
              Gender
            </label>
            <select
              id="short-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="any">Any (includes unisex)</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
              <option value="unisex">Unisex only</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="short-origin">
              Origin
            </label>
            <select
              id="short-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="any">All origins</option>
              {origins.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="short-letters">
              Exact letter count
            </label>
            <select
              id="short-letters"
              className={`mt-2 ${INPUT_CLASS}`}
              value={letters}
              onChange={(event) => setLetters(event.target.value)}
            >
              <option value="any">Any length</option>
              {LETTER_OPTIONS.map((value) => (
                <option key={value} value={String(value)}>
                  {value} letters
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="short-ease">
              Minimum spelling-ease score
            </label>
            <input
              id="short-ease"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={minEase}
              onChange={(event) => setMinEase(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Starting letter</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStartsWith("")}
              aria-pressed={startsWith === ""}
              className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                startsWith === ""
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              Any
            </button>
            {letterChoices.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setStartsWith(startsWith === letter ? "" : letter)}
                aria-pressed={startsWith === letter}
                className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  startsWith === letter
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
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
              Names matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : NUM.format(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `out of ${NUM.format(result.libraryTotal)} short names`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the matched short name list"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average spelling-ease score", result.error ? DASH : `${result.averageEase}/100`],
            [
              "Shortest match",
              result.error || !result.shortest
                ? DASH
                : `${result.shortest.name} (${result.shortest.letters} letters)`,
            ],
            ["Origins in the library", result.error ? DASH : origins.join(", ")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Score any name for spelling ease</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="short-check">
          Name to check
        </label>
        <input
          id="short-check"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          maxLength={30}
          value={check}
          onChange={(event) => setCheck(event.target.value)}
        />
        {checked.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {checked.error}
          </p>
        ) : (
          <div className="mt-3">
            <p className="text-3xl font-semibold text-[var(--primary)]">{checked.score}/100</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {checked.band} · {checked.letters} letters
            </p>
            {checked.deductions.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
                {checked.deductions.map((item) => (
                  <li key={item.key}>
                    −{item.points} for {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--success)]">
                No romanisation ambiguities found — this one gets written the same way every time.
              </p>
            )}
          </div>
        )}
      </section>

      {!result.error && result.total === 0 ? (
        <p className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
          Nothing matched. Lower the minimum spelling-ease score or clear the starting letter.
        </p>
      ) : null}

      {!result.error && result.total > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="px-4 py-3 font-semibold">Meaning</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Ease</th>
              </tr>
            </thead>
            <tbody>
              {result.names.map((entry) => (
                <tr key={`${entry.name}-${entry.origin}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 align-top">
                    <span className="font-semibold">{entry.name}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {entry.origin} · {GENDER_LABEL[entry.gender]} · {entry.letters} letters
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-[var(--muted-foreground)]">{entry.meaning}</td>
                  <td className="px-4 py-3 text-right align-top font-semibold">{entry.ease}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings are the common translation of the source word; regional usage and family tradition
        vary. The spelling-ease score compares romanised spellings only and says nothing about how a
        name is written in Devanagari, Tamil or any other script.
      </p>
    </main>
  );
}
