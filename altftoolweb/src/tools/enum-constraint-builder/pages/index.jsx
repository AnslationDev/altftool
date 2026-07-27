"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { buildEnumConstraint } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  fieldName: "ticket_status",
  description: "Lifecycle state of a support ticket",
  rawValues: "open, in_progress, waiting_on_customer, closed",
  fallback: "open",
  caseInsensitive: true,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      buildEnumConstraint({
        fieldName: form.fieldName,
        rawValues: form.rawValues,
        caseInsensitive: form.caseInsensitive,
        fallback: form.fallback,
        description: form.description,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyText = hasError
    ? ""
    : [
        "PROMPT RULE:",
        result.prompt,
        "",
        "JSON SCHEMA:",
        result.jsonSchema,
        "",
        "TYPESCRIPT:",
        result.tsUnion,
        "",
        "ZOD:",
        result.zodEnum,
        "",
        "PYDANTIC:",
        result.pydantic,
        "",
        "SQL:",
        result.sqlCheck,
      ].join("\n");

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
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

  const snippets = hasError
    ? []
    : [
        ["JSON Schema", result.jsonSchema],
        ["TypeScript union", result.tsUnion],
        ["Zod", result.zodEnum],
        ["Pydantic / typing.Literal", result.pydantic],
        ["SQL CHECK constraint", result.sqlCheck],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Structured output
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Enum Constraint Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Define the allowed values once and get every artefact that must agree with them: the LLM
          prompt rule, a JSON Schema enum, a TypeScript union, Zod, Pydantic and a SQL CHECK — all
          generated from the same de-duplicated list.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-field">
              Field name
            </label>
            <input
              id="ec-field"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={64}
              value={form.fieldName}
              onChange={set("fieldName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-desc">
              What the field means (optional)
            </label>
            <input
              id="ec-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={200}
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ec-values">
              Allowed values (comma or newline separated)
            </label>
            <textarea
              id="ec-values"
              className="mt-2 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              rows={4}
              value={form.rawValues}
              onChange={set("rawValues")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-fallback">
              Fallback value when unsure (optional)
            </label>
            <input
              id="ec-fallback"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={100}
              placeholder="Must be one of the values"
              value={form.fallback}
              onChange={set("fallback")}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="ec-caseless"
            >
              <input
                id="ec-caseless"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.caseInsensitive}
                onChange={set("caseInsensitive")}
              />
              Collapse values that differ only by case
            </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Allowed values
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.count)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the artefacts."
                : `Distinct members after de-duplication${result.duplicatesRemoved > 0 ? ` (${result.duplicatesRemoved} duplicate${result.duplicatesRemoved === 1 ? "" : "s"} removed)` : ""}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the prompt rule and every schema artefact"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="py-2.5">
            <dt className="text-[var(--muted-foreground)]">Prompt rule</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {hasError ? DASH : result.prompt}
            </dd>
          </div>
          {snippets.map(([label, code]) => (
            <div key={label} className="py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
                <pre className="font-mono text-xs leading-5">{code}</pre>
              </dd>
            </div>
          ))}
          {hasError ? (
            <div className="py-2.5">
              <dt className="text-[var(--muted-foreground)]">Artefacts</dt>
              <dd className="mt-1 font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Consistency warnings</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        JSON Schema enum matching is exact and case-sensitive (draft 2020-12 semantics), which is
        why the prompt rule tells the model to copy values verbatim. Validate model output with the
        schema — the prompt alone is a request, not a guarantee.
      </p>
    </main>
  );
}
