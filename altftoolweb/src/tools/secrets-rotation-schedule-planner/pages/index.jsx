"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_DUE_SOON_DAYS,
  SECRET_TYPES,
  SECRET_TYPE_BY_ID,
  STATUS,
  planRotationSchedule,
  scheduleToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function defaultSecrets(today) {
  const base = new Date(`${today}T00:00:00Z`);
  const ago = (days) => {
    const d = new Date(base.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };
  return [
    { key: 1, name: "Payments API key", typeId: "api-key", owner: "backend team", lastRotated: ago(75), intervalDays: "" },
    { key: 2, name: "Prod DB password", typeId: "db-password", owner: "ops", lastRotated: ago(40), intervalDays: "" },
    { key: 3, name: "www TLS certificate", typeId: "tls-cert", owner: "platform", lastRotated: ago(20), intervalDays: "" },
  ];
}

const STATUS_STYLES = {
  [STATUS.OVERDUE]: "bg-[var(--danger-soft)] text-[var(--danger)]",
  [STATUS.DUE_SOON]: "bg-[var(--muted)] text-[var(--primary)]",
  [STATUS.OK]: "bg-[var(--muted)] text-[var(--success)]",
};

const STATUS_LABELS = {
  [STATUS.OVERDUE]: "Overdue",
  [STATUS.DUE_SOON]: "Due soon",
  [STATUS.OK]: "OK",
};

export default function ToolHome() {
  const [today, setToday] = useState(() => localToday());
  const [dueSoonDays, setDueSoonDays] = useState(String(DEFAULT_DUE_SOON_DAYS));
  const [secrets, setSecrets] = useState(() => defaultSecrets(localToday()));
  const [nextKey, setNextKey] = useState(4);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planRotationSchedule({
        secrets: secrets.map((secret) => ({ ...secret, id: String(secret.key) })),
        today,
        dueSoonDays: dueSoonDays.trim() === "" ? DEFAULT_DUE_SOON_DAYS : Number(dueSoonDays),
      }),
    [secrets, today, dueSoonDays],
  );

  const hasError = Boolean(plan.error);
  const text = useMemo(() => (hasError ? "" : scheduleToText(plan)), [hasError, plan]);

  const updateSecret = (key, patch) => {
    setSecrets((current) =>
      current.map((secret) => (secret.key === key ? { ...secret, ...patch } : secret)),
    );
  };

  const addSecret = () => {
    setSecrets((current) => [
      ...current,
      { key: nextKey, name: "", typeId: "api-key", owner: "", lastRotated: today, intervalDays: "" },
    ]);
    setNextKey((k) => k + 1);
  };

  const removeSecret = (key) => {
    setSecrets((current) => current.filter((secret) => secret.key !== key));
  };

  const copyResult = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const t = localToday();
    setToday(t);
    setDueSoonDays(String(DEFAULT_DUE_SOON_DAYS));
    setSecrets(defaultSecrets(t));
    setNextKey(4);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          DevSecOps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Secrets Rotation Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List your keys, tokens, passwords and certificates with an owner and last-rotation date,
          and get a deadline-ordered rotation calendar with overdue and due-soon flags. Nothing you
          type leaves your browser — enter secret <em>names</em>, never secret values.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="srp-today">
              Plan as of date
            </label>
            <input
              id="srp-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="srp-window">
              Flag as due soon within (days)
            </label>
            <input
              id="srp-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={dueSoonDays}
              onChange={(event) => setDueSoonDays(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {secrets.map((secret, index) => (
            <fieldset
              key={secret.key}
              className="rounded-lg border border-[var(--border)] p-4"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Secret #{index + 1}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`srp-name-${secret.key}`}>
                    Name / identifier
                  </label>
                  <input
                    id={`srp-name-${secret.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. Payments API key"
                    value={secret.name}
                    onChange={(event) => updateSecret(secret.key, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`srp-type-${secret.key}`}>
                    Type
                  </label>
                  <select
                    id={`srp-type-${secret.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={secret.typeId}
                    onChange={(event) => updateSecret(secret.key, { typeId: event.target.value })}
                  >
                    {SECRET_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label} — every {type.recommendedDays} days
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`srp-owner-${secret.key}`}>
                    Owner
                  </label>
                  <input
                    id={`srp-owner-${secret.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="team or person"
                    value={secret.owner}
                    onChange={(event) => updateSecret(secret.key, { owner: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`srp-last-${secret.key}`}>
                    Last rotated
                  </label>
                  <input
                    id={`srp-last-${secret.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={secret.lastRotated}
                    onChange={(event) =>
                      updateSecret(secret.key, { lastRotated: event.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`srp-interval-${secret.key}`}>
                    Rotation interval (days)
                  </label>
                  <input
                    id={`srp-interval-${secret.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    placeholder={`recommended: ${SECRET_TYPE_BY_ID.get(secret.typeId)?.recommendedDays ?? ""}`}
                    value={secret.intervalDays}
                    onChange={(event) =>
                      updateSecret(secret.key, { intervalDays: event.target.value })
                    }
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Leave blank to use the recommended interval for this type.
                  </p>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeSecret(secret.key)}
                    aria-label={`Remove secret ${secret.name || `#${index + 1}`}`}
                    className={GHOST_BTN}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </fieldset>
          ))}
        </div>

        <button type="button" onClick={addSecret} className={`mt-4 ${PRIMARY_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add secret
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next rotation due
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !plan.nextDue ? DASH : plan.nextDue.nextRotation}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : plan.nextDue
                  ? `${plan.nextDue.name} — owner ${plan.nextDue.owner}. ${plan.counts.overdue} overdue, ${plan.counts.dueSoon} due soon, ${plan.counts.ok} on track.`
                  : "Add a secret to build the calendar."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the rotation schedule as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner to the example secrets"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Rotate by</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Secret</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Owner</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Interval</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                <th scope="col" className="py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : plan.entries).map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{entry.nextRotation}</td>
                  <td className="py-2 pr-3">
                    {entry.name}
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {entry.typeLabel}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{entry.owner}</td>
                  <td className="py-2 pr-3">
                    {entry.intervalDays} d{entry.usesRecommendedInterval ? " (rec.)" : ""}
                  </td>
                  <td className="py-2 pr-3">{entry.ageDays} d</td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[entry.status]}`}
                    >
                      {STATUS_LABELS[entry.status]}
                      {entry.status === STATUS.OVERDUE
                        ? ` ${Math.abs(entry.daysUntilDue)}d`
                        : entry.status === STATUS.DUE_SOON
                          ? ` in ${entry.daysUntilDue}d`
                          : ""}
                    </span>
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={6} className="py-3 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid. Recommended intervals follow published guidance — 90 days for
        cloud access keys (CIS AWS Foundations), a 200-day maximum for public TLS certificates
        issued from 15 March 2026 (CA/Browser Forum ballot SC-081), and NIST SP 800-57 cryptoperiods
        for signing and encryption keys — but your organisation's policy wins. Everything runs
        locally; no data is stored or transmitted.
      </p>
    </main>
  );
}
