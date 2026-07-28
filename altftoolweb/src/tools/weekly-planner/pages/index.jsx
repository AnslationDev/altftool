"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import {
  addDays,
  buildWeek,
  CATEGORIES,
  DEFAULT_DAY_END_MINUTES,
  DEFAULT_DAY_START_MINUTES,
  formatDuration,
  formatTime,
  OVERLOAD_THRESHOLD_PERCENT,
  planWeek,
  PRIORITIES,
  startOfWeek,
  validateBlock,
  weekToText,
} from "../lib";

const STORAGE_KEY = "weekly-planner:v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function seedBlocks(days) {
  return [
    { id: "seed-1", title: "Deep work — priority project", dayIso: days[0].iso, start: "09:00", durationMinutes: 120, category: "deep-work", priority: "high" },
    { id: "seed-2", title: "Team stand-up", dayIso: days[0].iso, start: "11:15", durationMinutes: 30, category: "meetings", priority: "medium" },
    { id: "seed-3", title: "Inbox and admin", dayIso: days[1].iso, start: "16:00", durationMinutes: 60, category: "admin", priority: "low" },
    { id: "seed-4", title: "Gym", dayIso: days[2].iso, start: "18:30", durationMinutes: 60, category: "health", priority: "medium" },
    { id: "seed-5", title: "Course module", dayIso: days[3].iso, start: "20:00", durationMinutes: 90, category: "learning", priority: "medium" },
  ];
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [anchorIso, setAnchorIso] = useState(() => todayIso());
  const [dayStart, setDayStart] = useState("08:00");
  const [dayEnd, setDayEnd] = useState("22:00");

  const weekStart = useMemo(() => startOfWeek(anchorIso, weekStartsOn), [anchorIso, weekStartsOn]);
  const week = useMemo(() => (weekStart.error ? { error: weekStart.error } : buildWeek(weekStart.iso)), [weekStart]);
  const days = useMemo(() => (week.error ? [] : week.days), [week]);

  const [blocks, setBlocks] = useState(() => (week.error ? [] : seedBlocks(week.days)));
  const [hydrated, setHydrated] = useState(false);

  const [title, setTitle] = useState("New block");
  const [dayIso, setDayIso] = useState(() => (week.error ? "" : week.days[0].iso));
  const [start, setStart] = useState("14:00");
  const [duration, setDuration] = useState("60");
  const [category, setCategory] = useState("deep-work");
  const [priority, setPriority] = useState("medium");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
        if (parsed.weekStartsOn === 0 || parsed.weekStartsOn === 1) setWeekStartsOn(parsed.weekStartsOn);
        if (typeof parsed.dayStart === "string") setDayStart(parsed.dayStart);
        if (typeof parsed.dayEnd === "string") setDayEnd(parsed.dayEnd);
      }
    } catch {
      /* corrupt or unavailable storage — keep the seeded week */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks, weekStartsOn, dayStart, dayEnd }));
    } catch {
      /* storage full or blocked — the plan simply is not persisted */
    }
  }, [hydrated, blocks, weekStartsOn, dayStart, dayEnd]);

  // When the visible week changes the stored day may no longer be in it, so the
  // select falls back to the first day of the week without needing an effect.
  const selectedDayIso = days.some((d) => d.iso === dayIso) ? dayIso : (days[0]?.iso ?? "");

  const startMinutes = useMemo(() => {
    const [h, m] = dayStart.split(":");
    const value = Number(h) * 60 + Number(m);
    return Number.isFinite(value) ? value : DEFAULT_DAY_START_MINUTES;
  }, [dayStart]);

  const endMinutes = useMemo(() => {
    const [h, m] = dayEnd.split(":");
    const value = Number(h) * 60 + Number(m);
    return Number.isFinite(value) ? value : DEFAULT_DAY_END_MINUTES;
  }, [dayEnd]);

  const plan = useMemo(() => {
    if (week.error) return { error: week.error };
    return planWeek({ blocks, days, dayStartMinutes: startMinutes, dayEndMinutes: endMinutes });
  }, [week, blocks, days, startMinutes, endMinutes]);

  const error = plan.error || null;
  const weekLabel = days.length ? `${days[0].label} to ${days[6].label}` : DASH;

  function addBlock(event) {
    event.preventDefault();
    const durationMinutes = Number(duration);
    const checked = validateBlock({ title, dayIso: selectedDayIso, start, durationMinutes });
    if (checked.error) {
      setFormError(checked.error);
      return;
    }
    setFormError("");
    setBlocks((current) => [
      ...current,
      { id: `b-${Date.now()}-${current.length}`, title: title.trim(), dayIso: selectedDayIso, start, durationMinutes, category, priority },
    ]);
    setTitle("New block");
  }

  function removeBlock(id) {
    setBlocks((current) => current.filter((b) => b.id !== id));
  }

  function shiftWeek(direction) {
    const moved = addDays(weekStart.error ? anchorIso : weekStart.iso, direction * 7);
    if (!moved.error) setAnchorIso(moved.iso);
  }

  function reset() {
    const fresh = startOfWeek(todayIso(), 1);
    const freshWeek = fresh.error ? null : buildWeek(fresh.iso);
    setWeekStartsOn(1);
    setAnchorIso(todayIso());
    setDayStart("08:00");
    setDayEnd("22:00");
    setBlocks(freshWeek && !freshWeek.error ? seedBlocks(freshWeek.days) : []);
    setFormError("");
    setCopied(false);
  }

  async function copyResult() {
    if (error) return;
    try {
      await navigator.clipboard.writeText(weekToText(plan, weekLabel));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <CalendarDays className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Weekly Planner
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Seven days of time blocks with clash warnings, free hours and a per-category breakdown. Saved in your browser only.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" className={GHOST_BTN} onClick={() => shiftWeek(-1)} aria-label="Show the previous week">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
        <p className="text-sm font-semibold text-[var(--foreground)]">{weekLabel}</p>
        <button type="button" className={GHOST_BTN} onClick={() => shiftWeek(1)} aria-label="Show the next week">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <section className="grid gap-4">
          <form className="grid gap-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" onSubmit={addBlock}>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Add a time block</h2>
            <div>
              <label className={LABEL_CLASS} htmlFor="wpl-title">
                Block name
              </label>
              <input id="wpl-title" className={`mt-1 ${INPUT_CLASS}`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-day">
                  Day
                </label>
                <select id="wpl-day" className={`mt-1 ${INPUT_CLASS}`} value={selectedDayIso} onChange={(e) => setDayIso(e.target.value)}>
                  {days.map((d) => (
                    <option key={d.iso} value={d.iso}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-start">
                  Start time
                </label>
                <input id="wpl-start" type="time" className={`mt-1 ${INPUT_CLASS}`} value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-duration">
                  Duration (minutes)
                </label>
                <input id="wpl-duration" className={`mt-1 ${INPUT_CLASS}`} value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-category">
                  Category
                </label>
                <select id="wpl-category" className={`mt-1 ${INPUT_CLASS}`} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-priority">
                  Priority
                </label>
                <select id="wpl-priority" className={`mt-1 ${INPUT_CLASS}`} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formError ? (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {formError}
              </p>
            ) : null}
            <button type="submit" className={PRIMARY_BTN} aria-label="Add this block to the week">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add block
            </button>
          </form>

          <div className="grid gap-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Week settings</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-week-start">
                  Week starts on
                </label>
                <select id="wpl-week-start" className={`mt-1 ${INPUT_CLASS}`} value={weekStartsOn} onChange={(e) => setWeekStartsOn(Number(e.target.value))}>
                  <option value={1}>Monday</option>
                  <option value={0}>Sunday</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-anchor">
                  Jump to date
                </label>
                <input id="wpl-anchor" type="date" className={`mt-1 ${INPUT_CLASS}`} value={anchorIso} onChange={(e) => setAnchorIso(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-day-start">
                  Day starts
                </label>
                <input id="wpl-day-start" type="time" className={`mt-1 ${INPUT_CLASS}`} value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wpl-day-end">
                  Day ends
                </label>
                <input id="wpl-day-end" type="time" className={`mt-1 ${INPUT_CLASS}`} value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy the whole week as text to the clipboard">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the planner to this week's example plan">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            {error ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-sm text-[var(--muted-foreground)]">Planned this week</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {error ? DASH : formatDuration(plan.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${plan.totalBlocks} blocks · ${PCT.format(plan.weekLoadPercent)}% of your waking window`}
            </p>
            <dl className="mt-4">
              <Row label="Free time in the window" value={error ? DASH : formatDuration(plan.freeMinutes)} />
              <Row label="Busiest day" value={error ? DASH : `${plan.busiestDay} (${formatDuration(plan.busiestMinutes)})`} />
              <Row label="Lightest day" value={error ? DASH : plan.lightestDay} />
              <Row label="Blocks in a clash" value={error ? DASH : plan.totalClashes} />
              {CATEGORIES.filter((c) => !error && plan.categoryMinutes[c.id]).map((c) => (
                <Row key={c.id} label={c.label} value={formatDuration(plan.categoryMinutes[c.id])} />
              ))}
            </dl>
          </div>
        </section>

        <section className="grid gap-3">
          {error
            ? null
            : plan.days.map((day) => (
                <article key={day.iso} className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
                  <header className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{day.label}</h3>
                    <p className={`text-xs font-semibold ${day.overloaded ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}>
                      {formatDuration(day.plannedMinutes)} planned · {PCT.format(day.loadPercent)}% full · {formatDuration(day.freeMinutes)} free
                    </p>
                  </header>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className={`h-full rounded-full ${day.overloaded ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                      style={{ width: `${Math.min(100, day.loadPercent)}%` }}
                    />
                  </div>
                  {day.overloaded ? (
                    <p className="mt-2 flex items-center gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]" role="alert">
                      <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      Over {OVERLOAD_THRESHOLD_PERCENT}% booked — nothing left to absorb an overrun.
                    </p>
                  ) : null}
                  <ul className="mt-3 grid gap-2">
                    {day.blocks.length === 0 ? (
                      <li className="text-sm text-[var(--muted-foreground)]">Nothing scheduled.</li>
                    ) : (
                      day.blocks.map((block) => {
                        const clashing = day.clashIds.has(block.id);
                        return (
                          <li
                            key={block.id}
                            className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 ${
                              clashing ? "border-[var(--danger)] bg-[var(--danger-soft)]" : "border-[var(--border)] bg-[var(--background)]"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{block.title}</p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {formatTime(block.startMinutes)}–{formatTime(block.endMinutes)} · {formatDuration(block.endMinutes - block.startMinutes)} ·{" "}
                                {CATEGORIES.find((c) => c.id === block.category)?.label ?? block.category} ·{" "}
                                {PRIORITIES.find((p) => p.id === block.priority)?.label ?? block.priority}
                              </p>
                              {clashing ? <p className="text-xs font-semibold text-[var(--danger)]">Overlaps another block</p> : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              aria-label={`Remove ${block.title} from ${day.label}`}
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </article>
              ))}
        </section>
      </div>
    </div>
  );
}
