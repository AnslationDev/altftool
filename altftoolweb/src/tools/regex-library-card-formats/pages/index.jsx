"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";

import { PATTERNS, analyzeCard } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  sample: "4111 1111 1111 1111", // Visa's public test number
  patternId: PATTERNS[0].id,
};

export default function ToolHome() {
  const [sample, setSample] = useState(DEFAULTS.sample);
  const [patternId, setPatternId] = useState(DEFAULTS.patternId);
  const [copied, setCopied] = useState(false);

  const pattern = PATTERNS.find((entry) => entry.id === patternId) ?? PATTERNS[0];

  const result = useMemo(() => analyzeCard(sample), [sample]);
  const hasError = Boolean(result.error);

  const copyPattern = async () => {
    try {
      await navigator.clipboard.writeText(`/${pattern.source}/`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSample(DEFAULTS.sample);
    setPatternId(DEFAULTS.patternId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Regex Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Regex Library for Card Formats
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Network format patterns — Visa, Mastercard (incl. the 2221–2720 series), Amex, RuPay,
          Discover, JCB, Diners — for input formatting, masking and UI hints. Not verification: no
          Luhn, no BIN lookup.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rlc-sample">
              Card-style number (test numbers only)
            </label>
            <input
              id="rlc-sample"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              inputMode="numeric"
              value={sample}
              onChange={(event) => setSample(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Never type a real card number into any online tool — use the networks&apos; public
              test numbers like 4111 1111 1111 1111.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rlc-pattern">
              Pattern to copy
            </label>
            <select
              id="rlc-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternId}
              onChange={(event) => setPatternId(event.target.value)}
            >
              {PATTERNS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{pattern.description}</p>
          </div>
        </div>
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
              Detected format
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : result.networkNames.length > 0
                  ? result.networkNames.join(" / ")
                  : "Unknown network"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.networkNames.length > 1
                  ? "Multiple networks share this prefix range — only a BIN database can say which issued it."
                  : "Format detection is a UI hint, not proof the card exists or is valid."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPattern}
              aria-label="Copy the selected card network regex pattern"
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
              aria-label="Reset the number and pattern to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <code className="block whitespace-pre text-xs leading-5 text-[var(--foreground)]">
            /{pattern.source}/
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Digits</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Display formatting (ISO 7813 grouping)</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : <code className="text-xs">{result.formatted}</code>}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Masked (last 4 visible, PCI-style)</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : <code className="text-xs">{result.masked}</code>}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Notes on the selected network pattern</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          {pattern.limitations.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All network format patterns</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Network
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Lengths
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Regex
                </th>
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{entry.name}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{entry.lengths.join(", ")}</td>
                  <td className="py-2">
                    <code className="break-all text-xs">{`/${entry.source}/`}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These patterns exist for input formatting, masking and UI badges only. They perform no Luhn
        check and no issuer verification, and never treat a regex match as authorisation to charge.
        Card data handling in production is governed by PCI DSS — use a certified payment gateway
        and keep raw PANs out of your systems entirely.
      </p>
    </main>
  );
}
