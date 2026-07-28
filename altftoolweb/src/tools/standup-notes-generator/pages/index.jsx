"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { FORMATS, generateStandupNotes } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Nikhil",
  team: "Payments",
  yesterday: "Shipped the refund API to staging\nReviewed PR 412 for webhook retries",
  today: "Wire up retry back-off\nPair with QA on the refund test plan",
  blockers: "Waiting on sandbox API keys from the payments provider",
  formatId: "slack",
  includeDate: true,
};

/** Local calendar date as yyyy-mm-dd (set after mount so SSR markup matches). */
function localTodayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [team, setTeam] = useState(DEFAULTS.team);
  const [dateIso, setDateIso] = useState("");
  const [yesterday, setYesterday] = useState(DEFAULTS.yesterday);
  const [today, setToday] = useState(DEFAULTS.today);
  const [blockers, setBlockers] = useState(DEFAULTS.blockers);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [includeDate, setIncludeDate] = useState(DEFAULTS.includeDate);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDateIso(localTodayIso());
  }, []);

  const result = useMemo(
    () =>
      generateStandupNotes({
        name,
        team,
        dateIso,
        yesterday,
        today,
        blockers,
        formatId,
        includeDate: includeDate && dateIso !== "",
      }),
    [name, team, dateIso, yesterday, today, blockers, formatId, includeDate],
  );

  const hasError = Boolean(result.error);

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
    setName(DEFAULTS.name);
    setTeam(DEFAULTS.team);
    setDateIso(localTodayIso());
    setYesterday(DEFAULTS.yesterday);
    setToday(DEFAULTS.today);
    setBlockers(DEFAULTS.blockers);
    setFormatId(DEFAULTS.formatId);
    setIncludeDate(DEFAULTS.includeDate);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Yesterday items", DASH],
        ["Today items", DASH],
        ["Blockers", DASH],
        ["Words", DASH],
        ["Characters", DASH],
      ]
    : [
        ["Yesterday items", NUM.format(result.yesterdayItems.length)],
        ["Today items", NUM.format(result.todayItems.length)],
        ["Blockers", NUM.format(result.blockerItems.length)],
        ["Words", NUM.format(result.wordCount)],
        ["Characters", NUM.format(result.charCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Agile rituals
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Standup Notes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type rough bullets for yesterday, today and blockers and get a tidy daily-scrum update
          formatted for Slack, Markdown, Jira or plain text — ready to paste.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="su-name">
              Your name
            </label>
            <input
              id="su-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-team">
              Team or squad
            </label>
            <input
              id="su-team"
              type="text"
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-date">
              Standup date
            </label>
            <input
              id="su-date"
              type="date"
              value={dateIso}
              onChange={(event) => setDateIso(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-format">
              Output format
            </label>
            <select
              id="su-format"
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="su-yesterday">
              Yesterday — one item per line
            </label>
            <textarea
              id="su-yesterday"
              rows={4}
              value={yesterday}
              onChange={(event) => setYesterday(event.target.value)}
              className={`mt-2 ${TEXTAREA_CLASS}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="su-today">
              Today — one item per line
            </label>
            <textarea
              id="su-today"
              rows={4}
              value={today}
              onChange={(event) => setToday(event.target.value)}
              className={`mt-2 ${TEXTAREA_CLASS}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="su-blockers">
              Blockers — one item per line
            </label>
            <textarea
              id="su-blockers"
              rows={3}
              value={blockers}
              onChange={(event) => setBlockers(event.target.value)}
              className={`mt-2 ${TEXTAREA_CLASS}`}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="su-include-date"
            >
              <input
                id="su-include-date"
                type="checkbox"
                checked={includeDate}
                onChange={(event) => setIncludeDate(event.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Include the date in the heading
            </label>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Update items
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.itemCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Formatted for ${result.format.label}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the standup notes"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className="mt-5 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 whitespace-pre-wrap">
          {hasError ? DASH : result.text}
        </pre>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.note ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-xs ${
              result.overSlackLimit
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.note}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you type stays in this browser tab — nothing is sent anywhere or stored.
      </p>
    </main>
  );
}
