"use client";

import { useMemo, useState } from "react";
import { Check, Code, Copy, RotateCcw } from "lucide-react";
import {
  buildCodingAssistantPrompt,
  DEFAULT_TOKEN_BUDGET,
  OUTPUT_FORMATS,
  REFUSAL_OPTIONS,
  REVIEW_FOCUS_OPTIONS,
  TEST_POLICIES,
  VERBOSITY_LEVELS,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  language: "TypeScript 5 (strict mode)",
  seniority: "senior",
  product: "an internal billing dashboard",
  framework: "Next.js 15, App Router",
  runtime: "Node 22",
  packageManager: "pnpm",
  styleGuide: "Airbnb JavaScript Style Guide + project ESLint config",
  formatter: "Prettier",
  linter: "ESLint",
  testFramework: "Vitest",
  commentStyle: "JSDoc on every exported function",
  contextNotes: "pnpm workspace monorepo. Server components by default; add \"use client\" only when a hook or event handler needs it.",
  bannedPatterns: "any, default exports, barrel files",
  verbosity: "balanced",
  testPolicy: "require",
  outputFormat: "diff",
  reviewFocus: ["correctness", "security", "errorHandling"],
  refusals: ["noSecrets", "noInvention", "noSilentRewrite"],
  tokenBudget: String(DEFAULT_TOKEN_BUDGET),
};

const REVIEW_LABELS = {
  correctness: "Correctness and edge cases",
  security: "Security",
  performance: "Performance",
  readability: "Readability",
  errorHandling: "Error handling",
  accessibility: "Accessibility",
  api: "API design",
  concurrency: "Concurrency",
};

const REFUSAL_LABELS = {
  noSecrets: "Never print or invent secrets",
  noInvention: "Never invent APIs or packages",
  noSilentRewrite: "Never rewrite unrelated code",
  noDestructive: "Confirm before destructive commands",
  noLicence: "No unknown-licence code",
  admitLimits: "Say what context is missing",
};

const OUTPUT_LABELS = {
  diff: "Unified diff",
  fullFile: "Complete updated file",
  snippet: "Changed block only",
  patchPlan: "Plan, then code per step",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggle = (key, option) => () => {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
      };
    });
  };

  const result = useMemo(
    () => buildCodingAssistantPrompt({ ...form, tokenBudget: Number(form.tokenBudget) }),
    [form],
  );
  const failed = Boolean(result.error);

  const copyPrompt = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Code className="h-4 w-4" aria-hidden="true" />
          System prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Coding Assistant System Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your stack, style guide, test policy and review bar into one system prompt, ordered
          role → context → rules → output format, with a token estimate for what it costs on every
          request.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Stack</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-language">
              Primary language (required)
            </label>
            <input id="cap-language" className={`mt-2 ${INPUT_CLASS}`} value={form.language} onChange={set("language")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-framework">
              Framework
            </label>
            <input id="cap-framework" className={`mt-2 ${INPUT_CLASS}`} value={form.framework} onChange={set("framework")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-runtime">
              Runtime / target
            </label>
            <input id="cap-runtime" className={`mt-2 ${INPUT_CLASS}`} value={form.runtime} onChange={set("runtime")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-pm">
              Package manager
            </label>
            <input id="cap-pm" className={`mt-2 ${INPUT_CLASS}`} value={form.packageManager} onChange={set("packageManager")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-style">
              Style guide
            </label>
            <input id="cap-style" className={`mt-2 ${INPUT_CLASS}`} value={form.styleGuide} onChange={set("styleGuide")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-formatter">
              Formatter
            </label>
            <input id="cap-formatter" className={`mt-2 ${INPUT_CLASS}`} value={form.formatter} onChange={set("formatter")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-linter">
              Linter
            </label>
            <input id="cap-linter" className={`mt-2 ${INPUT_CLASS}`} value={form.linter} onChange={set("linter")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-test">
              Test framework
            </label>
            <input id="cap-test" className={`mt-2 ${INPUT_CLASS}`} value={form.testFramework} onChange={set("testFramework")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-comment">
              Documentation comments
            </label>
            <input id="cap-comment" className={`mt-2 ${INPUT_CLASS}`} value={form.commentStyle} onChange={set("commentStyle")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-product">
              Product or codebase
            </label>
            <input id="cap-product" className={`mt-2 ${INPUT_CLASS}`} value={form.product} onChange={set("product")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Behaviour</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-verbosity">
              Answer length
            </label>
            <select id="cap-verbosity" className={`mt-2 ${INPUT_CLASS}`} value={form.verbosity} onChange={set("verbosity")}>
              {Object.entries(VERBOSITY_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-testpolicy">
              Test policy
            </label>
            <select id="cap-testpolicy" className={`mt-2 ${INPUT_CLASS}`} value={form.testPolicy} onChange={set("testPolicy")}>
              {Object.entries(TEST_POLICIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-output">
              Code output format
            </label>
            <select id="cap-output" className={`mt-2 ${INPUT_CLASS}`} value={form.outputFormat} onChange={set("outputFormat")}>
              {Object.keys(OUTPUT_FORMATS).map((key) => (
                <option key={key} value={key}>
                  {OUTPUT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-budget">
              Token budget for the system prompt
            </label>
            <input
              id="cap-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={form.tokenBudget}
              onChange={set("tokenBudget")}
            />
          </div>
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="cap-review-label">
          Review checklist
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="cap-review-label">
          {Object.keys(REVIEW_FOCUS_OPTIONS).map((key) => (
            <label key={key} htmlFor={`cap-review-${key}`} className={CHECK_CLASS}>
              <input
                id={`cap-review-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.reviewFocus.includes(key)}
                onChange={toggle("reviewFocus", key)}
              />
              {REVIEW_LABELS[key]}
            </label>
          ))}
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="cap-refusal-label">
          Hard rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="cap-refusal-label">
          {Object.keys(REFUSAL_OPTIONS).map((key) => (
            <label key={key} htmlFor={`cap-refusal-${key}`} className={CHECK_CLASS}>
              <input
                id={`cap-refusal-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.refusals.includes(key)}
                onChange={toggle("refusals", key)}
              />
              {REFUSAL_LABELS[key]}
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-banned">
              Banned patterns (comma separated)
            </label>
            <input id="cap-banned" className={`mt-2 ${INPUT_CLASS}`} value={form.bannedPatterns} onChange={set("bannedPatterns")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-context">
              Project context the assistant must know
            </label>
            <textarea
              id="cap-context"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.contextNotes}
              onChange={set("contextNotes")}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated system prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.tokens.low)}–${NUM.format(result.tokens.high)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `tokens · ${NUM.format(result.tokens.chars)} characters · ${result.completeness}% of the recommended fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated system prompt"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sections in the prompt", failed ? DASH : NUM.format(result.sections.length)],
            ["Review checks included", failed ? DASH : NUM.format(form.reviewFocus.length)],
            ["Hard rules included", failed ? DASH : NUM.format(form.refusals.length)],
            ["Warnings", failed ? DASH : NUM.format(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Gaps worth closing</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your system prompt</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts are estimates from the 4-characters-per-token rule of thumb for prose and 3.2
        for code-heavy text; your provider&apos;s tokeniser is the authority. Nothing is sent
        anywhere — the prompt is assembled in your browser.
      </p>
    </main>
  );
}
