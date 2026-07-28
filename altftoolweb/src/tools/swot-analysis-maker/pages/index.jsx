"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Download, Grid2x2, RotateCcw } from "lucide-react";
import { QUADRANTS, analyzeSwot, buildTows, toCsv, toMarkdown } from "../lib";

const DASH = "—";

const INITIAL = {
  title: "Independent coffee roaster — 2026 plan",
  strengths: "Own the roastery, so margin is not shared\nFive-year wholesale relationships with 18 cafes\nHead roaster has a national cupping score record",
  weaknesses: "One delivery van and one driver\nNo e-commerce beyond a contact form\nCash tied up in 6 months of green stock",
  opportunities:
    "Two new office blocks opening within 1 km\nSpeciality subscription boxes still growing locally\nA rival roaster has just lost its head roaster",
  threats:
    "Green bean prices volatile on a weak rupee\nA national chain opening 400 m away\nLandlord review due in 14 months",
};

const percentFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function SwotAnalysisMakerPage() {
  const [fields, setFields] = useState(INITIAL);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyzeSwot(fields), [fields]);
  const hasError = Boolean(analysis.error);

  const tows = useMemo(() => (hasError ? null : buildTows(analysis)), [hasError, analysis]);
  const markdown = useMemo(() => (hasError ? "" : toMarkdown(analysis)), [hasError, analysis]);

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleDownloadCsv() {
    if (hasError) return;
    const blob = new Blob([toCsv(analysis)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swot-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setFields(INITIAL);
    setCopied(false);
  }

  const byId = hasError
    ? {}
    : Object.fromEntries(analysis.quadrants.map((q) => [q.id, q]));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <Grid2x2 className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">SWOT Analysis Maker</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            One item per line in each box. The grid, the balance check and the four TOWS
            strategy crosses update as you type.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="swot-title" className="text-sm font-medium text-[var(--foreground)]">
          What is this analysis about?
        </label>
        <input
          id="swot-title"
          type="text"
          value={fields.title}
          onChange={(e) => setField("title", e.target.value)}
          className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label htmlFor={q.id} className="text-sm font-medium text-[var(--foreground)]">
              {q.label}{" "}
              <span className="font-normal text-[var(--muted-foreground)]">
                ({q.origin.toLowerCase()} · {q.effect.toLowerCase()})
              </span>
            </label>
            <textarea
              id={q.id}
              rows={5}
              value={fields[q.id]}
              onChange={(e) => setField(q.id, e.target.value)}
              placeholder={q.examples.join("\n")}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            <p className="text-xs text-[var(--muted-foreground)]">{q.prompt}</p>
          </div>
        ))}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the SWOT analysis as Markdown"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
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
          onClick={handleDownloadCsv}
          disabled={hasError}
          aria-label="Download the SWOT items as a CSV file"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the example analysis"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {analysis.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Quadrants adequately filled</p>
        <p className="mt-1 text-4xl leading-tight font-semibold text-[var(--foreground)]">
          {hasError ? DASH : `${percentFmt.format(analysis.completeness)}%`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${analysis.filledQuadrants} of 4 quadrants have 3 or more items · ${analysis.total} items total`}
        </p>

        <dl className="mt-4">
          <Row
            label="Internal (Strengths + Weaknesses)"
            value={
              hasError
                ? DASH
                : `${analysis.internal} (${percentFmt.format(analysis.internalShare)}%)`
            }
          />
          <Row
            label="External (Opportunities + Threats)"
            value={hasError ? DASH : `${analysis.external}`}
          />
          <Row
            label="Helpful (Strengths + Opportunities)"
            value={
              hasError
                ? DASH
                : `${analysis.helpful} (${percentFmt.format(analysis.helpfulShare)}%)`
            }
          />
          <Row
            label="Harmful (Weaknesses + Threats)"
            value={hasError ? DASH : `${analysis.harmful}`}
          />
        </dl>

        {!hasError && analysis.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {analysis.warnings.map((w) => (
              <li
                key={w}
                className="flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {!hasError && analysis.warnings.length === 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            All four quadrants are filled and readable.
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">The grid</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {hasError
            ? null
            : ["strengths", "weaknesses", "opportunities", "threats"].map((id) => {
                const q = byId[id];
                return (
                  <div
                    key={id}
                    className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
                  >
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {q.letter} · {q.label}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {q.origin} · {q.effect}
                    </p>
                    {q.items.length === 0 ? (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground)]">
                        {q.items.map((item, i) => (
                          <li key={`${id}-${i}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          TOWS strategies (Weihrich, 1982)
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tows && !tows.error
            ? tows.crosses.map((cross) => (
                <div
                  key={cross.id}
                  className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {cross.code} · {cross.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{cross.intent}</p>
                  {cross.pairs.length === 0 ? (
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Fill both quadrants to cross them.
                    </p>
                  ) : (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground)]">
                      {cross.pairs.slice(0, 6).map((pair, i) => (
                        <li key={`${cross.id}-${i}`}>{pair.text}</li>
                      ))}
                    </ul>
                  )}
                  {cross.possible > Math.min(cross.pairs.length, 6) ? (
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      {cross.possible} combinations in total — the full list is in the copied
                      Markdown.
                    </p>
                  ) : null}
                </div>
              ))
            : null}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">Markdown output</h2>
        <pre className="max-h-80 overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs whitespace-pre-wrap text-[var(--foreground)] ring-1 ring-[var(--border)]">
          {hasError ? DASH : markdown}
        </pre>
      </section>
    </div>
  );
}
