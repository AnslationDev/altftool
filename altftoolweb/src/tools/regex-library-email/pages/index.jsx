"use client";

import { useMemo, useState } from "react";
import { AtSign, Check, Copy, RotateCcw } from "lucide-react";

import { PATTERNS, testInput } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  patternId: PATTERNS[2].id, // HTML5 — the browser-standard pattern
  sample: "user@example.com",
};

export default function ToolHome() {
  const [patternId, setPatternId] = useState(DEFAULTS.patternId);
  const [sample, setSample] = useState(DEFAULTS.sample);
  const [copied, setCopied] = useState(false);

  const pattern = PATTERNS.find((entry) => entry.id === patternId) ?? PATTERNS[0];

  const result = useMemo(
    () => testInput({ source: pattern.source, flags: pattern.flags, input: sample }),
    [pattern.source, pattern.flags, sample],
  );
  const hasError = Boolean(result.error);

  const copyPattern = async () => {
    try {
      await navigator.clipboard.writeText(`/${pattern.source}/${pattern.flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPatternId(DEFAULTS.patternId);
    setSample(DEFAULTS.sample);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AtSign className="h-4 w-4" aria-hidden="true" />
          Regex Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Regex Library for Email Validation
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Five copy-ready email patterns, from a minimal sanity check to the exact WHATWG HTML5
          regex and an RFC 5322-flavoured version — each with honest notes on what it misses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rle-pattern">
              Strictness level
            </label>
            <select
              id="rle-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternId}
              onChange={(event) => setPatternId(event.target.value)}
            >
              {PATTERNS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.strictness} — {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rle-sample">
              Test an email address
            </label>
            <input
              id="rle-sample"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={sample}
              onChange={(event) => setSample(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{pattern.description}</p>
      </section>

      {hasError ? (
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
              Test result
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.matched
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : result.matched ? "Match" : "No match"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `“${sample || "(empty)"}” tested against the ${pattern.name} pattern.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPattern}
              aria-label="Copy the selected email regex pattern"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy regex"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset pattern and test input to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <code className="block whitespace-pre text-xs leading-5 text-[var(--foreground)]">
            /{pattern.source}/{pattern.flags}
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Strictness</dt>
            <dd className="text-right font-semibold">{pattern.strictness}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Pattern length</dt>
            <dd className="text-right font-semibold">{pattern.source.length} chars</dd>
          </div>
          <div className="gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Accepts (examples)</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {pattern.shouldMatch.map((example) => (
                <code
                  key={example}
                  className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--success)]"
                >
                  {example}
                </code>
              ))}
            </dd>
          </div>
          <div className="gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Rejects (examples)</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {pattern.shouldNotMatch.map((example) => (
                <code
                  key={example}
                  className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--danger)]"
                >
                  {example}
                </code>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Known limitations of this pattern</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          {pattern.limitations.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All patterns in this library</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Level
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Pattern
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Best for
                </th>
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{entry.strictness}</td>
                  <td className="py-2 pr-3">
                    <code className="break-all text-xs">{`/${entry.source}/`}</code>
                  </td>
                  <td className="py-2 min-w-[180px]">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        No regex proves an address exists or receives mail. Validate the format loosely, then send a
        confirmation email — that is the only real test. Length limits (64-octet local part,
        255-octet domain, RFC 5321) should be enforced in code, not in the pattern.
      </p>
    </main>
  );
}
