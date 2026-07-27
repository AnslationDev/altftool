"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Notebook, RotateCcw } from "lucide-react";
import { ACTIONS, OUTPUT_FORMATS, PROPERTY_TYPES, SCOPES, buildNotionPrompt } from "../lib";

const DEFAULTS = {
  scope: "database",
  action: "summarize",
  subject: "each customer interview transcript in this database",
  outputFormat: "sentences",
  targetWords: "45",
  propertyName: "AI Summary",
  propertyType: "Text",
  allowedValues: "",
  rowCount: "240",
  aiPropertyCount: "2",
  language: "",
  audience: "the product team scanning the table on a Monday",
  mustInclude: "the customer's job title and the single biggest complaint",
  mustAvoid: "quotes longer than one sentence",
};

const FORMAT_LABELS = {
  "one-line": "One line of plain text",
  sentences: "Two or three sentences",
  bullets: "Bulleted list",
  todo: "To-do checkboxes",
  table: "Markdown table",
  "select-value": "One value from a fixed list",
  headings: "Headings with paragraphs",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildNotionPrompt({
        scope: form.scope,
        action: form.action,
        subject: form.subject,
        outputFormat: form.outputFormat,
        targetWords: form.targetWords === "" ? 0 : Number(form.targetWords),
        propertyName: form.propertyName,
        propertyType: form.propertyType,
        allowedValues: form.allowedValues,
        rowCount: form.rowCount === "" ? 0 : Number(form.rowCount),
        aiPropertyCount: form.aiPropertyCount === "" ? 0 : Number(form.aiPropertyCount),
        language: form.language,
        audience: form.audience,
        mustInclude: form.mustInclude,
        mustAvoid: form.mustAvoid,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const showDatabaseFields = form.scope === "database" || form.scope === "database-view";

  const copyResult = async () => {
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

  const rows = [
    ["Estimated output length", failed ? DASH : `${result.estimatedChars} characters`],
    ["Notion property limit", failed ? DASH : `2,000 characters (${result.fitsProperty ? "fits" : "over"})`],
    ["Longest safe output", failed ? DASH : `${result.maxWordsForProperty} words`],
    ["Generations in one run", failed || result.runs === null ? DASH : result.runs.toLocaleString("en-US")],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Notebook className="h-4 w-4" aria-hidden="true" />
          Platform prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Notion AI Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prompts written for where they actually run — a page, a selection, or a database property
          where every row has to come out the same shape and fit inside 2,000 characters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="na-scope">Where it runs</label>
            <select id="na-scope" className={`mt-2 ${INPUT}`} value={form.scope} onChange={set("scope")}>
              {Object.entries(SCOPES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="na-action">Action</label>
            <select id="na-action" className={`mt-2 ${INPUT}`} value={form.action} onChange={set("action")}>
              {Object.entries(ACTIONS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="na-subject">What the content is</label>
            <input id="na-subject" className={`mt-2 ${INPUT}`} value={form.subject} onChange={set("subject")} />
            <p className={HINT}>For a database, phrase it per row: &quot;each customer interview&quot;.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="na-format">Output format</label>
            <select id="na-format" className={`mt-2 ${INPUT}`} value={form.outputFormat} onChange={set("outputFormat")}>
              {Object.keys(OUTPUT_FORMATS).map((key) => (
                <option key={key} value={key}>{FORMAT_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="na-words">Target length (words)</label>
            <input id="na-words" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="5" max="2000" value={form.targetWords} onChange={set("targetWords")} />
          </div>

          {showDatabaseFields && (
            <>
              <div>
                <label className={LABEL} htmlFor="na-prop">Property it writes into</label>
                <input id="na-prop" className={`mt-2 ${INPUT}`} value={form.propertyName} onChange={set("propertyName")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="na-proptype">Property type</label>
                <select id="na-proptype" className={`mt-2 ${INPUT}`} value={form.propertyType} onChange={set("propertyType")}>
                  {PROPERTY_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="na-allowed">Allowed values (Select, Status, Multi-select)</label>
                <input id="na-allowed" className={`mt-2 ${INPUT}`} value={form.allowedValues} onChange={set("allowedValues")} placeholder="Billing, Bug, Feature request, Account" />
              </div>
              <div>
                <label className={LABEL} htmlFor="na-rows">Rows in the view</label>
                <input id="na-rows" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="0" max="100000" value={form.rowCount} onChange={set("rowCount")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="na-aiprops">AI properties per row</label>
                <input id="na-aiprops" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="0" max="50" value={form.aiPropertyCount} onChange={set("aiPropertyCount")} />
              </div>
            </>
          )}

          <div>
            <label className={LABEL} htmlFor="na-language">Output language (optional)</label>
            <input id="na-language" className={`mt-2 ${INPUT}`} value={form.language} onChange={set("language")} placeholder="Spanish" />
          </div>
          <div>
            <label className={LABEL} htmlFor="na-audience">Audience</label>
            <input id="na-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={set("audience")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="na-include">Always include</label>
            <textarea id="na-include" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.mustInclude} onChange={set("mustInclude")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="na-avoid">Never include</label>
            <textarea id="na-avoid" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.mustAvoid} onChange={set("mustAvoid")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated output per run
            </p>
            <p className={`mt-1 text-4xl font-semibold ${failed || result.fitsProperty ? "text-[var(--primary)]" : "text-[var(--danger)]"}`}>
              {failed ? DASH : `${result.estimatedChars} chars`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to generate your prompt."
                : result.fitsProperty
                  ? `Inside Notion's 2,000-character property limit, ${result.headroom.toLocaleString("en-US")} spare.`
                  : `Over the 2,000-character limit — keep it under ${result.maxWordsForProperty} words or it will be truncated.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the Notion AI prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && result.largeRun && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.runs.toLocaleString("en-US")} generations in one run — test on a filtered view of
            10 rows first.
          </p>
        )}

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
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character estimates use six characters per word and are approximate. Notion&apos;s available
        AI actions and plan limits change over time — check your workspace before running a large
        autofill, and never point one at a database containing information you would not share.
      </p>
    </main>
  );
}
