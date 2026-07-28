"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, X } from "lucide-react";

import {
  COMMON_ZONES,
  dateISOInZone,
  formatOffset,
  isValidTimeZone,
  listSupportedTimeZones,
  MAX_ZONES,
  planMeeting,
  STEP_CHOICES,
} from "../lib";

const DASH = "—";

/** Rendered on the server and on the first client paint so hydration matches. */
const FALLBACK_DATE = "2026-01-15";
const FALLBACK_HOME = "Europe/London";

const DEFAULT_ZONES = ["Europe/London", "Asia/Kolkata", "America/New_York"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const QUALITY_CLASS = {
  good: "bg-[var(--success-soft)] text-[var(--success)]",
  fair: "bg-[var(--warning-soft)] text-[var(--warning)]",
  poor: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const zoneLabel = (tz) =>
  COMMON_ZONES.find((z) => z.timeZone === tz)?.label ?? tz.split("/").pop().replace(/_/g, " ");

/** No-op subscription: the "is this the client yet" flag never changes after hydration. */
const neverChanges = () => () => {};

/**
 * Captured once when this module is loaded rather than during a render, so the
 * default date stays stable across re-renders. On the client that is the moment
 * the page hydrates, which is what "today" should mean here.
 */
const LOADED_AT_MS = Date.now();

export default function ToolHome() {
  // false while server-rendering and on the first client paint, true after
  // hydration — so browser-only values can be read without a mismatch.
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  const defaults = useMemo(() => {
    if (!hydrated) {
      return {
        home: FALLBACK_HOME,
        date: FALLBACK_DATE,
        allZones: COMMON_ZONES.map((z) => z.timeZone),
      };
    }
    let home = FALLBACK_HOME;
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (isValidTimeZone(resolved)) home = resolved;
    } catch {
      home = FALLBACK_HOME;
    }
    return {
      home,
      date: dateISOInZone(home, LOADED_AT_MS) ?? FALLBACK_DATE,
      allZones: listSupportedTimeZones(),
    };
  }, [hydrated]);

  const [dateOverride, setDateOverride] = useState(null);
  const [homeOverride, setHomeOverride] = useState(null);
  const [zoneOverride, setZoneOverride] = useState(null);
  const [duration, setDuration] = useState("60");
  const [stepMinutes, setStepMinutes] = useState("30");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [clock12, setClock12] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateISO = dateOverride ?? defaults.date;
  const homeZone = homeOverride ?? defaults.home;
  const allZones = defaults.allZones;
  const zones = useMemo(() => {
    if (zoneOverride) return zoneOverride;
    return DEFAULT_ZONES.includes(defaults.home)
      ? DEFAULT_ZONES
      : [defaults.home, ...DEFAULT_ZONES].slice(0, MAX_ZONES);
  }, [zoneOverride, defaults.home]);

  const setDateISO = setDateOverride;
  const setHomeZone = setHomeOverride;

  const zoneObjects = useMemo(
    () => zones.map((tz) => ({ timeZone: tz, label: zoneLabel(tz) })),
    [zones],
  );

  const result = useMemo(
    () =>
      planMeeting({
        dateISO,
        homeTimeZone: homeZone,
        zones: zoneObjects,
        durationMinutes: Number(duration),
        stepMinutes: Number(stepMinutes),
        workStart,
        workEnd,
      }),
    [dateISO, homeZone, zoneObjects, duration, stepMinutes, workStart, workEnd],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const addZone = (tz) => {
    if (!tz || zones.includes(tz) || zones.length >= MAX_ZONES) return;
    setZoneOverride([...zones, tz]);
  };

  const removeZone = (tz) => {
    if (zones.length <= 1) return;
    setZoneOverride(zones.filter((z) => z !== tz));
  };

  const reset = () => {
    setZoneOverride(null);
    setDuration("60");
    setStepMinutes("30");
    setWorkStart("09:00");
    setWorkEnd("17:00");
    setClock12(false);
    setCopied(false);
  };

  const t = (zone) => (clock12 ? `${zone.start12} – ${zone.end12}` : `${zone.start24}–${zone.end24}`);

  const copy = async () => {
    if (!ok || !result.bestSlot) return;
    const slot = result.bestSlot;
    const lines = [
      `Best meeting slot on ${result.dateISO}`,
      `Length: ${result.durationMinutes} minutes`,
      `Score: ${slot.score} of ${result.maxScore}`,
      "",
      ...slot.zones.map(
        (z) =>
          `${z.label} (${formatOffset(z.offsetMinutes)}): ${t(z)}${z.dayShiftDays === 0 ? "" : z.dayShiftDays > 0 ? " next day" : " previous day"} — ${z.quality}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const visibleSlots = ok ? result.slots.filter((s) => s.score > 0) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Time Zone Meeting Planner</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add everyone&apos;s time zone and see which slots on a chosen day sit inside working
            hours for all of them. Daylight saving and half-hour offsets are handled for you.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-date">
            Meeting date
          </label>
          <input
            id="tzm-date"
            type="date"
            className={`${INPUT_CLASS} mt-1`}
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
          <p className={HINT_CLASS}>Read in your home zone below.</p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-home">
            Your home zone
          </label>
          <select
            id="tzm-home"
            className={`${INPUT_CLASS} mt-1`}
            value={homeZone}
            onChange={(e) => setHomeZone(e.target.value)}
          >
            {allZones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-duration">
            Meeting length (minutes)
          </label>
          <input
            id="tzm-duration"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-step">
            Slot spacing
          </label>
          <select
            id="tzm-step"
            className={`${INPUT_CLASS} mt-1`}
            value={stepMinutes}
            onChange={(e) => setStepMinutes(e.target.value)}
          >
            {STEP_CHOICES.map((s) => (
              <option key={s} value={String(s)}>
                Every {s} minutes
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-start">
            Working day starts
          </label>
          <input
            id="tzm-start"
            type="time"
            className={`${INPUT_CLASS} mt-1`}
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tzm-end">
            Working day ends
          </label>
          <input
            id="tzm-end"
            type="time"
            className={`${INPUT_CLASS} mt-1`}
            value={workEnd}
            onChange={(e) => setWorkEnd(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="tzm-add">
            Add a participant&apos;s time zone
          </label>
          <div className="mt-1 flex gap-2">
            <select
              id="tzm-add"
              className={INPUT_CLASS}
              value=""
              onChange={(e) => addZone(e.target.value)}
            >
              <option value="">Choose a zone…</option>
              {allZones
                .filter((tz) => !zones.includes(tz))
                .map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
            </select>
            <span className={`${GHOST_BTN} pointer-events-none whitespace-nowrap`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {zones.length}/{MAX_ZONES}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {zones.map((tz) => (
              <span
                key={tz}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)]"
              >
                {zoneLabel(tz)}
                <button
                  type="button"
                  onClick={() => removeZone(tz)}
                  aria-label={`Remove ${zoneLabel(tz)} from the plan`}
                  className="rounded p-1 text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <label
          className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] sm:col-span-2"
          htmlFor="tzm-12h"
        >
          <input
            id="tzm-12h"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={clock12}
            onChange={(e) => setClock12(e.target.checked)}
          />
          Show times in 12-hour format
        </label>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Best slot</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {ok && result.bestSlot
            ? clock12
              ? result.bestSlot.home12
              : result.bestSlot.home24
            : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok && result.bestSlot
            ? `${zoneLabel(result.homeTimeZone)} time on ${result.dateISO} — scores ${result.bestScore} of ${result.maxScore}`
            : "Fix the settings above to see a result."}
        </p>

        {ok && result.bestSlot ? (
          <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {result.bestSlot.zones.map((z) => (
              <div
                key={z.timeZone}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2"
              >
                <dt className="text-sm text-[var(--muted-foreground)]">
                  {z.label}{" "}
                  <span className="text-xs">({formatOffset(z.offsetMinutes)})</span>
                </dt>
                <dd className="text-right text-sm font-semibold text-[var(--foreground)]">
                  {t(z)}
                  {z.dayShiftDays !== 0 ? (
                    <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                      {z.dayShiftDays > 0 ? "next day" : "prev day"}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 sm:col-span-2">
              <dt className="text-sm text-[var(--muted-foreground)]">
                Slots where everyone is inside working hours
              </dt>
              <dd
                className={`text-sm font-semibold ${result.perfectSlotCount > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                {result.perfectSlotCount}
              </dd>
            </div>
          </dl>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the best meeting slot to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the planner to its defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Every workable slot</h2>
        <p className={HINT_CLASS}>
          Green means the whole meeting sits inside working hours, amber means it spills up to an
          hour either side, red means it does not work. Slots where nobody is available are hidden.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-3 py-2 font-semibold">Your time</th>
                {ok
                  ? zoneObjects.map((z) => (
                      <th key={z.timeZone} scope="col" className="px-3 py-2 font-semibold">
                        {z.label}
                      </th>
                    ))
                  : null}
                <th scope="col" className="px-3 py-2 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {visibleSlots.length > 0 ? (
                visibleSlots.map((slot) => (
                  <tr key={slot.utcISO} className="border-t border-[var(--border)]">
                    <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-semibold text-[var(--foreground)]">
                      {clock12 ? slot.home12 : slot.home24}
                    </th>
                    {slot.zones.map((z) => (
                      <td key={z.timeZone} className="px-3 py-2">
                        <span
                          className={`inline-block whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${QUALITY_CLASS[z.quality]}`}
                        >
                          {clock12 ? z.start12 : z.start24}
                          {z.dayShiftDays !== 0 ? (z.dayShiftDays > 0 ? " +1d" : " −1d") : ""}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-semibold text-[var(--foreground)]">
                      {slot.score}/{result.maxScore}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-[var(--border)]">
                  <td className="px-3 py-3 text-[var(--muted-foreground)]" colSpan={(ok ? zoneObjects.length : 0) + 2}>
                    {ok
                      ? "No slot on this day works for anyone — widen the working hours or shorten the meeting."
                      : DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
