"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { FORMATS, MAX_SCALE, MIN_SCALE, computeActComposite } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  formatId: FORMATS[0].id,
  english: "28",
  math: "26",
  reading: "30",
  science: "27",
};

const DASH = "—";

const toNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [english, setEnglish] = useState(DEFAULTS.english);
  const [math, setMath] = useState(DEFAULTS.math);
  const [reading, setReading] = useState(DEFAULTS.reading);
  const [science, setScience] = useState(DEFAULTS.science);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeActComposite({
        formatId,
        english: toNumber(english),
        math: toNumber(math),
        reading: toNumber(reading),
        science: toNumber(science),
      }),
    [formatId, english, math, reading, science],
  );

  const hasError = Boolean(result.error);
  const isEnhanced = formatId === "enhanced";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "ACT Composite score",
      `Format: ${result.format.label}`,
      `English: ${result.english}, Math: ${result.math}, Reading: ${result.reading}${result.science !== null ? `, Science: ${result.science}` : ""}`,
      `Unrounded average: ${NUM.format(result.average)}`,
      `Composite: ${result.composite}`,
      result.stem !== null ? `STEM score (Math + Science): ${result.stem}` : null,
    ]
      .filter(Boolean)
      .join("\n");
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
    setFormatId(DEFAULTS.formatId);
    setEnglish(DEFAULTS.english);
    setMath(DEFAULTS.math);
    setReading(DEFAULTS.reading);
    setScience(DEFAULTS.science);
    setCopied(false);
  };

  const sectionFields = [
    ["act-english", "English", english, setEnglish],
    ["act-math", "Math", math, setMath],
    ["act-reading", "Reading", reading, setReading],
    [
      "act-science",
      isEnhanced ? "Science (optional on enhanced ACT)" : "Science",
      science,
      setScience,
    ],
  ];

  const rows = hasError
    ? [
        ["Sum of counted sections", DASH],
        ["Unrounded average", DASH],
        ["Sections in Composite", DASH],
        ["STEM score", DASH],
      ]
    : [
        ["Sum of counted sections", NUM.format(result.sum)],
        ["Unrounded average", NUM.format(result.average)],
        ["Sections in Composite", NUM.format(result.sectionsCounted)],
        ["STEM score (Math + Science)", result.stem !== null ? NUM.format(result.stem) : "Not available without Science"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Global Test Prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ACT Composite Score Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Average your ACT section scores into the official Composite using ACT&apos;s rounding rule
          — fractions of one-half or more round up — for both the enhanced (2025+) and classic
          formats.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="act-format">
              ACT format
            </label>
            <select
              id="act-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          {sectionFields.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label} ({MIN_SCALE}–{MAX_SCALE})
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step="1"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
        {isEnhanced ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            On the enhanced ACT the Composite averages English, Math and Reading only. Leave Science
            blank if you did not take it — when entered, it feeds the separate STEM score.
          </p>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              ACT Composite
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.composite}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Average of ${NUM.format(result.average)} rounded ${result.average === result.composite ? "exactly" : result.composite > result.average ? "up" : "down"} to the nearest whole number.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the ACT composite result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on ACT&apos;s published rounding rule. Official Composite
        scores come only from your ACT score report; colleges may also superscore across test dates.
      </p>
    </main>
  );
}
