"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import { OPERATORS, computeWindow } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { op: "^", versionText: "1.2.3" };
const DASH = "—";

export default function ToolHome() {
  const [op, setOp] = useState(DEFAULTS.op);
  const [versionText, setVersionText] = useState(DEFAULTS.versionText);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeWindow({ op, versionText }), [op, versionText]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Range: ${result.rangeText}`,
      `Equivalent comparators: ${result.comparators}`,
      `Allowed window: from ${result.min} (inclusive) below ${result.maxExclusive} (exclusive)`,
      `Rule: ${result.rule}`,
    ].join("\n");
  }, [hasError, result]);

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
    setOp(DEFAULTS.op);
    setVersionText(DEFAULTS.versionText);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Equivalent comparators", DASH],
        ["Lowest allowed version", DASH],
        ["First blocked version", DASH],
      ]
    : [
        ["Equivalent comparators", result.comparators],
        ["Lowest allowed version", `${result.min} (inclusive)`],
        ["First blocked version", `${result.maxExclusive} (exclusive bound)`],
        ["^ and ~ identical here", result.sameWindow ? "Yes — both freeze the minor digit" : "No"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Caret Tilde Range Visualizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick ^ or ~ and a base version to see the allowed update window on a number line — the
          same desugaring npm applies to your package.json ranges.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-op">
              Operator
            </label>
            <select
              id="ct-op"
              className={`mt-2 ${INPUT_CLASS}`}
              value={op}
              onChange={(event) => setOp(event.target.value)}
            >
              {OPERATORS.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-version">
              Base version
            </label>
            <input
              id="ct-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              placeholder="1.2.3"
              value={versionText}
              onChange={(event) => setVersionText(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["1.2.3", "0.2.3", "0.0.3", "2.0.0"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setVersionText(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Allowed window
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.comparators}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the window." : result.rule}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the version window result"
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

        {!hasError ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Version number line
            </p>
            <div className="mt-3 overflow-x-auto pb-1">
              <ol className="flex min-w-[480px] items-stretch gap-1" aria-label="Versions ordered from oldest to newest">
                {result.candidates.map((candidate) => (
                  <li key={candidate.version} className="flex-1">
                    <div
                      className={`h-3 rounded-full ${
                        candidate.allowed ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                      }`}
                      aria-hidden="true"
                    />
                    <p
                      className={`mt-2 text-center font-mono text-xs sm:text-sm ${
                        candidate.isBase ? "font-bold text-[var(--primary)]" : "font-medium"
                      }`}
                    >
                      {candidate.version}
                    </p>
                    <p className="text-center text-[10px] leading-4 text-[var(--muted-foreground)] sm:text-xs">
                      {candidate.kind}
                    </p>
                    <p
                      className={`text-center text-[10px] font-semibold uppercase sm:text-xs ${
                        candidate.allowed ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {candidate.allowed ? "allowed" : "blocked"}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Caret (^) freezes the left-most non-zero digit; tilde (~) freezes major and minor. Windows
        follow the node-semver rules used by npm, pnpm and yarn. Pre-release versions have extra
        matching rules not shown on this line.
      </p>
    </main>
  );
}
