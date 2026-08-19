"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHANNELS,
  IMPACT_LEVELS,
  TIME_ZONES,
  buildMaintenanceAnnouncement,
  formatDuration,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  serviceName: "Payments API",
  reason: "upgrade the primary database and rebuild indexes",
  startDate: "2026-08-15",
  startTime: "03:30",
  timeZone: "Asia/Kolkata",
  durationMinutes: "90",
  bufferMinutes: "15",
  impactId: "partial",
  affectedText: "Card charges\nRefunds\nWebhook delivery",
  rollbackText:
    "If post-migration verification fails we restore the pre-upgrade snapshot and re-point traffic to the previous version. Restore is rehearsed and takes under 20 minutes.",
  statusUrl: "https://status.example.com",
  contact: "oncall@example.com",
  channelId: "status",
  displayZones: ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"],
};

export default function ToolHome() {
  const [serviceName, setServiceName] = useState(DEFAULTS.serviceName);
  const [reason, setReason] = useState(DEFAULTS.reason);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [timeZone, setTimeZone] = useState(DEFAULTS.timeZone);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [bufferMinutes, setBufferMinutes] = useState(DEFAULTS.bufferMinutes);
  const [impactId, setImpactId] = useState(DEFAULTS.impactId);
  const [affectedText, setAffectedText] = useState(DEFAULTS.affectedText);
  const [rollbackText, setRollbackText] = useState(DEFAULTS.rollbackText);
  const [statusUrl, setStatusUrl] = useState(DEFAULTS.statusUrl);
  const [contact, setContact] = useState(DEFAULTS.contact);
  const [channelId, setChannelId] = useState(DEFAULTS.channelId);
  const [displayZones, setDisplayZones] = useState(DEFAULTS.displayZones);
  const [announcedAtIso, setAnnouncedAtIso] = useState("");
  const [copied, setCopied] = useState(false);

  // Read the clock once, on the client only, and hand it to the pure library as an argument.
  useEffect(() => {
    setAnnouncedAtIso(new Date().toISOString());
  }, []);

  const result = useMemo(
    () =>
      buildMaintenanceAnnouncement({
        serviceName,
        reason,
        startDate,
        startTime,
        timeZone,
        durationMinutes: Number(durationMinutes),
        bufferMinutes: Number(bufferMinutes),
        impactId,
        affectedText,
        rollbackText,
        statusUrl,
        contact,
        channelId,
        displayZones,
        announcedAtIso,
      }),
    [
      serviceName,
      reason,
      startDate,
      startTime,
      timeZone,
      durationMinutes,
      bufferMinutes,
      impactId,
      affectedText,
      rollbackText,
      statusUrl,
      contact,
      channelId,
      displayZones,
      announcedAtIso,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleZone = (id) => {
    setDisplayZones((current) =>
      current.includes(id) ? current.filter((zone) => zone !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setServiceName(DEFAULTS.serviceName);
    setReason(DEFAULTS.reason);
    setStartDate(DEFAULTS.startDate);
    setStartTime(DEFAULTS.startTime);
    setTimeZone(DEFAULTS.timeZone);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setBufferMinutes(DEFAULTS.bufferMinutes);
    setImpactId(DEFAULTS.impactId);
    setAffectedText(DEFAULTS.affectedText);
    setRollbackText(DEFAULTS.rollbackText);
    setStatusUrl(DEFAULTS.statusUrl);
    setContact(DEFAULTS.contact);
    setChannelId(DEFAULTS.channelId);
    setDisplayZones(DEFAULTS.displayZones);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Start (UTC)", DASH],
        ["End (UTC)", DASH],
        ["Work / contingency", DASH],
        ["Impact level", DASH],
        ["Update cadence", DASH],
        ["Notice given", DASH],
      ]
    : [
        ["Start (UTC)", result.startIsoUtc],
        ["End (UTC)", result.endIsoUtc],
        [
          "Work / contingency",
          `${formatDuration(result.window.durationMinutes)} + ${formatDuration(result.window.bufferMinutes)}`,
        ],
        ["Impact level", result.impact.label],
        ["Update cadence", result.window.cadence.text],
        [
          "Notice given",
          result.window.noticeMinutes === null
            ? "not calculated"
            : result.window.noticeMinutes < 0
              ? "window already started"
              : formatDuration(result.window.noticeMinutes),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Change communication
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Maintenance Window Announcement Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the window once in your own time zone. The tool restates it in UTC and every
          reader time zone you pick, checks the notice period against the impact level, flags
          daylight-saving changes inside the window, and writes the notice with impact, user
          action, rollback and an update cadence.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mw-service">
              Service name
            </label>
            <input
              id="mw-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mw-reason">
              Reason for the work (optional)
            </label>
            <input
              id="mw-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. upgrade the primary database"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-date">
              Start date
            </label>
            <input
              id="mw-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-time">
              Start time (24-hour)
            </label>
            <input
              id="mw-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mw-zone">
              Those times are in
            </label>
            <select
              id="mw-zone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
            >
              {TIME_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-duration">
              Work length (minutes)
            </label>
            <input
              id="mw-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="5"
              step="5"
              inputMode="numeric"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-buffer">
              Contingency buffer (minutes)
            </label>
            <input
              id="mw-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="5"
              inputMode="numeric"
              value={bufferMinutes}
              onChange={(event) => setBufferMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-impact">
              Expected impact
            </label>
            <select
              id="mw-impact"
              className={`mt-2 ${INPUT_CLASS}`}
              value={impactId}
              onChange={(event) => setImpactId(event.target.value)}
            >
              {IMPACT_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-channel">
              Channel
            </label>
            <select
              id="mw-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
            >
              {CHANNELS.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mw-affected">
              Affected services or features — one per line
            </label>
            <textarea
              id="mw-affected"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={affectedText}
              onChange={(event) => setAffectedText(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mw-rollback">
              Rollback statement
            </label>
            <textarea
              id="mw-rollback"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={rollbackText}
              onChange={(event) => setRollbackText(event.target.value)}
              placeholder="What is restored, how long it takes, who decides"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-status">
              Status page URL (optional)
            </label>
            <input
              id="mw-status"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={statusUrl}
              onChange={(event) => setStatusUrl(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mw-contact">
              Contact during the window (optional)
            </label>
            <input
              id="mw-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={LABEL_CLASS}>Show local times for</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TIME_ZONES.map((zone) => (
                <label
                  key={zone.id}
                  htmlFor={`mw-zone-${zone.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  <input
                    id={`mw-zone-${zone.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={displayZones.includes(zone.id)}
                    onChange={() => toggleZone(zone.id)}
                  />
                  <span>{zone.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total window length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.window.totalMinutes)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.startIsoUtc} to ${result.endIsoUtc}, published as a ${result.channel.label.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated maintenance announcement"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy announcement"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <caption className="sr-only">Window start and end in each selected time zone</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Time zone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Starts
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Ends
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.startTable.map((zone, index) => (
                  <tr key={zone.id} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium">
                      {zone.label}
                    </th>
                    <td className="py-2 pr-3 whitespace-nowrap">{zone.readable}</td>
                    <td className="py-2 whitespace-nowrap">
                      {result.endTable[index] ? result.endTable[index].readable : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Announcement
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Times are converted through the IANA Time Zone Database, so daylight-saving rules for the
        chosen zone are applied automatically, and UTC instants are printed in the ISO 8601 /
        RFC 3339 form ending in Z. The notice-period warning compares your lead time against the
        advance notice commonly written into enterprise maintenance clauses — check your own
        agreement before publishing.
      </p>
    </main>
  );
}
