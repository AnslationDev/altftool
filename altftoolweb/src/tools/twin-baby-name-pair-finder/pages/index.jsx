"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import {
  GENDER_COMBOS,
  MAX_NAME_INPUT,
  PAIR_STYLES,
  availableOrigins,
  filterPairs,
  scorePair,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { nameA: "Vihaan", nameB: "Vivaan", combo: "any", style: "any", origin: "any" };
const COMBO_LABEL = { "boy-boy": "Two boys", "girl-girl": "Two girls", "boy-girl": "Boy and girl" };
const STYLE_LABEL = { sound: "Matched by sound", meaning: "Matched by meaning", theme: "Matched by theme" };
const DASH = "—";

export default function ToolHome() {
  const [nameA, setNameA] = useState(DEFAULTS.nameA);
  const [nameB, setNameB] = useState(DEFAULTS.nameB);
  const [combo, setCombo] = useState(DEFAULTS.combo);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [copied, setCopied] = useState(false);

  const origins = useMemo(() => availableOrigins(), []);
  const pairScore = useMemo(() => scorePair(nameA, nameB), [nameA, nameB]);
  const library = useMemo(() => filterPairs({ combo, style, origin }), [combo, style, origin]);

  const summary = useMemo(() => {
    if (pairScore.error) return "";
    return [
      `Twin name pair: ${pairScore.nameA} & ${pairScore.nameB}`,
      `Pairing score: ${pairScore.score}/100 — ${pairScore.verdict}`,
      "",
      ...pairScore.factors.map((f) => `${f.label}: ${f.earned}/${f.max} — ${f.note}`),
    ].join("\n");
  }, [pairScore]);

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
    setNameA(DEFAULTS.nameA);
    setNameB(DEFAULTS.nameB);
    setCombo(DEFAULTS.combo);
    setStyle(DEFAULTS.style);
    setOrigin(DEFAULTS.origin);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Twin names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Twin Baby Name Pair Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Score any two names against a five-factor pairing rubric — shared initial, rhyming ending,
          syllable balance, length balance and distinctness — then browse curated twin sets matched by
          sound, meaning or shared story.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="twin-a">
              First twin's name
            </label>
            <input
              id="twin-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_INPUT}
              value={nameA}
              onChange={(event) => setNameA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="twin-b">
              Second twin's name
            </label>
            <input
              id="twin-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_INPUT}
              value={nameB}
              onChange={(event) => setNameB(event.target.value)}
            />
          </div>
        </div>
      </section>

      {pairScore.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {pairScore.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pairing score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {pairScore.error ? DASH : `${pairScore.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {pairScore.error
                ? DASH
                : `${pairScore.verdict} — ${pairScore.nameA} & ${pairScore.nameB}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pairing score breakdown"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset names and filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!pairScore.error ? (
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Pairing score ${pairScore.score} out of 100`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, pairScore.score))}%` }}
            />
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {pairScore.error
            ? ["Same starting letter", "Rhyming ending", "Syllable balance", "Length balance", "Distinctness"].map(
                (label) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{DASH}</dd>
                  </div>
                ),
              )
            : pairScore.factors.map((factor) => (
                <div key={factor.key} className="gap-4 py-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold">{factor.label}</dt>
                    <dd className="text-right font-semibold text-[var(--primary)]">
                      {factor.earned}/{factor.max}
                    </dd>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{factor.note}</p>
                </div>
              ))}
        </dl>

        {!pairScore.error ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Spelling overlap: {PCT.format(pairScore.similarity)}
          </p>
        ) : null}

        {!pairScore.error && pairScore.confusing ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            These two names are nearly the same word. Twins usually prefer names that can be told apart
            when shouted across a room.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse curated twin pairs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="twin-combo">
              Twin combination
            </label>
            <select
              id="twin-combo"
              className={`mt-2 ${INPUT_CLASS}`}
              value={combo}
              onChange={(event) => setCombo(event.target.value)}
            >
              <option value="any">Any combination</option>
              {GENDER_COMBOS.map((value) => (
                <option key={value} value={value}>
                  {COMBO_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="twin-style">
              Pairing style
            </label>
            <select
              id="twin-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              <option value="any">Any style</option>
              {PAIR_STYLES.map((value) => (
                <option key={value} value={value}>
                  {STYLE_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="twin-origin">
              Origin
            </label>
            <select
              id="twin-origin"
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
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {library.error
            ? DASH
            : `${NUM.format(library.total)} of ${NUM.format(library.libraryTotal)} curated pairs`}
        </p>

        {library.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {library.error}
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {library.pairs.map((pair) => (
              <li
                key={`${pair.a}-${pair.b}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNameA(pair.a);
                      setNameB(pair.b);
                      setCopied(false);
                    }}
                    className="min-h-11 text-left text-lg font-semibold text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    aria-label={`Score ${pair.a} and ${pair.b} in the pair scorer above`}
                  >
                    {pair.a} &amp; {pair.b}
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {pair.score}/100 · {pair.origin}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{pair.why}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The score is a naming-style guide built from phonetic and structural rules, not a judgement of
        any name. Meanings are the common translation of the source word; regional usage varies.
      </p>
    </main>
  );
}
