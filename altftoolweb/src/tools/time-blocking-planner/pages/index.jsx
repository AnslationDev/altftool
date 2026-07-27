"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BLOCK_CATEGORIES,
  DEFAULT_DAY_END,
  DEFAULT_DAY_START,
  MIN_USEFUL_GAP_MINUTES,
  PRIORITIES,
  SNAP_MINUTES,
  buildDaySummary,
  formatDuration,
  formatTime,
  moveBlock,
  planDay,
} from "../lib";

const STORAGE_KEY = "altft.time-blocking-planner.v1";
const TIMELINE_HEIGHT_PX = 480;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_BLOCKS = [
  { id: "b1", title: "Deep work: pricing model", start: "09:00", end: "11:00", category: "deep", priority: "high", done: false, notes: "Phone in another room." },
  { id: "b2", title: "Coffee + walk", start: "11:00", end: "11:20", category: "break", priority: "low", done: false, notes: "" },
  { id: "b3", title: "Team standup", start: "11:30", end: "12:00", category: "meeting", priority: "medium", done: false, notes: "" },
  { id: "b4", title: "Lunch", start: "13:00", end: "13:45", category: "personal", priority: "low", done: false, notes: "" },
  { id: "b5", title: "Inbox + invoices", start: "16:00", end: "17:00", category: "shallow", priority: "medium", done: false, notes: "" },
];

const CATEGORY_LABEL = new Map(BLOCK_CATEGORIES.map((entry) => [entry.id, entry.label]));

export default function ToolHome() {
  const [dayStart, setDayStart] = useState(DEFAULT_DAY_START);
  const [dayEnd, setDayEnd] = useState(DEFAULT_DAY_END);
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [hideDone, setHideDone] = useState(false);
  const [nextId, setNextId] = useState(6);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  const timelineRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed?.blocks) && parsed.blocks.length > 0) {
        setBlocks(parsed.blocks);
        setDayStart(parsed.dayStart || DEFAULT_DAY_START);
        setDayEnd(parsed.dayEnd || DEFAULT_DAY_END);
        setNextId(parsed.nextId || parsed.blocks.length + 1);
        setRestored(true);
      }
    } catch {
      setRestored(false);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ blocks, dayStart, dayEnd, nextId })
      );
    } catch {
      /* storage unavailable — the planner still works for this session */
    }
  }, [blocks, dayStart, dayEnd, nextId]);

  const plan = useMemo(() => planDay({ blocks, dayStart, dayEnd }), [blocks, dayStart, dayEnd]);
  const error = plan.error ?? null;

  const summary = useMemo(
    () => (error ? { error } : buildDaySummary({ dayLabel: "Day plan", plan })),
    [error, plan]
  );

  const visibleBlocks = useMemo(() => {
    if (error) return [];
    return plan.blocks.filter((block) => {
      if (categoryFilter !== "all" && block.category !== categoryFilter) return false;
      if (hideDone && block.done) return false;
      return true;
    });
  }, [error, plan, categoryFilter, hideDone]);

  const updateBlock = (id, patch) => {
    setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  };

  const moveBlockTo = (id, newStartMin) => {
    setBlocks((previous) =>
      previous.map((block) => (block.id === id ? moveBlock(block, newStartMin) : block))
    );
  };

  const handlePointerDown = (event, block) => {
    const timeline = timelineRef.current;
    if (!timeline || error) return;
    const rect = timeline.getBoundingClientRect();
    const minutesPerPx = plan.windowMinutes / rect.height;
    dragRef.current = {
      id: block.id,
      grabOffsetMin: (event.clientY - rect.top) * minutesPerPx - (block.startMin - plan.windowStart),
      rect,
      minutesPerPx,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const offsetMin = (event.clientY - drag.rect.top) * drag.minutesPerPx - drag.grabOffsetMin;
    moveBlockTo(drag.id, plan.windowStart + offsetMin);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const nudge = (block, deltaMinutes) => {
    moveBlockTo(block.id, block.startMin + deltaMinutes);
  };

  const addBlock = () => {
    const id = `b${nextId}`;
    setBlocks((previous) => [
      ...previous,
      { id, title: "New block", start: "14:00", end: "15:00", category: "deep", priority: "medium", done: false, notes: "" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeBlock = (id) => {
    setBlocks((previous) => previous.filter((block) => block.id !== id));
  };

  const handleCopy = async () => {
    if (summary.error) return;
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setDayStart(DEFAULT_DAY_START);
    setDayEnd(DEFAULT_DAY_END);
    setBlocks(DEFAULT_BLOCKS);
    setCategoryFilter("all");
    setHideDone(false);
    setNextId(6);
    setCopied(false);
    setRestored(false);
  };

  const dash = "—";
  const hourMarks = useMemo(() => {
    if (error) return [];
    const marks = [];
    const firstHour = Math.ceil(plan.windowStart / 60) * 60;
    for (let minute = firstHour; minute < plan.windowEnd; minute += 60) {
      marks.push(minute);
    }
    return marks;
  }, [error, plan]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Time Blocking Planner
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Drag blocks onto the day, and see utilisation, clashes, dead gaps and your
            longest uninterrupted focus run. Saved locally in this browser.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="day-start">
            Day starts
          </label>
          <input
            id="day-start"
            type="time"
            className={`${INPUT_CLASS} mt-1.5`}
            value={dayStart}
            onChange={(event) => setDayStart(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="day-end">
            Day ends
          </label>
          <input
            id="day-end"
            type="time"
            className={`${INPUT_CLASS} mt-1.5`}
            value={dayEnd}
            onChange={(event) => setDayEnd(event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Day utilisation
        </p>
        <p className="mt-1 text-4xl font-bold text-[var(--foreground)]">
          {error ? dash : `${plan.utilisation}%`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error ? dash : `${formatDuration(plan.bookedMinutes)} booked of ${formatDuration(plan.windowMinutes)}`}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Focus time</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : formatDuration(plan.focusMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Breaks</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${formatDuration(plan.breakMinutes)} of ${formatDuration(plan.recommendedBreakMinutes)}`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Longest focus run</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : formatDuration(plan.longestFocusRun)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Unbooked</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : formatDuration(plan.freeMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Dead gaps (&lt;{MIN_USEFUL_GAP_MINUTES}m)</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : formatDuration(plan.deadTimeMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Marked done</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${plan.completion}%`}
            </dd>
          </div>
        </dl>

        {!error && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm text-[var(--danger)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!error ? (
        <div
          ref={timelineRef}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className="relative mt-5 w-full touch-none overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]"
          style={{ height: `${TIMELINE_HEIGHT_PX}px` }}
          aria-label="Day timeline"
        >
          {hourMarks.map((minute) => (
            <div
              key={minute}
              className="pointer-events-none absolute left-0 right-0 border-t border-[var(--border)]"
              style={{ top: `${((minute - plan.windowStart) / plan.windowMinutes) * 100}%` }}
            >
              <span className="ml-1 text-[10px] text-[var(--muted-foreground)]">
                {formatTime(minute)}
              </span>
            </div>
          ))}
          {plan.blocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onPointerDown={(event) => handlePointerDown(event, block)}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 30 : SNAP_MINUTES;
                if (event.key === "ArrowUp") { event.preventDefault(); nudge(block, -step); }
                if (event.key === "ArrowDown") { event.preventDefault(); nudge(block, step); }
              }}
              aria-label={`${block.title}, ${block.startLabel} to ${block.endLabel}. Drag or use arrow keys to move.`}
              className={`absolute left-14 right-2 cursor-grab overflow-hidden rounded-md px-2 py-1 text-left text-xs font-semibold ring-2 focus-visible:outline-none focus-visible:ring-[3px] ${
                block.clashes || block.outsideWindow
                  ? "bg-[var(--danger-soft)] text-[var(--danger)] ring-[var(--danger)]"
                  : "bg-[var(--primary)]/20 text-[var(--foreground)] ring-[var(--primary)]"
              }`}
              style={{
                top: `${Math.max(0, ((block.startMin - plan.windowStart) / plan.windowMinutes) * 100)}%`,
                height: `${Math.max(3, (block.minutes / plan.windowMinutes) * 100)}%`,
              }}
            >
              {block.startLabel}–{block.endLabel} · {block.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="filter-category">
            Filter by category
          </label>
          <select
            id="filter-category"
            className={`${INPUT_CLASS} mt-1.5`}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {BLOCK_CATEGORIES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label
            className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
            htmlFor="hide-done"
          >
            <input
              id="hide-done"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={hideDone}
              onChange={(event) => setHideDone(event.target.checked)}
            />
            Hide completed blocks
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Blocks {error ? "" : `(${visibleBlocks.length} shown)`}
        </h2>
        <button type="button" className={GHOST_BTN} onClick={addBlock} aria-label="Add a time block">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add block
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {visibleBlocks.map((block) => (
          <div key={block.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`title-${block.id}`}>
                  Title
                </label>
                <input
                  id={`title-${block.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={block.title}
                  onChange={(event) => updateBlock(block.id, { title: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`start-${block.id}`}>
                  Start
                </label>
                <input
                  id={`start-${block.id}`}
                  type="time"
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={block.startLabel}
                  onChange={(event) => updateBlock(block.id, { start: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`end-${block.id}`}>
                  End
                </label>
                <input
                  id={`end-${block.id}`}
                  type="time"
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={block.endLabel}
                  onChange={(event) => updateBlock(block.id, { end: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`cat-${block.id}`}>
                  Category
                </label>
                <select
                  id={`cat-${block.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={block.category}
                  onChange={(event) => updateBlock(block.id, { category: event.target.value })}
                >
                  {BLOCK_CATEGORIES.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`prio-${block.id}`}>
                  Priority
                </label>
                <select
                  id={`prio-${block.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={block.priority}
                  onChange={(event) => updateBlock(block.id, { priority: event.target.value })}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`notes-${block.id}`}>
                  Notes / reminder
                </label>
                <textarea
                  id={`notes-${block.id}`}
                  rows={2}
                  className={`${TEXTAREA_CLASS} mt-1.5`}
                  value={block.notes}
                  onChange={(event) => updateBlock(block.id, { notes: event.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <label
                className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
                htmlFor={`done-${block.id}`}
              >
                <input
                  id={`done-${block.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={block.done}
                  onChange={(event) => updateBlock(block.id, { done: event.target.checked })}
                />
                Done · {block.durationLabel} · {CATEGORY_LABEL.get(block.category)}
              </label>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => removeBlock(block.id)}
                aria-label={`Remove ${block.title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the day plan to clipboard"
          disabled={Boolean(summary.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy day plan"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset the planner">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        {restored ? "Restored from this browser's local storage. " : ""}
        Blocks snap to {SNAP_MINUTES}-minute steps. Nothing is uploaded.
      </p>
    </div>
  );
}
