"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCog, RotateCcw } from "lucide-react";

import {
  DEFAULT_MAX_LENGTH,
  MAX_MAX_LENGTH,
  MIN_MAX_LENGTH,
  REPLACEMENT_OPTIONS,
  sanitizeFileName,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Photo of Aadhaar Card (Front & Back) – final .JPG",
  replacement: "_",
  lowercase: false,
  maxLength: String(DEFAULT_MAX_LENGTH),
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [replacement, setReplacement] = useState(DEFAULTS.replacement);
  const [lowercase, setLowercase] = useState(DEFAULTS.lowercase);
  const [maxLength, setMaxLength] = useState(DEFAULTS.maxLength);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      sanitizeFileName({
        name,
        replacement,
        lowercase,
        maxLength: maxLength.trim() === "" ? Number.NaN : Number(maxLength),
      }),
    [name, replacement, lowercase, maxLength],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.sanitized);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setReplacement(DEFAULTS.replacement);
    setLowercase(DEFAULTS.lowercase);
    setMaxLength(DEFAULTS.maxLength);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCog className="h-4 w-4" aria-hidden="true" />
          Upload troubleshooting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">File Name Sanitiser For Portals</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Strip the spaces, symbols, accents and reserved words that make government portals and
          legacy upload systems reject files. Output uses only the POSIX-portable characters:
          letters, digits, dot, hyphen and underscore.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="fns-name">
          File name to clean
        </label>
        <input
          id="fns-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="fns-repl">
              Replace bad characters with
            </label>
            <select
              id="fns-repl"
              className={`mt-2 ${INPUT_CLASS}`}
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            >
              {REPLACEMENT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fns-max">
              Maximum length
            </label>
            <input
              id="fns-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MAX_LENGTH}
              max={MAX_MAX_LENGTH}
              step="1"
              value={maxLength}
              onChange={(event) => setMaxLength(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor="fns-lower"
            >
              <input
                id="fns-lower"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={lowercase}
                onChange={(event) => setLowercase(event.target.checked)}
              />
              Lowercase everything
            </label>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Safe file name
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.sanitized}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to get a safe name."
                : result.changed
                  ? "Rename your file to this before uploading."
                  : "Already portal-safe — no changes needed."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the sanitised file name"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy name"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example name" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Original</dt>
            <dd className="break-all text-right font-mono font-semibold">{hasError ? DASH : result.original}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Length</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${NUM.format(result.length)} characters`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Problems found</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : NUM.format(result.issues.length)}</dd>
          </div>
        </dl>

        {!hasError && result.issues.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm leading-6">
            {result.issues.map((issue) => (
              <li key={issue} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                {issue}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Output keeps only the POSIX portable filename characters (A-Z, a-z, 0-9, dot, hyphen,
        underscore), transliterates accents, avoids Windows reserved device names like CON and PRN,
        never starts with a dot, and always preserves the extension when truncating.
      </p>
    </main>
  );
}
