"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sigma } from "lucide-react";

import {
  PYTHAGOREAN_GROUPS,
  Y_MODES,
  compareSpellings,
  computeNameNumerology,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = { name: "John Smith", alternate: "Jon Smyth", yMode: Y_MODES.auto };
const DASH = "—";

const Y_MODE_OPTIONS = [
  { value: Y_MODES.auto, label: "Automatic (recommended)" },
  { value: Y_MODES.vowel, label: "Always a vowel" },
  { value: Y_MODES.consonant, label: "Always a consonant" },
];

function ResultCard({ title, subtitle, result }) {
  const blank = !result;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {title}
      </p>
      <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
        {blank ? DASH : result.value === 0 ? DASH : result.value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        {blank ? DASH : result.empty ? subtitle : `total ${result.total}`}
        {!blank && result.isMaster ? " · master number" : ""}
      </p>
      {!blank && result.keynote ? (
        <p className="mt-2 text-sm">{result.keynote}</p>
      ) : null}
      {!blank && result.karmicDebt ? (
        <p className="mt-2 text-xs font-semibold text-[var(--danger)]">
          Karmic debt total {result.karmicDebt}
        </p>
      ) : null}
    </div>
  );
}

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [alternate, setAlternate] = useState(DEFAULTS.alternate);
  const [yMode, setYMode] = useState(DEFAULTS.yMode);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeNameNumerology(name, { yMode }), [name, yMode]);

  const comparison = useMemo(
    () => compareSpellings(name, alternate, { yMode }),
    [name, alternate, yMode],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Pythagorean name numerology",
      `Name: ${result.name}`,
      `Expression / destiny: ${result.expression.value} (total ${result.expression.total})`,
      `Soul urge: ${result.soulUrge.value} (vowels total ${result.soulUrge.total})`,
      `Personality: ${result.personality.value} (consonants total ${result.personality.total})`,
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
    setAlternate(DEFAULTS.alternate);
    setYMode(DEFAULTS.yMode);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sigma className="h-4 w-4" aria-hidden="true" />
          Pythagorean system
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pythagorean Name Numerology</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scores a name on the Pythagorean chart, where the alphabet cycles 1 to 9 (A=1 … I=9,
          J=1 … R=9, S=1 … Z=8). You get the expression number from all letters, the soul urge from
          the vowels and the personality number from the consonants, with 11, 22 and 33 left unreduced.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pyth-name">
              Full name
            </label>
            <input
              id="pyth-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Traditionally the full name as first recorded at birth. Only A–Z letters are scored.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pyth-ymode">
              Treat the letter Y as
            </label>
            <select
              id="pyth-ymode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={yMode}
              onChange={(event) => setYMode(event.target.value)}
            >
              {Y_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pyth-alt">
              Alternative spelling to compare
            </label>
            <input
              id="pyth-alt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={alternate}
              onChange={(event) => setAlternate(event.target.value)}
            />
          </div>
        </div>
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
              Expression (destiny) number
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? result.expression.value : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.letters.length} letters totalling ${result.expression.total}`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the numerology result"
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ResultCard
            title="Soul urge (vowels)"
            subtitle="no vowels in this name"
            result={ok ? result.soulUrge : null}
          />
          <ResultCard
            title="Personality (consonants)"
            subtitle="no consonants in this name"
            result={ok ? result.personality : null}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letters scored", ok ? String(result.letters.length) : DASH],
            ["Vowels", ok ? `${result.vowels.length} letters, total ${result.soulUrge.total}` : DASH],
            [
              "Consonants",
              ok ? `${result.consonants.length} letters, total ${result.personality.total}` : DASH,
            ],
            [
              "Expression reduction",
              ok
                ? result.expression.steps.length === 0
                  ? "already a single or master number"
                  : result.expression.steps.map((s) => `${s.from} → ${s.to}`).join(", ")
                : DASH,
            ],
            ["Expression keynote", ok ? result.expression.keynote : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Letter by letter — vowels highlighted
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.letters.map((item, index) => (
                <span
                  key={`${item.letter}-${index}`}
                  className={`inline-flex flex-col items-center rounded-md border px-2 py-1 ${
                    item.vowel
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <span className="text-sm font-semibold">{item.letter}</span>
                  <span className="text-xs text-[var(--primary)]">{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Spelling comparison</h2>
        {comparison.error ? (
          <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
            {comparison.error}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {comparison.differences === 0
                ? "Both spellings give identical numbers."
                : `${comparison.differences} of 3 numbers change between the two spellings.`}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Number</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      {comparison.first.name}
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      {comparison.second.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.a}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          row.same ? "" : "text-[var(--primary)]"
                        }`}
                      >
                        {row.b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The Pythagorean letter chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-4 font-semibold">Value</th>
                <th scope="col" className="py-2 font-semibold">Letters</th>
              </tr>
            </thead>
            <tbody>
              {PYTHAGOREAN_GROUPS.map((group) => (
                <tr key={group.value} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-4 font-semibold text-[var(--primary)]">{group.value}</td>
                  <td className="py-2 tracking-wide">{group.letters.join("  ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Numerology is a cultural and entertainment tradition with no scientific basis. Nothing here
        predicts health, career, relationships or events, and it should not influence medical, legal
        or financial decisions.
      </p>
    </main>
  );
}
