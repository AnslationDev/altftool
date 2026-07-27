"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, RotateCcw } from "lucide-react";

import {
  LANGUAGE_PROFILES,
  MAX_INDENT,
  MAX_LINE_LENGTH,
  MIN_INDENT,
  MIN_LINE_LENGTH,
  OPTIONAL_SECTIONS,
  generateStyleGuide,
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
  teamName: "Acme Platform Team",
  language: "typescript",
  indentStyle: "",
  indentSize: "",
  lineLength: "",
  quotes: "",
  semicolons: "default",
  sections: ["commits", "reviews", "tests", "errors", "comments"],
  maxFunctionLines: "40",
  maxPrPatchSize: "400",
  branchPrefix: "feat/",
};

export default function ToolHome() {
  const [teamName, setTeamName] = useState(DEFAULTS.teamName);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [indentStyle, setIndentStyle] = useState(DEFAULTS.indentStyle);
  const [indentSize, setIndentSize] = useState(DEFAULTS.indentSize);
  const [lineLength, setLineLength] = useState(DEFAULTS.lineLength);
  const [quotes, setQuotes] = useState(DEFAULTS.quotes);
  const [semicolons, setSemicolons] = useState(DEFAULTS.semicolons);
  const [sections, setSections] = useState(DEFAULTS.sections);
  const [maxFunctionLines, setMaxFunctionLines] = useState(DEFAULTS.maxFunctionLines);
  const [maxPrPatchSize, setMaxPrPatchSize] = useState(DEFAULTS.maxPrPatchSize);
  const [branchPrefix, setBranchPrefix] = useState(DEFAULTS.branchPrefix);
  const [copied, setCopied] = useState("");

  const profile =
    LANGUAGE_PROFILES.find((item) => item.key === language) ?? LANGUAGE_PROFILES[0];

  const result = useMemo(
    () =>
      generateStyleGuide({
        teamName,
        language,
        indentStyle: indentStyle === "" ? undefined : indentStyle,
        indentSize: indentSize.trim() === "" ? undefined : Number(indentSize),
        lineLength: lineLength.trim() === "" ? undefined : Number(lineLength),
        quotes: quotes === "" ? undefined : quotes,
        semicolons:
          semicolons === "default" ? undefined : semicolons === "yes",
        sections,
        maxFunctionLines:
          maxFunctionLines.trim() === "" ? Number.NaN : Number(maxFunctionLines),
        maxPrPatchSize:
          maxPrPatchSize.trim() === "" ? Number.NaN : Number(maxPrPatchSize),
        branchPrefix,
      }),
    [
      teamName,
      language,
      indentStyle,
      indentSize,
      lineLength,
      quotes,
      semicolons,
      sections,
      maxFunctionLines,
      maxPrPatchSize,
      branchPrefix,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleSection = (key) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const copyText = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setTeamName(DEFAULTS.teamName);
    setLanguage(DEFAULTS.language);
    setIndentStyle(DEFAULTS.indentStyle);
    setIndentSize(DEFAULTS.indentSize);
    setLineLength(DEFAULTS.lineLength);
    setQuotes(DEFAULTS.quotes);
    setSemicolons(DEFAULTS.semicolons);
    setSections(DEFAULTS.sections);
    setMaxFunctionLines(DEFAULTS.maxFunctionLines);
    setMaxPrPatchSize(DEFAULTS.maxPrPatchSize);
    setBranchPrefix(DEFAULTS.branchPrefix);
    setCopied("");
  };

  const rows = hasError
    ? [
        ["Language baseline", DASH],
        ["Indentation", DASH],
        ["Line length", DASH],
        ["Optional sections included", DASH],
      ]
    : [
        ["Language baseline", profile.source],
        [
          "Indentation",
          result.resolved.indentStyle === "tab"
            ? "tabs"
            : `${NUM.format(result.resolved.indentSize)} spaces`,
        ],
        [
          "Line length",
          result.resolved.lineLength > 0
            ? `${NUM.format(result.resolved.lineLength)} characters`
            : "no hard limit",
        ],
        ["String quotes", result.resolved.quotes],
        ["Semicolons", result.resolved.semicolons ? "required" : "not used"],
        ["Optional sections included", NUM.format(result.sectionCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          Developer docs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Engineering Style Guide Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a language and your conventions to generate a Markdown coding-standards
          document plus a matching .editorconfig, seeded from each ecosystem&apos;s
          dominant published guide (Prettier, PEP 8, gofmt, Google Java Style, RuboCop,
          .NET guidelines).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-team">
              Team or repository name
            </label>
            <input
              id="esg-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-language">
              Language
            </label>
            <select
              id="esg-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGE_PROFILES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-indent-style">
              Indent style
            </label>
            <select
              id="esg-indent-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={indentStyle}
              onChange={(event) => setIndentStyle(event.target.value)}
            >
              <option value="">
                Language default ({profile.indentStyle === "tab" ? "tabs" : "spaces"})
              </option>
              <option value="space">Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-indent-size">
              Indent width ({MIN_INDENT}–{MAX_INDENT})
            </label>
            <input
              id="esg-indent-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_INDENT}
              max={MAX_INDENT}
              placeholder={`Default: ${profile.indentSize}`}
              value={indentSize}
              onChange={(event) => setIndentSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-line-length">
              Line length ({MIN_LINE_LENGTH}–{MAX_LINE_LENGTH}, 0 = no limit)
            </label>
            <input
              id="esg-line-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_LINE_LENGTH}
              placeholder={`Default: ${profile.lineLength || "no limit"}`}
              value={lineLength}
              onChange={(event) => setLineLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-quotes">
              String quotes
            </label>
            <select
              id="esg-quotes"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quotes}
              onChange={(event) => setQuotes(event.target.value)}
            >
              <option value="">Language default ({profile.quotes})</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-semicolons">
              Semicolons
            </label>
            <select
              id="esg-semicolons"
              className={`mt-2 ${INPUT_CLASS}`}
              value={semicolons}
              onChange={(event) => setSemicolons(event.target.value)}
            >
              <option value="default">
                Language default ({profile.semicolons ? "required" : "not used"})
              </option>
              <option value="yes">Required</option>
              <option value="no">Not used</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-fn-lines">
              Max function length (lines)
            </label>
            <input
              id="esg-fn-lines"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="500"
              value={maxFunctionLines}
              onChange={(event) => setMaxFunctionLines(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-pr-size">
              Max pull-request size (changed lines)
            </label>
            <input
              id="esg-pr-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="5000"
              step="50"
              value={maxPrPatchSize}
              onChange={(event) => setMaxPrPatchSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esg-branch">
              Branch prefix
            </label>
            <input
              id="esg-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={branchPrefix}
              onChange={(event) => setBranchPrefix(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Sections to include</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {OPTIONAL_SECTIONS.map((section) => (
              <label
                key={section.key}
                htmlFor={`esg-section-${section.key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`esg-section-${section.key}`}
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
              Rules in the generated guide
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.ruleCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.languageLabel} guide with a matching .editorconfig, ready to drop into your repository.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("md", hasError ? "" : result.markdown)}
              disabled={hasError}
              aria-label="Copy the style guide Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "md" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "md" ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={() => copyText("ec", hasError ? "" : result.editorConfig)}
              disabled={hasError}
              aria-label="Copy the .editorconfig contents"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "ec" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "ec" ? "Copied!" : "Copy .editorconfig"}
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
        <h2 className="text-base font-semibold">STYLE_GUIDE.md</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[280px] whitespace-pre p-4 text-xs leading-5">
            {hasError ? DASH : result.markdown}
          </pre>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">.editorconfig</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[280px] whitespace-pre p-4 text-xs leading-5">
            {hasError ? DASH : result.editorConfig}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Defaults follow each language&apos;s dominant published guide; adjust any value to
        match your team&apos;s decisions. The generated document is a starting point —
        adopt it in a pull request so the team agrees on it once.
      </p>
    </main>
  );
}
