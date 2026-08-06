"use client";

import { useMemo, useState } from "react";
import { Check, Copy, BookOpen, RotateCcw, Search } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { CATEGORIES, PROMPTS, fillPrompt, getPrompt, searchPrompts } from "../lib";

const PACK = {
  kicker: "Study prompts",
  title: "Student Prompt Pack",
  intro:
    "Pick a study task, fill in the blanks, and copy a prompt built to make you understand the material — these ask the model to quiz, explain and critique, not to do the work for you.",
};

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

const exampleValues = (prompt) =>
  prompt ? Object.fromEntries(prompt.variables.map((v) => [v.key, v.placeholder])) : {};

const FIRST = PROMPTS[0];

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState(FIRST.id);
  const [values, setValues] = useState(() => exampleValues(FIRST));
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();
  const copied = isCopied("prompt");

  const results = useMemo(() => searchPrompts({ query, category }), [query, category]);
  const active = useMemo(() => getPrompt(activeId), [activeId]);
  const filled = useMemo(
    () => fillPrompt({ template: active ? active.template : "", values }),
    [active, values],
  );

  const hasTypedValues = (candidate) =>
    Object.entries(candidate || {}).some(([key, value]) => {
      const example = active ? exampleValues(active)[key] : undefined;
      return String(value ?? "").trim() !== "" && value !== example;
    });

  const selectPrompt = (prompt) => {
    if (hasTypedValues(values)) {
      const message =
        activeId === prompt.id
          ? "Reset this prompt's fields to the example values? This will discard what you've filled in."
          : "Switch prompts? This will discard what you've filled in for the current one.";
      if (!window.confirm(message)) return;
    }
    setActiveId(prompt.id);
    setValues(exampleValues(prompt));
    resetCopyState();
  };

  const updateValue = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    resetCopyState();
  };

  const clearFields = () => {
    if (!active) return;
    if (hasTypedValues(values) && !window.confirm("Clear all fields for this prompt? This cannot be undone.")) {
      return;
    }
    setValues(Object.fromEntries(active.variables.map((v) => [v.key, ""])));
    resetCopyState();
  };

  const reset = () => {
    if (!window.confirm("Reset the pack? This will discard everything you've filled in and return to the first prompt.")) {
      return;
    }
    setQuery("");
    setCategory("All");
    setActiveId(FIRST.id);
    setValues(exampleValues(FIRST));
    resetCopyState();
  };

  const copyResult = async () => {
    if (filled.error) return;
    await copy("prompt", filled.text, { label: "finished prompt" });
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {PACK.kicker}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{PACK.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{PACK.intro}</p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prompt-search">
              Search prompts
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="prompt-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="revision, essay, flashcards"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prompt-category">
              Category
            </label>
            <select
              id="prompt-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {NUM.format(results.length)} of {NUM.format(PROMPTS.length)} prompts
        </p>

        {results.length === 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            No prompt matches that search. Try a shorter word or switch the category back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map((prompt) => {
              const isActive = prompt.id === activeId;
              return (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    aria-pressed={isActive}
                    className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {prompt.category}
                    </span>
                    <span className="text-sm font-semibold">{prompt.title}</span>
                    <span className="text-xs leading-5 text-[var(--muted-foreground)]">{prompt.goal}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fill in the blanks</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{active.tip}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.variables.map((variable) => (
              <div
                key={variable.key}
                className={variable.type === "textarea" ? "sm:col-span-2" : undefined}
              >
                <label className={LABEL_CLASS} htmlFor={`var-${variable.key}`}>
                  {variable.label}
                </label>
                {variable.type === "textarea" ? (
                  <textarea
                    id={`var-${variable.key}`}
                    rows={4}
                    className={`mt-2 ${TEXTAREA_CLASS}`}
                    placeholder={variable.placeholder}
                    value={values[variable.key] ?? ""}
                    onChange={(event) => updateValue(variable.key, event.target.value)}
                  />
                ) : (
                  <input
                    id={`var-${variable.key}`}
                    type="text"
                    className={`mt-2 ${INPUT_CLASS}`}
                    placeholder={variable.placeholder}
                    value={values[variable.key] ?? ""}
                    onChange={(event) => updateValue(variable.key, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={clearFields} className={GHOST_BTN}>
              Clear fields
            </button>
            <button type="button" onClick={() => selectPrompt(active)} className={GHOST_BTN}>
              Use example values
            </button>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {filled.error ? dash : `${NUM.format(filled.estimatedTokens)} tokens`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {filled.error
                ? "Select a prompt to build your text."
                : `${NUM.format(filled.filledCount)} of ${NUM.format(filled.totalCount)} blanks filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied the finished prompt to the clipboard" : "Copy the finished prompt to the clipboard"}
              className={GHOST_BTN}
              disabled={Boolean(filled.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the pack" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        {filled.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {filled.error}
          </p>
        ) : (
          <>
            {filled.missing.length > 0 && (
              <p
                role="status"
                className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
              >
                Still blank: {filled.missing.join(", ")}. They stay visible as {"{{placeholders}}"} in the copied text.
              </p>
            )}

            <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <pre className="whitespace-pre-wrap break-words font-[var(--font-mono)] text-sm leading-6 text-[var(--foreground)]">
                {filled.text}
              </pre>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Prompt", active ? active.title : dash],
                ["Category", active ? active.category : dash],
                ["Blanks filled", `${NUM.format(filled.filledCount)} / ${NUM.format(filled.totalCount)}`],
                ["Words", NUM.format(filled.words)],
                ["Characters", NUM.format(filled.characters)],
                ["Estimated tokens", NUM.format(filled.estimatedTokens)],
                ["Context window fit", filled.isLong ? "Long — check small-context models" : "Comfortable in an 8K window"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts are an estimate based on roughly four characters per token in English; the exact
        count depends on the model tokenizer. Everything runs in your browser — nothing you type is sent anywhere.
      </p>
    </main>
  );
}
