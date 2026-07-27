"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { BANDS, addDays, computeDeadlineBoard } from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const LONG_DATE = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ICON_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_PILL = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  primary: "bg-[var(--muted)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  primary: "text-[var(--primary)]",
  success: "text-[var(--success)]",
};

function todayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
}

function buildDefaults() {
  const base = todayIso();
  return {
    today: base,
    holidays: "",
    items: [
      {
        id: "d1",
        title: "File written statement",
        matter: "Sharma v. Metro Realty",
        due: addDays(base, 11),
        notice: "7",
      },
      {
        id: "d2",
        title: "Serve reply to legal notice",
        matter: "Notice dated last month",
        due: addDays(base, 3),
        notice: "2",
      },
      {
        id: "d3",
        title: "Trademark opposition deadline",
        matter: "Class 42 application",
        due: addDays(base, 45),
        notice: "14",
      },
      {
        id: "d4",
        title: "Board resolution to be circulated",
        matter: "Quarterly compliance",
        due: addDays(base, -2),
        notice: "3",
      },
    ],
  };
}

const formatDate = (iso) => {
  const parts = String(iso ?? "").split("-");
  if (parts.length !== 3) return DASH;
  const ts = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isFinite(ts) ? LONG_DATE.format(new Date(ts)) : DASH;
};

const countdownText = (days) => {
  if (!Number.isFinite(days)) return DASH;
  if (days === 0) return "Due today";
  if (days < 0) return `${NUM.format(-days)} day${days === -1 ? "" : "s"} overdue`;
  return `${NUM.format(days)} day${days === 1 ? "" : "s"} left`;
};

export default function ToolHome() {
  const [state, setState] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);
  const [seq, setSeq] = useState(0);

  const holidayList = useMemo(
    () =>
      state.holidays
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [state.holidays],
  );

  const result = useMemo(
    () =>
      computeDeadlineBoard({
        today: state.today,
        items: state.items.map((item) => ({ ...item, notice: Number(item.notice) })),
        holidays: holidayList,
      }),
    [state.today, state.items, holidayList],
  );

  const ok = !result.error;

  const setField = (key) => (event) =>
    setState((prev) => ({ ...prev, [key]: event.target.value }));

  const setItem = (id, key) => (event) => {
    const value = event.target.value;
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };

  const addRow = () => {
    const nextId = `new-${seq}`;
    setSeq((n) => n + 1);
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: nextId, title: "", matter: "", due: addDays(prev.today, 14), notice: "3" },
      ],
    }));
  };

  const removeRow = (id) =>
    setState((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));

  const reset = () => {
    setState(buildDefaults());
    setCopied(false);
  };

  const summary = ok
    ? [
        `Legal deadline board as at ${formatDate(state.today)}`,
        `${result.total} tracked | ${result.overdueCount} overdue | ${result.dueTodayCount} due today | ${result.withinSevenDays} inside 7 days`,
        "",
        ...result.rows.map(
          (row) =>
            `${row.due}  ${countdownText(row.daysRemaining)} (${NUM.format(row.workingDays)} working days) - ${row.title}${row.matter ? ` [${row.matter}]` : ""} - start by ${row.startBy}`,
        ),
      ].join("\n")
    : "";

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

  const headlineDays = ok && result.nextDue ? result.nextDue.daysRemaining : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Legal utilities
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Legal Deadline Countdown Board
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put every filing date, limitation date and reply date on one board. Each row shows the
          calendar days left, the working days left after weekends and registry holidays, and the
          date you should actually start drafting.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ldb-today">
              Count from (today)
            </label>
            <input
              id="ldb-today"
              className={INPUT}
              type="date"
              value={state.today}
              onChange={setField("today")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ldb-holidays">
              Court / registry holidays (optional)
            </label>
            <input
              id="ldb-holidays"
              className={INPUT}
              type="text"
              placeholder="2026-08-15, 2026-10-02"
              value={state.holidays}
              onChange={setField("holidays")}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Saturdays and Sundays are already excluded from the working-day count. Add court vacation
          or gazetted holiday dates above as YYYY-MM-DD, separated by commas.
        </p>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Deadlines</h2>
          <button type="button" className={GHOST_BTN} onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add deadline
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {state.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor={`ldb-title-${item.id}`}>
                    Deadline {index + 1}
                  </label>
                  <input
                    id={`ldb-title-${item.id}`}
                    className={INPUT}
                    type="text"
                    placeholder="File written statement"
                    value={item.title}
                    onChange={setItem(item.id, "title")}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`ldb-matter-${item.id}`}>
                    Matter / reference
                  </label>
                  <input
                    id={`ldb-matter-${item.id}`}
                    className={INPUT}
                    type="text"
                    placeholder="Sharma v. Metro Realty"
                    value={item.matter}
                    onChange={setItem(item.id, "matter")}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`ldb-due-${item.id}`}>
                    Due date
                  </label>
                  <input
                    id={`ldb-due-${item.id}`}
                    className={INPUT}
                    type="date"
                    value={item.due}
                    onChange={setItem(item.id, "due")}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={LABEL} htmlFor={`ldb-notice-${item.id}`}>
                      Start drafting (days before)
                    </label>
                    <input
                      id={`ldb-notice-${item.id}`}
                      className={INPUT}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={item.notice}
                      onChange={setItem(item.id, "notice")}
                    />
                  </div>
                  <button
                    type="button"
                    className={ICON_BTN}
                    onClick={() => removeRow(item.id)}
                    aria-label={`Remove ${item.title || `deadline ${index + 1}`}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
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
              Next deadline
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                ok && result.nextDue ? TONE_TEXT[result.nextDue.band.tone] : "text-[var(--primary)]"
              }`}
            >
              {ok && result.nextDue ? countdownText(headlineDays) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.nextDue
                  ? `${result.nextDue.title} — ${formatDate(result.nextDue.due)}`
                  : "Everything on this board is already past its due date."
                : "Fix the entries above to build the board."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the deadline board"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy board"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the board to the sample deadlines"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Deadlines tracked", NUM.format(result.total)],
                ["Already overdue", NUM.format(result.overdueCount)],
                ["Due today", NUM.format(result.dueTodayCount)],
                ["Falling inside 7 days", NUM.format(result.withinSevenDays)],
                ["Should be in drafting now", NUM.format(result.startNowCount)],
                [
                  "Working days to the next one",
                  result.nextDue ? NUM.format(result.nextDue.workingDays) : DASH,
                ],
                [
                  "Weeks to the next one",
                  result.nextDue ? NUM1.format(result.nextDue.weeksRemaining) : DASH,
                ],
                ["Holiday dates applied", NUM.format(result.holidaysUsed)],
              ]
            : [
                ["Deadlines tracked", DASH],
                ["Already overdue", DASH],
                ["Falling inside 7 days", DASH],
                ["Working days to the next one", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {BANDS.filter((band) => result.counts[band.id] > 0).map((band) => (
              <span
                key={band.id}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${TONE_PILL[band.tone]}`}
              >
                {band.label}: {NUM.format(result.counts[band.id])}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The board</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Deadline
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Days
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Working days
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Start by
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{row.title}</span>
                      {row.matter ? (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.matter}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {formatDate(row.due)}
                    </td>
                    <td
                      className={`py-2.5 pr-3 text-right font-semibold ${TONE_TEXT[row.band.tone]}`}
                    >
                      {NUM.format(row.daysRemaining)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM.format(row.workingDays)}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <span className={row.startOverdue ? "text-[var(--danger)] font-semibold" : ""}>
                        {formatDate(row.startBy)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${TONE_PILL[row.band.tone]}`}
                      >
                        {row.band.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a scheduling aid, not legal advice. Limitation periods, condonation of delay and the
        method of computing time differ by statute and jurisdiction, and a date that falls on a
        holiday may be extended by law. Confirm every critical date with the governing rules or your
        advocate.
      </p>
    </main>
  );
}
