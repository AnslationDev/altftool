"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Copy, Moon, Plus, RotateCcw, Sun, X } from "lucide-react";

import {
  buildClipboardText,
  buildOverlapStrip,
  CITY_PRESETS,
  DEFAULT_WORK_END_HOUR,
  DEFAULT_WORK_START_HOUR,
  describeZone,
  formatClock,
  MAX_ZONES,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULT_IDS = ["mumbai", "london", "new-york", "singapore"];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

function presetById(id) {
  return CITY_PRESETS.find((preset) => preset.id === id) || null;
}

export default function ToolHome() {
  const [ids, setIds] = useState(DEFAULT_IDS);
  const [baseId, setBaseId] = useState("mumbai");
  const [pickId, setPickId] = useState("tokyo");
  const [workStart, setWorkStart] = useState(String(DEFAULT_WORK_START_HOUR));
  const [workEnd, setWorkEnd] = useState(String(DEFAULT_WORK_END_HOUR));
  const [hour12, setHour12] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const zones = useMemo(() => ids.map(presetById).filter(Boolean), [ids]);
  const base = useMemo(() => presetById(baseId) || zones[0] || null, [baseId, zones]);
  const baseTimeZone = base ? base.timeZone : "UTC";

  const workStartHour = Number(workStart);
  const workEndHour = Number(workEnd);

  const rows = useMemo(
    () =>
      zones.map((zone) =>
        describeZone(zone, now, { baseTimeZone, workStartHour, workEndHour, hour12 }),
      ),
    [zones, now, baseTimeZone, workStartHour, workEndHour, hour12],
  );

  const strip = useMemo(
    () => buildOverlapStrip(zones, now, { baseTimeZone, workStartHour, workEndHour }),
    [zones, now, baseTimeZone, workStartHour, workEndHour],
  );

  const baseRow = useMemo(
    () => (base ? describeZone(base, now, { baseTimeZone, workStartHour, workEndHour, hour12 }) : { error: "Pick a home city." }),
    [base, now, baseTimeZone, workStartHour, workEndHour, hour12],
  );

  const error = baseRow.error || strip.error || (rows.find((row) => row.error) || {}).error || null;

  const overlapLabel = useMemo(() => {
    if (error || !strip.bestRun) return null;
    const start = strip.bestRun.startHour;
    const end = (start + strip.bestRun.length) % 24;
    return `${formatClock(start, 0, hour12)} – ${formatClock(end, 0, hour12)}`;
  }, [error, strip, hour12]);

  const available = useMemo(
    () => CITY_PRESETS.filter((preset) => !ids.includes(preset.id)),
    [ids],
  );

  // Derived during render rather than synced with an effect: once a city is on
  // the board it leaves the picker, so fall through to the first still-available
  // option instead of leaving the select pointing at nothing.
  const effectivePick = useMemo(() => {
    if (available.some((preset) => preset.id === pickId)) return pickId;
    return available.length > 0 ? available[0].id : "";
  }, [available, pickId]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const addZone = () => {
    if (!effectivePick || ids.includes(effectivePick) || ids.length >= MAX_ZONES) return;
    setIds((prev) => [...prev, effectivePick]);
  };

  const removeZone = (id) => {
    setIds((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item !== id)));
  };

  const reset = () => {
    setIds(DEFAULT_IDS);
    setBaseId("mumbai");
    setWorkStart(String(DEFAULT_WORK_START_HOUR));
    setWorkEnd(String(DEFAULT_WORK_END_HOUR));
    setHour12(false);
    setCopied(false);
  };

  const copy = async () => {
    const text = buildClipboardText(rows, `World clock — home ${base ? base.city : DASH}`);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Clock className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          World Clock Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Live times, UTC offsets and shared working hours across every city on your board.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="wcd-base">
            Home city (everything is compared to this)
          </label>
          <select
            id="wcd-base"
            className={`${INPUT_CLASS} mt-1`}
            value={baseId}
            onChange={(event) => setBaseId(event.target.value)}
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="wcd-add">
            Add a city
          </label>
          <div className="mt-1 flex gap-2">
            <select
              id="wcd-add"
              className={INPUT_CLASS}
              value={effectivePick}
              onChange={(event) => setPickId(event.target.value)}
              disabled={available.length === 0}
            >
              {available.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.city} · {preset.country}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={addZone}
              disabled={available.length === 0 || ids.length >= MAX_ZONES}
              aria-label="Add selected city to the board"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="wcd-start">
            Working day starts
          </label>
          <select
            id="wcd-start"
            className={`${INPUT_CLASS} mt-1`}
            value={workStart}
            onChange={(event) => setWorkStart(event.target.value)}
          >
            {HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={String(hour)}>
                {formatClock(hour, 0, hour12)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="wcd-end">
            Working day ends
          </label>
          <select
            id="wcd-end"
            className={`${INPUT_CLASS} mt-1`}
            value={workEnd}
            onChange={(event) => setWorkEnd(event.target.value)}
          >
            {HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={String(hour)}>
                {formatClock(hour, 0, hour12)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={GHOST_BTN}
          onClick={() => setHour12((prev) => !prev)}
          aria-label="Toggle between 24-hour and 12-hour clock"
        >
          {hour12 ? "12-hour clock" : "24-hour clock"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the board to the default cities">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the world clock board to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy board"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          {base ? `${base.city} right now` : "Home city"}
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
          {error ? DASH : baseRow.time}
          {!error ? (
            <span className="ml-1 align-baseline text-xl font-semibold text-[var(--muted-foreground)]">
              :{baseRow.seconds}
            </span>
          ) : null}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">UTC offset</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{error ? DASH : baseRow.offsetLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Local date</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${baseRow.weekday} ${String(baseRow.day).padStart(2, "0")}/${String(baseRow.month).padStart(2, "0")}/${baseRow.year}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Cities on board</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{error ? DASH : zones.length}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Longest shared working window</dt>
            <dd
              className={`text-sm font-semibold ${
                !error && overlapLabel ? "text-[var(--success)]" : "text-[var(--foreground)]"
              }`}
            >
              {error ? DASH : overlapLabel ? `${overlapLabel} (${strip.bestRun.length}h)` : "No shared hours"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Board</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row, index) => {
            const zone = zones[index];
            if (!zone) return null;
            if (row.error) {
              return (
                <p
                  key={zone.id}
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  {row.error}
                </p>
              );
            }
            return (
              <article
                key={zone.id}
                className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">{row.city}</p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">{row.country}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeZone(zone.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    aria-label={`Remove ${row.city} from the board`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold tabular-nums text-[var(--foreground)]">
                  {row.isDaylight ? (
                    <Sun className="h-5 w-5 text-[var(--primary)]" aria-label="Daytime" />
                  ) : (
                    <Moon className="h-5 w-5 text-[var(--muted-foreground)]" aria-label="Night-time" />
                  )}
                  {row.time}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {row.offsetLabel} · {row.differenceLabel} · {row.dayShiftLabel}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    row.withinWorkHours ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {row.withinWorkHours ? "Inside working hours" : "Outside working hours"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {!error && strip.slots ? (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
            Overlap strip — hours of {base ? base.city : DASH} down the left
          </h2>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <caption className="sr-only">Local time in each city for every hour of the home city&apos;s day</caption>
              <thead>
                <tr className="bg-[var(--card)]">
                  <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">
                    {base ? base.city : DASH}
                  </th>
                  {zones.map((zone) => (
                    <th key={zone.id} scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">
                      {zone.city}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {strip.slots.map((slot) => (
                  <tr
                    key={slot.baseHour}
                    className={slot.allWorking ? "bg-[var(--success)]/10" : "border-t border-[var(--border)]"}
                  >
                    <th
                      scope="row"
                      className="border-t border-[var(--border)] px-3 py-2 text-left font-semibold tabular-nums text-[var(--foreground)]"
                    >
                      {formatClock(slot.baseHour, 0, hour12)}
                    </th>
                    {slot.cells.map((cell) => (
                      <td
                        key={`${slot.baseHour}-${cell.city}`}
                        className={`border-t border-[var(--border)] px-3 py-2 tabular-nums ${
                          cell.working
                            ? "font-semibold text-[var(--success)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {formatClock(cell.hour, cell.minute, hour12)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Green rows are hours where every city on the board is inside its working day.
          </p>
        </section>
      ) : null}
    </div>
  );
}
