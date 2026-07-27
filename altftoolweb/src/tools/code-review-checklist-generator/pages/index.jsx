"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  CHANGE_TYPES,
  FOCUS_AREAS,
  LANGUAGES,
  RECOMMENDED_MAX_REVIEW_LINES,
  RISK_LEVELS,
  generateChecklist,
} from "../lib";

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
  title: "",
  language: "typescript",
  changeType: "feature",
  riskLevel: "medium",
  areas: ["security"],
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [changeType, setChangeType] = useState(DEFAULTS.changeType);
  const [riskLevel, setRiskLevel] = useState(DEFAULTS.riskLevel);
  const [areas, setAreas] = useState(DEFAULTS.areas);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateChecklist({ language, changeType, riskLevel, areas, title }),
    [language, changeType, riskLevel, areas, title],
  );

  const hasError = Boolean(result.error);

  const toggleArea = (key) => {
    setAreas((prev) =>
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
    setTitle(DEFAULTS.title);
    setLanguage(DEFAULTS.language);
    setChangeType(DEFAULTS.changeType);
    setRiskLevel(DEFAULTS.riskLevel);
    setAreas(DEFAULTS.areas);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Sections", DASH],
        ["Change type", DASH],
        ["Risk level", DASH],
      ]
    : [
        ["Sections", NUM.format(result.sectionCount)],
        ["Change type", result.changeLabel],
        ["Risk level", result.riskLabel],
        [
          "Recommended review size",
          `under ${NUM.format(RECOMMENDED_MAX_REVIEW_LINES)} changed lines`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Developer docs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Code Review Checklist Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a review checklist tuned to your language, change type and risk level.
          Sections follow Google&apos;s Code Review Developer Guide, with security items
          from the OWASP Code Review Guide. Copy it as Markdown task boxes for your pull
          request template.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="crc-title">
              Checklist title (optional)
            </label>
            <input
              id="crc-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Code review checklist"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crc-language">
              Language
            </label>
            <select
              id="crc-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crc-change">
              Change type
            </label>
            <select
              id="crc-change"
              className={`mt-2 ${INPUT_CLASS}`}
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
            >
              {CHANGE_TYPES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crc-risk">
              Risk level
            </label>
            <select
              id="crc-risk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value)}
            >
              {RISK_LEVELS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What does the change touch?</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {FOCUS_AREAS.map((area) => (
              <label
                key={area.key}
                htmlFor={`crc-area-${area.key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`crc-area-${area.key}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={areas.includes(area.key)}
                  onChange={() => toggleArea(area.key)}
                />
                {area.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Checklist items
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.itemCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Every item is a Markdown task box — paste the list straight into a pull request or template."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the checklist Markdown"
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

      {!hasError ? (
        <section className="mt-6 space-y-4">
          {result.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <h2 className="text-base font-semibold">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-[var(--border)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A checklist supports judgement, it does not replace it. Keep reviews under about{" "}
        {NUM.format(RECOMMENDED_MAX_REVIEW_LINES)} changed lines per session — defect
        discovery falls sharply on larger diffs.
      </p>
    </main>
  );
}
