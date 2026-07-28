"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  TWO_FACTOR_METHODS,
  assessSetup,
  buildChecklist,
  estimateTotalMinutes,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_METHOD = "authenticator";
const DEFAULT_DONE = ["open-security", "open-2fa"];

const BAND_TEXT = {
  strong: "text-[var(--success)]",
  good: "text-[var(--primary)]",
  partial: "text-[var(--warning)]",
  weak: "text-[var(--danger)]",
};

const DASH = "—";

export default function ToolHome() {
  const [methodId, setMethodId] = useState(DEFAULT_METHOD);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [completed, setCompleted] = useState(() => [...DEFAULT_DONE]);
  const [copied, setCopied] = useState(false);

  const steps = useMemo(() => buildChecklist(methodId), [methodId]);
  const result = useMemo(
    () => assessSetup({ methodId, completedIds: completed, hasSubscription }),
    [methodId, completed, hasSubscription]
  );
  const totalMinutes = useMemo(() => estimateTotalMinutes(methodId), [methodId]);
  const hasError = Boolean(result.error);

  const toggleStep = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "X (Twitter) 2FA setup check",
      `Second factor: ${result.method.label}`,
      `Readiness score: ${result.score}/100 (${result.band.label})`,
      `Steps done: ${result.done} of ${result.total}`,
      `Time left: about ${result.minutesLeft} min`,
      result.remaining.length
        ? `Still to do: ${result.remaining.map((step) => step.title).join("; ")}`
        : "Still to do: nothing — setup complete",
      ...result.warnings.map((warning) => `Warning: ${warning}`),
    ].join("\n");
  }, [hasError, result]);

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
    setMethodId(DEFAULT_METHOD);
    setHasSubscription(false);
    setCompleted([...DEFAULT_DONE]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          X account security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          X (Twitter) 2FA Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Follow the exact Security and account access path, save the backup code, drop the SMS
          fallback and clear out old sessions and connected apps. Everything runs in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>Which method are you enabling?</legend>
          <div className="mt-3 grid gap-3">
            {TWO_FACTOR_METHODS.map((method) => {
              const active = method.id === methodId;
              return (
                <label
                  key={method.id}
                  htmlFor={`x2fa-method-${method.id}`}
                  className={`flex cursor-pointer gap-3 rounded-md border p-3 transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <input
                    id={`x2fa-method-${method.id}`}
                    type="radio"
                    name="x2fa-method"
                    className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    value={method.id}
                    checked={active}
                    onChange={() => setMethodId(method.id)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {method.label}
                      {method.phishingResistant && (
                        <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                          Phishing-resistant
                        </span>
                      )}
                      {method.subscriberOnly && (
                        <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
                          Subscribers only
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                      {method.summary}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label
          htmlFor="x2fa-subscription"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
        >
          <input
            id="x2fa-subscription"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={hasSubscription}
            onChange={(event) => setHasSubscription(event.target.checked)}
          />
          <span>This account has a paid X subscription (needed for the text message method)</span>
        </label>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          A clean setup with this method takes about {totalMinutes} minutes end to end.
        </p>
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
              Account readiness score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : BAND_TEXT[result.band.id]
              }`}
            >
              {hasError ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the X 2FA setup summary"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasError ? "No score available" : `Readiness ${result.score} out of 100`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: hasError ? "0%" : `${result.score}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Method chosen", hasError ? DASH : result.method.label],
            ["Steps completed", hasError ? DASH : `${result.done} of ${result.total}`],
            ["Checklist coverage", hasError ? DASH : `${result.coverage}%`],
            [
              "Time left to finish",
              hasError ? DASH : result.minutesLeft > 0 ? `about ${result.minutesLeft} min` : "done",
            ],
            ["Phishing-resistant", hasError ? DASH : result.method.phishingResistant ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Method note: {result.method.caveat}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Setup checklist</h2>
        {steps.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Choose a method above to see its checklist.
          </p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {steps.map((step, index) => {
              const done = completed.includes(step.id);
              const inputId = `x2fa-step-${step.id}`;
              return (
                <li key={step.id}>
                  <label
                    htmlFor={inputId}
                    className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                      done
                        ? "border-[var(--success)]/40 bg-[var(--success-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                      checked={done}
                      onChange={() => toggleStep(step.id)}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="text-[var(--muted-foreground)]">{index + 1}.</span>
                        {step.title}
                        {step.critical && (
                          <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                            Required
                          </span>
                        )}
                        <span className="text-xs font-normal text-[var(--muted-foreground)]">
                          ~{step.minutes} min
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                        {step.detail}
                      </span>
                      <span className="mt-1 block text-xs break-words text-[var(--muted-foreground)]">
                        Path: {step.where}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide only. X renames and moves settings from time to time, so a menu label
        may differ from what you see. Never read a login code aloud or paste it into a chat, however
        official the request looks.
      </p>
    </main>
  );
}
