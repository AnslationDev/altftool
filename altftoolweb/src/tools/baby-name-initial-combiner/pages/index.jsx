"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Blend, Check, Copy, RotateCcw } from "lucide-react";

import { ENDINGS, MAX_SOURCE_LETTERS, blendNames } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { nameA: "Rohan", nameB: "Priya", ending: "", minScore: "0" };
const ENDING_LABEL = {
  "": "Keep the blend as it comes out",
  a: "Add -a",
  i: "Add -i",
  an: "Add -an",
  ya: "Add -ya",
  ika: "Add -ika",
  esh: "Add -esh",
  ie: "Add -ie",
};
const DASH = "—";

export default function ToolHome() {
  const [nameA, setNameA] = useState(DEFAULTS.nameA);
  const [nameB, setNameB] = useState(DEFAULTS.nameB);
  const [ending, setEnding] = useState(DEFAULTS.ending);
  const [minScore, setMinScore] = useState(DEFAULTS.minScore);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const result = useMemo(
    () => blendNames({ nameA, nameB, ending, minScore: Number(minScore) }),
    [nameA, nameB, ending, minScore],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Name blends from ${nameA.trim()} + ${nameB.trim()}`,
      `${result.total} ideas, best is ${result.best ? result.best.name : "none"}`,
      "",
      ...result.candidates.map((c) => `${c.score}/100  ${c.name} — ${c.strategy}`),
    ].join("\n");
  }, [result, nameA, nameB]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNameA(DEFAULTS.nameA);
    setNameB(DEFAULTS.nameB);
    setEnding(DEFAULTS.ending);
    setMinScore(DEFAULTS.minScore);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Blend className="h-4 w-4" aria-hidden="true" />
          Name blending
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Baby Name Initial Combiner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Both names are split into consonant-plus-vowel syllables, then spliced ten different ways in
          both directions. Every result is scored 60 percent on pronounceability — consonant runs,
          vowel pile-ups, length — and 40 percent on how evenly the two names contributed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="blend-a">
              First name
            </label>
            <input
              id="blend-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_SOURCE_LETTERS}
              value={nameA}
              onChange={(event) => setNameA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blend-b">
              Second name
            </label>
            <input
              id="blend-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_SOURCE_LETTERS}
              value={nameB}
              onChange={(event) => setNameB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blend-ending">
              Optional ending
            </label>
            <select
              id="blend-ending"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ending}
              onChange={(event) => setEnding(event.target.value)}
            >
              {ENDINGS.map((value) => (
                <option key={value || "none"} value={value}>
                  {ENDING_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blend-min">
              Minimum score
            </label>
            <input
              id="blend-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best blend
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error || !result.best ? DASH : result.best.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error || !result.best
                ? DASH
                : `${result.best.score}/100 — ${result.best.strategy.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!summary}
              aria-label="Copy every blended name idea"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy ideas"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset both names" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ideas kept", result.error ? DASH : NUM.format(result.total)],
            ["Combinations tried", result.error ? DASH : NUM.format(result.generated)],
            ["Initials", result.error ? DASH : result.initials],
            [
              "Syllables found",
              result.error ? DASH : `${result.chunksA.join(" · ")}  /  ${result.chunksB.join(" · ")}`,
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
          No blend cleared that score. Lower the minimum, or try an ending to give short blends more
          body.
        </p>
      ) : null}

      {!result.error && result.total > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite" aria-atomic="true">
          {result.candidates.map((candidate) => (
            <li key={candidate.raw} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{candidate.name}</h2>
                <span className="text-sm font-semibold text-[var(--primary)]">{candidate.score}/100</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{candidate.strategy}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Say-ability {candidate.pronounce} · balance {candidate.balance} · {candidate.letters} letters
              </p>
              {candidate.issues.length > 0 ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Watch out for: {candidate.issues.join(", ")}.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Blended names are invented words. Before settling on one, check that it does not carry an
        unintended meaning in the languages your family speaks, and say it aloud with your surname.
      </p>
    </main>
  );
}
