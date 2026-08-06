"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MAX_ENTRIES, USE_MODES, buildUsageLog } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ENTRY = {
  part: "Literature review",
  tool: "ChatGPT",
  modeId: "research",
  prompt: "Summarise the main arguments of three journal articles I pasted in",
  date: "",
};

const BLANK_ENTRY = { part: "", tool: "", modeId: "brainstorm", prompt: "", date: "" };

export default function ToolHome() {
  const [studentName, setStudentName] = useState("");
  const [assignment, setAssignment] = useState("Essay: Causes of the 2008 financial crisis");
  const [course, setCourse] = useState("");
  const [format, setFormat] = useState("markdown");
  const [entries, setEntries] = useState([{ ...DEFAULT_ENTRY }]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildUsageLog({ studentName, assignment, course, entries, format }),
    [studentName, assignment, course, entries, format],
  );

  const hasError = Boolean(result.error);

  const updateEntry = (index, field, value) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    setEntries((prev) => (prev.length >= MAX_ENTRIES ? prev : [...prev, { ...BLANK_ENTRY }]));
  };

  const removeEntry = (index) => {
    setEntries((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.log);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the log? This will clear the assignment details and all entries you've added, and cannot be undone.",
      )
    ) {
      return;
    }
    setStudentName("");
    setAssignment("Essay: Causes of the 2008 financial crisis");
    setCourse("");
    setFormat("markdown");
    setEntries([{ ...DEFAULT_ENTRY }]);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Usage Log for Assignments
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record which AI tools helped with which parts of your submission — the part, the tool,
          how the output was used and what you asked — and export a clean declaration log.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="log-assignment">
              Assignment title
            </label>
            <input
              id="log-assignment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="log-student">
              Your name (optional)
            </label>
            <input
              id="log-student"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="log-course">
              Course / unit code (optional)
            </label>
            <input
              id="log-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              placeholder="e.g. ECON2010"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="log-format">
              Output format
            </label>
            <select
              id="log-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="markdown">Markdown</option>
              <option value="plain">Plain text</option>
            </select>
          </div>
        </div>
      </section>

      {entries.map((entry, index) => (
        <section
          key={index}
          className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Entry {index + 1}
            </h2>
            <button
              type="button"
              onClick={() => removeEntry(index)}
              disabled={entries.length <= 1}
              aria-label={`Remove entry ${index + 1}`}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor={`log-part-${index}`}>
                Part of the assignment
              </label>
              <input
                id={`log-part-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={entry.part}
                onChange={(event) => updateEntry(index, "part", event.target.value)}
                placeholder="e.g. Introduction, Figure 2, data cleaning script"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`log-tool-${index}`}>
                AI tool
              </label>
              <input
                id={`log-tool-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={entry.tool}
                onChange={(event) => updateEntry(index, "tool", event.target.value)}
                placeholder="e.g. ChatGPT, Claude, Grammarly"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`log-mode-${index}`}>
                How the output was used
              </label>
              <select
                id={`log-mode-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={entry.modeId}
                onChange={(event) => updateEntry(index, "modeId", event.target.value)}
              >
                {USE_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`log-date-${index}`}>
                Date (optional)
              </label>
              <input
                id={`log-date-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={entry.date}
                onChange={(event) => updateEntry(index, "date", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor={`log-prompt-${index}`}>
                What you asked (optional but recommended)
              </label>
              <input
                id={`log-prompt-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={entry.prompt}
                onChange={(event) => updateEntry(index, "prompt", event.target.value)}
                placeholder="Short summary of the prompt"
              />
            </div>
          </div>
        </section>
      ))}

      <div className="mt-4">
        <button
          type="button"
          onClick={addEntry}
          disabled={entries.length >= MAX_ENTRIES}
          className={`${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another entry
        </button>
      </div>

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
              Recorded uses
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.entryCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the AI usage log"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy log"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the log to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted-foreground)]">Tools used</dt>
            <dd className="mt-0.5 font-semibold">
              {hasError ? DASH : result.toolsUsed.join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Heaviest reliance recorded</dt>
            <dd className="mt-0.5 font-semibold">{hasError ? DASH : result.heaviestUse}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Generated log</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
            {hasError ? DASH : result.log}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always follow your institution's own AI policy — some units prohibit AI use entirely, and a
        log does not make prohibited use acceptable. When in doubt, ask the unit coordinator before
        submitting.
      </p>
    </main>
  );
}
