"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Cpu, RotateCcw } from "lucide-react";

import {
  GATE_BRANCHES,
  GATE_DEFAULT_EXAM_DATE,
  GATE_PATTERN,
  MAX_CYCLES,
  MIN_CYCLES,
  buildRotation,
  countdownTo,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const makeSubjects = (branchId) => {
  const branch = GATE_BRANCHES.find((item) => item.id === branchId) || GATE_BRANCHES[0];
  return branch.subjects.map((label, index) => ({
    id: `${branch.id}-${index}`,
    label,
    weight: "1",
  }));
};

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [startDate, setStartDate] = useState(() => toLocalISODate(new Date()));
  const [examDate, setExamDate] = useState(GATE_DEFAULT_EXAM_DATE);
  const [branchId, setBranchId] = useState(GATE_BRANCHES[0].id);
  const [subjects, setSubjects] = useState(() => makeSubjects(GATE_BRANCHES[0].id));
  const [cycles, setCycles] = useState("3");
  const [mockBuffer, setMockBuffer] = useState("21");
  const [copied, setCopied] = useState(false);

  const count = useMemo(() => countdownTo(today, examDate), [today, examDate]);

  const plan = useMemo(
    () =>
      buildRotation({
        todayISO: today,
        startISO: startDate,
        examISO: examDate,
        subjects: subjects.map((subject) => ({ ...subject, weight: toNumber(subject.weight) })),
        cycles: toNumber(cycles),
        mockBufferDays: toNumber(mockBuffer),
      }),
    [today, startDate, examDate, subjects, cycles, mockBuffer],
  );

  const errorMessage = count.error || plan.error || "";
  const ok = !errorMessage;

  const changeBranch = (nextId) => {
    setBranchId(nextId);
    setSubjects(makeSubjects(nextId));
  };

  const updateWeight = (id, value) => {
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, weight: value } : row)));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "GATE Exam Countdown",
      `As on ${today}, GATE on ${examDate}`,
      `${NUM0.format(plan.daysToExam)} days to go`,
      `Rotation: ${NUM0.format(plan.cycles)} cycles over ${NUM0.format(plan.rotationDays)} days, then ${NUM0.format(plan.mockBufferDays)} mock-only days`,
      `Cycle lengths: ${plan.perCycleDays.map((days) => `${NUM0.format(days)}d`).join(" / ")}`,
      "",
      plan.current
        ? `Today: ${plan.current.label} (cycle ${plan.current.cycle}, day ${NUM0.format(plan.current.dayInBlock)} of ${NUM0.format(plan.current.days)})`
        : plan.inMockPhase
          ? "Today: mock-test phase — no new subject"
          : "Today falls outside the rotation window",
      "",
      "Days per subject:",
    ];
    plan.matrix.forEach((row) => {
      lines.push(
        `  ${row.label}: ${row.perCycle.map((days) => NUM0.format(days)).join(" + ")} = ${NUM0.format(row.totalDays)} days`,
      );
    });
    return lines.join("\n");
  }, [ok, today, examDate, plan]);

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
    const now = toLocalISODate(new Date());
    setToday(now);
    setStartDate(now);
    setExamDate(GATE_DEFAULT_EXAM_DATE);
    setBranchId(GATE_BRANCHES[0].id);
    setSubjects(makeSubjects(GATE_BRANCHES[0].id));
    setCycles("3");
    setMockBuffer("21");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Cpu className="h-4 w-4" aria-hidden="true" />
          GATE countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">GATE Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to GATE plus a subject rotation built from your branch syllabus, where each
          revision pass takes half the days of the one before it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dates and branch</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-today">
              Today&apos;s date
            </label>
            <input
              id="gate-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-exam">
              GATE exam date
            </label>
            <input
              id="gate-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-start">
              Rotation start date
            </label>
            <input
              id="gate-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-branch">
              GATE paper
            </label>
            <select
              id="gate-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              value={branchId}
              onChange={(event) => changeBranch(event.target.value)}
            >
              {GATE_BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-cycles">
              Revision cycles ({MIN_CYCLES}-{MAX_CYCLES})
            </label>
            <input
              id="gate-cycles"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CYCLES}
              max={MAX_CYCLES}
              step="1"
              value={cycles}
              onChange={(event) => setCycles(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gate-buffer">
              Mock-test only days at the end
            </label>
            <input
              id="gate-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={mockBuffer}
              onChange={(event) => setMockBuffer(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Subject weights</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights start equal. Raise the weight of a subject that carries more marks in your
          past-paper analysis, or one you are weak in, and the rotation gives it more days.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <label className={LABEL_CLASS} htmlFor={`gate-w-${subject.id}`}>
                {subject.label}
              </label>
              <input
                id={`gate-w-${subject.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                step="0.5"
                value={subject.weight}
                onChange={(event) => updateWeight(subject.id, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              GATE {ok ? `on ${examDate}` : "countdown"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? count.isPast
                  ? `${NUM0.format(Math.abs(plan.daysToExam))} days ago`
                  : `${NUM0.format(plan.daysToExam)} days`
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(count.weeks)} weeks ${NUM0.format(count.spareDays)} days · ${NUM0.format(plan.cycles)} cycles over ${NUM0.format(plan.rotationDays)} rotation days`
                : "Fix the inputs above to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy GATE countdown and rotation plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Today's rotation slot",
              ok
                ? plan.current
                  ? `${plan.current.label} — cycle ${plan.current.cycle}, day ${NUM0.format(plan.current.dayInBlock)} of ${NUM0.format(plan.current.days)}`
                  : plan.inMockPhase
                    ? "Mock-test phase, no new subject"
                    : "Outside the rotation window"
                : DASH,
            ],
            [
              "Cycle lengths",
              ok ? plan.perCycleDays.map((days) => `${NUM0.format(days)}d`).join(" / ") : DASH,
            ],
            ["Rotation days", ok ? NUM0.format(plan.rotationDays) : DASH],
            ["Mock-only days at the end", ok ? NUM0.format(plan.mockBufferDays) : DASH],
            [
              "Average days per subject per cycle",
              ok ? NUM.format(plan.daysPerSubjectPerCycle) : DASH,
            ],
            [
              "Subjects squeezed to zero in a cycle",
              ok
                ? plan.squeezedSubjects.length === 0
                  ? "None"
                  : plan.squeezedSubjects.join(", ")
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Days per subject, cycle by cycle</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Subject
                    </th>
                    {plan.perCycleDays.map((days, index) => (
                      <th
                        key={`head-cycle-${index}`}
                        scope="col"
                        className="py-2 pr-3 text-right font-semibold"
                      >
                        Cycle {index + 1}
                      </th>
                    ))}
                    <th scope="col" className="py-2 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.matrix.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {row.label}
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          {NUM.format(row.weightPercent)}% of rotation time
                        </span>
                      </td>
                      {row.perCycle.map((days, index) => (
                        <td
                          key={`${row.id}-c${index}`}
                          className={`py-2 pr-3 text-right ${days === 0 ? "text-[var(--danger)]" : ""}`}
                        >
                          {NUM0.format(days)}
                        </td>
                      ))}
                      <td className="py-2 text-right font-semibold">{NUM0.format(row.totalDays)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Rotation calendar</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Cycle
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Subject
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Window
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.blocks
                    .filter((block) => block.days > 0)
                    .map((block) => (
                      <tr
                        key={block.key}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          plan.current && plan.current.key === block.key
                            ? "bg-[var(--primary-soft)]"
                            : ""
                        }`}
                      >
                        <td className="py-2 pr-3">{block.cycle}</td>
                        <td className="py-2 pr-3 font-semibold">{block.label}</td>
                        <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                          {block.startISO} to {block.endISO}
                        </td>
                        <td className="py-2 text-right">{NUM0.format(block.days)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        GATE is a {GATE_PATTERN.durationHours} hour paper of {GATE_PATTERN.questions} questions for{" "}
        {GATE_PATTERN.totalMarks} marks, of which General Aptitude carries{" "}
        {GATE_PATTERN.generalAptitudeMarks} and the subject paper{" "}
        {GATE_PATTERN.subjectMarks}. The score stays valid for{" "}
        {GATE_PATTERN.scoreValidityYears} years from the date the result is announced. Subject lists
        follow the official syllabus headings; confirm the exam date and session on your admit card.
      </p>
    </main>
  );
}
