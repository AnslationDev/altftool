"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { GROUPS, applicableRecords, trackNameChange } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const OPTIONAL_GROUPS = GROUPS.filter((g) => g.optional);
const DEFAULT_GROUPS = ["money", "work", "home"];
const DEFAULT_DONE = ["affidavit", "newspaper"];

const STATUS_STYLE = {
  done: "text-[var(--success)]",
  ready: "text-[var(--primary)]",
  blocked: "text-[var(--muted-foreground)]",
};

const STATUS_LABEL = {
  done: "Done",
  ready: "Ready now",
  blocked: "Blocked",
};

export default function ToolHome() {
  const [activeGroups, setActiveGroups] = useState(DEFAULT_GROUPS);
  const [doneIds, setDoneIds] = useState(DEFAULT_DONE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => trackNameChange({ doneIds, activeOptionalGroups: activeGroups }),
    [doneIds, activeGroups],
  );

  const hasError = Boolean(result.error);

  const toggleGroup = (id) => {
    const next = activeGroups.includes(id)
      ? activeGroups.filter((group) => group !== id)
      : [...activeGroups, id];
    const stillInScope = new Set(applicableRecords(next).map((record) => record.id));
    setActiveGroups(next);
    setDoneIds(doneIds.filter((recordId) => stillInScope.has(recordId)));
  };

  const toggleRecord = (id) => {
    setDoneIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copySummary = async () => {
    if (hasError) return;
    const lines = [
      `Name change progress: ${result.doneCount} of ${result.total} records updated (${result.progressPercent}%).`,
      "",
      "Do next:",
      ...(result.nextActions.length > 0
        ? result.nextActions.map((label, index) => `${index + 1}. ${label}`)
        : ["Nothing outstanding."]),
      "",
      "Still to do:",
      ...result.items
        .filter((item) => !item.done)
        .map(
          (item) =>
            `- ${item.label} (${STATUS_LABEL[item.status]}${
              item.blockedBy.length > 0 ? ` by ${item.blockedBy.join(", ")}` : ""
            })`,
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
    setActiveGroups(DEFAULT_GROUPS);
    setDoneIds(DEFAULT_DONE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Name Change
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Name Change Record Update Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you have already updated. The tracker sequences the rest by dependency — nothing
          appears as &ldquo;ready&rdquo; until the documents it is verified against have been changed
          first.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>Which of these apply to you</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The legal and identity groups always apply.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {OPTIONAL_GROUPS.map((group) => (
              <label
                key={group.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`nc-group-${group.id}`}
              >
                <input
                  id={`nc-group-${group.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={activeGroups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                {group.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Records updated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.progressPercent}%`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={hasError}
              aria-label="Copy the outstanding record list"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the tracker to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Done / total</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${result.doneCount} / ${result.total}`}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Ready to file now</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : result.readyNow.length}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Rounds still needed</dt>
            <dd className="mt-1 text-lg font-semibold">{hasError ? DASH : result.steps}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Do these next</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {hasError ? (
              <li>{DASH}</li>
            ) : result.nextActions.length === 0 ? (
              <li>Nothing outstanding — every record in scope is updated.</li>
            ) : (
              result.nextActions.map((label) => <li key={label}>{label}</li>)
            )}
          </ol>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Every record, in dependency order</h2>
        <ul className="mt-4 space-y-3">
          {hasError
            ? null
            : result.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3"
                    htmlFor={`nc-record-${item.id}`}
                  >
                    <input
                      id={`nc-record-${item.id}`}
                      type="checkbox"
                      className={`mt-0.5 ${CHECKBOX_CLASS}`}
                      checked={item.done}
                      onChange={() => toggleRecord(item.id)}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${item.done ? "line-through opacity-70" : ""}`}
                        >
                          {item.label}
                        </span>
                        <span className={`text-xs font-semibold ${STATUS_STYLE[item.status]}`}>
                          {STATUS_LABEL[item.status]}
                          {item.status === "blocked" ? ` · after ${item.blockedBy.join(", ")}` : ""}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {item.why}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid, not legal advice. The sequence follows the documentary
        requirements the issuing authorities publish — affidavit, newspaper advertisements and
        Gazette notification first, then Aadhaar, then PAN and everything verified against them.
        Requirements differ by state, board and bank; confirm each with the office concerned.
      </p>
    </main>
  );
}
