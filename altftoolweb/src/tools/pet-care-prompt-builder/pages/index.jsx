"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PawPrint, RotateCcw } from "lucide-react";

import {
  AGE_UNITS,
  EXPERIENCE_LEVELS,
  GOALS,
  SPECIES,
  buildPetCarePrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  species: "dog",
  petName: "Rex",
  breed: "Indie / mixed breed",
  ageValue: "4",
  ageUnit: "months",
  weightKg: "",
  experience: "first-time",
  goal: "house-training",
  concern: "Wees indoors when left alone for more than an hour",
  household: "Two adults, a small flat, no other pets",
  minutesPerDay: "20",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildPetCarePrompt(form), [form]);
  const ok = !result.error;

  const copyPrompt = async () => {
    if (!ok) return;
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
    setCopied(false);
  };

  const rows = [
    ["Life stage", ok ? `${result.lifeStage} — ${result.lifeStageNote}` : DASH],
    ["Age used in the prompt", ok ? result.ageText : DASH],
    [
      "Session plan",
      ok
        ? `${result.sessionsPerDay} x ${result.sessionMinutes} min (${result.plannedMinutes} min used)`
        : DASH,
    ],
    ["Spare minutes for enrichment", ok ? `${result.leftoverMinutes} min` : DASH],
    ok && result.bladderGuidanceIncluded
      ? ["Toilet-break interval", `about every ${NUM.format(result.bladderHours)} h`]
      : null,
    ["Prompt goal", ok ? result.goalLabel : DASH],
    ["Characters", ok ? NUM.format(result.charCount) : DASH],
    ["Estimated tokens", ok ? `~${NUM.format(result.tokenEstimate)}` : DASH],
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PawPrint className="h-4 w-4" aria-hidden="true" />
          Everyday prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pet Care Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe your dog or cat once and get a training or routine prompt that already carries the
          right life stage, session length and toilet-break interval — so the assistant stops giving
          you generic puppy advice for a nine-year-old animal.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-species">
              Species
            </label>
            <select id="pet-species" className={`mt-2 ${INPUT_CLASS}`} value={form.species} onChange={set("species")}>
              {SPECIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-name">
              Pet name (optional)
            </label>
            <input id="pet-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.petName} onChange={set("petName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-age">
              Age
            </label>
            <input
              id="pet-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.ageValue}
              onChange={set("ageValue")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-age-unit">
              Age unit
            </label>
            <select id="pet-age-unit" className={`mt-2 ${INPUT_CLASS}`} value={form.ageUnit} onChange={set("ageUnit")}>
              {AGE_UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-breed">
              Breed or type (optional)
            </label>
            <input id="pet-breed" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.breed} onChange={set("breed")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-weight">
              Weight in kg (optional)
            </label>
            <input
              id="pet-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-goal">
              What the plan is for
            </label>
            <select id="pet-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {GOALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-experience">
              Your experience
            </label>
            <select
              id="pet-experience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.experience}
              onChange={set("experience")}
            >
              {EXPERIENCE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-minutes">
              Training minutes per day
            </label>
            <input
              id="pet-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="240"
              step="5"
              value={form.minutesPerDay}
              onChange={set("minutesPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pet-household">
              Household context (optional)
            </label>
            <input
              id="pet-household"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.household}
              onChange={set("household")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pet-concern">
              The behaviour you most want to change (optional)
            </label>
            <textarea
              id="pet-concern"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.concern}
              onChange={set("concern")}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(result.wordCount)} words` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Tuned for a ${result.lifeStage.toLowerCase()} ${form.species}` : "Fix the input above to build the prompt"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={!ok}
              aria-label="Copy the generated pet care prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.prompt : DASH}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Life-stage bands follow the published AAHA canine and AAFP/AAHA feline
        life-stage frameworks, and the toilet-break figure is the common age-in-months + 1 guideline.
        For anything involving health, pain, diet amounts or sudden behaviour change, speak to a
        veterinarian or a certified behaviourist.
      </p>
    </main>
  );
}
