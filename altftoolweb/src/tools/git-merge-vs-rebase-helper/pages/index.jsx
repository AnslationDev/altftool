"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitMerge, RotateCcw } from "lucide-react";

import { HISTORY_PREFERENCES, recommendIntegration } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BLOCK =
  "overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DASH = "—";

const DEFAULTS = {
  branchShared: false,
  commitCount: "4",
  commitsClean: true,
  historyPreference: "linear",
};

export default function ToolHome() {
  const [branchShared, setBranchShared] = useState(DEFAULTS.branchShared);
  const [commitCount, setCommitCount] = useState(DEFAULTS.commitCount);
  const [commitsClean, setCommitsClean] = useState(DEFAULTS.commitsClean);
  const [historyPreference, setHistoryPreference] = useState(DEFAULTS.historyPreference);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      recommendIntegration({
        branchShared,
        commitCount: commitCount.trim() === "" ? Number.NaN : Number(commitCount),
        commitsClean,
        historyPreference,
      }),
    [branchShared, commitCount, commitsClean, historyPreference],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Recommendation: ${result.name}`,
      result.ruling,
      "",
      "Commands:",
      ...result.commands.map((c) => `  ${c}`),
      "",
      "Why:",
      ...result.reasons.map((r) => `  - ${r}`),
      ...(result.cautions.length > 0 ? ["", "Watch out:", ...result.cautions.map((c) => `  - ${c}`)] : []),
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
    setBranchShared(DEFAULTS.branchShared);
    setCommitCount(DEFAULTS.commitCount);
    setCommitsClean(DEFAULTS.commitsClean);
    setHistoryPreference(DEFAULTS.historyPreference);
    setCopied(false);
  };

  const previewRows = hasError
    ? []
    : [
        ["Merge commit", result.previews.merge],
        ["Rebase + fast-forward", result.previews.rebase],
        ["Squash merge", result.previews.squash],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitMerge className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Merge vs Rebase Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe your branch and get a merge, rebase or squash recommendation based on the
          golden rule of rebasing — with ASCII history previews and the exact commands.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-count">
              Commits on your branch (not on target)
            </label>
            <input
              id="mr-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={commitCount}
              onChange={(event) => setCommitCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mr-history">
              History preference
            </label>
            <select
              id="mr-history"
              className={`mt-2 ${INPUT_CLASS}`}
              value={historyPreference}
              onChange={(event) => setHistoryPreference(event.target.value)}
            >
              {HISTORY_PREFERENCES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 grid gap-1">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="mr-shared"
          >
            <input
              id="mr-shared"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={branchShared}
              onChange={(event) => setBranchShared(event.target.checked)}
            />
            Others have pulled this branch or based work on it
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="mr-clean"
          >
            <input
              id="mr-clean"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={commitsClean}
              onChange={(event) => setCommitsClean(event.target.checked)}
            />
            Each commit is meaningful on its own (good message, builds, focused)
          </label>
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
              Recommendation
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.name}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.ruling}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the merge vs rebase recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex flex-col gap-1 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Why</dt>
            <dd className="font-medium">
              {hasError ? (
                DASH
              ) : (
                <ul className="list-disc space-y-1 pl-5">
                  {result.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
          {!hasError && result.cautions.length > 0 ? (
            <div className="flex flex-col gap-1 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Watch out</dt>
              <dd className="font-medium">
                <ul className="list-disc space-y-1 pl-5">
                  {result.cautions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>

        {!hasError ? (
          <>
            <h2 className="mt-5 text-sm font-semibold">Commands</h2>
            <pre className={`mt-2 ${CODE_BLOCK}`}>
              <code>{result.commands.join("\n")}</code>
            </pre>

            <h2 className="mt-5 text-sm font-semibold">What history will look like</h2>
            <div className="mt-2 space-y-3">
              {previewRows.map(([label, art]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</p>
                  <pre className={`mt-1 ${CODE_BLOCK}`}>
                    <code>{art}</code>
                  </pre>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
