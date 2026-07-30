"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, ShieldAlert } from "lucide-react";
import {
  CONTEXTS,
  LIMITS,
  PLATFORMS,
  TRACKS,
  buildTeacherPlan,
  formatTeacherPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CONTEXT = "secondary";
const DEFAULT_PLATFORMS = ["classroom", "whatsapp"];
const DEFAULT_DONE = ["mfa"];
const DEFAULT_CLASSES = "4";
const DEFAULT_PER_CLASS = "30";
const DEFAULT_PERSONAL_PHONE = true;

export default function ToolHome() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [platforms, setPlatforms] = useState(DEFAULT_PLATFORMS);
  const [done, setDone] = useState(DEFAULT_DONE);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [perClass, setPerClass] = useState(DEFAULT_PER_CLASS);
  const [usesPersonalPhone, setUsesPersonalPhone] = useState(DEFAULT_PERSONAL_PHONE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTeacherPlan({
        context,
        platforms,
        done,
        classes: classes.trim() === "" ? NaN : Number(classes),
        perClass: perClass.trim() === "" ? NaN : Number(perClass),
        usesPersonalPhone,
      }),
    [context, platforms, done, classes, perClass, usesPersonalPhone],
  );
  const ok = !result.error;

  const togglePlatform = (id) => {
    setPlatforms((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleAction = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => (ok ? formatTeacherPlan(result) : ""), [ok, result]);

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
    setContext(DEFAULT_CONTEXT);
    setPlatforms(DEFAULT_PLATFORMS);
    setDone(DEFAULT_DONE);
    setClasses(DEFAULT_CLASSES);
    setPerClass(DEFAULT_PER_CLASS);
    setUsesPersonalPhone(DEFAULT_PERSONAL_PHONE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Classroom privacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Teacher Privacy Starter Kit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it where you teach and which platforms you actually use, tick what is already done,
          and get a short, weighted plan for protecting student records and keeping your own
          number, device and time separate from the job.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-context">
              Where you teach
            </label>
            <select
              id="tk-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={context}
              onChange={(event) => {
                setContext(event.target.value);
                setCopied(false);
              }}
            >
              {CONTEXTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-personal-phone">
              Personal mobile number
            </label>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-md border border-[var(--border)] px-3">
              <input
                id="tk-personal-phone"
                type="checkbox"
                checked={usesPersonalPhone}
                onChange={(event) => {
                  setUsesPersonalPhone(event.target.checked);
                  setCopied(false);
                }}
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              <label htmlFor="tk-personal-phone" className="cursor-pointer text-sm">
                Parents or students have my personal number
              </label>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-classes">
              Classes or sections you teach
            </label>
            <input
              id="tk-classes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={LIMITS.maxClasses}
              step="1"
              value={classes}
              onChange={(event) => {
                setClasses(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-per-class">
              Students per class
            </label>
            <input
              id="tk-per-class"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={LIMITS.maxPerClass}
              step="1"
              value={perClass}
              onChange={(event) => {
                setPerClass(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Platforms you use for class work</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PLATFORMS.map((platform) => {
              const checked = platforms.includes(platform.id);
              return (
                <label
                  key={platform.id}
                  htmlFor={`tk-platform-${platform.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <input
                    id={`tk-platform-${platform.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlatform(platform.id)}
                    className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  />
                  {platform.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {!ok && (
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
              Readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.score}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.band.label} — ${result.band.advice}` : "Fix the setting above to see your score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the readiness score and outstanding actions"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Readiness score ${result.score} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.score))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Actions done", ok ? `${result.completed.length} of ${result.applicable.length}` : DASH],
            ["Student records you handle", ok ? `about ${NUM.format(result.studentRecords)}` : DASH],
            ["Students are minors", ok ? (result.minorStudents ? "Yes — DPDP applies" : "No") : DASH],
            [
              "Personal number shared",
              ok ? (result.usesPersonalPhone ? "Yes" : "No") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.outstanding.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Do these first</h2>
          <ol className="mt-3 space-y-3">
            {result.firstThree.map((action, index) => (
              <li key={action.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-bold text-[var(--primary-foreground)]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{action.label}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{action.why}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The full kit</h2>
        {TRACKS.map((track) => {
          const trackStat = ok ? result.tracks.find((entry) => entry.id === track.id) : null;
          const actions = ok ? result.applicable.filter((action) => action.track === track.id) : [];
          if (ok && actions.length === 0) return null;
          return (
            <div key={track.id} className="mt-5 first:mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {track.label}
                </h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {trackStat ? `${trackStat.coverage}% covered` : DASH}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {actions.map((action) => {
                  const checked = done.includes(action.id);
                  const isTop = ok && result.firstThree.some((item) => item.id === action.id);
                  return (
                    <li key={action.id} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="flex items-start gap-3">
                        <input
                          id={`tk-action-${action.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAction(action.id)}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                        <div className="min-w-0">
                          <label
                            htmlFor={`tk-action-${action.id}`}
                            className="block cursor-pointer text-sm font-semibold"
                          >
                            {action.label}
                          </label>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Why: {action.why}</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {action.weight} readiness point{action.weight === 1 ? "" : "s"}
                          </p>
                          {isTop && !checked && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
                              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                              Highest impact
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not legal advice. Where your students are minors, processing their
        personal data under India&apos;s Digital Personal Data Protection Act 2023 needs verifiable
        parental consent, held by the school as the data fiduciary — follow your institution&apos;s
        own policy and reporting route for any data incident.
      </p>
    </main>
  );
}
