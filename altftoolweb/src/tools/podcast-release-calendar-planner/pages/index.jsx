"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";
import { CADENCES, planSeason, nextWeekdayOnOrAfter, parseISODate, toISODate } from "../lib";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const showDate = (iso) => {
  const ts = parseISODate(iso);
  return ts === null ? "—" : DATE_FMT.format(new Date(ts));
};

const DEFAULTS = {
  startDate: "2026-09-07",
  episodes: "10",
  cadence: "weekly",
  editDays: "5",
  bufferDays: "2",
  breakAfterEpisode: "0",
  breakWeeks: "2",
  batchSize: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [episodes, setEpisodes] = useState(DEFAULTS.episodes);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [editDays, setEditDays] = useState(DEFAULTS.editDays);
  const [bufferDays, setBufferDays] = useState(DEFAULTS.bufferDays);
  const [breakAfter, setBreakAfter] = useState(DEFAULTS.breakAfterEpisode);
  const [breakWeeks, setBreakWeeks] = useState(DEFAULTS.breakWeeks);
  const [batchSize, setBatchSize] = useState(DEFAULTS.batchSize);
  const [today, setToday] = useState("");
  const [touchedStart, setTouchedStart] = useState(false);
  const [copied, setCopied] = useState(false);

  // Rendered on the server with the constant default, then rolled forward to the
  // next Monday after mount, so there is never a hydration mismatch.
  useEffect(() => {
    const nowIso = new Date().toISOString().slice(0, 10);
    setToday(nowIso);
    const ts = parseISODate(nowIso);
    if (ts !== null) setStartDate((current) => (current === DEFAULTS.startDate ? toISODate(nextWeekdayOnOrAfter(ts, 1)) : current));
  }, []);

  const plan = useMemo(
    () =>
      planSeason({
        startDate,
        episodes,
        cadence,
        editDays,
        bufferDays,
        breakAfterEpisode: breakAfter,
        breakWeeks,
        batchSize,
        today,
      }),
    [startDate, episodes, cadence, editDays, bufferDays, breakAfter, breakWeeks, batchSize, today],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      "Podcast release calendar",
      `Cadence: ${plan.cadenceLabel} · ${plan.totalEpisodes} episodes`,
      `First drop: ${plan.firstPublish} (${plan.firstPublishWeekday})`,
      `Season finale: ${plan.lastPublish} (${plan.lastPublishWeekday})`,
      `Production starts: ${plan.productionStart}`,
      "",
      "Ep | Publish | Edit locked | Recorded by",
    ];
    plan.episodes.forEach((episode) => {
      lines.push(
        `${episode.number} | ${episode.publishDate} | ${episode.editDeadline} | ${episode.recordDeadline}`,
      );
    });
    return lines.join("\n");
  }, [plan]);

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
    setStartDate(DEFAULTS.startDate);
    setEpisodes(DEFAULTS.episodes);
    setCadence(DEFAULTS.cadence);
    setEditDays(DEFAULTS.editDays);
    setBufferDays(DEFAULTS.bufferDays);
    setBreakAfter(DEFAULTS.breakAfterEpisode);
    setBreakWeeks(DEFAULTS.breakWeeks);
    setBatchSize(DEFAULTS.batchSize);
    setTouchedStart(false);
    setCopied(false);
  };

  const failed = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Podcast production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Release Calendar Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your first drop date and cadence, and get every publish date plus the edit-lock and
          recording deadline behind it — with batch sessions and a mid-season break built in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-start">
              First publish date
            </label>
            <input
              id="pod-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => {
                setTouchedStart(true);
                setStartDate(event.target.value);
              }}
            />
            {touchedStart ? null : (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Defaults to the next Monday.
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-cadence">
              Release cadence
            </label>
            <select
              id="pod-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            >
              {Object.values(CADENCES).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-episodes">
              Episodes in the season
            </label>
            <input
              id="pod-episodes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="104"
              step="1"
              value={episodes}
              onChange={(event) => setEpisodes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-batch">
              Episodes per recording session
            </label>
            <input
              id="pod-batch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={batchSize}
              onChange={(event) => setBatchSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-edit">
              Edit turnaround (days)
            </label>
            <input
              id="pod-edit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={editDays}
              onChange={(event) => setEditDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-buffer">
              Scheduled-early buffer (days)
            </label>
            <input
              id="pod-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={bufferDays}
              onChange={(event) => setBufferDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-break-after">
              Mid-season break after episode (0 = none)
            </label>
            <input
              id="pod-break-after"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={breakAfter}
              onChange={(event) => setBreakAfter(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-break-weeks">
              Break length (weeks)
            </label>
            <input
              id="pod-break-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="26"
              step="1"
              value={breakWeeks}
              onChange={(event) => setBreakWeeks(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Season finale drops
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : showDate(plan.lastPublish)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the plan."
                : `${plan.totalEpisodes} episodes · ${plan.cadenceLabel.toLowerCase()} · ${NUM.format(plan.seasonSpanWeeks)} weeks on air`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the release calendar"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy calendar"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["First drop", failed ? "—" : `${showDate(plan.firstPublish)} (${plan.firstPublishWeekday})`],
            ["Production starts (first recording due)", failed ? "—" : showDate(plan.productionStart)],
            ["Recording sessions", failed ? "—" : String(plan.sessionCount)],
            [
              "Edit lock",
              failed ? "—" : `${plan.editLeadDays} day(s) of editing + ${plan.bufferLeadDays} day(s) scheduled early`,
            ],
            [
              "Mid-season break",
              failed || !plan.breakStart
                ? failed
                  ? "—"
                  : "None"
                : `${showDate(plan.breakStart)} → ${showDate(plan.breakEnd)}`,
            ],
            [
              "Deadlines already past",
              failed ? "—" : plan.overdueCount > 0 ? `${plan.overdueCount} episode(s)` : "None",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {failed ? null : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Episode grid</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Ep</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Publishes</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Edit locked</th>
                    <th scope="col" className="py-2 font-semibold">Recorded by</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.episodes.map((episode) => (
                    <tr key={episode.number} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {episode.number}
                        {episode.firstAfterBreak ? (
                          <span className="ml-1 text-xs font-medium text-[var(--primary)]">· return</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">
                        {showDate(episode.publishDate)}
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {episode.publishWeekday}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                        {showDate(episode.editDeadline)}
                      </td>
                      <td
                        className={`py-2 ${episode.overdue ? "font-semibold text-[var(--danger)]" : ""}`}
                      >
                        {showDate(episode.recordDeadline)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Batch recording sessions</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Session</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Covers</th>
                    <th scope="col" className="py-2 font-semibold">In the can by</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.sessions.map((session) => (
                    <tr key={session.number} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{session.number}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                        Ep {session.episodes[0]}
                        {session.episodes.length > 1
                          ? `–${session.episodes[session.episodes.length - 1]}`
                          : ""}
                      </td>
                      <td className={`py-2 ${session.overdue ? "font-semibold text-[var(--danger)]" : ""}`}>
                        {showDate(session.recordBy)}
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {session.recordWeekday}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates are calculated in UTC and do not skip public holidays. Check your host&apos;s scheduling
        cut-off — most publish at the time of day you set, in the timezone on your show settings.
      </p>
    </main>
  );
}
