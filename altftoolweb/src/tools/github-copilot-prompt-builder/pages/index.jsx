"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquareCode, RotateCcw } from "lucide-react";

import { LANGUAGES, MODES, buildCopilotPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  task: "Parse a CSV line into an array of fields, handling quoted fields with embedded commas",
  languageId: "javascript",
  functionName: "parseCsvLine",
  inputs: "one line of CSV text",
  outputs: "an array of field strings",
  constraints: "no external libraries\nhandle double quotes escaped by doubling",
  example: 'parseCsvLine(\'a,"b,c",d\') -> ["a", "b,c", "d"]',
  mode: "inline",
};

export default function ToolHome() {
  const [task, setTask] = useState(DEFAULTS.task);
  const [languageId, setLanguageId] = useState(DEFAULTS.languageId);
  const [functionName, setFunctionName] = useState(DEFAULTS.functionName);
  const [inputs, setInputs] = useState(DEFAULTS.inputs);
  const [outputs, setOutputs] = useState(DEFAULTS.outputs);
  const [constraints, setConstraints] = useState(DEFAULTS.constraints);
  const [example, setExample] = useState(DEFAULTS.example);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCopilotPrompt({
        task,
        languageId,
        functionName,
        inputs,
        outputs,
        constraints,
        example,
        mode,
      }),
    [task, languageId, functionName, inputs, outputs, constraints, example, mode],
  );

  const hasError = Boolean(result.error);

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTask(DEFAULTS.task);
    setLanguageId(DEFAULTS.languageId);
    setFunctionName(DEFAULTS.functionName);
    setInputs(DEFAULTS.inputs);
    setOutputs(DEFAULTS.outputs);
    setConstraints(DEFAULTS.constraints);
    setExample(DEFAULTS.example);
    setMode(DEFAULTS.mode);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquareCode className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GitHub Copilot Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Structure a coding task the way GitHub's own guidance recommends — goal, inputs, output,
          constraints, then a concrete example — rendered as a comment block in your language's
          syntax, ready to paste above your cursor.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cp-task">
              The task (one task only)
            </label>
            <textarea
              id="cp-task"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={task}
              onChange={(event) => setTask(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-lang">
              Language
            </label>
            <select
              id="cp-lang"
              className={`mt-2 ${INPUT_CLASS}`}
              value={languageId}
              onChange={(event) => setLanguageId(event.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-name">
              Function name (optional)
            </label>
            <input
              id="cp-name"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={functionName}
              onChange={(event) => setFunctionName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-in">
              Inputs (optional)
            </label>
            <input
              id="cp-in"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={inputs}
              onChange={(event) => setInputs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-out">
              Output / return value (optional)
            </label>
            <input
              id="cp-out"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={outputs}
              onChange={(event) => setOutputs(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cp-constraints">
              Constraints — one per line (optional)
            </label>
            <textarea
              id="cp-constraints"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              placeholder={"no external libraries\nthrow on invalid input"}
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cp-example">
              Example input → output (optional, strongly recommended)
            </label>
            <textarea
              id="cp-example"
              className={`mt-2 ${AREA_CLASS} font-mono`}
              rows={2}
              spellCheck={false}
              value={example}
              onChange={(event) => setExample(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cp-mode">
              Prompt style
            </label>
            <select
              id="cp-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
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
              Copilot-ready prompt
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.lineCount} lines · ${result.charCount} characters · ${result.language.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated Copilot prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <pre className="font-mono text-sm leading-6 text-[var(--primary)]">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-xs leading-5">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why this shape works</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Goal first", "Copilot reads top-down; the opening sentence sets the frame for everything after it."],
            ["Inputs and output stated", "Unstated types and return shapes are where completions drift most."],
            ["One constraint per line", "Short single-purpose lines beat one long paragraph of requirements."],
            ["A concrete example", "GitHub's guidance ranks an input → output pair as the strongest steering signal."],
            ["Signature stub last", "Inline Copilot completes from your cursor — a named stub anchors the completion."],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="shrink-0 font-semibold">{label}</dt>
              <dd className="text-[var(--muted-foreground)] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Copilot also reads your open editor tabs and the current file — keep related code visible.
        This builder only structures your prompt text; results still depend on the model and your
        codebase context.
      </p>
    </main>
  );
}
