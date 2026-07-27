"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import { DOC_TYPES, OPTIONAL_SECTIONS, generateSpecTemplate } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  projectName: "Order search rewrite",
  author: "",
  reviewers: "",
  date: "",
  docType: "design-doc",
  sections: ["background", "alternatives", "risks", "rollout"],
};

export default function ToolHome() {
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [author, setAuthor] = useState(DEFAULTS.author);
  const [reviewers, setReviewers] = useState(DEFAULTS.reviewers);
  const [date, setDate] = useState(DEFAULTS.date);
  const [docType, setDocType] = useState(DEFAULTS.docType);
  const [sections, setSections] = useState(DEFAULTS.sections);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateSpecTemplate({ projectName, author, reviewers, date, docType, sections }),
    [projectName, author, reviewers, date, docType, sections],
  );

  const hasError = Boolean(result.error);
  const isAdr = docType === "adr";

  const toggleSection = (key) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProjectName(DEFAULTS.projectName);
    setAuthor(DEFAULTS.author);
    setReviewers(DEFAULTS.reviewers);
    setDate(DEFAULTS.date);
    setDocType(DEFAULTS.docType);
    setSections(DEFAULTS.sections);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Document type", DASH],
        ["Sections", DASH],
      ]
    : [
        ["Document type", result.docLabel],
        ["Sections", NUM.format(result.sectionCount)],
        [
          "Structure",
          result.adrFixed
            ? "Fixed: Status / Context / Decision / Consequences"
            : "Core sections plus your selected extras",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Developer docs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tech Spec Template Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a technical design document skeleton in one of three proven formats: a
          Google-style design doc with goals and non-goals, an RFC in the Rust / React
          style, or a Nygard-format Architecture Decision Record.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tst-name">
              Project or decision name
            </label>
            <input
              id="tst-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tst-type">
              Document type
            </label>
            <select
              id="tst-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
            >
              {DOC_TYPES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tst-author">
              Author (optional)
            </label>
            <input
              id="tst-author"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tst-reviewers">
              Reviewers (optional)
            </label>
            <input
              id="tst-reviewers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reviewers}
              onChange={(event) => setReviewers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tst-date">
              Date for the header (optional)
            </label>
            <input
              id="tst-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>

        {!isAdr ? (
          <fieldset className="mt-5">
            <legend className={LABEL_CLASS}>Extra sections</legend>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {OPTIONAL_SECTIONS.map((section) => (
                <label
                  key={section.key}
                  htmlFor={`tst-section-${section.key}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id={`tst-section-${section.key}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={sections.includes(section.key)}
                    onChange={() => toggleSection(section.key)}
                  />
                  {section.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            The ADR format is deliberately fixed: Status, Context, Decision, Consequences.
            Keep it to one or two pages per decision.
          </p>
        )}
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
              Sections in the template
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.sectionCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Copy the Markdown below into your docs repo, wiki or pull request."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the spec template Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Template</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[280px] whitespace-pre p-4 text-xs leading-5">
            {hasError ? DASH : result.markdown}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A spec exists to surface disagreement before code is written. Non-goals and
        alternatives-considered are the sections most teams skip — and the ones that save
        the most argument later.
      </p>
    </main>
  );
}
