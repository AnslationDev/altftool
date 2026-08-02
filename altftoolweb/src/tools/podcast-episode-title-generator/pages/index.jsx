"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Type } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { LIST_TRUNCATION, SEARCH_TITLE_LIMIT, generateTitles } from "../lib";

const DEFAULTS = {
  keyword: "hiring for taste",
  angle: "what most teams miss",
  claim: "beats hiring for experience",
  guest: "Ana Rivera",
  achievement: "rebuilt a design team in six months",
  audience: "small teams",
  number: "5",
  caseStyle: "sentence",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      generateTitles({
        keyword: form.keyword,
        angle: form.angle,
        claim: form.claim,
        guest: form.guest,
        achievement: form.achievement,
        audience: form.audience,
        number: form.number,
        caseStyle: form.caseStyle,
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const copyTitle = (pattern, title) => {
    copy(pattern, title, { label: "title" });
  };

  const copyAll = () => {
    if (hasError) return;
    const text = result.candidates
      .map((item) => `${item.score}/100 · ${item.chars} chars · ${item.title}`)
      .join("\n");
    copy("all", text, { label: "every generated title" });
  };

  const reset = () => {
    if (!window.confirm("Reset every field? This will discard everything you have typed and cannot be undone.")) {
      return;
    }
    setForm(DEFAULTS);
    resetCopyState();
  };

  const fields = [
    ["keyword", "Topic or keyword", "The words a listener would actually search for."],
    ["angle", "Angle", "Completes “Keyword: …” — the promise of the episode."],
    [
      "claim",
      "Contrarian claim",
      "Completes “Why <keyword> …”. Leave empty if the episode does not argue one.",
    ],
    ["guest", "Guest name", "Used only when the name is itself a draw."],
    ["achievement", "What the guest did", "Completes “How <guest> …”."],
    ["audience", "Audience", "Who the episode is for, e.g. “solo founders”."],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Podcast production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Episode Title Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build titles from eight editorial patterns, then see each one scored on length, where the
          keyword sits and whether it survives the {LIST_TRUNCATION}-character truncation in a phone
          episode list.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, hint]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`title-${key}`}>
                {label}
              </label>
              <input
                id={`title-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form[key]}
                onChange={set(key)}
              />
              <p className={HINT_CLASS}>{hint}</p>
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="title-number">
              Number for a list title
            </label>
            <input
              id="title-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="99"
              step="1"
              value={form.number}
              onChange={set("number")}
            />
            <p className={HINT_CLASS}>Used by the numbered-lessons pattern.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="title-case">
              Capitalisation
            </label>
            <select
              id="title-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.caseStyle}
              onChange={set("caseStyle")}
            >
              <option value="sentence">Sentence case</option>
              <option value="title">Title Case</option>
            </select>
            <p className={HINT_CLASS}>Sentence case reads as less shouty in an app list.</p>
          </div>
        </div>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best scoring title
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? dash : result.best.title}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.best.score}/100 · ${result.best.chars} characters · ${result.summary}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAll}
              aria-label={
                isCopied("all")
                  ? "Copied every generated title with its score"
                  : "Copy every generated title with its score"
              }
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("all") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("all") ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Titles generated", dash],
                ["Fit an episode list", dash],
                ["Search-result limit", dash],
                ["Keyword", dash],
              ]
            : [
                ["Titles generated", `${result.total}`],
                ["Fit an episode list", `${result.withinList} within ${LIST_TRUNCATION} characters`],
                ["Search-result limit", `${SEARCH_TITLE_LIMIT} characters`],
                ["Keyword", result.keyword],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 space-y-3">
          {result.candidates.map((item) => (
            <article
              key={item.pattern}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {item.patternLabel}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.chars} characters · {item.words} words · {item.hint}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl font-semibold ${
                      item.score >= 90
                        ? "text-[var(--success)]"
                        : item.score >= 70
                          ? "text-[var(--foreground)]"
                          : "text-[var(--danger)]"
                    }`}
                  >
                    {item.score}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyTitle(item.pattern, item.title)}
                    aria-label={isCopied(item.pattern) ? `Copied the title ${item.title}` : `Copy the title ${item.title}`}
                    className={GHOST_BTN}
                  >
                    {isCopied(item.pattern) ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isCopied(item.pattern) ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <span
                  aria-hidden="true"
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              {item.notes.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
                  {item.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Scores weigh length, keyword position and platform limits — they are a drafting aid, not a
        ranking prediction. Keep the show name and episode number out of the title field: Apple
        Podcasts stores both in their own tags.
      </p>
    </main>
  );
}
