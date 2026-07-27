"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenLine, RotateCcw } from "lucide-react";

import {
  buildEditorPrompt,
  DEFAULT_TOKEN_BUDGET,
  EDIT_LEVELS,
  ENGLISH_VARIANTS,
  HARD_RULES,
  STYLE_GUIDES,
  TRACKING_MODES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const RULE_LABELS = {
  preserveVoice: "Preserve the author's voice",
  noFactChanges: "Never change facts — query them",
  preserveQuotes: "Never edit quoted material",
  queryDontGuess: "Query ambiguity, don't guess",
  noRewrites: "No wholesale rewrites",
  keepLength: "Stay within ~5% of word count",
};

const DEFAULTS = {
  contentType: "technical blog posts and product documentation",
  audience: "software developers and technical decision-makers",
  terminology: "back end (noun), backend (adjective); JavaScript not Javascript",
  houseNotes: "",
  styleGuide: "chicago",
  englishVariant: "us",
  editLevel: "copyedit",
  tracking: "changeLog",
  hardRules: ["preserveVoice", "noFactChanges", "preserveQuotes", "queryDontGuess"],
  tokenBudget: String(DEFAULT_TOKEN_BUDGET),
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
    () => buildEditorPrompt({ ...form, tokenBudget: Number(form.tokenBudget) }),
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
          <PenLine className="h-4 w-4" aria-hidden="true" />
          System prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Editor System Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Configure a copy-editor persona with a real style guide, a defined depth of edit
          (proofread, copyedit or line edit) and change-tracking rules, so every AI edit is visible
          and reversible.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the editor works on</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-content">
              Content type (required)
            </label>
            <input id="ed-content" className={`mt-2 ${INPUT_CLASS}`} value={form.contentType} onChange={set("contentType")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-audience">
              Audience
            </label>
            <input id="ed-audience" className={`mt-2 ${INPUT_CLASS}`} value={form.audience} onChange={set("audience")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-style">
              Style guide
            </label>
            <select id="ed-style" className={`mt-2 ${INPUT_CLASS}`} value={form.styleGuide} onChange={set("styleGuide")}>
              {Object.entries(STYLE_GUIDES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-variant">
              English variant
            </label>
            <select id="ed-variant" className={`mt-2 ${INPUT_CLASS}`} value={form.englishVariant} onChange={set("englishVariant")}>
              {Object.entries(ENGLISH_VARIANTS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-level">
              Depth of edit
            </label>
            <select id="ed-level" className={`mt-2 ${INPUT_CLASS}`} value={form.editLevel} onChange={set("editLevel")}>
              {Object.entries(EDIT_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-tracking">
              Change tracking
            </label>
            <select id="ed-tracking" className={`mt-2 ${INPUT_CLASS}`} value={form.tracking} onChange={set("tracking")}>
              {Object.entries(TRACKING_MODES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ed-terms">
              Terminology to enforce (optional)
            </label>
            <input
              id="ed-terms"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.terminology}
              onChange={set("terminology")}
              placeholder="e.g. sign in (verb), sign-in (noun); email not e-mail"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ed-house">
              House style notes {form.styleGuide === "house" ? "(required)" : "(optional)"}
            </label>
            <textarea
              id="ed-house"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.houseNotes}
              onChange={set("houseNotes")}
              placeholder="e.g. Sentence case for all headings. Contractions welcome. No em dashes."
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-budget">
              Token budget for the system prompt
            </label>
            <input
              id="ed-budget"
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

        <p className={`mt-4 ${LABEL_CLASS}`} id="ed-rules-label">
          Hard rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="ed-rules-label">
          {Object.keys(HARD_RULES).map((key) => (
            <label key={key} htmlFor={`ed-rule-${key}`} className={CHECK_CLASS}>
              <input
                id={`ed-rule-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.hardRules.includes(key)}
                onChange={toggle("hardRules", key)}
              />
              {RULE_LABELS[key]}
            </label>
          ))}
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
              Estimated prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `~${NUM.format(result.tokens.tokens)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `tokens · ${NUM.format(result.tokens.chars)} characters · ${result.completeness}% of recommended fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated editor system prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Hard rules included", failed ? DASH : NUM.format(form.hardRules.length)],
            ["Depth of edit", failed ? DASH : EDIT_LEVELS[result.levelKey].label],
            ["Change tracking", failed ? DASH : TRACKING_MODES[result.trackingKey].label],
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
        Token counts use the rough 4-characters-per-token rule; your provider&apos;s tokeniser is
        the authority. The prompt is assembled entirely in your browser.
      </p>
    </main>
  );
}
