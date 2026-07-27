"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, Printer, RotateCcw, TrainFront } from "lucide-react";

import {
  CBT_DURATION_MINUTES,
  CBT_DURATION_PWBD_MINUTES,
  CBT_MARKS,
  CBT_QUESTIONS,
  CBT_SECTIONS,
  CHECKLIST_GROUPS,
  DEFAULTS,
  PROHIBITED_ITEMS,
  buildTimeline,
  checklistReadiness,
  expectedScore,
  itemKey,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
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
  const [gateClose, setGateClose] = useState(DEFAULTS.gateClose);
  const [examStart, setExamStart] = useState(DEFAULTS.examStart);
  const [travel, setTravel] = useState(String(DEFAULTS.travelMinutes));
  const [buffer, setBuffer] = useState(String(DEFAULTS.bufferMinutes));
  const [getReady, setGetReady] = useState(String(DEFAULTS.getReadyMinutes));
  const [isPwbd, setIsPwbd] = useState(false);
  const [attempted, setAttempted] = useState("90");
  const [accuracy, setAccuracy] = useState("70");
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);

  const timeline = useMemo(
    () =>
      buildTimeline({
        gateClose,
        examStart,
        travelMinutes: Number(travel),
        bufferMinutes: Number(buffer),
        getReadyMinutes: Number(getReady),
        isPwbd,
      }),
    [gateClose, examStart, travel, buffer, getReady, isPwbd],
  );

  const readiness = useMemo(() => checklistReadiness(checked), [checked]);
  const score = useMemo(
    () => expectedScore({ attempted: Number(attempted), accuracyPercent: Number(accuracy) }),
    [attempted, accuracy],
  );
  const hasTimeline = !timeline.error;

  const toggleItem = (key) => setChecked((current) => ({ ...current, [key]: !current[key] }));

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
    const lines = ["Railway (RRB) exam day checklist"];
    if (hasTimeline) {
      lines.push(`Gate closes: ${timeline.gateClose.label}`);
      lines.push(`Be at the gate by: ${timeline.arrive.label}`);
      lines.push(`Leave home by: ${timeline.leaveHome.label}`);
      lines.push(`Start getting ready at: ${timeline.wakeUp.label}`);
      lines.push(`CBT: ${timeline.examStartAt.label} to ${timeline.examEnd.label} (${timeline.durationMinutes} min)`);
    }
    lines.push(
      `Checklist: ${readiness.doneItems}/${readiness.totalItems} ticked, ${readiness.requiredDone}/${readiness.requiredItems} entry-critical done`,
    );
    if (!readiness.ready) lines.push(`Still missing: ${readiness.blocking.join("; ")}`);
    return lines.join("\n");
  }, [timeline, hasTimeline, readiness]);

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
    setGateClose(DEFAULTS.gateClose);
    setExamStart(DEFAULTS.examStart);
    setTravel(String(DEFAULTS.travelMinutes));
    setBuffer(String(DEFAULTS.bufferMinutes));
    setGetReady(String(DEFAULTS.getReadyMinutes));
    setIsPwbd(false);
    setAttempted("90");
    setAccuracy("70");
    setChecked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          RRB CBT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Railway Exam Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          e-Call letter, the matching original photo ID, travel to an out-of-town centre and a
          timeline worked back from the gate-closing time on your call letter.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-gate">
              Gate-closing time on the e-call letter (24-hour)
            </label>
            <input
              id="rrb-gate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={gateClose}
              onChange={(event) => setGateClose(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-start">
              CBT start time (24-hour)
            </label>
            <input
              id="rrb-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={examStart}
              onChange={(event) => setExamStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-travel">
              Travel time to the centre (minutes)
            </label>
            <input
              id="rrb-travel"
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
            <label className={LABEL_CLASS} htmlFor="rrb-buffer">
              Buffer before gate closing (minutes)
            </label>
            <input
              id="rrb-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rrb-ready">
              Time to get ready at home (minutes)
            </label>
            <input
              id="rrb-ready"
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

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="rrb-pwbd"
        >
          <input
            id="rrb-pwbd"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={isPwbd}
            onChange={(event) => setIsPwbd(event.target.checked)}
          />
          PwBD candidate eligible for extra time ({CBT_DURATION_PWBD_MINUTES} minutes instead of{" "}
          {CBT_DURATION_MINUTES})
        </label>
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
                ? `At the gate ${NUM.format(timeline.minutesBeforeGate)} minutes before it closes.`
                : "Fix the timing inputs to see the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the railway exam-day plan"
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
            ["Be at the gate by", hasTimeline ? timeline.arrive.label : DASH],
            ["Gate closes", hasTimeline ? timeline.gateClose.label : DASH],
            [
              "CBT runs",
              hasTimeline
                ? `${timeline.examStartAt.label} to ${timeline.examEnd.label} (${timeline.durationMinutes} min)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasTimeline && timeline.startsPreviousDay ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            These intervals roll back past midnight — travel the previous day and stay near the
            centre instead.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Documents, travel and desk items</h2>
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
              All entry-critical items ticked — {pct(readiness.percent)} of the list done.
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">
              {pct(readiness.percent)} done. {readiness.blocking.length} entry-critical item
              {readiness.blocking.length === 1 ? "" : "s"} still missing.
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
        <h2 className="text-base font-semibold">CBT attempt maths</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          RRB NTPC CBT-1: {CBT_QUESTIONS} questions, {CBT_MARKS} marks, {CBT_DURATION_MINUTES}{" "}
          minutes — {CBT_SECTIONS.map((s) => `${s.label} ${s.questions}`).join(", ")}. A wrong
          answer costs one-third of the question&apos;s marks.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-attempted">
              Questions attempted (of {CBT_QUESTIONS})
            </label>
            <input
              id="rrb-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={CBT_QUESTIONS}
              step="1"
              value={attempted}
              onChange={(event) => setAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-accuracy">
              Accuracy on what you attempt (%)
            </label>
            <input
              id="rrb-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
          </div>
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Projected marks", score.error ? DASH : `${NUM1.format(score.marks)} / ${score.maxMarks}`],
            ["Correct answers", score.error ? DASH : NUM1.format(score.correct)],
            [
              "Marks lost to negative marking",
              score.error ? DASH : NUM2.format(score.wrong * score.penaltyPerWrong),
            ],
            [
              "Accuracy at which a guess breaks even",
              score.error ? DASH : pct(score.breakEvenAccuracy),
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
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Ban className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
          Barred inside the centre
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
        Informational only. Each RRB prints its own instructions on the Centrally Employment Notice
        and the e-call letter — what your call letter says always prevails.
      </p>
    </main>
  );
}
