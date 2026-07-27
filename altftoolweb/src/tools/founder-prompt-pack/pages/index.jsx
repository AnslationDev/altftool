"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Rocket, RotateCcw } from "lucide-react";

import {
  CONTEXT_FIELDS,
  FOUNDER_PROMPTS,
  PROMPT_CATEGORIES,
  buildPack,
  buildPrompt,
  filterPrompts,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_VALUES = {
  company: "Northwind Labs",
  product: "an inventory forecasting app for small retailers",
  audience: "operations managers at 5-50 store retail chains",
  stage: "Seed",
  context: "Revenue grew 18% month on month but logo churn doubled last quarter.",
};

const DASH = "—";

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [promptId, setPromptId] = useState(FOUNDER_PROMPTS[0].id);
  const [copied, setCopied] = useState("");

  const visible = useMemo(() => filterPrompts({ category, query }), [category, query]);
  const result = useMemo(() => buildPrompt({ promptId, values }), [promptId, values]);
  const pack = useMemo(() => buildPack({ values, category }), [values, category]);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const copy = async (label, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setValues(DEFAULT_VALUES);
    setCategory("All");
    setQuery("");
    setPromptId(FOUNDER_PROMPTS[0].id);
    setCopied("");
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Founder prompts
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Founder Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your company context once. Every prompt in the pack fills itself in, so you paste a
          brief that already knows your product, customer and stage instead of a generic template.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your context</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CONTEXT_FIELDS.map((field) => (
            <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
              <label className={LABEL_CLASS} htmlFor={`fpp-${field.key}`}>
                {field.label}
                {field.required ? "" : " (optional)"}
              </label>
              {field.type === "select" ? (
                <select
                  id={`fpp-${field.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={values[field.key] || ""}
                  onChange={(event) => setField(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={`fpp-${field.key}`}
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              ) : (
                <input
                  id={`fpp-${field.key}`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fpp-category">
              Category
            </label>
            <select
              id="fpp-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              {PROMPT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fpp-search">
              Search prompts
            </label>
            <input
              id="fpp-search"
              type="search"
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder="churn, OKR, investor…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <ul className="mt-4 grid gap-2">
          {visible.map((prompt) => {
            const active = prompt.id === promptId;
            return (
              <li key={prompt.id}>
                <button
                  type="button"
                  onClick={() => setPromptId(prompt.id)}
                  aria-pressed={active}
                  className={`flex min-h-11 w-full flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="text-sm font-semibold">{prompt.title}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {prompt.category} · {prompt.useWhen}
                  </span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="rounded-md border border-[var(--border)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
              No prompt matches that search.
            </li>
          )}
        </ul>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(result.words)} words` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.title : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("prompt", ok ? result.text : "")}
              aria-label="Copy the built prompt"
              className={GHOST_BTN}
            >
              {copied === "prompt" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "prompt" ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Category", ok ? result.category : DASH],
            ["Characters", ok ? NUM.format(result.characters) : DASH],
            ["Approximate tokens", ok ? NUM.format(result.approxTokens) : DASH],
            [
              "Unfilled placeholders",
              ok ? (result.missing.length === 0 ? "None" : result.missing.join(", ")) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.missing.length > 0 && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
          >
            Placeholders left blank appear as [name] in the prompt. Fill them above for a
            model-ready brief.
          </p>
        )}

        {ok && (
          <div className="mt-4 overflow-x-auto">
            <pre className="min-w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--foreground)]">
              {result.text}
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Copy the whole pack</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {pack.error
            ? pack.error
            : `${NUM.format(pack.count)} prompts, ${NUM.format(pack.words)} words, filled with your context.`}
        </p>
        <button
          type="button"
          onClick={() => copy("pack", pack.error ? "" : pack.text)}
          aria-label="Copy every prompt in this category"
          className={`mt-3 ${GHOST_BTN}`}
          disabled={Boolean(pack.error)}
        >
          {copied === "pack" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied === "pack" ? "Copied!" : "Copy all prompts"}
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These prompts structure your thinking; they are not legal, tax or investment advice. Check
        any figure a model produces against your own books before sending it to investors.
      </p>
    </main>
  );
}
