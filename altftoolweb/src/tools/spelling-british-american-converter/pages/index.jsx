"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { convertSpelling } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE =
  "Our neighbour's counsellor travelled 5 kilometres to the theatre programme, where the colour of the catalogue was analysed and the defence of the licence was practised.";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [target, setTarget] = useState("american");
  const [includeVocabulary, setIncludeVocabulary] = useState(false);
  const [useSuffixRules, setUseSuffixRules] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertSpelling({ text, target, includeVocabulary, useSuffixRules }),
    [text, target, includeVocabulary, useSuffixRules],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(SAMPLE);
    setTarget("american");
    setIncludeVocabulary(false);
    setUseSuffixRules(true);
    setCopied(false);
  };

  const targetLabel = target === "american" ? "American English" : "British English";
  const sourceLabel = target === "american" ? "British English" : "American English";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          Spelling conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          British American Spelling Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rewrite a whole document from {sourceLabel} into {targetLabel}. Uses a curated word list
          plus the regular <span className="font-semibold">-our/-or</span>,{" "}
          <span className="font-semibold">-ise/-ize</span> and{" "}
          <span className="font-semibold">-re/-er</span> rules, with exception lists so words like
          <span className="font-semibold"> advertise</span> and{" "}
          <span className="font-semibold">honorary</span> are left alone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Convert to</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["american", "American English"],
              ["british", "British English"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`target-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  target === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`target-${value}`}
                  type="radio"
                  name="spelling-target"
                  className="accent-[var(--primary)]"
                  value={value}
                  checked={target === value}
                  onChange={() => setTarget(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="spelling-input">
            Your text
          </label>
          <textarea
            id="spelling-input"
            rows={7}
            className={`mt-2 ${AREA_CLASS}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste an essay, report or article here."
          />
        </div>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor="opt-suffix"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
          >
            <input
              id="opt-suffix"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={useSuffixRules}
              onChange={(event) => setUseSuffixRules(event.target.checked)}
            />
            <span>
              Apply suffix rules beyond the word list
              <span className="block text-xs text-[var(--muted-foreground)]">
                Catches every -our, -ise and -yse word, not just the listed ones.
              </span>
            </span>
          </label>
          <label
            htmlFor="opt-vocab"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
          >
            <input
              id="opt-vocab"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={includeVocabulary}
              onChange={(event) => setIncludeVocabulary(event.target.checked)}
            />
            <span>
              Also swap vocabulary, not just spelling
              <span className="block text-xs text-[var(--muted-foreground)]">
                lift to elevator, lorry to truck, autumn to fall. British to American only.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => setTarget((value) => (value === "american" ? "british" : "american"))}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Swap direction
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the text and options">
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Spellings changed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.changeCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `across ${NUM.format(result.wordCount)} words, now in ${targetLabel}`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the converted text"
            className={PRIMARY_BTN}
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="spelling-output">
            Converted text
          </label>
          <textarea
            id="spelling-output"
            rows={7}
            readOnly
            className={`mt-2 ${AREA_CLASS}`}
            value={hasError ? "" : result.output}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words scanned", hasError ? DASH : NUM.format(result.wordCount)],
            ["Words rewritten", hasError ? DASH : NUM.format(result.changeCount)],
            ["Distinct spellings changed", hasError ? DASH : NUM.format(result.changes.length)],
            ["Dictionary entries in this direction", hasError ? DASH : NUM.format(result.dictionarySize)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.changes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What changed</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Rule</th>
                  <th scope="col" className="py-2 text-right font-semibold">Times</th>
                </tr>
              </thead>
              <tbody>
                {result.changes.map((change) => (
                  <tr
                    key={`${change.from}-${change.to}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{change.from}</td>
                    <td className="py-2 pr-3 font-semibold">{change.to}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{change.rule}</td>
                    <td className="py-2 text-right">{NUM.format(change.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Some pairs only convert one way on purpose: cheque, tyre, programme, storey, licence and
        practise all map to American forms whose reverse is ambiguous, so American to British leaves
        check, tire, program, story, license and practice untouched. Proofread names, quotations and
        legal titles, which should keep their original spelling.
      </p>
    </main>
  );
}
