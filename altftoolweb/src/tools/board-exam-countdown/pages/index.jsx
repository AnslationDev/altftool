"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, School } from "lucide-react";

import {
  BOARD_PASS_PERCENT,
  BOARD_PRESETS,
  PAPER_DURATION_MINUTES,
  READING_TIME_MINUTES,
  buildDatesheet,
  requiredTheoryMarks,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Default datesheet spacing so a real result shows at first paint. */
const DEFAULT_DATES = ["2027-02-17", "2027-02-20", "2027-02-24", "2027-03-01", "2027-03-05"];
const DEFAULT_HOURS = "6";
const DEFAULT_TARGET = "90";
const DEFAULT_INTERNAL = "18";

const buildPapers = (presetId) => {
  const preset = BOARD_PRESETS.find((entry) => entry.id === presetId) ?? BOARD_PRESETS[0];
  return preset.papers.map((paper, index) => ({
    ...paper,
    date: DEFAULT_DATES[index % DEFAULT_DATES.length],
  }));
};

export default function ToolHome() {
  const [todayISO] = useState(() => toLocalISODate(new Date()));
  const [presetId, setPresetId] = useState(BOARD_PRESETS[0].id);
  const [papers, setPapers] = useState(() => buildPapers(BOARD_PRESETS[0].id));
  const [studyHours, setStudyHours] = useState(DEFAULT_HOURS);
  const [targetPercent, setTargetPercent] = useState(DEFAULT_TARGET);
  const [marksPaperId, setMarksPaperId] = useState(BOARD_PRESETS[0].papers[0].id);
  const [internalSecured, setInternalSecured] = useState(DEFAULT_INTERNAL);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () => buildDatesheet({ todayISO, papers, studyHoursPerDay: Number(studyHours) }),
    [todayISO, papers, studyHours],
  );

  const marksPaper = papers.find((paper) => paper.id === marksPaperId) ?? papers[0];
  const marks = useMemo(
    () =>
      requiredTheoryMarks({
        targetPercent: Number(targetPercent),
        theoryMax: marksPaper?.theoryMax,
        internalMax: marksPaper?.internalMax,
        internalSecured: Number(internalSecured),
      }),
    [targetPercent, marksPaper, internalSecured],
  );

  const hasError = Boolean(sheet.error);

  const pickPreset = (id) => {
    setPresetId(id);
    const next = buildPapers(id);
    setPapers(next);
    setMarksPaperId(next[0].id);
  };

  const setPaperDate = (id, value) => {
    setPapers((current) =>
      current.map((paper) => (paper.id === id ? { ...paper, date: value } : paper)),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Board exam countdown"];
    if (sheet.allPast) {
      lines.push("All papers on this datesheet are already past.");
    } else {
      lines.push(`Days to the first paper: ${NUM.format(sheet.daysToFirst)}`);
      lines.push(`Exam season spans ${NUM.format(sheet.seasonSpanDays)} days across ${NUM.format(sheet.upcomingCount)} papers`);
      lines.push(`Free study days across the season: ${NUM.format(sheet.totalFreeDays)} (${NUM.format(sheet.totalFreeHours)} hours at ${studyHours} h/day)`);
    }
    sheet.rows
      .filter((row) => !row.isPast)
      .forEach((row) => {
        lines.push(`${row.label} on ${row.date}: ${NUM.format(row.freeDaysBefore)} free day(s) before it`);
      });
    return lines.join("\n");
  }, [hasError, sheet, studyHours]);

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
    setPresetId(BOARD_PRESETS[0].id);
    setPapers(buildPapers(BOARD_PRESETS[0].id));
    setStudyHours(DEFAULT_HOURS);
    setTargetPercent(DEFAULT_TARGET);
    setMarksPaperId(BOARD_PRESETS[0].papers[0].id);
    setInternalSecured(DEFAULT_INTERNAL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Class 10 &amp; 12 boards
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Board Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your datesheet to see the days to each paper, the free study days between papers,
          and the theory marks a target percentage demands in each subject.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="board-preset">
              Class and stream
            </label>
            <select
              id="board-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => pickPreset(event.target.value)}
            >
              {BOARD_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="board-hours">
              Study hours on a free day
            </label>
            <input
              id="board-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="18"
              step="0.5"
              value={studyHours}
              onChange={(event) => setStudyHours(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Paper dates from your datesheet
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {papers.map((paper) => (
              <div key={paper.id}>
                <label className={LABEL_CLASS} htmlFor={`board-date-${paper.id}`}>
                  {paper.label}
                </label>
                <input
                  id={`board-date-${paper.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={paper.date}
                  onChange={(event) => setPaperDate(paper.id, event.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Clear a date to leave that paper out. Each theory paper runs {PAPER_DURATION_MINUTES}{" "}
            minutes with {READING_TIME_MINUTES} minutes of reading time before writing begins.
          </p>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sheet.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Days to the first paper
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || sheet.allPast ? DASH : NUM.format(sheet.daysToFirst)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : sheet.allPast
                  ? "Every paper on this datesheet is already past."
                  : `${sheet.first.label} on ${sheet.first.date} — ${NUM.format(sheet.weeksToFirst)} weeks and ${NUM.format(sheet.spareDaysToFirst)} days away.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the board exam countdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Season span (first to last paper)",
              hasError || sheet.allPast ? DASH : `${NUM.format(sheet.seasonSpanDays)} days`,
            ],
            [
              "Free study days across the season",
              hasError ? DASH : NUM.format(sheet.totalFreeDays),
            ],
            [
              "Free study hours at your daily rate",
              hasError ? DASH : `${NUM.format(sheet.totalFreeHours)} h`,
            ],
            [
              "Tightest gap",
              hasError || !sheet.tightestGap
                ? DASH
                : `${sheet.tightestGap.label} — ${NUM.format(sheet.tightestGap.freeDaysBefore)} free day(s) before it`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Datesheet view</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Paper</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Days away</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Free days before</th>
                <th scope="col" className="py-2 text-right font-semibold">Study hours</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : sheet.rows).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {row.label}
                    {row.isToday ? (
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                        today
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">{row.date}</td>
                  <td className="py-2 pr-3 text-right">
                    {row.isPast ? "past" : NUM.format(row.days)}
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {row.isPast ? DASH : NUM.format(row.freeDaysBefore)}
                  </td>
                  <td className="py-2 text-right">
                    {row.isPast ? DASH : NUM.format(row.freeHoursBefore)}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Free days exclude the day of the previous paper and the exam day itself.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Theory marks needed for a target percentage</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          The pass mark is {BOARD_PASS_PERCENT}% of the subject total. Internal or practical marks
          already secured count toward your target.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="board-marks-paper">
              Subject
            </label>
            <select
              id="board-marks-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marksPaperId}
              onChange={(event) => setMarksPaperId(event.target.value)}
            >
              {papers.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.label} ({paper.theoryMax}+{paper.internalMax})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="board-target">
              Target overall percentage
            </label>
            <input
              id="board-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={targetPercent}
              onChange={(event) => setTargetPercent(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="board-internal">
              Internal / practical marks secured (of {marksPaper ? marksPaper.internalMax : 0})
            </label>
            <input
              id="board-internal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={marksPaper ? marksPaper.internalMax : 0}
              step="1"
              value={internalSecured}
              onChange={(event) => setInternalSecured(event.target.value)}
            />
          </div>
        </div>

        {marks.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {marks.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Theory marks needed for the target",
              marks.error
                ? DASH
                : marks.alreadyEnough
                  ? "Internal marks alone already reach the target"
                  : `${NUM1.format(marks.requiredTheory)} / ${marksPaper ? marksPaper.theoryMax : 0} (${NUM1.format(marks.requiredTheoryPercent)}% of the paper)`,
            ],
            [
              `Theory marks needed just to pass (${BOARD_PASS_PERCENT}%)`,
              marks.error ? DASH : NUM1.format(marks.requiredToPass),
            ],
            [
              "Margin between target and pass",
              marks.error ? DASH : `${NUM1.format(marks.marginOverPass)} marks`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. Dates come from your board&apos;s official datesheet and
        the theory-internal split from your own scheme of studies — state boards differ from CBSE,
        so edit the numbers to match your documents.
      </p>
    </main>
  );
}
