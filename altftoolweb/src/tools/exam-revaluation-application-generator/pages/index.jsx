"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  DEFAULT_FEE_PER_UNIT,
  DEFAULT_WINDOW_DAYS,
  GROUNDS,
  STAGES,
  buildRevaluationApplication,
  formatLongDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  open: "bg-[var(--success)]/10 text-[var(--success)]",
  urgent: "bg-[var(--muted)] text-[var(--foreground)]",
  closed: "bg-[var(--danger-soft)] text-[var(--danger)]",
  early: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const DEFAULT_SUBJECTS = [
  { id: 1, name: "English Core", maxMarks: "100", obtained: "72", disputed: false, expected: "" },
  { id: 2, name: "Physics", maxMarks: "100", obtained: "58", disputed: true, expected: "70" },
  { id: 3, name: "Chemistry", maxMarks: "100", obtained: "65", disputed: false, expected: "" },
  { id: 4, name: "Mathematics", maxMarks: "100", obtained: "81", disputed: false, expected: "" },
  { id: 5, name: "Computer Science", maxMarks: "100", obtained: "88", disputed: false, expected: "" },
];

const DEFAULTS = {
  candidateName: "Rhea Kapoor",
  rollNumber: "22315509",
  className: "Class 12 Science",
  schoolName: "St Xavier School, Jaipur",
  boardName: "Central Board of Secondary Education",
  address: "18 Civil Lines, Jaipur 302006",
  phone: "98xxxxxx77",
  email: "rhea.kapoor@example.com",
  stageKey: "verification",
  questionNumbers: "",
  feePerUnit: String(DEFAULT_FEE_PER_UNIT.verification),
  resultDate: "2026-05-13",
  applyDate: "2026-05-16",
  windowDays: String(DEFAULT_WINDOW_DAYS),
  paymentReference: "TXN9931204",
};

export default function ToolHome() {
  const [candidateName, setCandidateName] = useState(DEFAULTS.candidateName);
  const [rollNumber, setRollNumber] = useState(DEFAULTS.rollNumber);
  const [className, setClassName] = useState(DEFAULTS.className);
  const [schoolName, setSchoolName] = useState(DEFAULTS.schoolName);
  const [boardName, setBoardName] = useState(DEFAULTS.boardName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [stageKey, setStageKey] = useState(DEFAULTS.stageKey);
  const [questionNumbers, setQuestionNumbers] = useState(DEFAULTS.questionNumbers);
  const [feePerUnit, setFeePerUnit] = useState(DEFAULTS.feePerUnit);
  const [resultDate, setResultDate] = useState(DEFAULTS.resultDate);
  const [applyDate, setApplyDate] = useState(DEFAULTS.applyDate);
  const [windowDays, setWindowDays] = useState(DEFAULTS.windowDays);
  const [paymentReference, setPaymentReference] = useState(DEFAULTS.paymentReference);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [grounds, setGrounds] = useState(GROUNDS.slice(0, 2));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRevaluationApplication({
        candidateName,
        rollNumber,
        className,
        schoolName,
        boardName,
        address,
        phone,
        email,
        stageKey,
        subjects,
        questionNumbers,
        feePerUnit,
        resultDate,
        applyDate,
        windowDays,
        grounds,
        paymentReference,
      }),
    [
      candidateName,
      rollNumber,
      className,
      schoolName,
      boardName,
      address,
      phone,
      email,
      stageKey,
      subjects,
      questionNumbers,
      feePerUnit,
      resultDate,
      applyDate,
      windowDays,
      grounds,
      paymentReference,
    ],
  );

  const failed = Boolean(result.error);
  const plan = failed ? null : result.plan;
  const marks = failed ? null : result.marks;
  const stage = STAGES.find((item) => item.key === stageKey) || STAGES[0];

  const updateSubject = (id, patch) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addSubject = () =>
    setSubjects((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...rows,
        { id: nextId, name: "", maxMarks: "100", obtained: "", disputed: false, expected: "" },
      ];
    });

  const removeSubject = (id) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  const changeStage = (key) => {
    setStageKey(key);
    setFeePerUnit(String(DEFAULT_FEE_PER_UNIT[key] ?? 0));
  };

  const toggleGround = (option) =>
    setGrounds((list) =>
      list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
    );

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCandidateName(DEFAULTS.candidateName);
    setRollNumber(DEFAULTS.rollNumber);
    setClassName(DEFAULTS.className);
    setSchoolName(DEFAULTS.schoolName);
    setBoardName(DEFAULTS.boardName);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setStageKey(DEFAULTS.stageKey);
    setQuestionNumbers(DEFAULTS.questionNumbers);
    setFeePerUnit(DEFAULTS.feePerUnit);
    setResultDate(DEFAULTS.resultDate);
    setApplyDate(DEFAULTS.applyDate);
    setWindowDays(DEFAULTS.windowDays);
    setPaymentReference(DEFAULTS.paymentReference);
    setSubjects(DEFAULT_SUBJECTS);
    setGrounds(GROUNDS.slice(0, 2));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Exam paperwork
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Revaluation Application Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your subject marks, mark the papers you are disputing and pick the stage —
          verification, photocopy or re-evaluation. You get the fee total, the last date to apply and
          the percentage your result would move to if the correction comes through.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which stage are you applying for?</h2>
        <div className="mt-3 grid gap-2">
          {STAGES.map((item) => (
            <label
              key={item.key}
              htmlFor={`erv-stage-${item.key}`}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                stageKey === item.key
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--background)]"
              }`}
            >
              <input
                id={`erv-stage-${item.key}`}
                type="radio"
                name="erv-stage"
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={stageKey === item.key}
                onChange={() => changeStage(item.key)}
              />
              <span>
                <span className="font-semibold">
                  Step {item.order}: {item.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                  {item.description}
                </span>
                {item.prerequisite && (
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--muted-foreground)]">
                    Prerequisite: {item.prerequisite}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        {stageKey === "reevaluation" && (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="erv-questions">
              Question numbers to re-evaluate (comma separated)
            </label>
            <input
              id="erv-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              value={questionNumbers}
              onChange={(event) => setQuestionNumbers(event.target.value)}
              placeholder="12, 18, 23, 27"
            />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Subjects and marks</h2>
          <button type="button" onClick={addSubject} className={GHOST_BTN} aria-label="Add a subject row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add subject
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {subjects.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`erv-name-${row.id}`}>
                    Subject {index + 1}
                  </label>
                  <input
                    id={`erv-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.name}
                    onChange={(event) => updateSubject(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`erv-max-${row.id}`}>
                    Maximum marks
                  </label>
                  <input
                    id={`erv-max-${row.id}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.maxMarks}
                    onChange={(event) => updateSubject(row.id, { maxMarks: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`erv-got-${row.id}`}>
                    Marks obtained
                  </label>
                  <input
                    id={`erv-got-${row.id}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.obtained}
                    onChange={(event) => updateSubject(row.id, { obtained: event.target.value })}
                  />
                </div>
                {row.disputed && (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`erv-exp-${row.id}`}>
                      Marks you expected
                    </label>
                    <input
                      id={`erv-exp-${row.id}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={row.expected}
                      onChange={(event) => updateSubject(row.id, { expected: event.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    id={`erv-disp-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={row.disputed}
                    onChange={(event) => updateSubject(row.id, { disputed: event.target.checked })}
                  />
                  <label
                    className="text-sm font-semibold text-[var(--foreground)]"
                    htmlFor={`erv-disp-${row.id}`}
                  >
                    Disputing this subject
                  </label>
                </div>
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(row.id)}
                    aria-label={`Remove subject ${index + 1}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Candidate, dates and fee</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-candidate">
              Candidate name
            </label>
            <input
              id="erv-candidate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-roll">
              Roll number
            </label>
            <input
              id="erv-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-class">
              Class or course
            </label>
            <input
              id="erv-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-school">
              School or college
            </label>
            <input
              id="erv-school"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="erv-board">
              Board or university
            </label>
            <input
              id="erv-board"
              className={`mt-2 ${INPUT_CLASS}`}
              value={boardName}
              onChange={(event) => setBoardName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="erv-address">
              Address
            </label>
            <input
              id="erv-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-phone">
              Phone
            </label>
            <input
              id="erv-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-email">
              Email
            </label>
            <input
              id="erv-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-result">
              Result declared on
            </label>
            <input
              id="erv-result"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resultDate}
              onChange={(event) => setResultDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-apply">
              Applying on
            </label>
            <input
              id="erv-apply"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={applyDate}
              onChange={(event) => setApplyDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-window">
              Application window (days from result)
            </label>
            <input
              id="erv-window"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windowDays}
              onChange={(event) => setWindowDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erv-fee">
              Fee per {stage.unitLabel} (INR)
            </label>
            <input
              id="erv-fee"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feePerUnit}
              onChange={(event) => setFeePerUnit(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="erv-txn">
              Fee payment reference (optional)
            </label>
            <input
              id="erv-txn"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>Grounds you are citing</p>
          <div className="mt-2 space-y-2">
            {GROUNDS.map((option, index) => (
              <div key={option} className="flex items-start gap-3">
                <input
                  id={`erv-ground-${index}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={grounds.includes(option)}
                  onChange={() => toggleGround(option)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`erv-ground-${index}`}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failed && (
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
              Percentage if corrected
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {marks ? `${marks.projectedPercentage}%` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {marks
                ? `up from ${marks.percentage}% — a gain of ${marks.gainMarks} marks`
                : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the revaluation application letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy application"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Current aggregate",
              marks ? `${marks.totalObtained} / ${marks.totalMax} (${marks.percentage}%)` : "—",
            ],
            [
              "Projected aggregate",
              marks
                ? `${marks.projectedTotal} / ${marks.totalMax} (${marks.projectedPercentage}%)`
                : "—",
            ],
            [
              "Change",
              marks ? `${marks.gainMarks} marks · ${marks.gainPercentagePoints} percentage points` : "—",
            ],
            [
              `Units applied for`,
              plan ? `${plan.units} ${plan.stage.unitLabel}${plan.units === 1 ? "" : "s"}` : "—",
            ],
            ["Total fee", plan ? money(plan.totalFee) : "—"],
            ["Last date to apply", plan ? formatLongDate(plan.lastDate) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {plan && (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm ${STATUS_STYLE[plan.status]}`}>
            {plan.message}
          </p>
        )}

        {marks && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Awarded
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Expected
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {marks.rows.map((row, index) => (
                  <tr
                    key={`${row.name}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3">
                      {row.name}
                      {row.disputed && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                          disputed
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.obtained} / {row.max}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.expected}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {row.gain > 0 ? `+${row.gain}` : row.gain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Application preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only. Fees, window lengths and the exact process are notified afresh
        by each board every year — read that year&apos;s circular and apply through the official
        portal, keeping this letter as the covering application.
      </p>
    </main>
  );
}
