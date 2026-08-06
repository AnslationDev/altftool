"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import { explainExitCode, formatExplanation, referenceRows } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_CODE = "137";
const QUICK_CODES = ["1", "2", "126", "127", "130", "137", "139", "143"];

export default function ToolHome() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => explainExitCode(code), [code]);
  const hasError = Boolean(result.error);

  const rows = useMemo(() => {
    const all = referenceRows();
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (row) =>
        String(row.code).includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.meaning.toLowerCase().includes(q),
    );
  }, [filter]);

  const copyResult = async () => {
    const text = formatExplanation(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCode(DEFAULT_CODE);
    setFilter("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Linux Admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exit Code Reference Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type the code from <code className="font-mono">echo $?</code> or a container status and
          see what it means — POSIX shell codes, the sysexits.h EX_* block, and 128+N
          signal deaths decoded to the signal that killed the process.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="exit-code">
          Exit code (0–255)
        </label>
        <input
          id="exit-code"
          className={`mt-2 ${INPUT_CLASS} font-mono`}
          type="number"
          inputMode="numeric"
          min="0"
          max="255"
          step="1"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_CODES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setCode(sample)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {sample}
            </button>
          ))}
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
          <div className="min-w-0" role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Meaning
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.name}
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.meaning}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the exit code explanation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          role="status"
          aria-live="polite"
        >
          {(hasError
            ? [
                ["Defined by", DASH],
                ["Signal", DASH],
              ]
            : [
                ["Defined by", result.source === "none" ? "the program itself" : result.source],
                [
                  "Signal",
                  result.isSignal
                    ? `${result.signal.name} (signal ${result.signal.number}) — 128 + ${result.signal.number} = ${result.code}`
                    : "Not a signal death",
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.containerNote ? (
          <p
            className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
            role="status"
            aria-live="polite"
          >
            {result.containerNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Full reference</h2>
          <div className="w-full sm:w-64">
            <label className="sr-only" htmlFor="exit-filter">
              Filter the reference table
            </label>
            <input
              id="exit-filter"
              className={INPUT_CLASS}
              type="text"
              placeholder="Filter — e.g. SIGKILL, usage, 74"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Code
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => setCode(String(row.code))}
                      aria-label={`Explain exit code ${row.code}`}
                      className="font-mono font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {row.code}
                    </button>
                  </td>
                  <td className="py-2 pr-3 font-semibold">{row.name}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.meaning}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-3 text-[var(--muted-foreground)]">
                    Nothing matches that filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Signal numbers follow signal(7) on Linux x86-64; SIGBUS, SIGUSR1/2 and a few others carry
        different numbers on Alpha, SPARC and MIPS. sysexits.h codes are a BSD convention many —
        but not all — programs follow. When in doubt, the program's own man page wins.
      </p>
    </main>
  );
}
