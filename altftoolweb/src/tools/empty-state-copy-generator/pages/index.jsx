"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Inbox, RotateCcw } from "lucide-react";

import {
  ACTION_MAX_WORDS,
  BODY_MAX_CHARS,
  HEADING_MAX_CHARS,
  STATE_GROUPS,
  STATE_TYPES,
  TONES,
  generateAllTones,
  generateStateCopy,
  reviewCopy,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  stateId: "empty-first-run",
  toneId: "plain",
  object: "invoice",
  action: "create",
  appName: "Acme",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [stateId, setStateId] = useState(DEFAULTS.stateId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [object, setObject] = useState(DEFAULTS.object);
  const [action, setAction] = useState(DEFAULTS.action);
  const [appName, setAppName] = useState(DEFAULTS.appName);
  const [copied, setCopied] = useState(false);

  const copy = useMemo(
    () => generateStateCopy({ stateId, toneId, object, action, appName }),
    [stateId, toneId, object, action, appName],
  );

  const variants = useMemo(
    () => generateAllTones({ stateId, object, action, appName }),
    [stateId, object, action, appName],
  );

  const review = useMemo(() => {
    if (copy.error) return { error: copy.error };
    return reviewCopy({
      heading: copy.heading,
      body: copy.body,
      primaryAction: copy.primaryAction,
      group: copy.group,
    });
  }, [copy]);

  const summary = useMemo(() => {
    if (copy.error) return "";
    return [
      `${copy.stateName} — ${copy.toneName}`,
      `Heading: ${copy.heading}`,
      `Body: ${copy.body}`,
      `Primary action: ${copy.primaryAction}`,
      copy.secondaryAction ? `Secondary action: ${copy.secondaryAction}` : "",
      `Guidance: ${copy.guidance}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [copy]);

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
    setStateId(DEFAULTS.stateId);
    setToneId(DEFAULTS.toneId);
    setObject(DEFAULTS.object);
    setAction(DEFAULTS.action);
    setAppName(DEFAULTS.appName);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Inbox className="h-4 w-4" aria-hidden="true" />
          UX microcopy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Empty State Copy Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a state and a tone, name the thing your screen lists, and get a heading, body and
          button label — then see it linted for length, blame and vague actions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="es-state">
              State
            </label>
            <select
              id="es-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
            >
              {STATE_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {STATE_TYPES.filter((entry) => entry.group === group).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-tone">
              Tone
            </label>
            <select
              id="es-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.name} — {tone.note}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-object">
              What this screen lists (singular)
            </label>
            <input
              id="es-object"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={object}
              onChange={(event) => setObject(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-action">
              Verb for making one
            </label>
            <input
              id="es-action"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={action}
              onChange={(event) => setAction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="es-app">
              Product name
            </label>
            <input
              id="es-app"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
          </div>
        </div>
      </section>

      {copy.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {copy.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Microcopy score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {review.error ? DASH : `${NUM.format(review.score)}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {copy.error ? "Fill in the fields above" : `${copy.stateName} in a ${copy.toneName.toLowerCase()} tone`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the generated copy" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
          <p className="text-lg font-semibold">{copy.error ? DASH : copy.heading}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
            {copy.error ? DASH : copy.body}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {!copy.error && copy.primaryAction ? (
              <span className={PRIMARY_BTN}>{copy.primaryAction}</span>
            ) : null}
            {!copy.error && copy.secondaryAction ? (
              <span className={GHOST_BTN}>{copy.secondaryAction}</span>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Heading length",
              review.error ? DASH : `${NUM.format(review.headingChars)} / ${HEADING_MAX_CHARS} characters`,
            ],
            ["Body length", review.error ? DASH : `${NUM.format(review.bodyChars)} / ${BODY_MAX_CHARS} characters`],
            [
              "Button label",
              review.error ? DASH : `${NUM.format(review.actionWords)} / ${ACTION_MAX_WORDS} words`,
            ],
            ["Writing rule for this state", copy.error ? DASH : copy.guidance],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!copy.error && copy.playfulError && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            A playful tone on an error state reads as flippant when someone has just lost work. Use
            plain or friendly here.
          </p>
        )}

        {!review.error && review.issues.length > 0 && (
          <ul className="mt-4 space-y-2">
            {review.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!variants.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The same state in every tone</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {variants.variants.map((variant) => (
              <button
                key={variant.toneId}
                type="button"
                onClick={() => setToneId(variant.toneId)}
                aria-label={`Use the ${variant.toneName} version`}
                className={`min-h-11 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  variant.toneId === toneId
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {variant.toneName}
                </p>
                <p className="mt-1 text-sm font-semibold">{variant.heading}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{variant.body}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--primary)]">{variant.primaryAction}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Templates are fixed, so the same state, tone and noun always produce the same wording — nothing
        is sent to a model. Treat the output as a starting draft and replace the generic noun with the
        word your users actually use.
      </p>
    </main>
  );
}
