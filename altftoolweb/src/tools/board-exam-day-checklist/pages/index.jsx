"use client";

import { useMemo, useState } from "react";
import {
  AlarmClock,
  Check,
  ClipboardCheck,
  Copy,
  Info,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import {
  BOARDS,
  PAPER_TYPES,
  buildExamDayKit,
  buildExamDayTimeline,
  computePackedProgress,
  formatDuration,
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
  { key: "privateCandidate", label: "Private, compartment or repeat candidate" },
  { key: "needsScribe", label: "A scribe or extra time has been sanctioned" },
];

const DEFAULTS = {
  boardId: "cbse",
  paperType: "maths",
  examStart: "10:30",
  durationMinutes: "180",
  travelMinutes: "40",
  getReadyMinutes: "60",
  arriveEarlyMinutes: "30",
};

export default function ToolHome() {
  const [boardId, setBoardId] = useState(DEFAULTS.boardId);
  const [paperType, setPaperType] = useState(DEFAULTS.paperType);
  const [examStart, setExamStart] = useState(DEFAULTS.examStart);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const [getReadyMinutes, setGetReadyMinutes] = useState(DEFAULTS.getReadyMinutes);
  const [arriveEarlyMinutes, setArriveEarlyMinutes] = useState(DEFAULTS.arriveEarlyMinutes);
  const [flags, setFlags] = useState({ privateCandidate: false, needsScribe: false });
  const [packedIds, setPackedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const timeline = useMemo(
    () =>
      buildExamDayTimeline({
        examStart,
        durationMinutes: durationMinutes === "" ? 0 : Number(durationMinutes),
        boardId,
        travelMinutes: travelMinutes === "" ? 0 : Number(travelMinutes),
        getReadyMinutes: getReadyMinutes === "" ? 0 : Number(getReadyMinutes),
        arriveEarlyMinutes: arriveEarlyMinutes === "" ? 0 : Number(arriveEarlyMinutes),
      }),
    [examStart, durationMinutes, boardId, travelMinutes, getReadyMinutes, arriveEarlyMinutes],
  );

  const kit = useMemo(() => buildExamDayKit({ boardId, paperType, flags }), [boardId, paperType, flags]);

  const hasError = Boolean(timeline.error) || Boolean(kit.error);
  const errorMessage = timeline.error || kit.error || "";

  const progress = useMemo(
    () => computePackedProgress(kit.error ? {} : kit, packedIds),
    [kit, packedIds],
  );

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const togglePacked = (id) =>
    setPackedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Board Exam Day Checklist",
      `Board: ${timeline.board.label}`,
      `Paper: ${kit.paper.label}`,
      "",
      "Timeline:",
      ...timeline.steps.map(
        (step) => `${step.clock}${step.previousDay ? " (previous day)" : ""} — ${step.label}`,
      ),
      "",
      "Documents and stationery:",
      ...[...kit.documents, ...kit.stationery].map(
        (item) => `[${packedIds.includes(item.id) ? "x" : " "}] ${item.label}`,
      ),
      "",
      "Leave behind:",
      ...kit.prohibited.map((item) => `• ${item.label}`),
    ];
    return lines.join("\n");
  }, [hasError, timeline, kit, packedIds]);

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
    setBoardId(DEFAULTS.boardId);
    setPaperType(DEFAULTS.paperType);
    setExamStart(DEFAULTS.examStart);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setTravelMinutes(DEFAULTS.travelMinutes);
    setGetReadyMinutes(DEFAULTS.getReadyMinutes);
    setArriveEarlyMinutes(DEFAULTS.arriveEarlyMinutes);
    setFlags({ privateCandidate: false, needsScribe: false });
    setPackedIds([]);
    setCopied(false);
  };

  const wakeClock = hasError ? DASH : timeline.steps.find((step) => step.id === "wake");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Exam day
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Board Exam Day Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The gate closes half an hour before the paper starts and no reason gets you in after that.
          Enter the start time and the journey, and this works backwards to the hour you have to be
          awake — then packs the bag for the paper you are actually sitting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bedc-board">
              Board
            </label>
            <select
              id="bedc-board"
              className={`mt-2 ${INPUT_CLASS}`}
              value={boardId}
              onChange={(event) => setBoardId(event.target.value)}
            >
              {BOARDS.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bedc-paper">
              Paper you are sitting
            </label>
            <select
              id="bedc-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paperType}
              onChange={(event) => setPaperType(event.target.value)}
            >
              {PAPER_TYPES.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bedc-start">
              Writing starts at (24-hour)
            </label>
            <input
              id="bedc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={examStart}
              onChange={(event) => setExamStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bedc-duration">
              Paper length (minutes)
            </label>
            <input
              id="bedc-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="300"
              step="15"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bedc-travel">
              Journey to the centre (minutes)
            </label>
            <input
              id="bedc-travel"
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
            <label className={LABEL_CLASS} htmlFor="bedc-ready">
              Getting ready at home (minutes)
            </label>
            <input
              id="bedc-ready"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bedc-early">
              Arrive this long before the gate closes (minutes)
            </label>
            <input
              id="bedc-early"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="5"
              value={arriveEarlyMinutes}
              onChange={(event) => setArriveEarlyMinutes(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Thirty minutes is the usual advice — enough for the frisking queue and to find your room.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Anything special?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FLAG_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`bedc-f-${option.key}`}>
                <input
                  id={`bedc-f-${option.key}`}
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
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Be awake by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : wakeClock.clock}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the exam-day clock."
                : wakeClock.previousDay
                  ? "That falls on the night before — plan to stay nearer the centre."
                  : `${formatDuration(timeline.totalDayMinutes)} from waking to the last bell.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the exam day plan and checklist"
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
            ["Leave home", hasError ? DASH : timeline.steps.find((s) => s.id === "leave").clock],
            ["Reach the centre", hasError ? DASH : timeline.steps.find((s) => s.id === "arrive").clock],
            ["Gate closes", hasError ? DASH : timeline.steps.find((s) => s.id === "gate").clock],
            ["Reading time", hasError ? DASH : formatDuration(timeline.readingMinutes)],
            ["Paper ends", hasError ? DASH : timeline.steps.find((s) => s.id === "end").clock],
            ["Bag packed", hasError ? DASH : `${progress.packed} of ${progress.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${progress.percent} percent of the documents and stationery are packed`}
            >
              <span
                className={`block h-full ${progress.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{timeline.board.note}</p>
          </div>
        )}
      </section>

      {!hasError && timeline.warnings.length > 0 && (
        <section className="mt-6 grid gap-3">
          {timeline.warnings.map((warning) => (
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
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlarmClock className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            The morning, minute by minute
          </h2>
          <ol className="mt-3 grid gap-3">
            {timeline.steps.map((step) => (
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

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Documents — nothing else gets you in</h2>
          <ul className="mt-3 grid gap-3">
            {kit.documents.map((item) => (
              <li key={item.id}>
                <label className={CHECK_ROW} htmlFor={`bedc-i-${item.id}`}>
                  <input
                    id={`bedc-i-${item.id}`}
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

          <h2 className="mt-6 text-base font-semibold">Stationery for {kit.paper.label.toLowerCase()}</h2>
          <ul className="mt-3 grid gap-3">
            {kit.stationery.map((item) => (
              <li key={item.id}>
                <label className={CHECK_ROW} htmlFor={`bedc-i-${item.id}`}>
                  <input
                    id={`bedc-i-${item.id}`}
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

          <h2 className="mt-6 text-base font-semibold">Allowed, and worth having</h2>
          <ul className="mt-3 grid gap-3">
            {kit.comfort.map((item) => (
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

          <h2 className="mt-6 text-base font-semibold">Leave at home</h2>
          <ul className="mt-3 grid gap-3">
            {kit.prohibited.map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-lg bg-[var(--danger-soft)] p-3">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--danger)]">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--danger)]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Gate-closing times, reading time and the list of permitted items are set
        by each board and can change from one session to the next — the instructions printed on your
        own admit card and your school&apos;s circular are the authority.
      </p>
    </main>
  );
}
