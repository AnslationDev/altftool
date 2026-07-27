"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw } from "lucide-react";

import { GAZETTE_TRIGGERS, applicableItems, buildSurnameChecklist } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULT_TRIGGER = "surname-only";
const DEFAULT_DONE = ["register-marriage", "check-spelling"];

const MODE_LABEL = { "in-person": "In person", online: "Online" };

export default function ToolHome() {
  const [triggerId, setTriggerId] = useState(DEFAULT_TRIGGER);
  const [doneIds, setDoneIds] = useState(DEFAULT_DONE);
  const [skipPhaseLocks, setSkipPhaseLocks] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildSurnameChecklist({ triggerId, doneIds, skipPhaseLocks }),
    [triggerId, doneIds, skipPhaseLocks],
  );

  const hasError = Boolean(result.error);

  const changeTrigger = (nextId) => {
    const stillInScope = new Set(applicableItems(nextId).map((item) => item.id));
    setTriggerId(nextId);
    setDoneIds(doneIds.filter((id) => stillInScope.has(id)));
  };

  const toggleItem = (id) => {
    setDoneIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyRemaining = async () => {
    if (hasError) return;
    const lines = [
      `Surname change progress: ${result.doneCount} of ${result.total} steps done (${result.overallPercent}%).`,
      `Next: ${result.currentPhaseLabel}`,
      "",
      "Documents to keep to hand:",
      ...(result.documentsToCarry.length > 0
        ? result.documentsToCarry.map((doc) => `- ${doc.label} (needed by ${doc.usedBy} steps)`)
        : ["- None outstanding."]),
      "",
      "Steps left:",
      ...result.phases.flatMap((phase) =>
        phase.items
          .filter((item) => !item.done)
          .map((item) => `- [${MODE_LABEL[item.mode]}] ${item.label}`),
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTriggerId(DEFAULT_TRIGGER);
    setDoneIds(DEFAULT_DONE);
    setSkipPhaseLocks(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Name Change
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Surname Change After Marriage Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Five phases, in the order the offices expect them. Tells you whether a Gazette
          notification is actually needed, which documents to carry, and how many of the remaining
          steps still require a counter visit.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-trigger">
              What exactly is changing
            </label>
            <select
              id="sc-trigger"
              className={`mt-2 ${INPUT_CLASS}`}
              value={triggerId}
              onChange={(event) => changeTrigger(event.target.value)}
            >
              {GAZETTE_TRIGGERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="sc-unlock"
          >
            <input
              id="sc-unlock"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={skipPhaseLocks}
              onChange={(event) => setSkipPhaseLocks(event.target.checked)}
            />
            Show every phase, even the ones not reached yet
          </label>
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
              Checklist complete
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.overallPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.currentPhaseLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyRemaining}
              disabled={hasError}
              aria-label="Copy the remaining steps and documents"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Steps done</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${result.doneCount} / ${result.total}`}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Counter visits left</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : result.inPersonRemaining}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Doable online</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : result.onlineRemaining}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <p className="text-sm font-semibold">
            Gazette notification: {hasError ? DASH : result.gazetteNeeded ? "recommended" : "not usually needed"}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {hasError ? DASH : result.gazetteReason}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
            Documents the remaining steps ask for
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {hasError ? (
              <li>{DASH}</li>
            ) : result.documentsToCarry.length === 0 ? (
              <li>Nothing outstanding.</li>
            ) : (
              result.documentsToCarry.map((doc) => (
                <li key={doc.label}>
                  {doc.label}{" "}
                  <span className="text-[var(--muted-foreground)]">
                    — needed by {doc.usedBy} step{doc.usedBy === 1 ? "" : "s"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {hasError
        ? null
        : result.phases.map((phase) => (
            <section
              key={phase.id}
              className={`mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)] ${
                phase.locked ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{phase.label}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {phase.doneCount} / {phase.total} · {phase.percent}%
                  {phase.locked ? " · finish the phase above first" : ""}
                </p>
              </div>
              <ul className="mt-4 space-y-3">
                {phase.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3"
                      htmlFor={`sc-item-${item.id}`}
                    >
                      <input
                        id={`sc-item-${item.id}`}
                        type="checkbox"
                        className={`mt-0.5 ${CHECKBOX_CLASS}`}
                        checked={item.done}
                        onChange={() => toggleItem(item.id)}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${item.done ? "line-through opacity-70" : ""}`}
                          >
                            {item.label}
                          </span>
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                            {MODE_LABEL[item.mode]}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.note}
                        </span>
                        {item.docs.length > 0 ? (
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            Carry: {item.docs.join(", ")}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid, not legal advice. No Indian law requires a spouse to take the
        other&rsquo;s surname — every step here is optional. Marriage registration is governed by the
        Hindu Marriage Act 1955 or the Special Marriage Act 1954, and document requirements differ by
        state, bank and passport office; confirm each with the authority concerned.
      </p>
    </main>
  );
}
