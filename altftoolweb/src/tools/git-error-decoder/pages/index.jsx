"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, History, Link2, RotateCcw, Search, TriangleAlert } from "lucide-react";

import {
  BLAST_RADIUS,
  GIT_ERRORS,
  REFLOG_RECOVERY,
  anchorId,
  blastSummary,
  formatErrorForCopy,
  getBlastLevel,
  groupedErrors,
  searchErrors,
} from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRE_BLOCK =
  "overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DASH = "—";

/** Literal class strings per tone so Tailwind can see them at build time. */
const TONE_BADGE = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const numberFormat = new Intl.NumberFormat("en-US");

function BlastBadge({ levelId }) {
  const level = getBlastLevel(levelId);
  if (!level) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE_BADGE[level.tone]}`}
      title={level.rule}
    >
      {level.label}
    </span>
  );
}

function CommandRow({ command }) {
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-3">
      <BlastBadge levelId={command.blast} />
      <div className="min-w-0 flex-1">
        <pre className={PRE_BLOCK}>
          <code>{command.cmd}</code>
        </pre>
        <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{command.why}</p>
      </div>
    </li>
  );
}

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(() => searchErrors(query), [query]);
  const hasError = Boolean(result.error);

  const matches = hasError ? [] : result.matches;
  const topMatch = matches.length > 0 ? matches[0].entry : null;
  const topSummary = topMatch ? blastSummary(topMatch) : null;
  const topWorst = topSummary && !topSummary.error ? getBlastLevel(topSummary.worst) : null;
  const groups = useMemo(() => groupedErrors(), []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const target = window.location.hash.replace(/^#/, "");
    if (!target) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (element) element.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const copyEntry = async (entry) => {
    const text = formatErrorForCopy(entry);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setQuery("");
    setCopiedId("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Git troubleshooting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Error Message Decoder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the error, or pick it from the list. Each entry explains what happened in git&apos;s
          own model and grades every suggested command by blast radius — because at this moment the
          question is not which command fixes it, but which command is safe to run.
        </p>
      </header>

      <section className={CARD} aria-labelledby="ged-legend-heading">
        <h2 id="ged-legend-heading" className="text-sm font-semibold">
          What the badges mean
        </h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {BLAST_RADIUS.map((level) => (
            <div key={level.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-3">
              <dt>
                <BlastBadge levelId={level.id} />
              </dt>
              <dd className="min-w-0 flex-1">
                <span className="font-semibold">{level.short}. </span>
                <span className="text-[var(--muted-foreground)]">{level.rule}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ged-search-heading">
        <h2 id="ged-search-heading" className="sr-only">
          Search the catalogue
        </h2>
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="ged-query">
              Paste the git error, or type a few words
            </label>
            <textarea
              id="ged-query"
              rows={3}
              placeholder="fatal: refusing to merge unrelated histories"
              className={`mt-2 min-h-11 py-2 font-mono text-sm ${INPUT_CLASS}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ged-pick">
                Or pick one from the list
              </label>
              <select
                id="ged-pick"
                className={`mt-2 h-11 ${INPUT_CLASS}`}
                value=""
                onChange={(event) => {
                  if (event.target.value !== "") setQuery(event.target.value);
                }}
              >
                <option value="">Choose an error…</option>
                {groups.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.entries.map((entry) => (
                      <option key={entry.id} value={entry.title}>
                        {entry.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => topMatch && copyEntry(topMatch)}
                disabled={!topMatch}
                aria-label="Copy the decoded explanation and graded commands for the top match"
                className={`${GHOST_BTN} flex-1 disabled:opacity-50`}
              >
                {copiedId && topMatch && copiedId === topMatch.id ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copiedId && topMatch && copiedId === topMatch.id ? "Copied!" : "Copy top match"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Clear the search and show every error"
                className={PRIMARY_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="ged-result-heading">
        <h2 id="ged-result-heading" className="sr-only">
          Search result
        </h2>
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
            {hasError ? DASH : numberFormat.format(result.count)}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {hasError
              ? "Fix the input above to search."
              : result.showingAll
                ? "entries in the catalogue — all shown below"
                : `of ${numberFormat.format(GIT_ERRORS.length)} entries match`}
          </p>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-[var(--muted-foreground)]">Closest match</dt>
            <dd className="font-medium sm:text-right">{hasError || !topMatch ? DASH : topMatch.title}</dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="text-[var(--muted-foreground)]">Worst blast radius in its commands</dt>
            <dd className="font-medium sm:text-right">
              {hasError || !topWorst ? DASH : <BlastBadge levelId={topWorst.id} />}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-[var(--muted-foreground)]">Its commands, by grade</dt>
            <dd className="font-medium sm:text-right">
              {hasError || !topSummary || topSummary.error
                ? DASH
                : `${numberFormat.format(topSummary.counts.safe)} safe · ${numberFormat.format(topSummary.counts.rewrite)} rewrite history · ${numberFormat.format(topSummary.counts.destructive)} destructive`}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-[var(--muted-foreground)]">Words matched</dt>
            <dd className="font-medium sm:text-right">
              {hasError || !topMatch || result.showingAll
                ? DASH
                : matches[0].matched.join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      {!hasError && matches.length === 0 ? (
        <p className="mt-6 rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
          Nothing in the catalogue matches those words. It covers {numberFormat.format(GIT_ERRORS.length)}{" "}
          errors — try a distinctive phrase from the message, such as “unrelated histories”,
          “index.lock” or “publickey”.
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        {matches.map(({ entry }) => {
          const summary = blastSummary(entry);
          const anchor = anchorId(entry.id);
          return (
            <article key={entry.id} id={anchor} className={`${CARD} scroll-mt-24`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug">
                  <a
                    href={`#${anchor}`}
                    className="inline-flex items-start gap-2 hover:text-[var(--primary)]"
                    aria-label={`Link to ${entry.title}`}
                  >
                    <Link2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{entry.title}</span>
                  </a>
                </h2>
                <button
                  type="button"
                  onClick={() => copyEntry(entry)}
                  aria-label={`Copy the explanation and graded commands for: ${entry.title}`}
                  className={GHOST_BTN}
                >
                  {copiedId === entry.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === entry.id ? "Copied!" : "Copy"}
                </button>
              </div>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {entry.group}
                {summary.error ? null : (
                  <>
                    {" · "}
                    {numberFormat.format(summary.total)} commands, worst grade{" "}
                    {(getBlastLevel(summary.worst) || {}).label}
                  </>
                )}
              </p>

              <pre className={`mt-3 ${PRE_BLOCK}`}>
                <code>{entry.message}</code>
              </pre>

              <h3 className="mt-5 text-sm font-semibold">What actually happened</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{entry.model}</p>

              <h3 className="mt-4 text-sm font-semibold">Why it shows up</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                {entry.causes.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>

              <h3 className="mt-4 text-sm font-semibold">Commands, graded</h3>
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {entry.commands.map((command) => (
                  <CommandRow key={command.cmd} command={command} />
                ))}
              </ul>

              <p className="mt-4 text-xs text-[var(--muted-foreground)]">Source: {entry.source}</p>
            </article>
          );
        })}
      </div>

      <section className={`mt-8 ${CARD}`} aria-labelledby="ged-reflog-heading" id="reflog-recovery">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <History className="h-4 w-4" aria-hidden="true" />
          Recovery
        </div>
        <h2 id="ged-reflog-heading" className="text-xl font-semibold leading-snug">
          {REFLOG_RECOVERY.headline}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {REFLOG_RECOVERY.explainer}
        </p>

        <h3 className="mt-5 text-sm font-semibold">The reflog walk, graded</h3>
        <ul className="mt-1 divide-y divide-[var(--border)]">
          {REFLOG_RECOVERY.steps.map((step) => (
            <CommandRow key={step.cmd} command={step} />
          ))}
        </ul>

        <h3 className="mt-5 text-sm font-semibold">What the reflog cannot do</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          {REFLOG_RECOVERY.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">Source: {REFLOG_RECOVERY.source}</p>
      </section>

      <section className={`mt-8 ${CARD}`} aria-labelledby="ged-index-heading">
        <h2 id="ged-index-heading" className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4" aria-hidden="true" />
          All {numberFormat.format(GIT_ERRORS.length)} errors
        </h2>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.group}
              </p>
              <ul className="mt-1 space-y-1 text-sm">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${anchorId(entry.id)}`}
                      onClick={() => setQuery("")}
                      className="inline-block min-h-11 py-2.5 leading-6 text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--primary)] hover:decoration-[var(--primary)]"
                    >
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
