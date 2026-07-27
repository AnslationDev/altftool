"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenTool, RotateCcw } from "lucide-react";

import {
  FACT_LEVELS,
  LENGTHS,
  MAX_SLIDER,
  PRIVACY_LEVELS,
  TASKS,
  VOLUMES,
  pickWritingModel,
  resultToText,
} from "../lib";

const ONE_DP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  task: "draft",
  length: "medium",
  factLevel: "some",
  privacy: "internal",
  volume: "daily",
  voiceImportance: "2",
  costSensitivity: "1",
  multilingual: false,
};

const SLIDER_LABELS = ["Not a factor", "Mildly important", "Important", "Decisive"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      pickWritingModel({
        ...form,
        voiceImportance: Number(form.voiceImportance),
        costSensitivity: Number(form.costSensitivity),
      }),
    [form]
  );

  const hasError = Boolean(result.error);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const clipboardText = useMemo(() => (hasError ? "" : resultToText(result)), [hasError, result]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const breakdown = hasError
    ? [
        ["Best fit", DASH],
        ["Runner-up", DASH],
        ["Margin", DASH],
        ["Plays to", DASH],
        ["Watch out for", DASH],
      ]
    : [
        ["Best fit", `${result.top.name} · ${ONE_DP.format(result.top.score)}/100`],
        [
          "Runner-up",
          result.runnerUp
            ? `${result.runnerUp.name} · ${ONE_DP.format(result.runnerUp.score)}/100`
            : "None — everything else was ruled out",
        ],
        ["Margin", result.margin === null ? DASH : `${ONE_DP.format(result.margin)} points`],
        [
          "Plays to",
          result.top.strengths.length > 0 ? result.top.strengths.join(", ") : "No standout strength",
        ],
        [
          "Watch out for",
          result.top.weaknesses.length > 0 ? result.top.weaknesses.join(", ") : "No major gap",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PenTool className="h-4 w-4" aria-hidden="true" />
          Model selection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Writing Model Picker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Say what you write, how long it runs, how much it depends on checkable facts and what your
          confidentiality rules allow — and get a ranked, explained comparison of drafting, grounded,
          self-hosted, local and pure-editing options.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wmp-task">
              What do you mostly need?
            </label>
            <select
              id="wmp-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.task}
              onChange={(event) => setField("task", event.target.value)}
            >
              {TASKS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-length">
              Typical length
            </label>
            <select
              id="wmp-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.length}
              onChange={(event) => setField("length", event.target.value)}
            >
              {LENGTHS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-facts">
              How fact-dependent is it?
            </label>
            <select
              id="wmp-facts"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.factLevel}
              onChange={(event) => setField("factLevel", event.target.value)}
            >
              {FACT_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-privacy">
              Confidentiality
            </label>
            <select
              id="wmp-privacy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.privacy}
              onChange={(event) => setField("privacy", event.target.value)}
            >
              {PRIVACY_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-volume">
              How much do you publish?
            </label>
            <select
              id="wmp-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.volume}
              onChange={(event) => setField("volume", event.target.value)}
            >
              {VOLUMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-voice">
              Matching a specific voice
            </label>
            <input
              id="wmp-voice"
              className="mt-4 h-3 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max={MAX_SLIDER}
              step="1"
              value={form.voiceImportance}
              onChange={(event) => setField("voiceImportance", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {SLIDER_LABELS[Number(form.voiceImportance)] ?? ""}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wmp-cost">
              Running cost
            </label>
            <input
              id="wmp-cost"
              className="mt-4 h-3 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max={MAX_SLIDER}
              step="1"
              value={form.costSensitivity}
              onChange={(event) => setField("costSensitivity", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {SLIDER_LABELS[Number(form.costSensitivity)] ?? ""}
            </p>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="wmp-multilingual"
        >
          <input
            id="wmp-multilingual"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={form.multilingual}
            onChange={(event) => setField("multilingual", event.target.checked)}
          />
          <span>I work in more than one language</span>
        </label>
      </section>

      {hasError && (
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
              Best fit score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${ONE_DP.format(result.top.score)}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs to see a ranking" : result.top.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommendation"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {result.top.summary} Examples: {result.top.examples}.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.close && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            The top two are within {ONE_DP.format(result.margin)} points — trial both on one real
            piece before you commit.
          </p>
        )}

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full ranking</h2>
          <ul className="mt-4 space-y-4">
            {result.ranked.map((option, index) => (
              <li key={option.id}>
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-sm font-bold text-[var(--muted-foreground)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold">{option.name}</span>
                  <span className="shrink-0 text-sm font-semibold">
                    {ONE_DP.format(option.score)}
                  </span>
                </div>
                <div className="ml-9 mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${option.score}%` }}
                  />
                </div>
                <p className="ml-9 mt-1 text-xs text-[var(--muted-foreground)]">{option.examples}</p>
              </li>
            ))}
          </ul>

          {result.disqualified.length > 0 && (
            <div className="mt-5 rounded-md bg-[var(--muted)] p-3">
              <h3 className="text-sm font-semibold">Ruled out by your constraints</h3>
              <ul className="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
                {result.disqualified.map((option) => (
                  <li key={option.id}>
                    <span className="font-semibold text-[var(--foreground)]">{option.name}</span>:{" "}
                    {option.reasons.join("; ")}.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How the score was built</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Weight is how much your answers said each criterion matters (0-3); rating is how the
            winning option scores on it (0-5).
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Criterion</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rating</th>
                  <th scope="col" className="py-2 text-right font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {result.top.contributions.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.weight}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.rating}
                    </td>
                    <td className="py-2 text-right font-semibold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ratings describe structural properties — whether an option can draft at all, whether it looks
        facts up at answer time, whether weights are yours, whether it runs offline — not benchmark
        results. Anything published under your name still needs a human edit and a fact check.
      </p>
    </main>
  );
}
