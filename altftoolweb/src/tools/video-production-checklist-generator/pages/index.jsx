"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, RotateCcw } from "lucide-react";

import { VIDEO_TYPES, buildProductionPlan, formatDuration } from "../lib";

const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const d1 = (value) => DEC1.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  videoTypeId: "talking-head",
  runtimeMinutes: "10",
  shootRatio: "3",
  editRatio: "4",
  crewSize: "1",
  contingencyPercent: "20",
  callTime: "09:00",
  outdoor: false,
  multicam: false,
  graphics: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold";

const PHASE_LABELS = { Pre: "Pre-production", Shoot: "Shoot day", Post: "Post-production" };

export default function ToolHome() {
  const [videoTypeId, setVideoTypeId] = useState(DEFAULTS.videoTypeId);
  const [runtimeMinutes, setRuntimeMinutes] = useState(DEFAULTS.runtimeMinutes);
  const [shootRatio, setShootRatio] = useState(DEFAULTS.shootRatio);
  const [editRatio, setEditRatio] = useState(DEFAULTS.editRatio);
  const [crewSize, setCrewSize] = useState(DEFAULTS.crewSize);
  const [contingencyPercent, setContingencyPercent] = useState(DEFAULTS.contingencyPercent);
  const [callTime, setCallTime] = useState(DEFAULTS.callTime);
  const [outdoor, setOutdoor] = useState(DEFAULTS.outdoor);
  const [multicam, setMulticam] = useState(DEFAULTS.multicam);
  const [graphics, setGraphics] = useState(DEFAULTS.graphics);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildProductionPlan({
        videoTypeId,
        runtimeMinutes: Number(runtimeMinutes),
        shootRatio: Number(shootRatio),
        editRatio: Number(editRatio),
        crewSize: Number(crewSize),
        outdoor,
        multicam,
        graphics,
        contingencyPercent: Number(contingencyPercent),
        callTime,
      }),
    [
      videoTypeId,
      runtimeMinutes,
      shootRatio,
      editRatio,
      crewSize,
      outdoor,
      multicam,
      graphics,
      contingencyPercent,
      callTime,
    ],
  );

  const failed = Boolean(plan.error);

  const applyType = (id) => {
    setVideoTypeId(id);
    const type = VIDEO_TYPES.find((item) => item.id === id);
    if (type) {
      setShootRatio(String(type.shootRatio));
      setEditRatio(String(type.editRatio));
    }
    setDone([]);
  };

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Video production plan — ${plan.type.label}`,
      `Finished runtime ${d1(plan.runtimeMinutes)} min · footage ${d1(plan.footageMinutes)} min · editing budget ${formatDuration(plan.editingBudgetMinutes)}`,
      `Total effort ${formatDuration(plan.totalMinutes)} including ${plan.contingencyPercent}% contingency`,
      `Shoot day ${plan.callTime} call, ${plan.wrapTime} wrap`,
      "",
      ...plan.phases.flatMap((phase) => [
        `${PHASE_LABELS[phase.phase]} — ${formatDuration(phase.minutes)}`,
        ...phase.items.map(
          (item) => `  [${done.includes(item.id) ? "x" : " "}] ${item.title} (${formatDuration(item.minutes)})`,
        ),
      ]),
    ].join("\n");
  }, [plan, done, failed]);

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
    setVideoTypeId(DEFAULTS.videoTypeId);
    setRuntimeMinutes(DEFAULTS.runtimeMinutes);
    setShootRatio(DEFAULTS.shootRatio);
    setEditRatio(DEFAULTS.editRatio);
    setCrewSize(DEFAULTS.crewSize);
    setContingencyPercent(DEFAULTS.contingencyPercent);
    setCallTime(DEFAULTS.callTime);
    setOutdoor(DEFAULTS.outdoor);
    setMulticam(DEFAULTS.multicam);
    setGraphics(DEFAULTS.graphics);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Production planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Production Checklist Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the video and get a checklist for every phase with time attached, so the schedule
          is built from the footage you will actually shoot rather than from optimism.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vpc-type">
              Video type
            </label>
            <select
              id="vpc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={videoTypeId}
              onChange={(event) => applyType(event.target.value)}
            >
              {VIDEO_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-runtime">
              Finished runtime (minutes)
            </label>
            <input
              id="vpc-runtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="240"
              step="0.5"
              value={runtimeMinutes}
              onChange={(event) => setRuntimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-crew">
              Crew on the day
            </label>
            <input
              id="vpc-crew"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={crewSize}
              onChange={(event) => setCrewSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-shoot-ratio">
              Shooting ratio (footage min per finished min)
            </label>
            <input
              id="vpc-shoot-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="60"
              step="0.5"
              value={shootRatio}
              onChange={(event) => setShootRatio(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-edit-ratio">
              Editing ratio (edit min per footage min)
            </label>
            <input
              id="vpc-edit-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="60"
              step="0.5"
              value={editRatio}
              onChange={(event) => setEditRatio(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-call">
              Call time
            </label>
            <input
              id="vpc-call"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={callTime}
              onChange={(event) => setCallTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpc-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="vpc-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={contingencyPercent}
              onChange={(event) => setContingencyPercent(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={TOGGLE_CLASS} htmlFor="vpc-outdoor">
            <input
              id="vpc-outdoor"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={outdoor}
              onChange={(event) => setOutdoor(event.target.checked)}
            />
            On location
          </label>
          <label className={TOGGLE_CLASS} htmlFor="vpc-multicam">
            <input
              id="vpc-multicam"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={multicam}
              onChange={(event) => setMulticam(event.target.checked)}
            />
            More than one camera
          </label>
          <label className={TOGGLE_CLASS} htmlFor="vpc-graphics">
            <input
              id="vpc-graphics"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={graphics}
              onChange={(event) => setGraphics(event.target.checked)}
            />
            Titles and graphics
          </label>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total time to deliver
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : formatDuration(plan.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to build the plan."
                : `${plan.taskCount} tasks · includes ${plan.contingencyPercent}% contingency`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the production checklist"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Footage you will record", failed ? DASH : `${d1(plan.footageMinutes)} min`],
            ["Editing budget from that footage", failed ? DASH : formatDuration(plan.editingBudgetMinutes)],
            ["Pre-production", failed ? DASH : formatDuration(plan.phases[0].minutes)],
            ["Shoot day", failed ? DASH : formatDuration(plan.phases[1].minutes)],
            ["Post-production", failed ? DASH : formatDuration(plan.phases[2].minutes)],
            ["Call and wrap", failed ? DASH : `${plan.callTime} – ${plan.wrapTime}`],
            ["Total before contingency", failed ? DASH : formatDuration(plan.totalRawMinutes)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Shoot-day timeline</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Sequential from the call time, before contingency. Wrap with contingency is{" "}
              {plan.wrapTime}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Start</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">End</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Activity</th>
                    <th scope="col" className="py-2 text-right font-semibold">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.timeline.map((slot) => (
                    <tr key={slot.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap font-semibold">{slot.start}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">{slot.end}</td>
                      <td className="py-2 pr-3">{slot.title}</td>
                      <td className="py-2 text-right whitespace-nowrap">{formatDuration(slot.minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {plan.phases.map((phase) => (
            <section
              key={phase.phase}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{PHASE_LABELS[phase.phase]}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{formatDuration(phase.minutes)}</p>
              </div>
              <ul className="mt-3 space-y-3">
                {phase.items.map((item) => (
                  <li key={item.id}>
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-3"
                      htmlFor={`vpc-task-${item.id}`}
                    >
                      <input
                        id={`vpc-task-${item.id}`}
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {item.title}
                          <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                            {formatDuration(item.minutes)}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The shooting and editing ratios are the two numbers that move the estimate most. Track your
        own on the next three videos and replace the defaults — everything else here is arithmetic
        on top of them.
      </p>
    </main>
  );
}
