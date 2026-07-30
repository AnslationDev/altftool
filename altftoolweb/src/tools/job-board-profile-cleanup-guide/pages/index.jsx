"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Eraser,
  FileSearch,
  ListChecks,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { MAX_PORTALS, MAX_TEXT_LENGTH, PORTAL_ACTIONS, scanResume } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50 disabled:pointer-events-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50 disabled:pointer-events-none";

const DASH = "—";

const EXAMPLE_TEXT = `Priya Sharma
Email: priya.sharma1990@gmail.com
Phone: 98765 43210
Date of Birth: 14/03/1990
Address: 12, MG Road, Bengaluru, Karnataka 560001
Marital Status: Married
Current CTC: 12,00,000
Photograph attached
References: Rohit Verma, +91 99887 76655`;

function severityStyle(severity) {
  if (severity >= 5) return { box: "bg-[var(--danger-soft)] text-[var(--danger)]", label: "Critical" };
  if (severity >= 3) return { box: "bg-[var(--warning-soft)] text-[var(--warning)]", label: "High" };
  return { box: "bg-[var(--muted)] text-[var(--muted-foreground)]", label: "Low" };
}

export default function ToolHome() {
  const [text, setText] = useState("");
  const [portalCount, setPortalCount] = useState("1");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedRedacted, setCopiedRedacted] = useState(false);

  const result = useMemo(
    () => scanResume({ text, portalCount: Number(portalCount) }),
    [text, portalCount]
  );

  const hasResult = !result.error;

  const summary = useMemo(() => {
    if (!hasResult) return "";
    const lines = [
      "Job Board Profile Cleanup Guide",
      `Exposure score: ${Math.round(result.exposurePercent)}% — ${result.band.label}`,
      result.band.note,
      `Findings: ${result.findingCount} categories, ${result.matchCount} match${result.matchCount === 1 ? "" : "es"}`,
      `Portal copies checked: ${result.portalCount}`,
      "",
    ];
    if (result.findings.length === 0) {
      lines.push("Nothing flagged in this text.");
    } else {
      lines.push("Detected:");
      for (const finding of result.findings) {
        lines.push(
          `- ${finding.label} (severity ${finding.severity}/5, ${finding.count} match${finding.count === 1 ? "" : "es"})`
        );
        lines.push(`  Why: ${finding.why}`);
        lines.push(`  Fix: ${finding.fix}`);
      }
    }
    return lines.join("\n");
  }, [hasResult, result]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 1500);
    } catch {
      setCopiedSummary(false);
    }
  };

  const copyRedacted = async () => {
    if (!hasResult || !result.redacted) return;
    try {
      await navigator.clipboard.writeText(result.redacted);
      setCopiedRedacted(true);
      setTimeout(() => setCopiedRedacted(false), 1500);
    } catch {
      setCopiedRedacted(false);
    }
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
    setPortalCount("3");
    setCopiedSummary(false);
    setCopiedRedacted(false);
  };

  const clearAll = () => {
    setText("");
    setPortalCount("1");
    setCopiedSummary(false);
    setCopiedRedacted(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Résumé privacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Job Board Profile Cleanup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the text of a résumé before you upload it to a job portal. The scanner flags
          government identifiers, contact and address details, date of birth, salary history and
          other fields that recruiters can search for but should not need at application stage,
          then builds a redacted copy you can use instead. Nothing you paste leaves this browser
          tab.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Exposure score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${Math.round(result.exposurePercent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasResult ? result.band.label : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasResult ? result.band.note : "Paste résumé text below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={!hasResult}
              aria-label="Copy the exposure summary"
              className={GHOST_BTN}
            >
              {copiedSummary ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedSummary ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={clearAll} aria-label="Clear the résumé text" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasResult ? `Exposure score ${Math.round(result.exposurePercent)} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasResult ? result.exposurePercent : 0}%` }}
          />
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Categories flagged", hasResult ? `${result.findingCount}` : DASH],
            ["Total matches", hasResult ? NUM.format(result.matchCount) : DASH],
            [
              "Severity found",
              hasResult ? `${NUM.format(result.severityFound)} / ${NUM.format(result.maxSeverity)}` : DASH,
            ],
            ["Portal copies checked", hasResult ? NUM.format(result.portalCount) : DASH],
            [
              "Exposure units (severity × copies)",
              hasResult ? NUM.format(result.exposureUnits) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Résumé text</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Paste the plain text of the résumé you are about to upload. Nothing is sent
              anywhere — the scan runs entirely in this tab.
            </p>
          </div>
          <button type="button" onClick={loadExample} className={GHOST_BTN}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Load example
          </button>
        </div>

        <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="resume-text">
          Paste résumé text
        </label>
        <textarea
          id="resume-text"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={12}
          maxLength={MAX_TEXT_LENGTH}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopiedSummary(false);
          }}
          placeholder="Paste the full text of your résumé here…"
        />
        <div className="mt-1 flex justify-end text-xs text-[var(--muted-foreground)]">
          {NUM.format(text.length)} / {NUM.format(MAX_TEXT_LENGTH)} characters
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="portal-count">
              Portals this résumé is uploaded to
            </label>
            <input
              id="portal-count"
              type="number"
              min={0}
              max={MAX_PORTALS}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={portalCount}
              onChange={(event) => {
                setPortalCount(event.target.value);
                setCopiedSummary(false);
              }}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Counts every job board and copy of this file, up to {MAX_PORTALS}. Each one is a
              separate place the same data can leak from.
            </p>
          </div>
        </div>
      </section>

      {hasResult && result.findings.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-base font-semibold">What was found</h2>
          {result.findings.map((finding) => {
            const style = severityStyle(finding.severity);
            return (
              <div key={finding.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.box}`}>
                      <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{finding.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        {finding.why}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.box}`}>
                    {style.label} · {finding.count} match{finding.count === 1 ? "" : "es"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6">
                  <span className="font-semibold">Fix: </span>
                  {finding.fix}
                </p>
                {finding.samples.length > 0 ? (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Masked samples: {finding.samples.join(", ")}
                  </p>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {hasResult && result.findings.length === 0 && text.trim().length > 0 ? (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          Nothing flagged in this text.
        </p>
      ) : null}

      {hasResult && result.findings.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Redacted résumé</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Flagged text is replaced with a placeholder. Review it before re-uploading —
                context around a removed field can still need a rewrite.
              </p>
            </div>
            <button type="button" onClick={copyRedacted} className={PRIMARY_BTN}>
              {copiedRedacted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eraser className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedRedacted ? "Copied!" : "Copy redacted text"}
            </button>
          </div>
          <textarea
            readOnly
            aria-label="Redacted résumé text"
            className={`mt-4 ${TEXTAREA_CLASS} bg-[var(--muted)]`}
            rows={12}
            value={result.redacted}
          />
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">Beyond the file: clean up the portal profile</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recruiter search matches on the portal's own profile fields as well as the uploaded
          file, so redacting the document alone is not enough.
        </p>
        <ul className="mt-4 space-y-3">
          {PORTAL_ACTIONS.map(([title, detail]) => (
            <li key={title} className="flex gap-3 text-sm leading-6">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>
                <span className="font-semibold">{title}.</span>{" "}
                <span className="text-[var(--muted-foreground)]">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This scanner runs entirely in your browser, does not upload the
        résumé anywhere, and cannot detect every possible identifier or format. Review the
        redacted text yourself before you re-upload it.
      </p>
    </main>
  );
}
