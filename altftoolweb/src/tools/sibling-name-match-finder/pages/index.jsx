"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_NAME_INPUT,
  MIN_LIMIT,
  suggestSiblingNames,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { siblingName: "Aarav", gender: "any", style: "any", limit: String(DEFAULT_LIMIT) };

const STYLE_LABEL = {
  any: "Any — best overall match",
  "same-initial": "Same starting letter",
  "different-initial": "Different starting letter",
  "same-origin": "Same language of origin",
};

const DASH = "—";

export default function ToolHome() {
  const [siblingName, setSiblingName] = useState(DEFAULTS.siblingName);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => suggestSiblingNames({ siblingName, gender, style, limit: Number(limit) }),
    [siblingName, gender, style, limit],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Sibling names for ${result.sibling.name}`,
      result.sibling.knownName
        ? `${result.sibling.name}: ${result.sibling.origin} — ${result.sibling.meaning}`
        : `${result.sibling.name}: not in the library, so origin matching is skipped`,
      `${result.matched} candidates ranked; showing ${result.matches.length}`,
      "",
      ...result.matches.map((m) => `${m.score}/100  ${m.name} (${m.origin}) — ${m.meaning}`),
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
    setSiblingName(DEFAULTS.siblingName);
    setGender(DEFAULTS.gender);
    setStyle(DEFAULTS.style);
    setLimit(DEFAULTS.limit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Sibling names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sibling Name Match Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the name your older child already has. Every name in the library is scored against it
          on shared origin, syllable rhythm, ending, starting letter, length and distinctness, then
          ranked. Names too close in spelling to tell apart are removed rather than rewarded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sib-name">
              Older child&apos;s name
            </label>
            <input
              id="sib-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_INPUT}
              value={siblingName}
              onChange={(event) => setSiblingName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sib-gender">
              New baby&apos;s gender
            </label>
            <select
              id="sib-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="any">Any (includes unisex)</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sib-style">
              Match style
            </label>
            <select
              id="sib-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {Object.entries(STYLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sib-limit">
              How many suggestions
            </label>
            <input
              id="sib-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="1"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
          </div>
        </div>
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
              Best match score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : `${result.bestScore}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${NUM.format(result.matched)} names ranked against ${result.sibling.name}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sibling name shortlist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy shortlist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Origin of the existing name", result.error ? DASH : result.sibling.origin || "Not in library"],
            ["Meaning", result.error ? DASH : result.sibling.meaning || "Not in library"],
            [
              "Shape",
              result.error
                ? DASH
                : `${result.sibling.letters} letters · about ${result.sibling.syllables} syllables · ends in "${result.sibling.ending}"`,
            ],
            ["Library size", result.error ? DASH : `${NUM.format(result.libraryTotal)} names`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && !result.sibling.knownName ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.sibling.name} is not in the library, so the 25-point origin factor cannot be
            awarded. Scores here are out of 75 in practice.
          </p>
        ) : null}
      </section>

      {!result.error && result.matches.length === 0 ? (
        <p className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
          Nothing matched those filters. Try the &quot;Any&quot; match style or widen the gender filter.
        </p>
      ) : null}

      {!result.error && result.matches.length > 0 ? (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.matches.map((match) => (
            <li
              key={`${match.name}-${match.origin}`}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{match.name}</h2>
                <span className="text-sm font-semibold text-[var(--primary)]">{match.score}/100</span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground)]">{match.meaning}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                {match.origin} · {match.letters} letters · {match.syllables} syllables
              </p>
              {match.reasons.length > 0 ? (
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Matches on: {match.reasons.join(", ")}.
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The score describes how well two names sit together stylistically. It says nothing about the
        quality of any name, and meanings are the common translation of the source word — regional
        usage and family tradition vary.
      </p>
    </main>
  );
}
