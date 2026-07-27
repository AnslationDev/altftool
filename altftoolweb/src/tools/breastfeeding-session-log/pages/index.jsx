"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  LONG_GAP_HOURS,
  MAX_SESSION_MINUTES,
  MAX_TYPICAL_FEEDS_PER_DAY,
  MIN_TYPICAL_FEEDS_PER_DAY,
  SIDES,
  formatDuration,
  summariseFeedLog,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SIDE_LABEL = { left: "Left", right: "Right", both: "Both" };

const DEFAULT_ENTRIES = [
  { id: "seed-1", clock: "06:00", side: "left", minutes: "15" },
  { id: "seed-2", clock: "09:00", side: "right", minutes: "20" },
  { id: "seed-3", clock: "12:30", side: "both", minutes: "25" },
  { id: "seed-4", clock: "18:00", side: "left", minutes: "10" },
];

const DASH = "—";

export default function ToolHome() {
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [nextId, setNextId] = useState(1);
  const [draftClock, setDraftClock] = useState("21:00");
  const [draftSide, setDraftSide] = useState("right");
  const [draftMinutes, setDraftMinutes] = useState("15");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      summariseFeedLog({
        entries: entries.map((entry) => ({
          id: entry.id,
          clock: entry.clock,
          side: entry.side,
          minutes: Number(entry.minutes),
        })),
      }),
    [entries],
  );

  const hasError = Boolean(result.error);
  const showFigures = !hasError && !result.empty;

  const addFeed = () => {
    const id = `feed-${nextId}`;
    setNextId((value) => value + 1);
    setEntries((list) => [
      ...list,
      { id, clock: draftClock, side: draftSide, minutes: draftMinutes },
    ]);
    setCopied(false);
  };

  const updateEntry = (id, patch) => {
    setEntries((list) => list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
    setCopied(false);
  };

  const removeEntry = (id) => {
    setEntries((list) => list.filter((entry) => entry.id !== id));
    setCopied(false);
  };

  const reset = () => {
    setEntries(DEFAULT_ENTRIES);
    setNextId(1);
    setDraftClock("21:00");
    setDraftSide("right");
    setDraftMinutes("15");
    setCopied(false);
  };

  const summaryText = useMemo(() => {
    if (!showFigures) return "";
    const lines = [
      "Breastfeeding session log",
      `Feeds recorded: ${result.count}`,
      `Total time at the breast: ${formatDuration(result.totalMinutes)}`,
      `Average feed: ${formatDuration(result.averageMinutes)}`,
      `Average gap between feeds: ${formatDuration(result.averageGapMin)}`,
      `Longest stretch without a feed: ${formatDuration(result.longestStretchMin)}`,
      `Left: ${formatDuration(result.leftMinutes)} over ${result.leftCount} feed(s)`,
      `Right: ${formatDuration(result.rightMinutes)} over ${result.rightCount} feed(s)`,
      `Both sides: ${formatDuration(result.bothMinutes)} over ${result.bothCount} feed(s)`,
      `First feed ${result.firstClock}, last feed ${result.lastClock}`,
    ];
    if (result.nextFeedClock) lines.push(`Next feed at this rhythm: about ${result.nextFeedClock}`);
    return lines.join("\n");
  }, [result, showFigures]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const frequencyNote = () => {
    if (!showFigures) return null;
    if (result.frequencyStatus === "below") {
      return `Fewer than ${MIN_TYPICAL_FEEDS_PER_DAY} feeds logged for the day — newborn guidance describes ${MIN_TYPICAL_FEEDS_PER_DAY}-${MAX_TYPICAL_FEEDS_PER_DAY} feeds per 24 hours.`;
    }
    if (result.frequencyStatus === "above") {
      return `More than ${MAX_TYPICAL_FEEDS_PER_DAY} feeds — cluster feeding days look like this and are common during growth spurts.`;
    }
    return `Inside the usual ${MIN_TYPICAL_FEEDS_PER_DAY}-${MAX_TYPICAL_FEEDS_PER_DAY} feeds per 24 hours described for newborns.`;
  };

  const rows = showFigures
    ? [
        ["Total time at the breast", formatDuration(result.totalMinutes)],
        ["Average feed length", formatDuration(result.averageMinutes)],
        ["Average gap (start to start)", formatDuration(result.averageGapMin)],
        [
          "Longest gap between feeds",
          result.longestGapMin === null
            ? DASH
            : `${formatDuration(result.longestGapMin)} (${result.longestGapFrom} → ${result.longestGapTo})`,
        ],
        [
          "Longest stretch incl. overnight",
          result.longestStretchMin === null ? DASH : formatDuration(result.longestStretchMin),
        ],
        ["Left breast", `${formatDuration(result.leftMinutes)} · ${result.leftCount} feed(s)`],
        ["Right breast", `${formatDuration(result.rightMinutes)} · ${result.rightCount} feed(s)`],
        ["Both sides", `${formatDuration(result.bothMinutes)} · ${result.bothCount} feed(s)`],
        [
          "Left / right split",
          result.leftShare === null
            ? "No single-side feeds logged"
            : `${Math.round(result.leftShare)}% left / ${Math.round(result.rightShare)}% right${result.balanced ? "" : " — uneven"}`,
        ],
        ["First feed", result.firstClock ?? DASH],
        ["Last feed", result.lastClock ?? DASH],
        ["Next feed at this rhythm", result.nextFeedClock ? `about ${result.nextFeedClock}` : DASH],
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Feeding log
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Breastfeeding Session Log
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record each feed with the side used and how long it lasted. The log adds up the day for
          you: total minutes at the breast, the gaps between feeds, the left-right balance and the
          longest stretch your baby went without feeding.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add a feed</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="feed-clock">
              Start time
            </label>
            <input
              id="feed-clock"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={draftClock}
              onChange={(event) => setDraftClock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="feed-side">
              Side
            </label>
            <select
              id="feed-side"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draftSide}
              onChange={(event) => setDraftSide(event.target.value)}
            >
              {SIDES.map((side) => (
                <option key={side} value={side}>
                  {SIDE_LABEL[side]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="feed-minutes">
              Duration (minutes)
            </label>
            <input
              id="feed-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SESSION_MINUTES}
              step="1"
              value={draftMinutes}
              onChange={(event) => setDraftMinutes(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={addFeed} className={`w-full ${PRIMARY_BTN}`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add feed
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Today&apos;s feeds ({entries.length})</h2>
          <button type="button" onClick={reset} aria-label="Reset the log" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            No feeds logged yet. Add the first one above.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <div>
                    <label className="sr-only" htmlFor={`row-clock-${entry.id}`}>
                      Feed {index + 1} start time
                    </label>
                    <input
                      id={`row-clock-${entry.id}`}
                      className={INPUT_CLASS}
                      type="time"
                      value={entry.clock}
                      onChange={(event) => updateEntry(entry.id, { clock: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`row-side-${entry.id}`}>
                      Feed {index + 1} side
                    </label>
                    <select
                      id={`row-side-${entry.id}`}
                      className={INPUT_CLASS}
                      value={entry.side}
                      onChange={(event) => updateEntry(entry.id, { side: event.target.value })}
                    >
                      {SIDES.map((side) => (
                        <option key={side} value={side}>
                          {SIDE_LABEL[side]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`row-min-${entry.id}`}>
                      Feed {index + 1} duration in minutes
                    </label>
                    <input
                      id={`row-min-${entry.id}`}
                      className={INPUT_CLASS}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max={MAX_SESSION_MINUTES}
                      step="1"
                      value={entry.minutes}
                      onChange={(event) => updateEntry(entry.id, { minutes: event.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Remove feed ${index + 1}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
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
              Feeds in the day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showFigures ? result.count : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {showFigures
                ? `${formatDuration(result.totalMinutes)} at the breast in total`
                : "Add at least one valid feed to see the totals."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            disabled={!showFigures}
            aria-label="Copy the feeding log summary"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy summary"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(showFigures
            ? rows
            : [
                ["Total time at the breast", DASH],
                ["Average feed length", DASH],
                ["Average gap (start to start)", DASH],
                ["Longest stretch incl. overnight", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {showFigures && (
          <div className="mt-5 space-y-2 text-sm">
            <p className="text-[var(--muted-foreground)]">{frequencyNote()}</p>
            {result.longGapCount > 0 && (
              <p className="text-[var(--muted-foreground)]">
                {result.longGapCount} gap(s) longer than {LONG_GAP_HOURS} hours between feeds.
              </p>
            )}
            {result.balanced === false && (
              <p className="text-[var(--muted-foreground)]">
                One breast is taking noticeably more time than the other — alternating the starting
                side usually evens this out.
              </p>
            )}
          </div>
        )}

        {showFigures && result.gaps.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    From
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    To
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.gaps.map((gap) => (
                  <tr
                    key={`${gap.fromClock}-${gap.toClock}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3">{gap.fromClock}</td>
                    <td className="py-2 pr-3">{gap.toClock}</td>
                    <td className="py-2 text-right font-semibold">{formatDuration(gap.gapMin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational record-keeping only. Feed counts, weight gain, nappy output and jaundice are
        assessed by a paediatrician, midwife or lactation consultant — contact them if feeding hurts,
        the baby is sleepy at the breast or weight gain is a concern.
      </p>
    </main>
  );
}
