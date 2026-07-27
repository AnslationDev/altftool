"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw } from "lucide-react";

import { MOODS, THEMES, WRITING_PACES, buildJournalSession } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  minutes: "15",
  pace: "hand-steady",
  theme: "day-review",
  mood: "okay",
  variation: "1",
  context: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(() => buildJournalSession(form), [form]);
  const ok = !result.error;

  const copy = async (which) => {
    if (!ok) return;
    const text = which === "session" ? result.sessionSheet : result.aiPrompt;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const rows = [
    ["Words in the session", ok ? NUM.format(result.totalWords) : DASH],
    ["Warm-up", ok ? `about ${NUM.format(result.warmUpWords)} words` : DASH],
    ["Main reflection", ok ? `about ${NUM.format(result.mainWords)} words` : DASH],
    ["Close", ok ? `about ${NUM.format(result.closeWords)} words` : DASH],
    ["Prompts that fit", ok ? `${result.promptCount}` : DASH],
    [
      "Per prompt",
      ok ? `about ${NUM.format(result.wordsPerPrompt)} words, ${NUM.format(result.minutesPerPrompt)} min` : DASH,
    ],
    ["Pace assumed", ok ? `${result.paceLabel} (${result.wpm} wpm)` : DASH],
    ["Mood framing", ok ? result.moodLabel : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Everyday prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Journaling Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Say how long you have and how you are feeling. This works out how many words you can
          realistically write at your pace, splits them into a warm-up, the reflection and a close,
          and gives you exactly the number of prompts that fit — nothing you will abandon halfway.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-minutes">
              Minutes you have
            </label>
            <input
              id="jp-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="180"
              step="1"
              value={form.minutes}
              onChange={set("minutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-pace">
              How you write
            </label>
            <select id="jp-pace" className={`mt-2 ${INPUT_CLASS}`} value={form.pace} onChange={set("pace")}>
              {WRITING_PACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.wpm} wpm)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-theme">
              Theme
            </label>
            <select id="jp-theme" className={`mt-2 ${INPUT_CLASS}`} value={form.theme} onChange={set("theme")}>
              {THEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-mood">
              How you are feeling
            </label>
            <select id="jp-mood" className={`mt-2 ${INPUT_CLASS}`} value={form.mood} onChange={set("mood")}>
              {MOODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-variation">
              Variation (change for a different set)
            </label>
            <input
              id="jp-variation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={form.variation}
              onChange={set("variation")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-context">
              Anything specific on your mind (optional)
            </label>
            <input
              id="jp-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.context}
              onChange={set("context")}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Realistic word budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(result.totalWords)} words` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.promptCount} prompt${result.promptCount === 1 ? "" : "s"} fit in ${NUM.format(result.minutes)} minutes`
                : "Fix the input above to build the session"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("session")}
              disabled={!ok}
              aria-label="Copy the journaling session sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "session" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "session" ? "Copied!" : "Copy session"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your session</h2>
        {ok ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.moodGuard}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.sessionSheet : DASH}
          </pre>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Prompt for generating more</h2>
          <button
            type="button"
            onClick={() => copy("ai")}
            disabled={!ok}
            aria-label="Copy the AI prompt for generating more journaling prompts"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied === "ai" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "ai" ? "Copied!" : "Copy prompt"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.aiPrompt : DASH}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Journaling is a reflective habit, not treatment. If writing keeps taking you somewhere darker
        rather than lighter, or you are having thoughts of harming yourself, stop and speak to a
        doctor, a mental health professional or a crisis line in your country.
      </p>
    </main>
  );
}
