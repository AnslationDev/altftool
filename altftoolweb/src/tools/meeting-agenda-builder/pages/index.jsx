"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  agendaToMarkdown,
  buildAgenda,
  formatDuration,
  ITEM_TYPES,
  RECOMMENDED_MAX_MINUTES,
} from "../lib";

const DEFAULT_ITEMS = [
  { id: 1, title: "Welcome and context", owner: "Chair", minutes: "5", type: "inform" },
  { id: 2, title: "Last week's metrics", owner: "Analytics", minutes: "10", type: "review" },
  { id: 3, title: "Blockers on the release", owner: "Engineering", minutes: "15", type: "discuss" },
  { id: 4, title: "Go / no-go for Friday", owner: "Product", minutes: "10", type: "decide" },
  { id: 5, title: "Actions and owners", owner: "Chair", minutes: "5", type: "inform" },
];

const DEFAULTS = {
  title: "Weekly release sync",
  dateISO: "2026-08-03",
  startTime: "10:00",
  attendees: "6",
  hourlyCost: "1500",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [dateISO, setDateISO] = useState(DEFAULTS.dateISO);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [attendees, setAttendees] = useState(DEFAULTS.attendees);
  const [hourlyCost, setHourlyCost] = useState(DEFAULTS.hourlyCost);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [nextId, setNextId] = useState(DEFAULT_ITEMS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAgenda({
        title,
        dateISO,
        startTime,
        attendees: toNumber(attendees),
        hourlyCost: toNumber(hourlyCost),
        items: items.map((row) => ({
          title: row.title,
          owner: row.owner,
          minutes: toNumber(row.minutes),
          type: row.type,
        })),
      }),
    [title, dateISO, startTime, attendees, hourlyCost, items],
  );

  const hasError = Boolean(result.error);
  const summary = useMemo(() => (hasError ? "" : agendaToMarkdown(result, "INR")), [hasError, result]);

  const updateItem = (id, field, value) => {
    setItems((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      { id: nextId, title: "", owner: "", minutes: "10", type: "discuss" },
    ]);
    setNextId((current) => current + 1);
  };

  const removeItem = (id) => {
    setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const moveItem = (id, direction) => {
    setItems((current) => {
      const index = current.findIndex((row) => row.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

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
    setTitle(DEFAULTS.title);
    setDateISO(DEFAULTS.dateISO);
    setStartTime(DEFAULTS.startTime);
    setAttendees(DEFAULTS.attendees);
    setHourlyCost(DEFAULTS.hourlyCost);
    setItems(DEFAULT_ITEMS);
    setNextId(DEFAULT_ITEMS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Meeting planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Meeting Agenda Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give every agenda item a length and an owner. The builder turns the list into a timed
          running order with clock slots, an end time, a 10% buffer and the cost of the room.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Meeting details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="meeting-title">
              Meeting title
            </label>
            <input
              id="meeting-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meeting-date">
              Date
            </label>
            <input
              id="meeting-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateISO}
              onChange={(event) => setDateISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meeting-start">
              Start time (24-hour)
            </label>
            <input
              id="meeting-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meeting-attendees">
              Attendees
            </label>
            <input
              id="meeting-attendees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={attendees}
              onChange={(event) => setAttendees(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meeting-cost">
              Loaded cost per attendee per hour (INR)
            </label>
            <input
              id="meeting-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={hourlyCost}
              onChange={(event) => setHourlyCost(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Agenda items</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add an agenda item">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {items.map((row, index) => (
            <li
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Item {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(row.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move item ${index + 1} up`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-sm font-semibold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(row.id, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move item ${index + 1} down`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-sm font-semibold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(row.id)}
                    disabled={items.length === 1}
                    aria-label={`Remove item ${index + 1}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`item-title-${row.id}`}>
                    Topic
                  </label>
                  <input
                    id={`item-title-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.title}
                    placeholder="What gets covered"
                    onChange={(event) => updateItem(row.id, "title", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`item-owner-${row.id}`}>
                    Owner
                  </label>
                  <input
                    id={`item-owner-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.owner}
                    placeholder="Who leads it"
                    onChange={(event) => updateItem(row.id, "owner", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`item-minutes-${row.id}`}>
                    Minutes
                  </label>
                  <input
                    id={`item-minutes-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="5"
                    value={row.minutes}
                    onChange={(event) => updateItem(row.id, "minutes", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`item-type-${row.id}`}>
                    Purpose
                  </label>
                  <select
                    id={`item-type-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.type}
                    onChange={(event) => updateItem(row.id, "type", event.target.value)}
                  >
                    {ITEM_TYPES.map((type) => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total meeting length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the agenda above to see the running order."
                : `${result.startClock} to ${result.endClock} across ${result.itemCount} items`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the meeting agenda to the clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy agenda"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the agenda" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ends at", hasError ? DASH : result.endClock],
            [
              "With a 10% buffer, ends at",
              hasError ? DASH : `${result.endWithBufferClock} (+${result.bufferMinutes}m)`,
            ],
            ["Estimated cost of the meeting", hasError ? DASH : INR.format(result.cost)],
            ["Cost per minute", hasError ? DASH : INR.format(result.costPerMinute)],
            [
              "Person-minutes consumed",
              hasError ? DASH : `${NUM.format(result.personMinutes)} minutes`,
            ],
            [
              "Longest single item",
              hasError ? DASH : formatDuration(result.longestItemMinutes),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Running order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Slot
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Topic
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Owner
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Purpose
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {row.startClock}–{row.endClock}
                    </td>
                    <td className="py-2 pr-3">{row.title}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.owner}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.typeLabel}</td>
                    <td className="py-2 text-right">{Math.round(row.sharePercent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything stays in your browser — nothing is uploaded. Meetings longer than{" "}
        {RECOMMENDED_MAX_MINUTES} minutes get a warning because attention and decision quality drop
        past the hour mark.
      </p>
    </main>
  );
}
