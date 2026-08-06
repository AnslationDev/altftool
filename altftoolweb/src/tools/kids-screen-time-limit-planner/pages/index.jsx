"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw } from "lucide-react";

import { buildScreenPlan, formatDuration } from "../lib";

const DEFAULTS = {
  ageYears: "9",
  wakeTime: "07:00",
  bedTime: "21:00",
  schoolHours: "6",
  napMinutes: "0",
  activityMinutes: "60",
  schoolworkMinutes: "30",
  videoMinutes: "60",
  gameMinutes: "45",
  socialMinutes: "15",
  videoCallMinutes: "15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const MINUTE_FIELDS = [
  { key: "schoolworkMinutes", id: "kstl-schoolwork", label: "Homework / study on a screen (min)" },
  { key: "videoMinutes", id: "kstl-video", label: "Shows and video (min)" },
  { key: "gameMinutes", id: "kstl-games", label: "Games (min)" },
  { key: "socialMinutes", id: "kstl-social", label: "Social and chat (min)" },
  { key: "videoCallMinutes", id: "kstl-calls", label: "Video calls with family (min)" },
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      buildScreenPlan({
        ageYears: toNumber(form.ageYears),
        wakeTime: form.wakeTime,
        bedTime: form.bedTime,
        schoolHours: toNumber(form.schoolHours),
        napMinutes: toNumber(form.napMinutes),
        activityMinutes: toNumber(form.activityMinutes),
        schoolworkMinutes: toNumber(form.schoolworkMinutes),
        videoMinutes: toNumber(form.videoMinutes),
        gameMinutes: toNumber(form.gameMinutes),
        socialMinutes: toNumber(form.socialMinutes),
        videoCallMinutes: toNumber(form.videoCallMinutes),
      }),
    [form],
  );

  const hasError = Boolean(plan.error);

  const rows = hasError
    ? [
        ["Daily guideline for this age", DASH],
        ["Recreational screens used", DASH],
        ["Left in the allowance", DASH],
        ["Homework screens (outside the cap)", DASH],
        ["Family video calls (outside the cap)", DASH],
        ["All screen time today", DASH],
        ["Sleep window", DASH],
        ["Physical activity", DASH],
        ["Unstructured free time left", DASH],
        ["Screens off by", DASH],
      ]
    : [
        [`Daily guideline (${plan.band})`, formatDuration(plan.capMinutes)],
        ["Recreational screens used", formatDuration(plan.recreationalMinutes)],
        [
          plan.remainingMinutes < 0 ? "Over the allowance by" : "Left in the allowance",
          formatDuration(Math.abs(plan.remainingMinutes)),
        ],
        ["Homework screens (outside the cap)", formatDuration(plan.breakdown.schoolwork)],
        ["Family video calls (outside the cap)", formatDuration(plan.breakdown.videoCalls)],
        ["All screen time today", formatDuration(plan.totalScreenMinutes)],
        [
          plan.napMinutes > 0 ? "Sleep window (incl. naps)" : "Sleep window",
          plan.sleepBand
            ? `${formatDuration(plan.sleepMinutes)} (target ${plan.sleepBand.minHours}-${plan.sleepBand.maxHours} h)`
            : formatDuration(plan.sleepMinutes),
        ],
        [
          "Physical activity",
          `${formatDuration(plan.activityMinutes)} of ${formatDuration(plan.activityTargetMinutes)}`,
        ],
        ["Unstructured free time left", formatDuration(plan.freeMinutes)],
        ["Screens off by", plan.screensOffAtLabel],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kids Screen Time Limit Planner",
      `Age: ${plan.age} years (${plan.band})`,
      `Guideline: ${formatDuration(plan.capMinutes)} recreational screen time — ${plan.capSource}`,
      `Planned recreational screens: ${formatDuration(plan.recreationalMinutes)} (video ${formatDuration(plan.breakdown.video)}, games ${formatDuration(plan.breakdown.games)}, social ${formatDuration(plan.breakdown.social)})`,
      `Homework screens: ${formatDuration(plan.breakdown.schoolwork)} · Video calls: ${formatDuration(plan.breakdown.videoCalls)}`,
      `Total screen time: ${formatDuration(plan.totalScreenMinutes)}`,
      `Sleep window: ${formatDuration(plan.sleepMinutes)}`,
      `Physical activity: ${formatDuration(plan.activityMinutes)} of ${formatDuration(plan.activityTargetMinutes)}`,
      `Screens off by: ${plan.screensOffAtLabel}`,
    ].join("\n");
  }, [hasError, plan]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const usedShare =
    hasError || plan.capMinutes <= 0
      ? 0
      : Math.max(0, Math.min(100, (plan.recreationalMinutes / plan.capMinutes) * 100));

  const statusTone =
    !hasError && plan.status === "over" ? "text-[var(--danger)]" : "text-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kids Screen Time Limit Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set an age-appropriate daily screen budget, split it by purpose, and see whether the day still
          leaves room for sleep, activity and unstructured play.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The day</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-age">
              Child&apos;s age (years)
            </label>
            <input
              id="kstl-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="17"
              step="1"
              value={form.ageYears}
              onChange={setField("ageYears")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-school">
              School or childcare (hours)
            </label>
            <input
              id="kstl-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="14"
              step="0.5"
              value={form.schoolHours}
              onChange={setField("schoolHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-wake">
              Wake time
            </label>
            <input
              id="kstl-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.wakeTime}
              onChange={setField("wakeTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-bed">
              Bedtime
            </label>
            <input
              id="kstl-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.bedTime}
              onChange={setField("bedTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-activity">
              Physical activity planned (min)
            </label>
            <input
              id="kstl-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={form.activityMinutes}
              onChange={setField("activityMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kstl-nap">
              Daytime naps, if any (min)
            </label>
            <input
              id="kstl-nap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={form.napMinutes}
              onChange={setField("napMinutes")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Sleep guidelines for younger children include naps — add nap time here so the sleep
              check is accurate. Leave at 0 for children who no longer nap.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Screen minutes by purpose</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Homework screens and live video calls with family are tracked separately — only shows, games
          and social count towards the recreational limit.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {MINUTE_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={form[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recreational screen time today
            </p>
            <p className={`mt-1 text-4xl font-semibold ${statusTone}`}>
              {hasError ? DASH : formatDuration(plan.recreationalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `Guideline for this age: ${formatDuration(plan.capMinutes)} · ${plan.capSource}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the screen time plan"
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

        {!hasError && plan.capMinutes > 0 && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(usedShare)} percent of the daily recreational allowance is used`}
            >
              <span
                className={`block h-full ${plan.status === "over" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${usedShare}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {Math.round(usedShare)}% of the allowance used
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">A suggested split of the allowance</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Purpose
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Suggested
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Your plan
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Shows and video", plan.suggestedSplit.video, plan.breakdown.video],
                  ["Games", plan.suggestedSplit.games, plan.breakdown.games],
                  ["Social and chat", plan.suggestedSplit.social, plan.breakdown.social],
                ].map(([label, suggested, actual]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {formatDuration(suggested)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${actual > suggested ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
                    >
                      {formatDuration(actual)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These limits come from WHO, AAP and Canadian 24-Hour Movement guidance and
        are starting points, not diagnoses — content quality, co-viewing and your child&apos;s needs
        matter as much as the clock. Talk to your paediatrician about sleep, development or behaviour
        concerns.
      </p>
    </main>
  );
}
