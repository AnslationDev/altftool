"use client";

import { useMemo, useState } from "react";
import { Ban, Check, ClipboardCheck, Copy, Printer, RotateCcw } from "lucide-react";

import {
  CHECKLIST_GROUPS,
  DEFAULTS,
  EXAM_SESSIONS,
  GATE_CLOSE_LEAD_MINUTES,
  PAPER_DURATION_MINUTES,
  PROHIBITED_ITEMS,
  buildTimeline,
  checklistReadiness,
  itemKey,
  sessionById,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

export default function ToolHome() {
  const [sessionId, setSessionId] = useState(EXAM_SESSIONS[0].id);
  const [examStart, setExamStart] = useState(EXAM_SESSIONS[0].start);
  const [travel, setTravel] = useState(String(DEFAULTS.travelMinutes));
  const [buffer, setBuffer] = useState(String(DEFAULTS.bufferMinutes));
  const [getReady, setGetReady] = useState(String(DEFAULTS.getReadyMinutes));
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);

  const timeline = useMemo(
    () =>
      buildTimeline({
        examStart,
        travelMinutes: Number(travel),
        bufferMinutes: Number(buffer),
        getReadyMinutes: Number(getReady),
      }),
    [examStart, travel, buffer, getReady],
  );

  const readiness = useMemo(() => checklistReadiness(checked), [checked]);
  const hasTimeline = !timeline.error;

  const pickSession = (id) => {
    setSessionId(id);
    const session = sessionById(id);
    if (session) setExamStart(session.start);
  };

  const toggleItem = (key) => {
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  };

  const tickAll = (value) => {
    setChecked(() => {
      if (!value) return {};
      const next = {};
      CHECKLIST_GROUPS.forEach((group) => {
        group.items.forEach((item) => {
          next[itemKey(group.id, item.id)] = true;
        });
      });
      return next;
    });
  };

  const summary = useMemo(() => {
    const lines = ["UPSC exam-day checklist"];
    const session = sessionById(sessionId);
    if (session) lines.push(session.label);
    if (hasTimeline) {
      lines.push(`Exam starts: ${timeline.examStart.label}`);
      lines.push(`Gate closes: ${timeline.gateClose.label}`);
      lines.push(`Be at the centre by: ${timeline.arrive.label}`);
      lines.push(`Leave home by: ${timeline.leaveHome.label}`);
      lines.push(`Start getting ready at: ${timeline.wakeUp.label}`);
    }
    lines.push(
      `Checklist: ${readiness.doneItems}/${readiness.totalItems} ticked, ${readiness.requiredDone}/${readiness.requiredItems} entry-critical items done`,
    );
    if (!readiness.ready) {
      lines.push(`Still missing: ${readiness.blocking.join("; ")}`);
    }
    return lines.join("\n");
  }, [sessionId, timeline, hasTimeline, readiness]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const printPage = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setSessionId(EXAM_SESSIONS[0].id);
    setExamStart(EXAM_SESSIONS[0].start);
    setTravel(String(DEFAULTS.travelMinutes));
    setBuffer(String(DEFAULTS.bufferMinutes));
    setGetReady(String(DEFAULTS.getReadyMinutes));
    setChecked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          UPSC exam day
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          UPSC Admit Card Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Everything the e-Admit Card asks you to carry, what the hall bans, and a reporting plan
          worked backwards from the {GATE_CLOSE_LEAD_MINUTES}-minute gate closing rule so you are
          never the candidate turned away at the door.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="upsc-session">
              Session
            </label>
            <select
              id="upsc-session"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sessionId}
              onChange={(event) => pickSession(event.target.value)}
            >
              {EXAM_SESSIONS.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.label} · {session.start}–{session.end}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Each paper runs {PAPER_DURATION_MINUTES} minutes. Confirm the timing printed on your
              own admit card.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-start">
              Exam start time (24-hour)
            </label>
            <input
              id="upsc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={examStart}
              onChange={(event) => setExamStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-travel">
              Travel time to the centre (minutes)
            </label>
            <input
              id="upsc-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={travel}
              onChange={(event) => setTravel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-buffer">
              Buffer before gate closing (minutes)
            </label>
            <input
              id="upsc-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-ready">
              Time to get ready at home (minutes)
            </label>
            <input
              id="upsc-ready"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={getReady}
              onChange={(event) => setGetReady(event.target.value)}
            />
          </div>
        </div>
      </section>

      {timeline.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {timeline.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Leave home by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasTimeline ? timeline.leaveHome.label : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasTimeline
                ? `${NUM.format(timeline.totalLeadMinutes)} minutes of lead time before the paper starts`
                : "Fix the timing inputs to see the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the exam-day plan and checklist status"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={printPage} aria-label="Print this checklist" className={GHOST_BTN}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Start getting ready at", hasTimeline ? timeline.wakeUp.label : DASH],
            ["Leave home by", hasTimeline ? timeline.leaveHome.label : DASH],
            ["Be at the centre by", hasTimeline ? timeline.arrive.label : DASH],
            [
              "Gate closes",
              hasTimeline
                ? `${timeline.gateClose.label} (${GATE_CLOSE_LEAD_MINUTES} min before the start)`
                : DASH,
            ],
            ["Paper starts", hasTimeline ? timeline.examStart.label : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasTimeline && timeline.startsPreviousDay ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            With these intervals you would have to start the previous night — the times above roll
            back past midnight.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Bag and document checklist</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {readiness.doneItems} of {readiness.totalItems} ticked ·{" "}
              {readiness.requiredDone}/{readiness.requiredItems} entry-critical
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => tickAll(true)} className={GHOST_BTN}>
              Tick everything
            </button>
            <button type="button" onClick={() => tickAll(false)} className={GHOST_BTN}>
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, readiness.percent))}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-semibold">
          {readiness.ready ? (
            <span className="text-[var(--success)]">
              Every entry-critical item is ticked — {pct(readiness.percent)} of the full list done.
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">
              {pct(readiness.percent)} done. Still missing {readiness.blocking.length}{" "}
              entry-critical item{readiness.blocking.length === 1 ? "" : "s"}.
            </span>
          )}
        </p>

        {CHECKLIST_GROUPS.map((group) => (
          <div key={group.id} className="mt-5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {group.title}
            </h3>
            <ul className="mt-2 space-y-2">
              {group.items.map((item) => {
                const key = itemKey(group.id, item.id);
                return (
                  <li key={key} className="rounded-md border border-[var(--border)] p-3">
                    <label className="flex min-h-11 cursor-pointer items-start gap-3" htmlFor={key}>
                      <input
                        id={key}
                        type="checkbox"
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(checked[key])}
                        onChange={() => toggleItem(key)}
                      />
                      <span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.required ? (
                          <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                            entry-critical
                          </span>
                        ) : null}
                        {item.note ? (
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Ban className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
          Leave these at home
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {PROHIBITED_ITEMS.map((item) => (
            <li key={item} className="rounded-md border border-[var(--border)] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The instructions printed on your own e-Admit Card and the Commission&apos;s
        latest notice always override this list — read both the night before, and follow the
        invigilator&apos;s directions at the centre.
      </p>
    </main>
  );
}
