"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Check, Copy, RotateCcw } from "lucide-react";
import {
  MAJOR_ZONE_IDS,
  MEETING_MAX_WEEKS,
  MEETING_MAX_ZONES,
  MEETING_MIN_WEEKS,
  MAX_YEAR,
  MIN_YEAR,
  NO_DST_SURVEY_ZONE_IDS,
  TZDB_VERSION,
  ZONE_PRESETS,
  buildMeetingClipboard,
  describeTransition,
  formatClock,
  formatDuration,
  formatMagnitude,
  formatOffset,
  formatWallClock,
  meetingSafetyCheck,
  nextTransition,
  parseISODate,
  resolveLocalTime,
  yearChangeTable,
} from "../lib";

const DASH = "—";

/**
 * First paint is deterministic — no clock read during render, so the server and
 * the browser agree. "Use today" fills the browser's date from a click handler.
 */
const DEFAULT_REFERENCE_DATE = "2026-07-29";
const DEFAULT_ZONE = "America/New_York";
const DEFAULT_YEAR = 2026;

const DEFAULT_MEETING = {
  anchorZone: "America/New_York",
  otherZones: ["Europe/London", "Asia/Kolkata"],
  localTime: "09:00",
  startDate: "2026-02-05",
  weeks: 26,
};

const DEFAULT_CHECK = {
  zone: "America/New_York",
  date: "2026-03-08",
  time: "02:30",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PANEL = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_BOX =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";
const TH = "px-3 py-2 text-left font-semibold whitespace-nowrap";
const TD = "px-3 py-2 whitespace-nowrap";

const zoneLabel = (id) => {
  const preset = ZONE_PRESETS.find((z) => z.id === id);
  return preset ? `${preset.label} — ${id}` : id;
};

const shortZone = (id) => {
  const preset = ZONE_PRESETS.find((z) => z.id === id);
  return preset ? preset.label : id;
};

function ZoneSelect({ id, value, onChange, label }) {
  return (
    <div>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`${INPUT} mt-1`} value={value} onChange={(e) => onChange(e.target.value)}>
        {ZONE_PRESETS.map((z) => (
          <option key={z.id} value={z.id}>
            {z.label} · {z.region}
          </option>
        ))}
      </select>
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className={GHOST_BTN} onClick={onCopy} aria-label={label} disabled={!text}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Row({ term, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{term}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)] text-right">{children}</dd>
    </div>
  );
}

export default function ToolHome() {
  /* ---- Panel 1: next clock change ---- */
  const [zone, setZone] = useState(DEFAULT_ZONE);
  const [referenceDate, setReferenceDate] = useState(DEFAULT_REFERENCE_DATE);

  const nextResult = useMemo(() => {
    const parsed = parseISODate(referenceDate);
    if (!parsed) return { error: "Reference date must be a real date written as YYYY-MM-DD." };
    return nextTransition({
      zone,
      fromMs: Date.UTC(parsed.year, parsed.month - 1, parsed.day),
    });
  }, [zone, referenceDate]);

  const nextError = nextResult.error || null;
  const upcoming = !nextError ? nextResult.transition : null;

  /* ---- Panel 2: meeting safety check ---- */
  const [anchorZone, setAnchorZone] = useState(DEFAULT_MEETING.anchorZone);
  const [otherZones, setOtherZones] = useState(DEFAULT_MEETING.otherZones);
  const [meetingTime, setMeetingTime] = useState(DEFAULT_MEETING.localTime);
  const [meetingStart, setMeetingStart] = useState(DEFAULT_MEETING.startDate);
  const [weeks, setWeeks] = useState(String(DEFAULT_MEETING.weeks));

  const meeting = useMemo(
    () =>
      meetingSafetyCheck({
        anchorZone,
        otherZones,
        localTime: meetingTime,
        startDate: meetingStart,
        weeks: Number(weeks),
      }),
    [anchorZone, otherZones, meetingTime, meetingStart, weeks],
  );
  const meetingError = meeting.error || null;
  const meetingText = meetingError ? "" : buildMeetingClipboard(meeting);

  const setOtherZone = (index, value) =>
    setOtherZones((current) => current.map((z, i) => (i === index ? value : z)));
  const removeOtherZone = (index) =>
    setOtherZones((current) => current.filter((_, i) => i !== index));
  const addOtherZone = () =>
    setOtherZones((current) => {
      if (current.length + 1 >= MEETING_MAX_ZONES) return current;
      const spare = ZONE_PRESETS.find((z) => z.id !== anchorZone && !current.includes(z.id));
      return spare ? [...current, spare.id] : current;
    });

  const resetMeeting = () => {
    setAnchorZone(DEFAULT_MEETING.anchorZone);
    setOtherZones(DEFAULT_MEETING.otherZones);
    setMeetingTime(DEFAULT_MEETING.localTime);
    setMeetingStart(DEFAULT_MEETING.startDate);
    setWeeks(String(DEFAULT_MEETING.weeks));
  };

  /* ---- Panel 3: does this local time exist? ---- */
  const [checkZone, setCheckZone] = useState(DEFAULT_CHECK.zone);
  const [checkDate, setCheckDate] = useState(DEFAULT_CHECK.date);
  const [checkTime, setCheckTime] = useState(DEFAULT_CHECK.time);

  const checkResult = useMemo(() => {
    const parsedDate = parseISODate(checkDate);
    if (!parsedDate) return { error: "Date must be a real date written as YYYY-MM-DD." };
    const m = /^(\d{1,2}):(\d{2})$/.exec(checkTime.trim());
    if (!m) return { error: "Time must look like 02:30 on a 24-hour clock." };
    return resolveLocalTime({
      zone: checkZone,
      year: parsedDate.year,
      month: parsedDate.month,
      day: parsedDate.day,
      hour: Number(m[1]),
      minute: Number(m[2]),
    });
  }, [checkZone, checkDate, checkTime]);
  const checkError = checkResult.error || null;

  /* ---- Panel 4 & 5: year table + zones that do not change ---- */
  const [year, setYear] = useState(String(DEFAULT_YEAR));
  const yearTable = useMemo(
    () => yearChangeTable({ zones: MAJOR_ZONE_IDS, year: Number(year) }),
    [year],
  );
  const surveyTable = useMemo(
    () => yearChangeTable({ zones: NO_DST_SURVEY_ZONE_IDS, year: Number(year) }),
    [year],
  );
  const yearError = yearTable.error || surveyTable.error || null;

  const nextSummary = nextError || !upcoming ? "" : describeTransition(upcoming);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 text-[var(--foreground)]">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <AlarmClock className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Clock Changes &amp; DST Tracker
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Every instant on this page is read straight out of the IANA time zone database (tzdb{" "}
          {TZDB_VERSION}) bundled with this site. Nothing is typed by hand, and nothing leaves your browser.
        </p>
      </header>

      {/* ---------------- Next clock change ---------------- */}
      <section className="mb-8" aria-labelledby="next-heading">
        <h2 id="next-heading" className="mb-3 text-lg font-bold">
          Next clock change in a zone
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ZoneSelect id="next-zone" label="Time zone" value={zone} onChange={setZone} />
          <div>
            <label className={LABEL} htmlFor="reference-date">
              Look forward from
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="reference-date"
                type="date"
                className={INPUT}
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
              />
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => setReferenceDate(new Date().toISOString().slice(0, 10))}
              >
                Today
              </button>
            </div>
          </div>
        </div>

        <div className={`${PANEL} mt-4`} aria-live="polite">
          {nextError ? (
            <p className={ERROR_BOX} role="alert">
              {nextError}
            </p>
          ) : null}

          <p className="text-sm text-[var(--muted-foreground)]">
            {upcoming && !nextError
              ? upcoming.direction === "forward"
                ? "Clocks go forward"
                : "Clocks go back"
              : "Next clock change"}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--primary)]">
            {nextError || !upcoming ? DASH : formatWallClock(upcoming.localBefore)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {nextError || !upcoming
              ? "No upcoming change in the database for this zone."
              : `local wall clock in ${shortZone(zone)} — the clock then reads ${formatClock(upcoming.localAfter)}`}
          </p>

          <dl className="mt-4">
            <Row term="Shift">
              {nextError || !upcoming
                ? DASH
                : `${upcoming.direction === "forward" ? "forward" : "back"} ${formatMagnitude(upcoming.deltaMinutes)}`}
            </Row>
            <Row term="UTC offset before → after">
              {nextError || !upcoming
                ? DASH
                : `${formatOffset(upcoming.offsetBefore)} → ${formatOffset(upcoming.offsetAfter)}`}
            </Row>
            <Row term="Abbreviation">
              {nextError || !upcoming ? DASH : `${upcoming.abbrBefore} → ${upcoming.abbrAfter}`}
            </Row>
            <Row term="Exact UTC instant">{nextError || !upcoming ? DASH : upcoming.utcISO}</Row>
            <Row term="Days away">
              {nextError || nextResult.daysUntil === null || nextResult.daysUntil === undefined
                ? DASH
                : `${nextResult.daysUntil} days`}
            </Row>
            <Row term="Offset right now in this view">
              {nextError ? DASH : `${nextResult.currentOffsetLabel} (${nextResult.currentAbbr})`}
            </Row>
            <Row term={upcoming && upcoming.direction === "forward" ? "Hour that disappears" : "Hour that repeats"}>
              {nextError || !upcoming
                ? DASH
                : upcoming.direction === "forward"
                  ? `${formatClock(upcoming.localBefore)} to ${formatClock(upcoming.localAfter)} never happens`
                  : `${formatClock(upcoming.localAfter)} to ${formatClock(upcoming.localBefore)} happens twice`}
            </Row>
            <Row term="Previous change in this zone">
              {nextError || !nextResult.lastTransition
                ? DASH
                : `${formatWallClock(nextResult.lastTransition.localBefore)} (${formatDuration(nextResult.lastTransition.deltaMinutes)})`}
            </Row>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={nextSummary} label="Copy the next clock change details" />
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setZone(DEFAULT_ZONE);
                setReferenceDate(DEFAULT_REFERENCE_DATE);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- Meeting safety check ---------------- */}
      <section className="mb-8" aria-labelledby="meeting-heading">
        <h2 id="meeting-heading" className="text-lg font-bold">
          Meeting safety check
        </h2>
        <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
          A weekly meeting keeps its local time in one zone. Because regions switch on different weekends —
          the United States on the second Sunday of March, the European Union on the last Sunday of March —
          the gap to everyone else moves for a few weeks. These are the dates it moves.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ZoneSelect
            id="anchor-zone"
            label="Meeting time is written in"
            value={anchorZone}
            onChange={setAnchorZone}
          />
          <div>
            <label className={LABEL} htmlFor="meeting-time">
              Local start time (24-hour)
            </label>
            <input
              id="meeting-time"
              type="time"
              className={`${INPUT} mt-1`}
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="meeting-start">
              First occurrence
            </label>
            <input
              id="meeting-start"
              type="date"
              className={`${INPUT} mt-1`}
              value={meetingStart}
              onChange={(e) => setMeetingStart(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="meeting-weeks">
              Weeks to scan ({MEETING_MIN_WEEKS}–{MEETING_MAX_WEEKS})
            </label>
            <input
              id="meeting-weeks"
              type="number"
              inputMode="numeric"
              min={MEETING_MIN_WEEKS}
              max={MEETING_MAX_WEEKS}
              className={`${INPUT} mt-1`}
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
            />
          </div>
          {otherZones.map((z, i) => (
            <div key={`other-${i}`} className="flex items-end gap-2">
              <div className="flex-1">
                <ZoneSelect
                  id={`other-zone-${i}`}
                  label={`Compare with zone ${i + 1}`}
                  value={z}
                  onChange={(v) => setOtherZone(i, v)}
                />
              </div>
              {otherZones.length > 1 ? (
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => removeOtherZone(i)}
                  aria-label={`Remove ${zoneLabel(z)}`}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {otherZones.length + 1 < MEETING_MAX_ZONES ? (
            <button type="button" className={GHOST_BTN} onClick={addOtherZone}>
              Add a zone
            </button>
          ) : null}
          <button type="button" className={GHOST_BTN} onClick={resetMeeting}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className={`${PANEL} mt-4`} aria-live="polite">
          {meetingError ? (
            <p className={ERROR_BOX} role="alert">
              {meetingError}
            </p>
          ) : null}

          <p className="text-sm text-[var(--muted-foreground)]">Weeks where the gap changes</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--primary)]">
            {meetingError ? DASH : meeting.changeCount}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {meetingError
              ? "Fix the inputs above to see the scan."
              : `${meeting.localTime} ${shortZone(meeting.anchorZone)}, every ${meeting.weekday} from ${meeting.firstDate} to ${meeting.lastDate}`}
          </p>

          {!meetingError && meeting.changeCount === 0 ? (
            <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
              The gap between these zones is the same at every occurrence in this window.
            </p>
          ) : null}

          {!meetingError && meeting.changes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {meeting.changes.map((c) => (
                <li key={c.date} className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-sm font-bold tabular-nums">{c.date}</p>
                  {c.movedZones.map((z) => (
                    <p key={z.zone} className="mt-1 text-sm text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">{shortZone(z.zone)}</span>{" "}
                      moves from {z.previousGapLabel} to {z.gapLabel} against {shortZone(meeting.anchorZone)} —
                      the local start time changes from {z.previousClockLabel} to {z.clockLabel} (
                      {z.gapDeltaLabel}).
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          ) : null}

          {!meetingError && meeting.flaggedOccurrences.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {meeting.flaggedOccurrences.map((o) => (
                <li
                  key={`flag-${o.date}`}
                  className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
                >
                  {o.date}: {meeting.localTime} in {shortZone(meeting.anchorZone)}{" "}
                  {o.anchorStatus === "nonexistent"
                    ? "does not exist — it falls inside the hour the clocks skip. The row below uses the instant the clocks jump to."
                    : "happens twice — it falls inside the repeated hour. The row below uses the first occurrence."}
                </li>
              ))}
            </ul>
          ) : null}

          {!meetingError ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <caption className="sr-only">Local start time of every occurrence in each zone</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th scope="col" className={TH}>
                      Date
                    </th>
                    {meeting.zones.map((z) => (
                      <th scope="col" key={z} className={TH}>
                        {shortZone(z)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meeting.occurrences.map((o) => (
                    <tr key={o.date} className="border-b border-[var(--border)] last:border-b-0">
                      <th scope="row" className={`${TD} text-left font-semibold tabular-nums`}>
                        {o.date}
                      </th>
                      {o.rows.map((r) => (
                        <td key={r.zone} className={`${TD} tabular-nums`}>
                          {r.clockLabel}
                          {r.dayShift === 0 ? "" : r.dayShift > 0 ? " (+1 d)" : " (−1 d)"}{" "}
                          <span className="text-[var(--muted-foreground)]">{r.abbr}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-4">
            <CopyButton text={meetingText} label="Copy the meeting safety check" />
          </div>
        </div>
      </section>

      {/* ---------------- Does this local time exist? ---------------- */}
      <section className="mb-8" aria-labelledby="check-heading">
        <h2 id="check-heading" className="text-lg font-bold">
          Does this local time exist?
        </h2>
        <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
          On a spring-forward morning an hour of the local clock never happens; on a fall-back morning an hour
          happens twice. Both break calendar invites and cron jobs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ZoneSelect id="check-zone" label="Time zone" value={checkZone} onChange={setCheckZone} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="check-date">
                Date
              </label>
              <input
                id="check-date"
                type="date"
                className={`${INPUT} mt-1`}
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="check-time">
                Local time
              </label>
              <input
                id="check-time"
                type="time"
                className={`${INPUT} mt-1`}
                value={checkTime}
                onChange={(e) => setCheckTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`${PANEL} mt-4`} aria-live="polite">
          {checkError ? (
            <p className={ERROR_BOX} role="alert">
              {checkError}
            </p>
          ) : null}
          <p className="text-sm text-[var(--muted-foreground)]">Verdict</p>
          <p className="mt-1 text-3xl font-bold text-[var(--primary)]">
            {checkError
              ? DASH
              : checkResult.status === "unique"
                ? "Happens once"
                : checkResult.status === "nonexistent"
                  ? "Never happens"
                  : "Happens twice"}
          </p>
          <dl className="mt-4">
            <Row term="Local reading">{checkError ? DASH : checkResult.wallLabel}</Row>
            {!checkError && checkResult.status === "unique" ? (
              <Row term="UTC instant">
                {checkResult.chosen.utcISO} · {checkResult.chosen.abbr} {checkResult.chosen.offsetLabel}
              </Row>
            ) : null}
            {!checkError && checkResult.status === "ambiguous" ? (
              <>
                <Row term="First occurrence">
                  {checkResult.firstOccurrence.utcISO} · {checkResult.firstOccurrence.abbr}{" "}
                  {checkResult.firstOccurrence.offsetLabel}
                </Row>
                <Row term="Second occurrence">
                  {checkResult.secondOccurrence.utcISO} · {checkResult.secondOccurrence.abbr}{" "}
                  {checkResult.secondOccurrence.offsetLabel}
                </Row>
                <Row term="Apart by">{formatMagnitude(checkResult.repeatGapMinutes)}</Row>
              </>
            ) : null}
            {!checkError && checkResult.status === "nonexistent" ? (
              <>
                <Row term="Clock skips from">
                  {checkResult.transition ? formatClock(checkResult.transition.localBefore) : DASH}
                </Row>
                <Row term="Straight to">
                  {checkResult.transition ? formatClock(checkResult.transition.localAfter) : DASH}
                </Row>
                <Row term="Instant of the jump">
                  {checkResult.chosen ? checkResult.chosen.utcISO : DASH}
                </Row>
              </>
            ) : null}
            <Row term="Governing clock change">
              {checkError || !checkResult.transition
                ? "None nearby"
                : `${formatWallClock(checkResult.transition.localBefore)} · ${formatDuration(checkResult.transition.deltaMinutes)}`}
            </Row>
          </dl>
          <div className="mt-4">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={() => {
                setCheckZone(DEFAULT_CHECK.zone);
                setCheckDate(DEFAULT_CHECK.date);
                setCheckTime(DEFAULT_CHECK.time);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset to the classic gap
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- Year at a glance ---------------- */}
      <section className="mb-8" aria-labelledby="year-heading">
        <h2 id="year-heading" className="text-lg font-bold">
          A full year of clock changes
        </h2>
        <div className="mt-3 max-w-xs">
          <label className={LABEL} htmlFor="year-input">
            Year ({MIN_YEAR}–{MAX_YEAR})
          </label>
          <input
            id="year-input"
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={MAX_YEAR}
            className={`${INPUT} mt-1`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div className={`${PANEL} mt-4`}>
          {yearError ? (
            <p className={ERROR_BOX} role="alert">
              {yearError}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Clock changes by zone for the chosen year</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th scope="col" className={TH}>
                      Zone
                    </th>
                    <th scope="col" className={TH}>
                      Change
                    </th>
                    <th scope="col" className={TH}>
                      Local instant
                    </th>
                    <th scope="col" className={TH}>
                      Shift
                    </th>
                    <th scope="col" className={TH}>
                      Offset after
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearTable.rows.map((row) =>
                    row.changeCount === 0 ? (
                      <tr key={row.zone} className="border-b border-[var(--border)]">
                        <th scope="row" className={`${TD} text-left font-semibold`}>
                          {shortZone(row.zone)}
                        </th>
                        <td className={TD} colSpan={4}>
                          {row.statusLabel}
                        </td>
                      </tr>
                    ) : (
                      row.changes.map((t, i) => (
                        <tr key={`${row.zone}-${t.utcISO}`} className="border-b border-[var(--border)]">
                          {i === 0 ? (
                            <th
                              scope="row"
                              rowSpan={row.changes.length}
                              className={`${TD} align-top text-left font-semibold`}
                            >
                              {shortZone(row.zone)}
                            </th>
                          ) : null}
                          <td className={TD}>{t.direction === "forward" ? "Forward" : "Back"}</td>
                          <td className={`${TD} tabular-nums`}>{formatWallClock(t.localBefore)}</td>
                          <td className={`${TD} tabular-nums`}>{formatMagnitude(t.deltaMinutes)}</td>
                          <td className={`${TD} tabular-nums`}>
                            {formatOffset(t.offsetAfter)} ({t.abbrAfter})
                          </td>
                        </tr>
                      ))
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Zones that do not change ---------------- */}
      <section className="mb-4" aria-labelledby="survey-heading">
        <h2 id="survey-heading" className="text-lg font-bold">
          Who has stopped changing their clocks
        </h2>
        <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
          The database records the last time each zone actually moved its clock. A zone with no change in the
          chosen year is either one that abolished seasonal time or one that never adopted it.
        </p>
        <div className={PANEL}>
          {yearError ? (
            <p className={ERROR_BOX} role="alert">
              {yearError}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <caption className="sr-only">Clock-change status by zone</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th scope="col" className={TH}>
                      Zone
                    </th>
                    <th scope="col" className={TH}>
                      Region
                    </th>
                    <th scope="col" className={TH}>
                      Status in {surveyTable.year}
                    </th>
                    <th scope="col" className={TH}>
                      Standard offset
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {surveyTable.rows.map((row) => {
                    const preset = ZONE_PRESETS.find((z) => z.id === row.zone);
                    return (
                      <tr key={row.zone} className="border-b border-[var(--border)] last:border-b-0">
                        <th scope="row" className={`${TD} text-left font-semibold`}>
                          {shortZone(row.zone)}
                        </th>
                        <td className={TD}>{preset ? preset.region : DASH}</td>
                        <td className={TD}>{row.statusLabel}</td>
                        <td className={`${TD} tabular-nums`}>{row.standardOffsetLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Rules beyond the current year are the database projecting today&apos;s law forward, not a guarantee —
          Egypt reinstated summer time in 2023 and Iran dropped it in 2022, and each such law lands in a new
          tzdb release. Source for every figure above: IANA tzdb {TZDB_VERSION}, as bundled with this page.
        </p>
      </section>
    </div>
  );
}
