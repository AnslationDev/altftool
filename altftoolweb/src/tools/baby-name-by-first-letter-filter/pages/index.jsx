"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  ALPHABET,
  GENDERS,
  MAX_LETTERS,
  MIN_LETTERS,
  NAMES,
  ORIGINS,
  countsByLetter,
  filterNames,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  letter: "A",
  gender: "any",
  origin: "any",
  minLetters: MIN_LETTERS,
  maxLetters: MAX_LETTERS,
  meaning: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LETTER_COUNTS = countsByLetter();

export default function ToolHome() {
  const [letter, setLetter] = useState(DEFAULTS.letter);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [minLetters, setMinLetters] = useState(String(DEFAULTS.minLetters));
  const [maxLetters, setMaxLetters] = useState(String(DEFAULTS.maxLetters));
  const [meaning, setMeaning] = useState(DEFAULTS.meaning);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () => filterNames({ letter, gender, origin, minLetters, maxLetters, meaning }),
    [letter, gender, origin, minLetters, maxLetters, meaning],
  );

  const hasError = Boolean(result.error);
  const names = hasError ? [] : result.names;

  const copyList = () => {
    if (hasError || names.length === 0) return;
    const text = names.map((n) => `${n.name} (${n.gender}) — ${n.meaning} [${n.origin}]`).join("\n");
    return copy("list", text, { label: "Matching names" });
  };

  const reset = () => {
    setLetter(DEFAULTS.letter);
    setGender(DEFAULTS.gender);
    setOrigin(DEFAULTS.origin);
    setMinLetters(String(DEFAULTS.minLetters));
    setMaxLetters(String(DEFAULTS.maxLetters));
    setMeaning(DEFAULTS.meaning);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          {NUM.format(NAMES.length)} names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Baby Name by First Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a starting letter, then narrow by gender, origin, how many letters the name has, or a
          word in the meaning. Every entry lists the source language and what the name means.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Starting letter</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLetter("any")}
              aria-pressed={letter === "any"}
              className={`min-h-11 min-w-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                letter === "any"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              }`}
            >
              All
            </button>
            {ALPHABET.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLetter(item)}
                aria-pressed={letter === item}
                aria-label={`Names starting with ${item}, ${LETTER_COUNTS[item]} in the list`}
                className={`min-h-11 min-w-11 rounded-md px-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  letter === item
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-gender">
              Gender
            </label>
            <select
              id="bn-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-origin">
              Origin
            </label>
            <select
              id="bn-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="any">Any origin</option>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-min">
              Shortest (letters)
            </label>
            <input
              id="bn-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LETTERS}
              max={MAX_LETTERS}
              step="1"
              value={minLetters}
              onChange={(event) => setMinLetters(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bn-max">
              Longest (letters)
            </label>
            <input
              id="bn-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LETTERS}
              max={MAX_LETTERS}
              step="1"
              value={maxLetters}
              onChange={(event) => setMaxLetters(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bn-meaning">
              Meaning contains
            </label>
            <input
              id="bn-meaning"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={meaning}
              placeholder="light, sun, ocean, brave…"
              onChange={(event) => setMeaning(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={reset}
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Names matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.matched)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the filters above to see names."
                : `out of ${NUM.format(result.total)} names in the list`}
            </p>
          </div>
          <button
            type="button"
            className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={copyList}
            aria-label={isCopied("list") ? "Copied" : "Copy the matching names with their meanings"}
            disabled={hasError || names.length === 0}
          >
            {isCopied("list") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("list") ? "Copied!" : "Copy list"}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Starting letter", letter === "any" ? "All letters" : letter],
            ["Gender", GENDERS.find((g) => g.id === gender)?.label ?? DASH],
            ["Origin", origin === "any" ? "Any" : origin],
            ["Length", hasError ? DASH : `${minLetters}-${maxLetters} letters`],
            ["Meaning filter", meaning.trim() ? meaning.trim() : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Matching names</h2>
          {names.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              No names match those filters. Try a different letter, widen the length range, or clear
              the meaning search.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Gender
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Origin
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {names.map((entry) => (
                    <tr key={entry.name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{entry.name}</td>
                      <td className="py-2 pr-3 capitalize text-[var(--muted-foreground)]">
                        {entry.gender}
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.origin}</td>
                      <td className="py-2">{entry.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings are the ones consistently given for each name in its source language. Names with
        genuinely disputed meanings are left out rather than guessed at, and spellings vary widely
        between families and regions.
      </p>
    </main>
  );
}
