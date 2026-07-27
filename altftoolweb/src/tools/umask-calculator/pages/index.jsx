"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FolderLock, RotateCcw } from "lucide-react";

import { COMMON_UMASKS, computeUmask, umaskForDirMode } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_UMASK = "022";
const DEFAULT_DIR = "750";
const DASH = "—";

export default function ToolHome() {
  const [umaskText, setUmaskText] = useState(DEFAULT_UMASK);
  const [dirModeText, setDirModeText] = useState(DEFAULT_DIR);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeUmask({ umaskText }), [umaskText]);
  const reverse = useMemo(() => umaskForDirMode({ dirModeText }), [dirModeText]);

  const hasError = Boolean(result.error);
  const hasReverseError = Boolean(reverse.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(
        [
          `umask ${result.umaskOctal}`,
          `New files: ${result.fileOctal} (${result.fileSymbolic})`,
          `New directories: ${result.dirOctal} (${result.dirSymbolic})`,
        ].join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setUmaskText(DEFAULT_UMASK);
    setDirModeText(DEFAULT_DIR);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FolderLock className="h-4 w-4" aria-hidden="true" />
          Linux admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Umask Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A umask clears bits from every new file: files get 666 &amp; ~umask, directories get 777
          &amp; ~umask. Enter a umask to see the resulting modes, or work backwards from the
          permissions you want.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="umask-value">
              Umask value
            </label>
            <input
              id="umask-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={umaskText}
              onChange={(event) => setUmaskText(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={4}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Common values</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_UMASKS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.note}
                  onClick={() => setUmaskText(item.value)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {item.value}
                </button>
              ))}
            </div>
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
              New files get
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.fileOctal}
            </p>
            <p className="mt-1 font-mono text-lg text-[var(--muted-foreground)]">
              {hasError ? DASH : result.fileSymbolic}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the umask result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">New directories get</dt>
            <dd className="text-right font-mono font-semibold">
              {hasError ? DASH : `${result.dirOctal} (${result.dirSymbolic})`}
            </dd>
          </div>
          {(hasError ? [] : result.maskedByClass).map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{item.label} — umask removes</dt>
              <dd className="text-right font-semibold">{item.removed}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reverse: find the umask for a target mode</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="umask-dirmode">
              Directory mode you want
            </label>
            <input
              id="umask-dirmode"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={dirModeText}
              onChange={(event) => setDirModeText(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={3}
            />
          </div>
          <div className="flex items-end">
            {hasReverseError ? (
              <p
                role="alert"
                className="w-full rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {reverse.error}
              </p>
            ) : (
              <p className="w-full rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                Use <span className="font-mono font-semibold">umask {reverse.umaskOctal}</span> —
                dirs become <span className="font-mono">{reverse.dirOctal}</span>, files{" "}
                <span className="font-mono">
                  {reverse.fileOctal} ({reverse.fileSymbolic})
                </span>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A umask only removes permission bits at creation time — it never adds execute to files (the
        base is 666) and never changes files that already exist. Set it in ~/.profile, a systemd
        unit&apos;s UMask=, or /etc/login.defs for the system default.
      </p>
    </main>
  );
}
