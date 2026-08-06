"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  COMPLEXITY_OPTIONS,
  DEFAULT_CONTINGENCY_PERCENT,
  DEFAULT_DAY_HOURS,
  DEFAULT_MEAL_MINUTES,
  MOVEMENT_OPTIONS,
  SHOT_SIZES,
  SHOT_STATUSES,
  buildShootingSheet,
  formatMinutes,
  planShotList,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const makeShot = (overrides = {}) => ({
  id: `shot-${Math.random().toString(36).slice(2, 9)}`,
  scene: "Scene 1",
  name: "New shot",
  size: "Medium",
  complexity: "standard",
  movement: "static",
  takes: 3,
  durationSeconds: 15,
  hasTalent: true,
  status: "planned",
  gear: "",
  ...overrides,
});

const DEFAULT_SHOTS = [
  makeShot({
    id: "shot-establish",
    scene: "Scene 1 — Rooftop",
    name: "Establishing skyline",
    size: "Extreme wide",
    complexity: "simple",
    movement: "crane",
    takes: 2,
    durationSeconds: 12,
    hasTalent: false,
    gear: "Drone, ND filters",
  }),
  makeShot({
    id: "shot-dialogue",
    scene: "Scene 1 — Rooftop",
    name: "Two-shot dialogue",
    size: "Medium",
    complexity: "standard",
    movement: "static",
    takes: 4,
    durationSeconds: 45,
    gear: "35mm, bounce board",
  }),
  makeShot({
    id: "shot-reaction",
    scene: "Scene 1 — Rooftop",
    name: "Reaction close-up",
    size: "Close-up",
    complexity: "simple",
    movement: "static",
    takes: 3,
    durationSeconds: 8,
    gear: "85mm",
  }),
  makeShot({
    id: "shot-chase",
    scene: "Scene 2 — Stairwell",
    name: "Chase down stairwell",
    size: "Medium wide",
    complexity: "stunt",
    movement: "handheld",
    takes: 5,
    durationSeconds: 25,
    gear: "Gimbal, crash pads",
  }),
];

export default function ToolHome() {
  const [shots, setShots] = useState(DEFAULT_SHOTS);
  const [dayHours, setDayHours] = useState(String(DEFAULT_DAY_HOURS));
  const [mealMinutes, setMealMinutes] = useState(String(DEFAULT_MEAL_MINUTES));
  const [contingency, setContingency] = useState(String(DEFAULT_CONTINGENCY_PERCENT));
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const plan = useMemo(
    () =>
      planShotList(shots, {
        dayHours: Number(dayHours),
        mealMinutes: Number(mealMinutes),
        contingencyPercent: Number(contingency),
      }),
    [shots, dayHours, mealMinutes, contingency],
  );

  const hasError = Boolean(plan.error);

  const updateShot = (id, key, value) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, [key]: value } : shot)));
  };

  const addShot = () => {
    setShots((prev) => [...prev, makeShot({ scene: prev.at(-1)?.scene ?? "Scene 1" })]);
  };

  const removeShot = (id) => {
    setShots((prev) => prev.filter((shot) => shot.id !== id));
  };

  const sheet = useMemo(() => (hasError ? "" : buildShootingSheet(plan)), [hasError, plan]);

  const copyResult = () => {
    if (!sheet) return;
    copyToClipboard("sheet", sheet, { label: "printable shooting sheet" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the shot list? This replaces every shot and day setting with the defaults and cannot be undone.",
      )
    ) {
      return;
    }
    setShots(DEFAULT_SHOTS);
    setDayHours(String(DEFAULT_DAY_HOURS));
    setMealMinutes(String(DEFAULT_MEAL_MINUTES));
    setContingency(String(DEFAULT_CONTINGENCY_PERCENT));
  };

  const rows = hasError
    ? [
        ["Shooting time still to do", DASH],
        ["Productive time per day", DASH],
        ["Shots remaining", DASH],
        ["Screen time in the cut", DASH],
        ["Shooting ratio", DASH],
      ]
    : [
        ["Shooting time still to do", formatMinutes(plan.workingMinutes)],
        ["Productive time per day", formatMinutes(plan.productiveMinutesPerDay)],
        [
          "Shots remaining",
          `${plan.remainingShots} of ${plan.shotCount} (${plan.statusCounts.shot} shot, ${plan.statusCounts.cut} cut)`,
        ],
        ["Screen time in the cut", formatMinutes(plan.screenMinutes)],
        [
          "Shooting ratio",
          plan.shootingRatio === null ? "No screen time yet" : `${NUM.format(plan.shootingRatio)}:1`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Production planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Shot List Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the shot list, then see how many shooting days it really needs. Each shot is costed
          as setup + rig + rehearsal + takes × (duration + reset), and the day is a{" "}
          {DEFAULT_DAY_HOURS}-hour call minus a {DEFAULT_MEAL_MINUTES}-minute meal break and a{" "}
          {DEFAULT_CONTINGENCY_PERCENT}% contingency.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Day settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="slp-day">
              Shooting day (hours)
            </label>
            <input
              id="slp-day"
              type="number"
              inputMode="decimal"
              min="1"
              max="16"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dayHours}
              onChange={(event) => setDayHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slp-meal">
              Meal break (minutes)
            </label>
            <input
              id="slp-meal"
              type="number"
              inputMode="numeric"
              min="0"
              step="15"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mealMinutes}
              onChange={(event) => setMealMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slp-contingency">
              Contingency (%)
            </label>
            <input
              id="slp-contingency"
              type="number"
              inputMode="numeric"
              min="0"
              max="99"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contingency}
              onChange={(event) => setContingency(event.target.value)}
            />
          </div>
        </div>
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
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Shooting days needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.daysNeeded}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : plan.daysNeeded === 0
                  ? "Every shot is marked shot or cut — nothing left to schedule."
                  : `Last day runs about ${formatMinutes(plan.lastDayMinutes)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the printable shooting sheet"
              className={GHOST_BTN}
            >
              {isCopied("sheet") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("sheet") ? "Copied!" : "Copy sheet"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the shot list to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.scenes.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <caption className="pb-2 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Time by scene
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Scene
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Shots
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.scenes.map((scene) => (
                  <tr key={scene.scene} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{scene.scene}</td>
                    <td className="py-2.5 pr-3">{scene.shots}</td>
                    <td className="py-2.5">{formatMinutes(scene.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 space-y-4">
        {shots.map((shot, index) => (
          <div key={shot.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">
                Shot {index + 1}
                {hasError ? null : (
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                    {formatMinutes(plan.rows[index]?.estimate?.totalMinutes ?? 0)}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => removeShot(shot.id)}
                aria-label={`Remove shot ${index + 1}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-scene`}>
                  Scene
                </label>
                <input
                  id={`${shot.id}-scene`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.scene}
                  onChange={(event) => updateShot(shot.id, "scene", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-name`}>
                  Shot description
                </label>
                <input
                  id={`${shot.id}-name`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.name}
                  onChange={(event) => updateShot(shot.id, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-size`}>
                  Framing
                </label>
                <select
                  id={`${shot.id}-size`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.size}
                  onChange={(event) => updateShot(shot.id, "size", event.target.value)}
                >
                  {SHOT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-move`}>
                  Camera move
                </label>
                <select
                  id={`${shot.id}-move`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.movement}
                  onChange={(event) => updateShot(shot.id, "movement", event.target.value)}
                >
                  {MOVEMENT_OPTIONS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-complexity`}>
                  Setup complexity
                </label>
                <select
                  id={`${shot.id}-complexity`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.complexity}
                  onChange={(event) => updateShot(shot.id, "complexity", event.target.value)}
                >
                  {COMPLEXITY_OPTIONS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-takes`}>
                  Planned takes
                </label>
                <input
                  id={`${shot.id}-takes`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.takes}
                  onChange={(event) =>
                    updateShot(shot.id, "takes", Math.trunc(Number(event.target.value)))
                  }
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-duration`}>
                  Shot length (seconds)
                </label>
                <input
                  id={`${shot.id}-duration`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.durationSeconds}
                  onChange={(event) =>
                    updateShot(shot.id, "durationSeconds", Number(event.target.value))
                  }
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-status`}>
                  Status
                </label>
                <select
                  id={`${shot.id}-status`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.status}
                  onChange={(event) => updateShot(shot.id, "status", event.target.value)}
                >
                  {SHOT_STATUSES.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${shot.id}-gear`}>
                  Gear notes
                </label>
                <input
                  id={`${shot.id}-gear`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={shot.gear}
                  onChange={(event) => updateShot(shot.id, "gear", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3"
                  htmlFor={`${shot.id}-talent`}
                >
                  <input
                    id={`${shot.id}-talent`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={shot.hasTalent}
                    onChange={(event) => updateShot(shot.id, "hasTalent", event.target.checked)}
                  />
                  <span className="text-sm font-medium">
                    Talent in frame (adds a 5-minute blocking rehearsal)
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addShot} aria-label="Add another shot" className={GHOST_BTN}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add shot
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Setup times are planning averages for a small crew. A first AD boarding a union schedule
        will also weigh company moves, night work, turnaround and overtime rules that are set by
        the production&apos;s own agreements rather than by arithmetic.
      </p>
    </main>
  );
}
