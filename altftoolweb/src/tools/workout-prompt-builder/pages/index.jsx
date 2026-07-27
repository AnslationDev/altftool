"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  DAYS_MAX,
  DAYS_MIN,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  MUSCLE_GROUPS,
  SESSION_MINUTES_MAX,
  SESSION_MINUTES_MIN,
  TRAINING_GOALS,
  WEEKLY_SETS_MAX,
  WEEKLY_SETS_MIN,
  buildWorkoutPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const WARN_CLASS =
  "mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const chipClass = (active) =>
  `min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
    active
      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
  }`;

const DEFAULT_GROUPS = MUSCLE_GROUPS.slice(0, 6);
const DEFAULT_KIT = ["Barbell and plates", "Bench", "Pull-up bar", "Adjustable dumbbells"];

const DEFAULTS = {
  daysPerWeek: "4",
  experience: "intermediate",
  goal: "hypertrophy",
  sessionMinutes: "60",
  weeks: "8",
  injuriesRaw: "",
  dislikedExercisesRaw: "Back squat — knee clicks",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [muscleGroups, setMuscleGroups] = useState(DEFAULT_GROUPS);
  const [equipment, setEquipment] = useState(DEFAULT_KIT);
  const [includeDeload, setIncludeDeload] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleGroup = (name) =>
    setMuscleGroups((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  const toggleKit = (name) =>
    setEquipment((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );

  const result = useMemo(
    () => buildWorkoutPrompt({ ...form, muscleGroups, equipment, includeDeload }),
    [form, muscleGroups, equipment, includeDeload],
  );
  const hasError = Boolean(result.error);
  const plan = result.plan;

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setMuscleGroups(DEFAULT_GROUPS);
    setEquipment(DEFAULT_KIT);
    setIncludeDeload(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Workout Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your days, experience and goal. The builder picks a split, works out weekly set volume
          in the {WEEKLY_SETS_MIN}-{WEEKLY_SETS_MAX} set range, and checks whether that volume
          actually fits the time you have.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-days">
              Training days a week
            </label>
            <input
              id="wo-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={DAYS_MIN}
              max={DAYS_MAX}
              step="1"
              value={form.daysPerWeek}
              onChange={set("daysPerWeek")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-minutes">
              Minutes per session
            </label>
            <input
              id="wo-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={SESSION_MINUTES_MIN}
              max={SESSION_MINUTES_MAX}
              step="5"
              value={form.sessionMinutes}
              onChange={set("sessionMinutes")}
            />
            <p className={HINT_CLASS}>Including warm-up and cool-down.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-experience">
              Experience
            </label>
            <select
              id="wo-experience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.experience}
              onChange={set("experience")}
            >
              {EXPERIENCE_LEVELS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-goal">
              Primary goal
            </label>
            <select id="wo-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {TRAINING_GOALS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-weeks">
              Plan length (weeks)
            </label>
            <input
              id="wo-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="16"
              step="1"
              value={form.weeks}
              onChange={set("weeks")}
            />
          </div>
          <div className="flex items-end">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="wo-deload">
              <input
                id="wo-deload"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={includeDeload}
                onChange={(event) => setIncludeDeload(event.target.checked)}
              />
              Include a deload week
            </label>
          </div>
          <div className="sm:col-span-2">
            <fieldset>
              <legend className={LABEL_CLASS}>Muscle groups to train</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={muscleGroups.includes(name)}
                    onClick={() => toggleGroup(name)}
                    className={chipClass(muscleGroups.includes(name))}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="sm:col-span-2">
            <fieldset>
              <legend className={LABEL_CLASS}>Equipment you actually have</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={equipment.includes(name)}
                    onClick={() => toggleKit(name)}
                    className={chipClass(equipment.includes(name))}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-injuries">
              Injuries or limitations (one per line)
            </label>
            <textarea
              id="wo-injuries"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.injuriesRaw}
              onChange={set("injuriesRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wo-dislikes">
              Exercises to avoid (one per line)
            </label>
            <textarea
              id="wo-dislikes"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.dislikedExercisesRaw}
              onChange={set("dislikedExercisesRaw")}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Working sets a week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.weeklyTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${plan.split.name} — ${NUM.format(plan.weeklySetsPerMuscle)} sets per muscle group, about ${plan.frequency}× a week each`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated workout plan prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Split", hasError ? DASH : plan.split.sessions.join(" / ")],
            [
              "Rep range",
              hasError
                ? DASH
                : `${plan.goal.repMin}-${plan.goal.repMax} reps at ${plan.goal.pctMin}-${plan.goal.pctMax}% 1RM`,
            ],
            ["Rest between sets", hasError ? DASH : `${NUM.format(plan.goal.restSec)} seconds`],
            ["Sets in the longest session", hasError ? DASH : NUM.format(plan.heaviestSession)],
            ["Estimated session length", hasError ? DASH : `${NUM.format(plan.estimatedMinutes)} minutes`],
            [
              "Sets that fit your time slot",
              hasError ? DASH : `${NUM.format(plan.setsThatFit)} in ${NUM.format(plan.sessionMinutes)} minutes`,
            ],
            ["Total gym time a week", hasError ? DASH : `${NUM.format(plan.weeklyMinutes)} minutes`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.overTime ? (
        <p className={WARN_CLASS}>
          {NUM.format(plan.heaviestSession)} sets will not fit in {NUM.format(plan.sessionMinutes)}{" "}
          minutes at {NUM.format(plan.goal.restSec)}-second rests — only about{" "}
          {NUM.format(plan.setsThatFit)} will. Drop a muscle group, add a day, or lengthen the
          session. The prompt asks the model to make that call and explain it.
        </p>
      ) : null}

      {!hasError && plan.overCap ? (
        <p className={WARN_CLASS}>
          {NUM.format(plan.heaviestSession)} working sets in one session is past the point where
          quality holds up. Spread the volume over more days.
        </p>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Sets per session</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Session</th>
                  <th scope="col" className="py-2 text-right font-semibold">Working sets</th>
                </tr>
              </thead>
              <tbody>
                {plan.split.sessions.map((name, index) => (
                  <tr key={name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{name}</td>
                    <td className="py-2 text-right">{NUM.format(plan.perSession[index] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not medical, physiotherapy or coaching advice. Set volumes and load
        percentages are population guidance — individual recovery capacity varies widely. If you are
        new to lifting, returning from an injury, pregnant, or managing a heart, joint or metabolic
        condition, get clearance from a doctor and have your technique checked in person before
        loading anything heavy. Everything here runs in your browser and nothing is stored.
      </p>
    </main>
  );
}
