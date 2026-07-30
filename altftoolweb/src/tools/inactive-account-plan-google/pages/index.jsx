"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hourglass, RotateCcw } from "lucide-react";

import { INACTIVITY_OPTIONS, MAX_TRUSTED_CONTACTS, buildPlan } from "../lib";

const DEFAULTS = {
  lastActiveDate: "2026-07-01",
  inactivityMonths: "12",
  trustedContacts: "2",
  deleteAccount: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TIER_LABEL = { essential: "Essential", recommended: "Recommended", optional: "Optional" };
const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};
const TONE_BAR = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};
const DASH = "—";

export default function ToolHome() {
  const [lastActiveDate, setLastActiveDate] = useState(DEFAULTS.lastActiveDate);
  const [inactivityMonths, setInactivityMonths] = useState(DEFAULTS.inactivityMonths);
  const [trustedContacts, setTrustedContacts] = useState(DEFAULTS.trustedContacts);
  const [deleteAccount, setDeleteAccount] = useState(DEFAULTS.deleteAccount);
  const [completed, setCompleted] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildPlan({
        lastActiveDate,
        inactivityMonths: Number(inactivityMonths),
        trustedContacts: Number(trustedContacts),
        deleteAccount,
        completed,
      }),
    [lastActiveDate, inactivityMonths, trustedContacts, deleteAccount, completed],
  );

  const grouped = useMemo(() => {
    if (plan.error) return [];
    return ["essential", "recommended", "optional"]
      .map((tier) => [tier, plan.steps.filter((step) => step.tier === tier)])
      .filter(([, list]) => list.length > 0);
  }, [plan]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      "Google Inactive Account Manager plan",
      `Last activity: ${plan.timeline.lastActiveDate} · inactivity period ${plan.timeline.inactivityMonths} months · ${plan.contacts} trusted contact(s)`,
      `Warning sent to you: ${plan.timeline.warningDate}`,
      `Account treated as inactive: ${plan.timeline.triggerDate}`,
      `Contacts must download by: ${plan.timeline.downloadDeadline}`,
      plan.timeline.deletionDate
        ? `Account deleted: ${plan.timeline.deletionDate}`
        : "Account deletion: not requested",
      `Setup progress: ${plan.score}% (${plan.band}) — ${plan.doneSteps} of ${plan.totalSteps} steps`,
      "",
      "Still to do:",
    ];
    if (plan.remaining.length === 0) lines.push("- nothing, the plan is complete");
    plan.remaining.forEach((step) => {
      lines.push(`- [${TIER_LABEL[step.tier]}] ${step.title}`);
      lines.push(`    ${step.where}`);
    });
    return lines.join("\n");
  }, [plan]);

  const toggleStep = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
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
    setLastActiveDate(DEFAULTS.lastActiveDate);
    setInactivityMonths(DEFAULTS.inactivityMonths);
    setTrustedContacts(DEFAULTS.trustedContacts);
    setDeleteAccount(DEFAULTS.deleteAccount);
    setCompleted([]);
    setCopied(false);
  };

  const toneText = plan.error ? TONE_TEXT.danger : TONE_TEXT[plan.tone] ?? TONE_TEXT.warning;
  const toneBar = plan.error ? TONE_BAR.danger : TONE_BAR[plan.tone] ?? TONE_BAR.warning;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
          Digital inheritance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Google Inactive Account Plan Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out exactly when Google would warn you, when your account would be treated as
          inactive, and how long your trusted contacts have to download the data you left them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iam-date">
              Assume last account activity on
            </label>
            <input
              id="iam-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastActiveDate}
              onChange={(event) => setLastActiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iam-months">
              Inactivity period
            </label>
            <select
              id="iam-months"
              className={`mt-2 ${INPUT_CLASS}`}
              value={inactivityMonths}
              onChange={(event) => setInactivityMonths(event.target.value)}
            >
              {INACTIVITY_OPTIONS.map((months) => (
                <option key={months} value={String(months)}>
                  {months} months
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iam-contacts">
              Trusted contacts (0 to {MAX_TRUSTED_CONTACTS})
            </label>
            <input
              id="iam-contacts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_TRUSTED_CONTACTS}
              step="1"
              value={trustedContacts}
              onChange={(event) => setTrustedContacts(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="iam-delete"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
            >
              <input
                id="iam-delete"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={deleteAccount}
                onChange={(event) => setDeleteAccount(event.target.checked)}
              />
              Delete the account afterwards
            </label>
          </div>
        </div>
      </section>

      {plan.error ? (
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
              Data download deadline
            </p>
            <p className={`mt-1 text-4xl font-semibold ${toneText}`}>
              {plan.error ? DASH : plan.timeline.downloadDeadline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the inputs above to see the timeline."
                : `${plan.timeline.totalDays} days from the last activity date`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Inactive Account Manager plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plan" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Google warns you (email and SMS)", plan.error ? DASH : plan.timeline.warningDate],
            ["Account treated as inactive", plan.error ? DASH : plan.timeline.triggerDate],
            ["Trusted contacts notified", plan.error ? DASH : plan.timeline.triggerDate],
            ["Download link stops working", plan.error ? DASH : plan.timeline.downloadDeadline],
            [
              "Account deleted",
              plan.error ? DASH : plan.timeline.deletionDate ?? "Not requested",
            ],
            [
              "Margin before Google's own 2-year policy",
              plan.error ? DASH : `${plan.timeline.policyMarginMonths} months`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!plan.error && plan.warnings.length > 0 && (
          <div className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <ul className="list-disc space-y-1 pl-5">
              {plan.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Setup progress</h2>
          <p className={`text-2xl font-semibold ${toneText}`}>
            {plan.error ? DASH : `${plan.score}%`}
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${toneBar}`}
            style={{ width: plan.error ? "0%" : `${plan.score}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {plan.error
            ? "Fix the inputs above to see the checklist."
            : `${plan.band} · ${plan.essentialsMissing} of ${plan.essentialsTotal} essential steps still open`}
        </p>
      </section>

      {!plan.error &&
        grouped.map(([tier, list]) => (
          <section key={tier} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              {TIER_LABEL[tier]}{" "}
              <span className="font-normal text-[var(--muted-foreground)]">({list.length})</span>
            </h2>
            <ul className="mt-3 space-y-3">
              {list.map((step) => (
                <li key={step.id} className="rounded-lg border border-[var(--border)] p-3">
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3"
                    htmlFor={`iam-step-${step.id}`}
                  >
                    <input
                      id={`iam-step-${step.id}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={step.done}
                      onChange={() => toggleStep(step.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold leading-6">{step.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--primary)]">
                        {step.where}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {step.why}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal advice. How digital assets pass on differs by jurisdiction —
        speak to a solicitor when you write or update your will. Dates here follow Google&apos;s
        published intervals; the exact day a notification lands can vary.
      </p>
    </main>
  );
}
