"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Phone, RotateCcw, Siren, TriangleAlert } from "lucide-react";
import {
  FIELDS,
  FIELD_GROUPS,
  RED_FLAGS,
  REGIONS,
  ROUTES,
  buildPoisoningBrief,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_EXPOSURE = "2026-01-15T09:15";
const DEFAULT_NOW = "2026-01-15T09:35";
const DASH = "—";

const emptyAnswers = () => Object.fromEntries(FIELDS.map((field) => [field.id, ""]));

const pad = (value) => String(value).padStart(2, "0");
const localNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(emptyAnswers);
  const [redFlags, setRedFlags] = useState([]);
  const [routeId, setRouteId] = useState("swallowed");
  const [regionId, setRegionId] = useState("india");
  const [exposureAt, setExposureAt] = useState(DEFAULT_EXPOSURE);
  const [nowAt, setNowAt] = useState(DEFAULT_NOW);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildPoisoningBrief({ answers, redFlags, routeId, regionId, exposureAt, nowAt }),
    [answers, redFlags, routeId, regionId, exposureAt, nowAt],
  );

  const hasError = Boolean(result.error);

  const toggleFlag = (id) => {
    setRedFlags((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAnswers(emptyAnswers());
    setRedFlags([]);
    setRouteId("swallowed");
    setRegionId("india");
    setExposureAt(DEFAULT_EXPOSURE);
    setNowAt(DEFAULT_NOW);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Siren className="h-4 w-4" aria-hidden="true" />
          Poisoning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Poisoning Information Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Poison centres ask the same questions every time: who, what, how much, by what route,
          when, and what has already been done. Fill them in here and you get route-specific first
          aid and a script you can read straight down the phone.
        </p>
      </header>

      <div
        role="alert"
        className="rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
      >
        <p className="flex items-center gap-2 font-semibold">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Call first, fill this in second
        </p>
        <p className="mt-1">
          If the person is unresponsive, struggling to breathe, fitting or collapsed, call{" "}
          {hasError ? "your local emergency number" : result.emergencyNumber} immediately. Do not
          wait to complete a form, and never wait for symptoms before ringing a poison centre.
        </p>
      </div>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Red flags — check these first</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag.id}
              htmlFor={`flag-${flag.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id={`flag-${flag.id}`}
                type="checkbox"
                checked={redFlags.includes(flag.id)}
                onChange={() => toggleFlag(flag.id)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              <span>{flag.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Route, place and timing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="poison-route">
              How was the person exposed?
            </label>
            <select
              id="poison-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={routeId}
              onChange={(event) => setRouteId(event.target.value)}
            >
              {ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poison-region">
              Where are you?
            </label>
            <select
              id="poison-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regionId}
              onChange={(event) => setRegionId(event.target.value)}
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poison-exposure">
              When did it happen?
            </label>
            <input
              id="poison-exposure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={exposureAt}
              onChange={(event) => setExposureAt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poison-now">
              Time now
            </label>
            <input
              id="poison-now"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={nowAt}
              onChange={(event) => setNowAt(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setNowAt(localNow())}
              className={`mt-2 ${GHOST_BTN} w-full`}
            >
              Use the current time
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">3. What they will ask</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Fields marked required are the ones a poison centre needs before it can advise.
        </p>
        {FIELD_GROUPS.map((group) => (
          <div key={group} className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              {group}
            </h3>
            <div className="mt-2 grid gap-4">
              {FIELDS.filter((field) => field.group === group).map((field) => (
                <div key={field.id}>
                  <label className={LABEL_CLASS} htmlFor={`field-${field.id}`}>
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-[var(--danger)]" aria-hidden="true">
                        *
                      </span>
                    )}
                    {field.required && <span className="sr-only"> (required)</span>}
                  </label>
                  <input
                    id={`field-${field.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={answers[field.id]}
                    onChange={(event) =>
                      setAnswers((prev) => ({ ...prev, [field.id]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
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
              Information gathered
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.completeness}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the times above to build the brief."
                : `${result.filledCount} of ${result.totalFields} details, ${result.requiredCompleteness}% of the required ones`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the call script"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Clear the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.urgent && (
          <div
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="flex items-center gap-2 font-semibold">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {result.emergencyNumber} now — do not finish this form
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.urgentFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Emergency number", hasError ? DASH : result.emergencyNumber],
            ["Poison information line", hasError ? DASH : result.poisonLine],
            ["Route of exposure", hasError ? DASH : result.routeLabel],
            ["Time since exposure", hasError ? DASH : result.sinceLabel],
            [
              "Ready to call",
              hasError ? DASH : result.readyToCall ? "Yes — every required detail is filled in" : "Not yet",
            ],
            [
              "Still missing",
              hasError
                ? DASH
                : result.missingRequired.length === 0
                  ? "Nothing"
                  : result.missingRequired.join("; "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">First aid for {result.routeLabel.toLowerCase()}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.firstAid.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-semibold">Do not</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.doNots.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--danger)]">
                    ×
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your call script</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
                {result.script}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not medical advice. Emergency and poison line numbers are given for
        general reference and can change — confirm your local number in advance and keep it saved.
        Nothing here replaces speaking to a poison information centre or an emergency clinician.
      </p>
    </main>
  );
}
