"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Flame, Languages, RotateCcw, Search } from "lucide-react";
import {
  LANGUAGE,
  SCRIPT,
  WORDS,
  addDays,
  searchWords,
  updateStreak,
  upcomingWords,
  wordForDate,
  wordToText,
} from "../lib";

/**
 * Fixed date used for the very first render so the server and the browser agree.
 * An effect swaps it for the visitor's own local date immediately after mount.
 */
const FALLBACK_DATE = "2026-01-01";
const STORAGE_KEY = "altft-wotd-sa";
const PREVIEW_DAYS = 7;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN");

/** Today's date in the visitor's own timezone, as YYYY-MM-DD. */
function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const EMPTY_STREAK = { currentStreak: 0, longestStreak: 0, lastStudiedISO: null };

export default function ToolHome() {
  const [date, setDate] = useState(FALLBACK_DATE);
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [streak, setStreak] = useState(EMPTY_STREAK);
  const [streakMessage, setStreakMessage] = useState("");
  const [streakError, setStreakError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDate(localToday());
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        setStreak({
          currentStreak: Number(saved.currentStreak) || 0,
          longestStreak: Number(saved.longestStreak) || 0,
          lastStudiedISO: typeof saved.lastStudiedISO === "string" ? saved.lastStudiedISO : null,
        });
      }
    } catch {
      setStreak(EMPTY_STREAK);
    }
  }, []);

  const entry = useMemo(() => wordForDate(date), [date]);
  const preview = useMemo(() => upcomingWords(date, PREVIEW_DAYS), [date]);
  const results = useMemo(() => searchWords(query), [query]);

  const cardText = useMemo(() => (entry.error ? "" : wordToText(entry)), [entry]);

  const copyResult = async () => {
    if (!cardText) return;
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const persist = (next) => {
    setStreak(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable (private mode) — the streak simply will not persist
    }
  };

  const markStudied = () => {
    const next = updateStreak({
      lastStudiedISO: streak.lastStudiedISO,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      todayISO: date,
    });
    if (next.error) {
      setStreakError(next.error);
      setStreakMessage("");
      return;
    }
    setStreakError("");
    setStreakMessage(next.message);
    persist({
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastStudiedISO: next.lastStudiedISO,
    });
  };

  const clearStreak = () => {
    setStreakError("");
    setStreakMessage("Streak cleared.");
    persist(EMPTY_STREAK);
  };

  const shiftDay = (delta) => {
    const next = addDays(date, delta);
    if (next) setDate(next);
    setCopied(false);
  };

  const reset = () => {
    setDate(localToday());
    setQuery("");
    setShowList(false);
    setCopied(false);
    setStreakError("");
    setStreakMessage("");
  };

  const word = entry.error ? null : entry.word;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          {LANGUAGE} vocabulary
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sanskrit Word of the Day</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One word a day from a curated deck of {NUM.format(WORDS.length)}, each with its {SCRIPT}
          {" "}spelling, romanisation, meaning and a full example sentence. The word is fixed by the
          date, so everyone studying on the same day sees the same word.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wotd-date">
              Date
            </label>
            <input
              id="wotd-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wotd-search">
              Search the deck
            </label>
            <input
              id="wotd-search"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={query}
              placeholder="Search by word, romanisation or meaning"
              onChange={(event) => {
                setQuery(event.target.value);
                setShowList(true);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => shiftDay(-1)} aria-label="Show the previous day's word" className={GHOST_BTN}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous day
          </button>
          <button type="button" onClick={() => shiftDay(1)} aria-label="Show the next day's word" className={GHOST_BTN}>
            Next day
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={reset} aria-label="Go back to today" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Today
          </button>
        </div>
      </section>

      {entry.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {entry.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Word of the day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">—</p>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Word of the day · card {NUM.format(entry.dayNumber)} of {NUM.format(entry.total)}
              </p>
              <p
                className="mt-2 break-words text-4xl font-semibold leading-tight text-[var(--primary)] sm:text-5xl"
                lang="sa"
                dir="ltr"
              >
                {word.w}
              </p>
              <p className="mt-2 text-lg font-medium">{word.r}</p>
            </div>
            <button type="button" onClick={copyResult} aria-label="Copy today's word card" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy card"}
            </button>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">Part of speech</dt>
              <dd className="font-medium">{word.pos}</dd>
            </div>
            <div className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">Meaning</dt>
              <dd className="font-medium">{word.m}</dd>
            </div>
            <div className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">Note</dt>
              <dd className="font-medium">{word.note}</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In a sentence
            </p>
            <p className="mt-2 text-lg leading-8" lang="sa" dir="ltr">
              {word.ex}
            </p>
            <p className="mt-1 text-sm italic text-[var(--muted-foreground)]">{word.exr}</p>
            <p className="mt-1 text-sm">{word.exm}</p>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current streak
            </p>
            <p className="mt-1 flex items-center gap-2 text-4xl font-semibold text-[var(--primary)]">
              <Flame className="h-7 w-7" aria-hidden="true" />
              {NUM.format(streak.currentStreak)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Longest streak {NUM.format(streak.longestStreak)} · last marked{" "}
              {streak.lastStudiedISO || "never"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markStudied}
              aria-label="Mark this date as studied"
              className={PRIMARY_BTN}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Mark studied
            </button>
            <button type="button" onClick={clearStreak} aria-label="Clear the saved streak" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
        {streakError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {streakError}
          </p>
        ) : null}
        {!streakError && streakMessage ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]" aria-live="polite">
            {streakMessage}
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The streak is stored only in this browser. Clearing site data or switching device starts
          it again.
        </p>
      </section>

      {preview.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The next {PREVIEW_DAYS} days</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Word</th>
                  <th scope="col" className="py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {preview.list.map((item) => (
                  <tr key={item.date} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 text-[var(--muted-foreground)]">{item.date}</td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold" lang="sa" dir="ltr">
                        {item.word.w}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{item.word.r}</span>
                    </td>
                    <td className="py-2">{item.word.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Search className="h-4 w-4" aria-hidden="true" />
            Whole deck ({NUM.format(results.length)} shown)
          </h2>
          <button
            type="button"
            onClick={() => setShowList((value) => !value)}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            aria-expanded={showList}
          >
            {showList ? "Hide" : "Show"}
          </button>
        </div>
        {showList &&
          (results.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Nothing in the deck matches “{query}”.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Word</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Meaning</th>
                    <th scope="col" className="py-2 font-semibold">Part of speech</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ word: item, index }) => (
                    <tr key={item.w + index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{NUM.format(index + 1)}</td>
                      <td className="py-2 pr-3">
                        <span className="font-semibold" lang="sa" dir="ltr">
                          {item.w}
                        </span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{item.r}</span>
                      </td>
                      <td className="py-2 pr-3">{item.m}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{item.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Romanisation is a reading aid, not a standard transliteration scheme — pronunciation varies
        by region and speaker. Meanings give the core sense; a good dictionary will show the fuller
        range of usage.
      </p>
    </main>
  );
}
