"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, RotateCcw, Timer, TriangleAlert } from "lucide-react";

import {
  SECTIONS,
  SLOTS,
  buildCatDayPlan,
  buildCatKit,
  computeCarryProgress,
  computeCatScore,
  formatSpan,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]";

const FLAG_OPTIONS = [
  { key: "extraTime", label: "Compensatory time has been granted" },
  { key: "scribe", label: "I am using an approved scribe" },
  { key: "outstation", label: "The centre is in another city" },
];

const DEFAULTS = {
  slotId: "slot1",
  customStart: "08:30",
  reportingBefore: "75",
  gateCloseBefore: "45",
  travelMinutes: "45",
  getReadyMinutes: "60",
  varc: "24",
  dilr: "22",
  qa: "22",
  correct: "34",
  wrongMcq: "8",
  wrongTita: "2",
};

export default function ToolHome() {
  const [slotId, setSlotId] = useState(DEFAULTS.slotId);
  const [customStart, setCustomStart] = useState(DEFAULTS.customStart);
  const [reportingBefore, setReportingBefore] = useState(DEFAULTS.reportingBefore);
  const [gateCloseBefore, setGateCloseBefore] = useState(DEFAULTS.gateCloseBefore);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const [getReadyMinutes, setGetReadyMinutes] = useState(DEFAULTS.getReadyMinutes);
  const [counts, setCounts] = useState({ varc: DEFAULTS.varc, dilr: DEFAULTS.dilr, qa: DEFAULTS.qa });
  const [flags, setFlags] = useState({ extraTime: false, scribe: false, outstation: false });
  const [attempts, setAttempts] = useState({
    correct: DEFAULTS.correct,
    wrongMcq: DEFAULTS.wrongMcq,
    wrongTita: DEFAULTS.wrongTita,
  });
  const [packedIds, setPackedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildCatDayPlan({
        slotId,
        customStart,
        extraTime: flags.extraTime,
        reportingBefore: reportingBefore === "" ? 0 : Number(reportingBefore),
        gateCloseBefore: gateCloseBefore === "" ? 0 : Number(gateCloseBefore),
        travelMinutes: travelMinutes === "" ? 0 : Number(travelMinutes),
        getReadyMinutes: getReadyMinutes === "" ? 0 : Number(getReadyMinutes),
        questionCounts: counts,
      }),
    [slotId, customStart, flags.extraTime, reportingBefore, gateCloseBefore, travelMinutes, getReadyMinutes, counts],
  );

  const kit = useMemo(
    () => buildCatKit({ pwd: flags.extraTime, scribe: flags.scribe, outstation: flags.outstation }),
    [flags],
  );

  const hasError = Boolean(plan.error);

  const score = useMemo(
    () =>
      computeCatScore({
        correct: attempts.correct === "" ? 0 : Number(attempts.correct),
        wrongMcq: attempts.wrongMcq === "" ? 0 : Number(attempts.wrongMcq),
        wrongTita: attempts.wrongTita === "" ? 0 : Number(attempts.wrongTita),
        totalQuestions: hasError ? 68 : plan.totalQuestions,
      }),
    [attempts, hasError, plan],
  );

  const scoreError = Boolean(score.error);
  const progress = useMemo(() => computeCarryProgress(kit.carry, packedIds), [kit, packedIds]);

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const setCount = (key, value) => setCounts((current) => ({ ...current, [key]: value }));
  const setAttempt = (key, value) => setAttempts((current) => ({ ...current, [key]: value }));
  const togglePacked = (id) =>
    setPackedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "CAT Exam Day Checklist",
      `${plan.slot.label} — test starts ${plan.startClock}`,
      "",
      "Clock:",
      ...plan.steps.map((step) => `${step.clock}${step.previousDay ? " (previous day)" : ""} — ${step.label}`),
      "",
      "Sectional pace:",
      ...plan.sections.map(
        (section) => `${section.id.toUpperCase()} ${section.startClock}–${section.endClock}, ${section.questions} questions, ${section.paceLabel} each`,
      ),
      "",
      "Carry:",
      ...kit.carry.map((item) => `[${packedIds.includes(item.id) ? "x" : " "}] ${item.label}`),
      "",
      "Barred at the door:",
      ...kit.prohibited.map((item) => `• ${item.label}`),
    ];
    return lines.join("\n");
  }, [hasError, plan, kit, packedIds]);

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
    setSlotId(DEFAULTS.slotId);
    setCustomStart(DEFAULTS.customStart);
    setReportingBefore(DEFAULTS.reportingBefore);
    setGateCloseBefore(DEFAULTS.gateCloseBefore);
    setTravelMinutes(DEFAULTS.travelMinutes);
    setGetReadyMinutes(DEFAULTS.getReadyMinutes);
    setCounts({ varc: DEFAULTS.varc, dilr: DEFAULTS.dilr, qa: DEFAULTS.qa });
    setFlags({ extraTime: false, scribe: false, outstation: false });
    setAttempts({ correct: DEFAULTS.correct, wrongMcq: DEFAULTS.wrongMcq, wrongTita: DEFAULTS.wrongTita });
    setPackedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          CAT test day
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CAT Exam Day Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three sections, 40 minutes each, and no way back once a section locks. This turns your slot
          into an actual clock — when to leave, when the gate shuts, and the minute VARC, DILR and QA
          each close — then lists what the centre will and will not let through.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-slot">
              Slot
            </label>
            <select
              id="cat-slot"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slotId}
              onChange={(event) => setSlotId(event.target.value)}
            >
              {SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                  {slot.id === "custom" ? "" : ` (${slot.start})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-start">
              Test start time
            </label>
            <input
              id="cat-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={slotId === "custom" ? customStart : SLOTS.find((s) => s.id === slotId).start}
              onChange={(event) => setCustomStart(event.target.value)}
              disabled={slotId !== "custom"}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Choose &ldquo;other&rdquo; above to type the time on your own admit card.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-report">
              Reporting opens (minutes before start)
            </label>
            <input
              id="cat-report"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={reportingBefore}
              onChange={(event) => setReportingBefore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-gate">
              Gate closes (minutes before start)
            </label>
            <input
              id="cat-gate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={gateCloseBefore}
              onChange={(event) => setGateCloseBefore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-travel">
              Journey to the centre (minutes)
            </label>
            <input
              id="cat-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="480"
              step="5"
              value={travelMinutes}
              onChange={(event) => setTravelMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-ready">
              Getting ready (minutes)
            </label>
            <input
              id="cat-ready"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={getReadyMinutes}
              onChange={(event) => setGetReadyMinutes(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Questions per section</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <label className={LABEL_CLASS} htmlFor={`cat-q-${section.id}`}>
                  {section.id.toUpperCase()}
                </label>
                <input
                  id={`cat-q-${section.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  value={counts[section.id]}
                  onChange={(event) => setCount(section.id, event.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The split changes between cycles. Set it to whatever your mock or the current pattern uses.
          </p>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Anything special?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FLAG_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`cat-f-${option.key}`}>
                <input
                  id={`cat-f-${option.key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={flags[option.key]}
                  onChange={() => toggleFlag(option.key)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
              Leave home by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.leaveClock}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the test-day clock."
                : `Reporting opens ${plan.reportingClock}, gate closes ${plan.gateClock}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the CAT test day plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Start getting ready", hasError ? DASH : plan.wakeClock],
            ["Test begins", hasError ? DASH : plan.startClock],
            ["Per section", hasError ? DASH : formatSpan(plan.sectionSeconds)],
            ["Test ends", hasError ? DASH : plan.testEndClock],
            ["Questions in all", hasError ? DASH : String(plan.totalQuestions)],
            ["Average per question", hasError || plan.overallPace === 0 ? DASH : formatSpan(plan.overallPace)],
            ["Documents packed", `${progress.packed} of ${progress.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.warnings.length > 0 && (
        <section className="mt-6 grid gap-3">
          {plan.warnings.map((warning) => (
            <p
              key={warning}
              role="alert"
              className="flex items-start gap-3 rounded-lg bg-[var(--warning-soft)] p-3 text-sm leading-5 text-[var(--warning)]"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{warning}</span>
            </p>
          ))}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Sectional windows and pace</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Window</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Questions</th>
                  <th scope="col" className="py-2 font-semibold">Per question</th>
                </tr>
              </thead>
              <tbody>
                {plan.sections.map((section) => (
                  <tr key={section.id} className="border-b border-[var(--border)] align-top">
                    <th scope="row" className="py-3 pr-3 text-left font-semibold">
                      {section.id.toUpperCase()}
                    </th>
                    <td className="py-3 pr-3">
                      {section.startClock} – {section.endClock}
                    </td>
                    <td className="py-3 pr-3">{section.questions}</td>
                    <td className="py-3 font-semibold text-[var(--primary)]">{section.paceLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 grid gap-2">
            {plan.sections.map((section) => (
              <li key={section.id} className="text-xs leading-5 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">{section.id.toUpperCase()}:</span>{" "}
                {section.tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The day, step by step</h2>
          <ol className="mt-3 grid gap-3">
            {plan.steps.map((step) => (
              <li
                key={step.id}
                className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {step.clock}
                  {step.previousDay ? (
                    <span className="block text-[0.65rem] font-medium text-[var(--muted-foreground)]">
                      night before
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {step.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Attempt strategy at +3 and &minus;1</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Wrong multiple-choice answers cost a mark. Wrong type-in-the-answer responses cost nothing,
          so those are worth a considered guess.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["correct", "Correct answers"],
            ["wrongMcq", "Wrong MCQs"],
            ["wrongTita", "Wrong TITA"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cat-a-${key}`}>
                {label}
              </label>
              <input
                id={`cat-a-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={attempts[key]}
                onChange={(event) => setAttempt(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        {scoreError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Net score", scoreError ? DASH : `${score.net} of ${score.maximum}`],
            ["Marks gained", scoreError ? DASH : String(score.gained)],
            ["Marks lost to negatives", scoreError ? DASH : String(score.lost)],
            ["Attempted", scoreError ? DASH : String(score.attempted)],
            ["Left blank", scoreError ? DASH : String(score.unattempted)],
            ["Accuracy", scoreError ? DASH : `${score.accuracy}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Carry these — nothing else is needed</h2>
        <ul className="mt-3 grid gap-3">
          {kit.carry.map((item) => (
            <li key={item.id}>
              <label className={CHECK_ROW} htmlFor={`cat-i-${item.id}`}>
                <input
                  id={`cat-i-${item.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={packedIds.includes(item.id)}
                  onChange={() => togglePacked(item.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.detail}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-base font-semibold">Taken off you at the door</h2>
        <ul className="mt-3 grid gap-3">
          {kit.prohibited.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-lg bg-[var(--danger-soft)] p-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--danger)]">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--danger)]">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-base font-semibold">Given to you at the centre</h2>
        <ul className="mt-3 grid gap-3">
          {kit.provided.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Slot timings, the question split and the permitted-items list are
        republished for each CAT cycle — your admit card and the current instructions on the official
        CAT website are the authority, and reporting times differ from centre to centre.
      </p>
    </main>
  );
}
