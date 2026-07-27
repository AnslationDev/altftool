"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageSearch, RotateCcw } from "lucide-react";

import { PRESET_RANGES, explainRange, satisfies } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { range: "^1.2.3", testVersion: "1.9.0" };
const DASH = "—";

export default function ToolHome() {
  const [range, setRange] = useState(DEFAULTS.range);
  const [testVersion, setTestVersion] = useState(DEFAULTS.testVersion);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => explainRange(range), [range]);
  const hasError = Boolean(result.error);

  const testOutcome = useMemo(() => {
    if (hasError || testVersion.trim() === "") return null;
    return satisfies(testVersion, range);
  }, [hasError, testVersion, range]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Semver range: ${range}`,
      `Meaning: ${result.english}`,
      ...result.alternatives.map(
        (alternative) => `${alternative.source}  =>  ${alternative.comparators.join(" ") || "any version"}`,
      ),
      `Examples allowed: ${result.examples.allowed.join(", ") || "none"}`,
      `Examples blocked: ${result.examples.blocked.join(", ") || "none"}`,
    ].join("\n");
  }, [hasError, range, result]);

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
    setRange(DEFAULTS.range);
    setTestVersion(DEFAULTS.testVersion);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageSearch className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Semver Range Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type any npm-style version range — caret, tilde, hyphen, x-range or comparators — and see
          exactly which versions it allows, using the same desugaring rules as node-semver.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sre-range">
              Version range
            </label>
            <input
              id="sre-range"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              placeholder="^1.2.3"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sre-test">
              Test a version against it (optional)
            </label>
            <input
              id="sre-test"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              placeholder="1.9.0"
              value={testVersion}
              onChange={(event) => setTestVersion(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRange(preset)}
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In plain English
            </p>
            <p className="mt-1 text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
              {hasError ? DASH : result.english}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the range explanation"
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
          {(hasError ? [] : result.alternatives).map((alternative) => (
            <div key={alternative.source} className="flex flex-wrap items-center justify-between gap-4 py-2.5">
              <dt className="font-mono text-[var(--muted-foreground)]">{alternative.source}</dt>
              <dd className="text-right font-mono font-semibold">
                {alternative.comparators.join("  ") || "any version"}
              </dd>
            </div>
          ))}
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Desugared comparators</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>

        {testOutcome !== null ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              testOutcome
                ? "bg-[var(--success-soft,var(--muted))] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {testOutcome
              ? `${testVersion.trim()} SATISFIES ${range.trim()}`
              : `${testVersion.trim()} does NOT satisfy ${range.trim()}`}
          </p>
        ) : null}
        {!hasError && testVersion.trim() !== "" && testOutcome === null ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Enter a full version like 1.9.0 to test it against the range.
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--success)]">Allowed, for example</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {(hasError ? [] : result.examples.allowed).map((example) => (
                <li
                  key={example}
                  className="rounded-md bg-[var(--muted)] px-2.5 py-1 font-mono text-sm text-[var(--foreground)]"
                >
                  {example}
                </li>
              ))}
              {hasError || result.examples?.allowed.length === 0 ? (
                <li className="text-sm text-[var(--muted-foreground)]">{DASH}</li>
              ) : null}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--danger)]">Blocked, for example</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {(hasError ? [] : result.examples.blocked).map((example) => (
                <li
                  key={example}
                  className="rounded-md bg-[var(--muted)] px-2.5 py-1 font-mono text-sm text-[var(--foreground)]"
                >
                  {example}
                </li>
              ))}
              {hasError || result.examples?.blocked.length === 0 ? (
                <li className="text-sm text-[var(--muted-foreground)]">{DASH}</li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Follows the node-semver range grammar used by npm, pnpm and yarn, including the rule that
        pre-release versions only match ranges that name a pre-release on the same
        major.minor.patch. Build metadata (+build) is ignored for matching, as the spec requires.
      </p>
    </main>
  );
}
