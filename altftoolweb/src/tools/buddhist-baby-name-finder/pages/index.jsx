"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import {
  GENDERS,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  ORIGINS,
  availableLetters,
  filterNames,
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
  startsWith: "",
  maxLength: String(MAX_NAME_LENGTH),
  query: "",
};

const GENDER_LABEL = { boy: "Boy", girl: "Girl", unisex: "Unisex" };

const DASH = "—";

export default function ToolHome() {
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [startsWith, setStartsWith] = useState(DEFAULTS.startsWith);
  const [maxLength, setMaxLength] = useState(DEFAULTS.maxLength);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [copied, setCopied] = useState(false);

  const letters = useMemo(() => availableLetters(), []);

  const result = useMemo(
    () => filterNames({ gender, origin, startsWith, maxLength: Number(maxLength), query }),
    [gender, origin, startsWith, maxLength, query],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Buddhist baby name shortlist",
      `Filters: ${gender === "any" ? "any gender" : GENDER_LABEL[gender]}, ${
        origin === "any" ? "all origins" : origin
      }${startsWith ? `, starting with ${startsWith.toUpperCase()}` : ""}${
        query ? `, matching "${query}"` : ""
      }, up to ${maxLength} letters`,
      `${result.total} names`,
      "",
      ...result.names.map((n) => `${n.name} (${n.origin}, ${GENDER_LABEL[n.gender]}) — ${n.meaning}`),
    ].join("\n");
  }, [result, gender, origin, startsWith, query, maxLength]);

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
    setStartsWith(DEFAULTS.startsWith);
    setMaxLength(DEFAULTS.maxLength);
    setQuery(DEFAULTS.query);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Baby names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Buddhist Baby Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search names drawn from Pali, Sanskrit and Tibetan Buddhist sources. Each entry gives the
          literal sense of the word plus the disciple, bodhisattva or doctrinal term it points to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bbn-gender">
              Gender
            </label>
            <select
              id="bbn-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="any">Any (includes unisex)</option>
              {GENDERS.map((value) => (
                <option key={value} value={value}>
                  {GENDER_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bbn-origin">
              Language of origin
            </label>
            <select
              id="bbn-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="any">All origins</option>
              {ORIGINS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bbn-max">
              Maximum letters
            </label>
            <input
              id="bbn-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_NAME_LENGTH}
              max={MAX_NAME_LENGTH}
              step="1"
              value={maxLength}
              onChange={(event) => setMaxLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bbn-query">
              Search name or meaning
            </label>
            <input
              id="bbn-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="wisdom, lotus, compassion…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
            {letters.map((letter) => (
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
              {result.error ? DASH : `out of ${NUM.format(result.libraryTotal)} names in the library`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the matched name list"
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
            ["Pali names matched", result.error ? DASH : NUM.format(result.byOrigin[0][1])],
            ["Sanskrit names matched", result.error ? DASH : NUM.format(result.byOrigin[1][1])],
            ["Tibetan names matched", result.error ? DASH : NUM.format(result.byOrigin[2][1])],
            [
              "Shortest match",
              result.error || !result.shortest
                ? DASH
                : `${result.shortest.name} (${result.shortest.letters} letters)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.total === 0 ? (
        <p className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
          No names fit those filters. Try clearing the starting letter or raising the letter limit.
        </p>
      ) : null}

      {!result.error && result.total > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.names.map((entry) => (
            <li
              key={`${entry.name}-${entry.origin}`}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{entry.name}</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {GENDER_LABEL[entry.gender]}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground)]">{entry.meaning}</p>
              {entry.note ? (
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{entry.note}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {entry.origin} · {entry.letters} letters · {entry.syllables} syllables
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings are the literal sense of the source word; families and traditions often attach
        further associations. Spellings vary widely once a name is romanised, so check the form your
        family prefers before registering a birth.
      </p>
    </main>
  );
}
