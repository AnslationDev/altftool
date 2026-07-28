"use client";

import { useMemo, useState } from "react";
import { Check, Clover, Copy, RotateCcw } from "lucide-react";

import { MAX_SCORE, POINTS_PER_COMPONENT, analyseName, rankNames } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[110px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = { name: "Aarav", list: "Aarav\nMeera\nVihaan\nAnaya" };
const DASH = "—";
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const ONE_DP = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [list, setList] = useState(DEFAULTS.list);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseName(name), [name]);

  const ranking = useMemo(() => rankNames(list.split(/\r?\n/)), [list]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Lucky name analysis — ${result.name}`,
      `Score: ${result.score} / ${MAX_SCORE} (${result.band.label})`,
      ...result.components.map((c) => `${c.label}: ${ONE_DP.format(c.points)} / ${POINTS_PER_COMPONENT}`),
      `Chaldean total ${result.chaldeanTotal} → root ${result.chaldeanRoot}`,
      `Pythagorean total ${result.pythagoreanTotal} → root ${result.pythagoreanRoot}`,
      "Entertainment only — this score has no traditional or scientific standing.",
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
    setName(DEFAULTS.name);
    setList(DEFAULTS.list);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clover className="h-4 w-4" aria-hidden="true" />
          Just for fun
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lucky Name Alphabet Analyzer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Breaks a spelling down into five measurable properties — vowel balance, letter variety,
          consonant clusters, how common the letters are in English, and whether the Chaldean and
          Pythagorean root numbers agree — and adds them into a 0–{MAX_SCORE} novelty score. Every
          weight is shown, so you can check the arithmetic yourself.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="lucky-name">
          Name to analyse
        </label>
        <input
          id="lucky-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Spaces and punctuation are ignored; only A–Z letters count.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {result.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {result.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Novelty score
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? result.score : DASH}
              {ok ? <span className="text-2xl text-[var(--muted-foreground)]"> / {MAX_SCORE}</span> : null}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.band.label} — ${result.band.note}` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the name analysis"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {ok ? (
            result.components.map((component) => (
              <div key={component.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{component.label}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {ONE_DP.format(component.points)} / {POINTS_PER_COMPONENT}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${component.label}: ${ONE_DP.format(component.points)} out of ${POINTS_PER_COMPONENT}`}
                >
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${(component.points / POINTS_PER_COMPONENT) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{component.detail}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">{DASH}</p>
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letters", ok ? String(result.letterCount) : DASH],
            [
              "Vowels vs consonants",
              ok
                ? `${result.vowelCount} vowels, ${result.consonantCount} consonants (${PCT.format(result.vowelShare * 100)}% vowels)`
                : DASH,
            ],
            ["Distinct letters", ok ? String(result.distinctCount) : DASH],
            ["Longest consonant run", ok ? String(result.longestRun) : DASH],
            ["Mean English letter frequency", ok ? `${ONE_DP.format(result.meanFrequency)}%` : DASH],
            [
              "Chaldean total → root",
              ok ? `${result.chaldeanTotal} → ${result.chaldeanRoot}` : DASH,
            ],
            [
              "Pythagorean total → root",
              ok ? `${result.pythagoreanTotal} → ${result.pythagoreanRoot}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <caption className="sr-only">Letter by letter values</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Letter</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Chaldean</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Pythagorean</th>
                  <th scope="col" className="py-2 text-right font-semibold">English freq.</th>
                </tr>
              </thead>
              <tbody>
                {result.letters.map((item, index) => (
                  <tr key={`${item.letter}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {item.letter}
                      {item.vowel ? (
                        <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">vowel</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{item.chaldean}</td>
                    <td className="py-2 pr-3 text-right">{item.pythagorean}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {ONE_DP.format(item.frequency)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Compare a shortlist</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="lucky-list">
          One name per line
        </label>
        <textarea
          id="lucky-list"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={list}
          onChange={(event) => setList(event.target.value)}
        />
        {ranking.error ? (
          <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
            {ranking.error}
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {ranking.rows.map((row, index) => (
              <li
                key={`${row.input}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span>
                  <span className="mr-2 text-[var(--muted-foreground)]">{index + 1}.</span>
                  <span className="font-semibold">{row.input}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                    {row.result.band.label}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-[var(--primary)]">
                  {row.result.score}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This score is a novelty index invented for this page. It is not a traditional practice, it
        is not evidence-based, and a low score says nothing about a person or a name. Use it for fun
        when narrowing a shortlist, never as a reason to accept or reject a name.
      </p>
    </main>
  );
}
