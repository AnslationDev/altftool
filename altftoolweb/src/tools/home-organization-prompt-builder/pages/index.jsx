"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageOpen, RotateCcw } from "lucide-react";
import { AREA_UNITS, CLUTTER_LEVELS, METHODS, ROOMS, buildHomeOrganizationPrompt } from "../lib";

const DEFAULTS = {
  room: "Bedroom",
  areaValue: "14",
  areaUnit: "sqm",
  clutterLevel: "4",
  minutesPerSqm: "6",
  sessionMinutes: "45",
  sessionsPerWeek: "3",
  method: "four-box",
  householdSize: "2",
  problemAreas: "The chair that collects clothes, the top of the chest of drawers, under the bed.",
  keepConstraints: "Books stay; the sewing machine stays even though it is bulky.",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildHomeOrganizationPrompt({
        room: form.room,
        areaValue: form.areaValue === "" ? 0 : Number(form.areaValue),
        areaUnit: form.areaUnit,
        clutterLevel: form.clutterLevel === "" ? 0 : Number(form.clutterLevel),
        minutesPerSqm: form.minutesPerSqm === "" ? 0 : Number(form.minutesPerSqm),
        sessionMinutes: form.sessionMinutes === "" ? 0 : Number(form.sessionMinutes),
        sessionsPerWeek: form.sessionsPerWeek === "" ? 0 : Number(form.sessionsPerWeek),
        method: form.method,
        householdSize: form.householdSize === "" ? 0 : Number(form.householdSize),
        problemAreas: form.problemAreas,
        keepConstraints: form.keepConstraints,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
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
    ["Floor area", failed ? DASH : `${result.squareMetres} m²`],
    ["Estimated total work", failed ? DASH : `${result.totalMinutes} min (${result.totalHours} h)`],
    ["Finishes in", failed ? DASH : `${result.weeks} ${result.weeks === 1 ? "week" : "weeks"}`],
    ["Pomodoro blocks per session", failed ? DASH : String(result.pomodoros)],
    ["Method", failed ? DASH : result.methodLabel],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageOpen className="h-4 w-4" aria-hidden="true" />
          Everyday prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Home Organization Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size the job from the room&apos;s area and how bad it is, split it into sessions you will
          actually sit through, then generate the prompt that turns it into a plan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ho-room">Room</label>
            <select id="ho-room" className={`mt-2 ${INPUT}`} value={form.room} onChange={set("room")}>
              {ROOMS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-method">Method</label>
            <select id="ho-method" className={`mt-2 ${INPUT}`} value={form.method} onChange={set("method")}>
              {Object.entries(METHODS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-area">Floor area</label>
            <input id="ho-area" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="0" step="0.5" value={form.areaValue} onChange={set("areaValue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-unit">Area unit</label>
            <select id="ho-unit" className={`mt-2 ${INPUT}`} value={form.areaUnit} onChange={set("areaUnit")}>
              {Object.entries(AREA_UNITS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-clutter">Clutter level</label>
            <select id="ho-clutter" className={`mt-2 ${INPUT}`} value={form.clutterLevel} onChange={set("clutterLevel")}>
              {Object.entries(CLUTTER_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>{key} — {value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-rate">Minutes per m² at normal clutter</label>
            <input id="ho-rate" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="1" max="60" step="1" value={form.minutesPerSqm} onChange={set("minutesPerSqm")} />
            <p className={HINT}>Planning rate — raise it for storage-dense rooms like a garage.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-session">Session length (minutes)</label>
            <input id="ho-session" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="10" max="480" step="5" value={form.sessionMinutes} onChange={set("sessionMinutes")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-perweek">Sessions per week</label>
            <input id="ho-perweek" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="14" value={form.sessionsPerWeek} onChange={set("sessionsPerWeek")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-house">People in the household</label>
            <input id="ho-house" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="20" value={form.householdSize} onChange={set("householdSize")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="ho-problem">The worst spots</label>
            <textarea id="ho-problem" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.problemAreas} onChange={set("problemAreas")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ho-keep">Things that must stay</label>
            <textarea id="ho-keep" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.keepConstraints} onChange={set("keepConstraints")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sessions needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.sessions}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to generate your prompt."
                : `${form.sessionMinutes} minutes each at ${result.clutterLabel.toLowerCase()} clutter, ${form.sessionsPerWeek} a week.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the decluttering plan prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The time estimate is a planning figure built from the rate you set, not a measured average —
        treat the first session as your calibration. If clutter is tied to grief, illness or hoarding,
        a professional organiser or therapist will help far more than a checklist.
      </p>
    </main>
  );
}
