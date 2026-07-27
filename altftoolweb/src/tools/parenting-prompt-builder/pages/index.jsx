"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  ATTENTION_MAX_PER_YEAR,
  ATTENTION_MIN_PER_YEAR,
  SESSION_GOALS,
  SETTINGS,
  buildParentingPrompt,
  planSession,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  childName: "",
  ageYears: "4",
  availableMinutes: "45",
  goalId: "screen-free-play",
  settingId: "small-indoor",
  interests: "dinosaurs, trains, anything that can be knocked over",
  materials: "cushions, masking tape, paper, saucepans",
  notes: "",
};

export default function ToolHome() {
  const [childName, setChildName] = useState(DEFAULTS.childName);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [availableMinutes, setAvailableMinutes] = useState(DEFAULTS.availableMinutes);
  const [goalId, setGoalId] = useState(DEFAULTS.goalId);
  const [settingId, setSettingId] = useState(DEFAULTS.settingId);
  const [interests, setInterests] = useState(DEFAULTS.interests);
  const [materials, setMaterials] = useState(DEFAULTS.materials);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planSession({ ageYears, availableMinutes }),
    [ageYears, availableMinutes],
  );

  const result = useMemo(
    () =>
      buildParentingPrompt({
        plan,
        childName,
        goalId,
        settingId,
        interests,
        materials,
        notes,
      }),
    [plan, childName, goalId, settingId, interests, materials, notes],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setChildName(DEFAULTS.childName);
    setAgeYears(DEFAULTS.ageYears);
    setAvailableMinutes(DEFAULTS.availableMinutes);
    setGoalId(DEFAULTS.goalId);
    setSettingId(DEFAULTS.settingId);
    setInterests(DEFAULTS.interests);
    setMaterials(DEFAULTS.materials);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Developmental stage", DASH],
        ["Typical sustained attention", DASH],
        ["Activity block length", DASH],
        ["Transitions allowed", DASH],
        ["Time planned / spare", DASH],
        ["Recommended sleep at this age", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Developmental stage", result.plan.stage.label],
        [
          "Typical sustained attention",
          `${NUM.format(result.plan.attentionLow)}–${NUM.format(result.plan.attentionHigh)} min`,
        ],
        ["Activity block length", `${NUM.format(result.plan.blockMinutes)} min`],
        [
          "Transitions allowed",
          `${NUM.format(result.plan.transitionCount)} × ${NUM.format(result.plan.transitionMinutes)} min`,
        ],
        [
          "Time planned / spare",
          `${NUM.format(result.plan.plannedMinutes)} min / ${NUM.format(result.plan.spareMinutes)} min`,
        ],
        [
          "Recommended sleep at this age",
          result.plan.sleepLow && result.plan.sleepHigh
            ? `${NUM.format(result.plan.sleepLow)}–${NUM.format(result.plan.sleepHigh)} h per 24 h`
            : DASH,
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  const warnings = hasError ? [] : result.plan.warnings;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Family &amp; play
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Parenting Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your child&apos;s age and the minutes you actually have. The tool maps the age
          onto a Piagetian developmental stage, works out a realistic attention block at{" "}
          {ATTENTION_MIN_PER_YEAR}–{ATTENTION_MAX_PER_YEAR} minutes per year of age, fits the
          activities into the time with transitions counted, and writes an AI prompt built
          around those numbers.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-name">
              Child&apos;s name (optional)
            </label>
            <input
              id="pp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
              placeholder="left blank, the prompt says “my child”"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pp-age">
              Age in years
            </label>
            <input
              id="pp-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0.5"
              max="18"
              step="0.5"
              inputMode="decimal"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pp-minutes">
              Minutes you have
            </label>
            <input
              id="pp-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="5"
              max="240"
              step="5"
              inputMode="numeric"
              value={availableMinutes}
              onChange={(event) => setAvailableMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pp-goal">
              What this time is for
            </label>
            <select
              id="pp-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goalId}
              onChange={(event) => setGoalId(event.target.value)}
            >
              {SESSION_GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-setting">
              Where you are
            </label>
            <select
              id="pp-setting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={settingId}
              onChange={(event) => setSettingId(event.target.value)}
            >
              {SETTINGS.map((setting) => (
                <option key={setting.id} value={setting.id}>
                  {setting.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-interests">
              What they are into right now (optional)
            </label>
            <textarea
              id="pp-interests"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-materials">
              What you have to hand (optional)
            </label>
            <textarea
              id="pp-materials"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={materials}
              onChange={(event) => setMaterials(event.target.value)}
              placeholder="left blank, the prompt assumes ordinary household objects only"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-notes">
              Anything else the plan must respect (optional)
            </label>
            <input
              id="pp-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. a sleeping baby in the next room, so nothing loud"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Activities that fit the time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.plan.activityCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `About ${NUM.format(result.plan.blockMinutes)} minutes each, plus ${NUM.format(result.plan.transitionMinutes)} minutes between them for setting up and tidying.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated parenting prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.plan.screenGuidance ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Media guidance (AAP):</span>{" "}
            {result.plan.screenGuidance}
          </p>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stages follow Piaget&apos;s four periods of cognitive development; the attention band is
        the 2–5 minutes per year of age planning heuristic, not a clinical measure; media and
        sleep figures come from the American Academy of Pediatrics media-use policy statements
        and the American Academy of Sleep Medicine consensus recommendations. Every child
        differs — this is a planning aid, not medical or developmental advice.
      </p>
    </main>
  );
}
