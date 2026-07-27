"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  AUDIENCE_PROFILES,
  DEFAULT_ZONE_IDS,
  MAX_SLOTS_PER_WEEK,
  MIN_SLOTS_PER_WEEK,
  TARGET_ZONES,
  planPostingWeek,
} from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  audienceId: "professionals",
  slotsPerWeek: "4",
  zoneIds: DEFAULT_ZONE_IDS,
};

/** Today as YYYY-MM-DD, used only as the form's starting value. */
function todayIso() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const shiftLabel = (shift) => (shift === 1 ? " (next day)" : shift === -1 ? " (prev day)" : "");

export default function ToolHome() {
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [slotsPerWeek, setSlotsPerWeek] = useState(DEFAULTS.slotsPerWeek);
  const [zoneIds, setZoneIds] = useState(DEFAULTS.zoneIds);
  const [weekStartDate, setWeekStartDate] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planPostingWeek({
        audienceId,
        slotsPerWeek: Number(slotsPerWeek),
        weekStartDate,
        zoneIds,
      }),
    [audienceId, slotsPerWeek, weekStartDate, zoneIds],
  );

  const hasError = Boolean(result.error);

  const toggleZone = (id) => {
    setZoneIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Posting plan — ${result.profile.label}, ${result.slotsPerWeek} posts a week from ${result.weekStartDate}`,
      "",
    ];
    result.plan.forEach((slot) => {
      lines.push(`${slot.dayName} ${slot.istDate} ${slot.istTime} IST — ${slot.window.label}`);
      slot.zones.forEach((zone) => {
        lines.push(`    ${zone.label}: ${zone.time}${shiftLabel(zone.dayShift)}`);
      });
    });
    return lines.join("\n");
  }, [result, hasError]);

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
    setAudienceId(DEFAULTS.audienceId);
    setSlotsPerWeek(DEFAULTS.slotsPerWeek);
    setZoneIds(DEFAULTS.zoneIds);
    setWeekStartDate(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          IST scheduling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Creator Posting Time Planner India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your audience, get a week of posting slots in IST, and see the exact local time each
          slot lands for viewers abroad — daylight saving included.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pt-audience">
              Who your audience mostly is
            </label>
            <select
              id="pt-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audienceId}
              onChange={(event) => setAudienceId(event.target.value)}
            >
              {AUDIENCE_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-slots">
              Posts per week
            </label>
            <input
              id="pt-slots"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SLOTS_PER_WEEK}
              max={MAX_SLOTS_PER_WEEK}
              step="1"
              value={slotsPerWeek}
              onChange={(event) => setSlotsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-start">
              Week starts on
            </label>
            <input
              id="pt-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={weekStartDate}
              onChange={(event) => setWeekStartDate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Audience time zones to show</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TARGET_ZONES.map((zone) => (
              <label
                key={zone.id}
                htmlFor={`pt-zone-${zone.id}`}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              >
                <input
                  id={`pt-zone-${zone.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={zoneIds.includes(zone.id)}
                  onChange={() => toggleZone(zone.id)}
                />
                <span className="min-w-0">{zone.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Best window for this audience
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.topWindow.range}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.topWindow.label} IST · ${result.profile.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the weekly posting plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the posting time planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Slots planned", hasError ? DASH : String(result.plan.length)],
            ["Distinct windows used", hasError ? DASH : String(result.usedWindows)],
            ["Average window strength", hasError ? DASH : PCT.format(result.averageScore)],
            ["Time zones shown", hasError ? DASH : String(result.zones.length)],
            ["India offset", "UTC+05:30, no daylight saving"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.profile.note}
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your week</h2>
            <ol className="mt-4 space-y-3">
              {result.plan.map((slot) => (
                <li
                  key={slot.key}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-[var(--primary-foreground)]">
                      {slot.istTime} IST
                    </span>
                    <span className="text-sm font-semibold">{slot.dayName}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {slot.istDate} · {slot.window.label} ({slot.window.range})
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {slot.window.note}
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left text-sm">
                      <tbody>
                        {slot.zones.map((zone) => (
                          <tr
                            key={zone.id}
                            className="border-b border-[var(--border)] last:border-0"
                          >
                            <td className="py-1.5 pr-3 text-[var(--muted-foreground)]">
                              {zone.label}
                            </td>
                            <td className="py-1.5 text-right font-semibold">
                              {zone.weekday} {zone.time}
                              <span className="font-normal text-[var(--muted-foreground)]">
                                {shiftLabel(zone.dayShift)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">All windows, ranked for this audience</h2>
            <ul className="mt-4 space-y-3">
              {result.ranked.map((window) => (
                <li key={window.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {window.label}{" "}
                      <span className="font-normal text-[var(--muted-foreground)]">
                        {window.range} IST
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      {PCT.format(window.score)}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                    role="img"
                    aria-label={`${window.label}: strength ${PCT.format(window.score)}`}
                  >
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, window.score * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Time-zone conversions are exact and account for daylight saving in the target country. The
        window strengths are a planning heuristic describing when each group is typically free —
        they are not measured platform data, so check them against your own analytics.
      </p>
    </main>
  );
}
