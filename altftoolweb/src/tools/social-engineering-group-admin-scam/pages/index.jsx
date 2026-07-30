"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert, UsersRound } from "lucide-react";
import {
  ALL_SIGNALS,
  MAX_SCORE,
  PATTERNS,
  SIGNAL_GROUPS,
  assessGroupAdminRisk,
  formatAssessment,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};
const TONE_BAR = {
  danger: "bg-[var(--danger)]",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
};

const DEFAULT_SELECTED = ["adminDmOnly", "personalUpi", "urgency"];
const DEFAULT_AGE = "4";
const DEFAULT_AMOUNT = "15000";

const DASH = "—";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [groupAge, setGroupAge] = useState(DEFAULT_AGE);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessGroupAdminRisk({
        selectedIds: selected,
        groupAgeDays: groupAge === "" ? 0 : groupAge,
        amountRequested: amount === "" ? 0 : amount,
      }),
    [selected, groupAge, amount],
  );

  const summary = useMemo(() => formatAssessment(result), [result]);
  const failed = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

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
    setSelected(DEFAULT_SELECTED);
    setGroupAge(DEFAULT_AGE);
    setAmount(DEFAULT_AMOUNT);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          Group chat safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          WhatsApp Group Admin Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you can actually see in the chat. Each tell carries a weight drawn from RBI and
          cybercrime advisories, and the result names the fraud pattern the message matches.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="group-age">
              How old is the group (days)?
            </label>
            <input
              id="group-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={groupAge}
              onChange={(event) => {
                setGroupAge(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="group-amount">
              Amount being asked for (INR, 0 if none)
            </label>
            <input
              id="group-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        {SIGNAL_GROUPS.map((group) => (
          <fieldset key={group.id} className="mt-6">
            <legend className="text-sm font-semibold text-[var(--foreground)]">{group.title}</legend>
            <div className="mt-2 grid gap-2">
              {group.signals.map((signal) => {
                const checked = selected.includes(signal.id);
                return (
                  <label
                    key={signal.id}
                    htmlFor={`signal-${signal.id}`}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                      checked
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    <input
                      id={`signal-${signal.id}`}
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      checked={checked}
                      onChange={() => toggle(signal.id)}
                    />
                    <span>
                      {signal.label}
                      {signal.decisive && (
                        <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          decisive
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelected([]);
              setCopied(false);
            }}
            className={GHOST_BTN}
          >
            Clear all tells
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(ALL_SIGNALS.map((signal) => signal.id));
              setCopied(false);
            }}
            className={GHOST_BTN}
          >
            Select all
          </button>
        </div>
      </section>

      {failed && (
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
              Scam risk score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                failed ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]
              }`}
            >
              {failed ? DASH : `${result.score}/${MAX_SCORE}`}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {failed ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the scam risk assessment"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={failed ? "Risk score unavailable" : `Risk score ${result.score} out of ${MAX_SCORE}`}
        >
          {!failed && (
            <span
              className={`block h-full ${TONE_BAR[result.band.tone]}`}
              style={{ width: `${Math.max(2, result.score)}%` }}
            />
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Closest fraud pattern", failed ? DASH : result.topPattern ? result.topPattern.name : "None matched"],
            ["Decisive tells present", failed ? DASH : String(result.decisive.length)],
            ["Tells ticked", failed ? DASH : `${result.matched.length} of ${ALL_SIGNALS.length}`],
            [
              "Group age",
              failed ? DASH : `${result.groupAgeDays} day(s)${result.newGroup ? " — unestablished" : ""}`,
            ],
            ["Money at stake", failed ? DASH : result.amountRequested > 0 ? INR.format(result.amountRequested) : "Nothing requested yet"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {result.band.advice}
          </p>
        )}
      </section>

      {!failed && result.patterns.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Which pattern this matches</h2>
          <ul className="mt-3 grid gap-3">
            {result.patterns.map((pattern) => (
              <li key={pattern.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{pattern.name}</h3>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {pattern.share}% of the evidence
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{pattern.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            What to do next
          </h2>
          <ol className="mt-3 grid gap-2 text-sm leading-6">
            {result.actions.map((action, index) => (
              <li key={action} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The four patterns in one line each</h2>
        <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {Object.values(PATTERNS).map((pattern) => (
            <div key={pattern.id}>
              <dt className="font-semibold">{pattern.name}</dt>
              <dd className="text-[var(--muted-foreground)]">{pattern.summary}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — it scores the tells you report, not the account itself, so a low score is
        not proof a message is genuine. If money has already left your account, call 1930 and file a
        report at cybercrime.gov.in immediately; your bank must be told the same day.
      </p>
    </main>
  );
}
