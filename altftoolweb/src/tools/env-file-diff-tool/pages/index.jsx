"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileDiff, RotateCcw } from "lucide-react";

import { diffEnv, formatDiffReport } from "../lib";

const TEXTAREA_CLASS =
  "min-h-44 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_A = `# staging
DATABASE_URL=postgres://staging-db:5432/app
REDIS_URL=redis://cache:6379
LOG_LEVEL=debug
FEATURE_FLAGS=beta,newsearch`;

const DEFAULT_B = `# production
DATABASE_URL=postgres://prod-db:5432/app
REDIS_URL=redis://cache:6379
LOG_LEVEL=info
SENTRY_DSN=https://key@sentry.example.com/1`;

const DASH = "—";

const BADGE = {
  removed: "bg-[var(--danger-soft)] text-[var(--danger)]",
  added: "bg-[var(--muted)] text-[var(--success)]",
  changed: "bg-[var(--muted)] text-[var(--primary)]",
};

export default function ToolHome() {
  const [textA, setTextA] = useState(DEFAULT_A);
  const [textB, setTextB] = useState(DEFAULT_B);
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => diffEnv(textA, textB), [textA, textB]);
  const hasError = Boolean(diff.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(formatDiffReport(diff));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTextA(DEFAULT_A);
    setTextB(DEFAULT_B);
    setCopied(false);
  };

  const tableRows = hasError
    ? []
    : [
        ...diff.missingInB.map((r) => ({
          key: r.key,
          status: "Only in A",
          badge: BADGE.removed,
          a: r.valueA,
          b: DASH,
        })),
        ...diff.missingInA.map((r) => ({
          key: r.key,
          status: "Only in B",
          badge: BADGE.added,
          a: DASH,
          b: r.valueB,
        })),
        ...diff.changed.map((r) => ({
          key: r.key,
          status: "Changed",
          badge: BADGE.changed,
          a: r.valueA,
          b: r.valueB,
        })),
      ];

  const statRows = hasError
    ? [
        ["Variables in File A", DASH],
        ["Variables in File B", DASH],
        ["Only in A (missing from B)", DASH],
        ["Only in B (missing from A)", DASH],
        ["Changed values", DASH],
        ["Identical", DASH],
      ]
    : [
        ["Variables in File A", diff.counts.keysA],
        ["Variables in File B", diff.counts.keysB],
        ["Only in A (missing from B)", diff.counts.missingInB],
        ["Only in B (missing from A)", diff.counts.missingInA],
        ["Changed values", diff.counts.changed],
        ["Identical", diff.counts.unchanged],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileDiff className="h-4 w-4" aria-hidden="true" />
          Environment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Env File Diff Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste two .env files to see which variables are missing, extra or changed. Files are
          parsed with dotenv rules, so FOO=bar and FOO=&quot;bar&quot; compare as equal and
          comments are ignored. Everything runs locally in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="envdiff-a">
              File A (e.g. staging or .env.example)
            </label>
            <textarea
              id="envdiff-a"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={textA}
              onChange={(event) => setTextA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="envdiff-b">
              File B (e.g. production)
            </label>
            <textarea
              id="envdiff-b"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={textB}
              onChange={(event) => setTextB(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {diff.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Differences found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : diff.counts.differences}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : diff.inSync
                  ? "Both files define identical variables."
                  : "Rows below show every key that does not match between the two files."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the diff report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset both files to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 divide-y divide-[var(--border)] text-sm sm:grid-cols-3 sm:divide-y-0">
          {statRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-2 py-2.5 sm:flex-col sm:items-start">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && tableRows.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Variable
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Value in A
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Value in B
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={`${row.status}-${row.key}`} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-mono font-semibold">{row.key}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${row.badge}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="max-w-56 break-all py-2 pr-3 font-mono text-xs">{row.a}</td>
                    <td className="max-w-56 break-all py-2 font-mono text-xs">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && (diff.duplicatesA.length > 0 || diff.duplicatesB.length > 0) ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Duplicate keys detected (last assignment wins, per dotenv):{" "}
            {[
              diff.duplicatesA.length > 0 ? `File A — ${diff.duplicatesA.join(", ")}` : null,
              diff.duplicatesB.length > 0 ? `File B — ${diff.duplicatesB.join(", ")}` : null,
            ]
              .filter(Boolean)
              .join("; ")}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Values may contain secrets — this page never uploads your input, and the copy report only
        includes values for keys whose values differ.
      </p>
    </main>
  );
}
