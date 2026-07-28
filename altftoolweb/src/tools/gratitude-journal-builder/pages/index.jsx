"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  ITEMS_PER_ENTRY,
  buildEntry,
  computeStreaks,
  monthlyReview,
  promptForDate,
} from "../lib";

const DASH = "—";
const EMPTY_ITEMS = ["", "", ""];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const isoFromDate = (value) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export default function ToolHome() {
  const [today, setToday] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState(EMPTY_ITEMS);
  const [whys, setWhys] = useState(EMPTY_ITEMS);
  const [entries, setEntries] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [month, setMonth] = useState("");
  const [copied, setCopied] = useState(false);

  // The clock is only read here, never inside the maths in ../lib.
  useEffect(() => {
    const iso = isoFromDate(new Date());
    setToday(iso);
    setDate(iso);
    setMonth(iso.slice(0, 7));
  }, []);

  const prompt = useMemo(() => promptForDate(date), [date]);
  const streaks = useMemo(
    () => computeStreaks(entries.map((entry) => entry.date), today),
    [entries, today],
  );
  const streaksOk = !streaks.error;

  const review = useMemo(() => monthlyReview(entries, month), [entries, month]);
  const reviewOk = !review.error;

  const monthOptions = useMemo(() => {
    const set = new Set(entries.map((entry) => entry.date.slice(0, 7)));
    if (month) set.add(month);
    return [...set].sort().reverse();
  }, [entries, month]);

  const setItemAt = (index, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
    setSaveError("");
  };
  const setWhyAt = (index, value) => {
    setWhys((prev) => prev.map((why, i) => (i === index ? value : why)));
    setSaveError("");
  };

  const save = () => {
    const entry = buildEntry({
      date,
      items,
      whys,
      existingDates: entries.map((existing) => existing.date),
    });
    if (entry.error) {
      setSaveError(entry.error);
      return;
    }
    setSaveError("");
    setEntries((prev) => [...prev, entry]);
    setItems(EMPTY_ITEMS);
    setWhys(EMPTY_ITEMS);
  };

  const removeEntry = (entryDate) =>
    setEntries((prev) => prev.filter((entry) => entry.date !== entryDate));

  const resetAll = () => {
    setItems(EMPTY_ITEMS);
    setWhys(EMPTY_ITEMS);
    setEntries([]);
    setSaveError("");
    setDate(today);
    setMonth(today ? today.slice(0, 7) : "");
    setCopied(false);
  };

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  const summary = useMemo(() => {
    const lines = ["Gratitude Journal"];
    if (streaksOk) {
      lines.push(
        `Current streak: ${streaks.current} day${streaks.current === 1 ? "" : "s"}`,
        `Longest streak: ${streaks.longest}`,
        `Entries saved: ${streaks.total}`,
      );
    }
    if (reviewOk) {
      lines.push(
        "",
        `${review.yearMonth}: ${review.entries} of ${review.days} days (${review.completionPercent}%)`,
        `Good things written: ${review.itemCount}, with a reason on ${review.whyRate}% of them`,
        review.topTheme ? `Most common prompt theme: ${review.topTheme}` : "",
      );
    }
    sortedEntries.forEach((entry) => {
      lines.push("", `${entry.date} (${entry.theme})`);
      entry.items.forEach((item, index) => {
        const why = entry.whys[index];
        lines.push(`  ${index + 1}. ${item}${why ? ` — ${why}` : ""}`);
      });
    });
    return lines.filter((line) => line !== "").join("\n");
  }, [streaks, streaksOk, review, reviewOk, sortedEntries]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Daily practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gratitude Journal Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write three good things and, for each one, why it happened — the format used in the
          positive psychology research on this exercise. A rotating prompt keeps the entries from
          repeating, and the streak and monthly review show whether the habit is actually holding.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gj-date">
              Entry date
            </label>
            <input
              id="gj-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSaveError("");
              }}
            />
          </div>
          <div className="rounded-md border border-[var(--border)] px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Today&apos;s prompt {prompt.error ? "" : `· ${prompt.theme}`}
            </p>
            <p className="mt-1 text-sm">{prompt.error ? "Pick a date to see the prompt." : prompt.text}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {Array.from({ length: ITEMS_PER_ENTRY }, (_, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gj-item-${index}`}>
                  Good thing {index + 1}
                </label>
                <input
                  id={`gj-item-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={items[index]}
                  placeholder="What went well?"
                  onChange={(event) => setItemAt(index, event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gj-why-${index}`}>
                  Why it happened (optional)
                </label>
                <input
                  id={`gj-why-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={whys[index]}
                  placeholder="What made it possible?"
                  onChange={(event) => setWhyAt(index, event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={save} aria-label="Save this entry" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save entry
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the journal and streak summary"
            className={GHOST_BTN}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy journal"}
          </button>
          <button type="button" onClick={resetAll} aria-label="Clear the journal" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {saveError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {saveError}
          </p>
        ) : null}
      </section>

      {streaks.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {streaks.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Current streak
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {streaksOk ? `${streaks.current} day${streaks.current === 1 ? "" : "s"}` : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {streaksOk
            ? streaks.wroteToday
              ? "Today is written up."
              : streaks.streakAtRisk
                ? "Written yesterday but not today — one more day and the streak resets."
                : "No entry yet today."
            : "Enter a valid date to track the streak."}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Longest streak", streaksOk ? `${streaks.longest} days` : DASH],
            ["Entries saved", streaksOk ? `${streaks.total}` : DASH],
            ["Last entry", streaksOk && streaks.lastEntry ? streaks.lastEntry : DASH],
            [
              "Days since last entry",
              streaksOk && streaks.daysSinceLast !== null ? `${streaks.daysSinceLast}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Monthly review</h2>
          <div className="min-w-[10rem]">
            <label className="sr-only" htmlFor="gj-month">
              Month to review
            </label>
            <select
              id="gj-month"
              className={INPUT_CLASS}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {monthOptions.length === 0 ? <option value="">No months yet</option> : null}
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {review.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {review.error}
          </p>
        ) : null}

        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Days written",
              reviewOk ? `${review.entries} of ${review.days} (${review.completionPercent}%)` : DASH,
            ],
            ["Good things recorded", reviewOk ? `${review.itemCount}` : DASH],
            ["Entries with a reason", reviewOk ? `${review.whyRate}% of items` : DASH],
            ["Longest streak this month", reviewOk ? `${review.longestStreakInMonth} days` : DASH],
            ["Most common theme", reviewOk && review.topTheme ? review.topTheme : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Saved entries</h2>
        {sortedEntries.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Nothing saved yet. Entries stay in this browser tab only — copy the journal to keep it.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {sortedEntries.map((entry) => (
              <li key={entry.date} className="rounded-md border border-[var(--border)] px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {entry.date}
                    <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                      {entry.theme}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.date)}
                    aria-label={`Delete the entry for ${entry.date}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <ol className="mt-1 grid gap-1 text-sm">
                  {entry.items.map((item, index) => (
                    <li key={`${entry.date}-${index}`}>
                      <span className="font-medium">{index + 1}. {item}</span>
                      {entry.whys[index] ? (
                        <span className="text-[var(--muted-foreground)]"> — {entry.whys[index]}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Gratitude journalling is a wellbeing practice, not a treatment for
        depression or anxiety — if low mood persists for more than two weeks, speak to a doctor or
        a qualified mental health professional.
      </p>
    </main>
  );
}
