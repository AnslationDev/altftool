"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  PROVERBS,
  THEMES,
  groupByTheme,
  proverbOfTheDay,
  searchProverbs,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-full border border-[var(--primary)] bg-[var(--muted)] px-3 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const SEED_DATE = "2026-01-01";

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const themeLabel = (id) => THEMES.find((t) => t.id === id)?.label ?? id;

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [dayIso, setDayIso] = useState(SEED_DATE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDayIso(localIsoDate());
  }, []);

  const featured = useMemo(() => proverbOfTheDay(dayIso), [dayIso]);
  const search = useMemo(() => searchProverbs({ query, theme }), [query, theme]);
  const groups = useMemo(() => groupByTheme(), []);

  const summary = useMemo(() => {
    if (featured.error) return "";
    const p = featured.proverb;
    return [
      p.malayalam,
      p.roman,
      `Literal: ${p.literal}`,
      `Meaning: ${p.meaning}`,
      `English equivalent: ${p.english}`,
    ].join("\n");
  }, [featured]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery("");
    setTheme("all");
    setDayIso(localIsoDate());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Malayalam pazhamchollu
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Malayalam Pazhamchollu Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {PROVERBS.length} old Malayalam sayings with the literal image, the working meaning and
          the English proverb that matches.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pazham-search">
              Search proverbs
            </label>
            <input
              id="pazham-search"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="thorn, unity, ആന…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pazham-date">
              Pazhamchollu of the day for
            </label>
            <input
              id="pazham-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dayIso}
              onChange={(event) => setDayIso(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold">Themes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={theme === "all" ? CHIP_ON : CHIP}
            aria-pressed={theme === "all"}
            onClick={() => setTheme("all")}
          >
            All ({PROVERBS.length})
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={theme === group.id ? CHIP_ON : CHIP}
              aria-pressed={theme === group.id}
              onClick={() => setTheme(group.id)}
            >
              {group.label} ({group.proverbs.length})
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Pazhamchollu of the day
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the featured Malayalam proverb with its meaning"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy proverb"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset search, theme and date"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {featured.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {featured.error}
          </p>
        ) : null}

        <p className="mt-3 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
          {featured.error ? DASH : featured.proverb.malayalam}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transliteration", featured.error ? DASH : featured.proverb.roman],
            ["Literal reading", featured.error ? DASH : featured.proverb.literal],
            ["How it is used", featured.error ? DASH : featured.proverb.meaning],
            ["English equivalent", featured.error ? DASH : featured.proverb.english],
            ["Theme", featured.error ? DASH : themeLabel(featured.proverb.theme)],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">
          {search.matched} of {search.total} proverbs
          {search.theme === "all" ? "" : ` in ${themeLabel(search.theme)}`}
        </h2>

        {search.matched === 0 ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted-foreground)]"
          >
            Nothing matched that search. Try one word instead of a phrase, or clear the theme.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {search.results.map((proverb) => (
              <li
                key={proverb.id}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="text-lg font-semibold leading-snug">{proverb.malayalam}</p>
                <p className="mt-1 text-sm italic text-[var(--muted-foreground)]">
                  {proverb.roman}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Literal: </span>
                  {proverb.literal}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{proverb.meaning}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 font-semibold text-[var(--primary)]">
                    {themeLabel(proverb.theme)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    English: {proverb.english}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Proverbs vary by district and by speaker; the wording used here follows the form most often
        printed in Malayalam collections. Transliteration is a pronunciation guide only.
      </p>
    </main>
  );
}
