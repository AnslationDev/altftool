"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Copy, Flame, RotateCcw, Search } from "lucide-react";

import {
  CATEGORIES,
  CYCLE_LENGTH,
  computeStreak,
  filterWords,
  upcomingWords,
  wordForDate,
} from "../lib";

const STORAGE_KEY = "altft-gujarati-wotd-studied";
const PREVIEW_DAYS = 7;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function localTodayIso() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const prettyDate = (iso) => {
  const parts = String(iso).split("-");
  if (parts.length !== 3) return iso;
  const stamp = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (!Number.isFinite(stamp)) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(stamp));
};

export default function ToolHome() {
  const [today] = useState(localTodayIso);
  const [dateIso, setDateIso] = useState(localTodayIso);
  const [studied, setStudied] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setStudied(parsed.filter((item) => typeof item === "string"));
    } catch {
      /* storage unavailable or corrupt — start with an empty history */
    }
  }, []);

  const persist = (next) => {
    setStudied(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private-mode failures */
    }
  };

  const card = useMemo(() => wordForDate(dateIso), [dateIso]);
  const streak = useMemo(
    () => computeStreak({ studiedDates: studied, todayIso: today }),
    [studied, today],
  );
  const preview = useMemo(() => upcomingWords(dateIso, PREVIEW_DAYS), [dateIso]);
  const browse = useMemo(() => filterWords({ category, query }), [category, query]);

  const error = card.error || null;
  const markedForDate = !error && studied.includes(card.date);

  const summary = useMemo(() => {
    if (error) return "";
    return [
      `Gujarati Word of the Day — ${prettyDate(card.date)}`,
      `${card.word} (${card.roman})`,
      `Meaning: ${card.meaning}`,
      `Part of speech: ${card.pos}`,
      `Example: ${card.exampleNative}`,
      `Transliteration: ${card.exampleRoman}`,
      `English: ${card.exampleEnglish}`,
      `Card ${card.dayNumber} of ${card.cycleLength}`,
    ].join("\n");
  }, [card, error]);

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

  const toggleStudied = () => {
    if (error) return;
    const next = markedForDate
      ? studied.filter((item) => item !== card.date)
      : studied.concat(card.date);
    persist(next);
  };

  const reset = () => {
    setDateIso(today);
    setCategory("All");
    setQuery("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Gujarati vocabulary
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gujarati Word of the Day</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A single ગુજરાતી word for every calendar day, with transliteration, meaning and an example
          sentence. The rotation is keyed to the date, so a study group opening the page anywhere in
          the world sees the same word.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gu-date">
              Date
            </label>
            <input
              id="gu-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateIso}
              onChange={(event) => setDateIso(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gu-category">
              Browse by topic
            </label>
            <select
              id="gu-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All topics</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {error ? "Word of the day" : prettyDate(card.date)}
            </p>
            <p className="mt-1 break-words text-4xl font-semibold leading-tight text-[var(--primary)]">
              {error ? DASH : card.word}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${card.roman} · ${card.pos}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy today's Gujarati word card"
              className={GHOST_BTN}
              disabled={Boolean(error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy card"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to today" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Today
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Meaning", error ? DASH : card.meaning],
            ["Topic", error ? DASH : card.category],
            ["Example (Gujarati)", error ? DASH : card.exampleNative],
            ["Example (transliteration)", error ? DASH : card.exampleRoman],
            ["Example (English)", error ? DASH : card.exampleEnglish],
            ["Position in deck", error ? DASH : `Card ${card.dayNumber} of ${card.cycleLength}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:max-w-[62%] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold">
            <Flame className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Revision streak
          </h2>
          <button
            type="button"
            onClick={toggleStudied}
            className={markedForDate ? GHOST_BTN : PRIMARY_BTN}
            aria-pressed={markedForDate}
            disabled={Boolean(error)}
          >
            {markedForDate ? "Marked as revised" : "Mark as revised"}
          </button>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            [
              "Current streak",
              streak.error ? DASH : `${streak.current} day${streak.current === 1 ? "" : "s"}`,
            ],
            [
              "Longest streak",
              streak.error ? DASH : `${streak.longest} day${streak.longest === 1 ? "" : "s"}`,
            ],
            ["Days revised", streak.error ? DASH : String(streak.total)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[var(--border)] px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Marks live only in this browser. A streak survives until you miss a whole day.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Next {PREVIEW_DAYS} days</h2>
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
              {(preview.cards || []).map((entry) => (
                <tr key={entry.date} className="border-b border-[var(--border)] last:border-0">
                  <td className="whitespace-nowrap py-2 pr-3 text-[var(--muted-foreground)]">
                    {prettyDate(entry.date)}
                  </td>
                  <td className="py-2 pr-3 font-semibold">
                    {entry.word}
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                      {entry.roman}
                    </span>
                  </td>
                  <td className="py-2">{entry.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse the full deck</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="gu-search">
          Search script, transliteration or meaning
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          <input
            id="gu-search"
            className={`${INPUT_CLASS} pl-9`}
            type="search"
            value={query}
            placeholder="rain, varsād, વરસાદ"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {browse.length} of {CYCLE_LENGTH} words shown.
        </p>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {browse.map((entry) => (
            <li key={entry.word} className="py-3">
              <p className="text-lg font-semibold">
                {entry.word}{" "}
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  {entry.roman}
                </span>
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">{entry.meaning}</p>
            </li>
          ))}
          {browse.length === 0 ? (
            <li className="py-3 text-sm text-[var(--muted-foreground)]">
              No word in the deck matches that search.
            </li>
          ) : null}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Transliterations use the practical scheme found in Gujarati primers. Saurashtra, Kutch and
        Surat speech differ in places, so a local speaker may pronounce some of these words
        differently.
      </p>
    </main>
  );
}
