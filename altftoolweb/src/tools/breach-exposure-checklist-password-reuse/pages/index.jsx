"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, KeyRound, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";

import {
  ACCOUNT_CATEGORIES,
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_CATEGORIES,
  DEFAULT_DONE,
  GROUPS,
  daysBetween,
  exposureScore,
  overdueSteps,
  scoreChecklist,
  windowLabel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ToolHome() {
  const [today] = useState(todayISO);
  const [discovered, setDiscovered] = useState(today);
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [categories, setCategories] = useState(() => DEFAULT_CATEGORIES.slice());
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const risk = useMemo(() => exposureScore(categories), [categories]);
  const elapsed = useMemo(() => daysBetween(discovered, today), [discovered, today]);
  const triage = useMemo(
    () => (elapsed.error ? elapsed : overdueSteps(done, elapsed.days)),
    [done, elapsed]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleCategory = (id) => {
    setCategories((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setCategories(DEFAULT_CATEGORIES.slice());
    setDiscovered(today);
    setCopied(false);
  };

  const hasScore = !score.error;
  const hasRisk = !risk.error;
  const hasTriage = !triage.error;

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "Password Reuse Breach Checklist",
      `Response score: ${score.percent}% — ${score.bandLabel}`,
      `Steps done: ${score.completed} of ${score.total}`,
      `Critical steps still open: ${score.missingCritical.length} of ${CRITICAL_COUNT}`,
    ];
    if (hasRisk) {
      lines.push(
        `Blast radius: ${risk.tierLabel} (${risk.points}/${risk.maxPoints})`,
        `Also shares the password: ${
          risk.included.length === 0 ? "the breached site only" : risk.included.map((f) => f.label).join(", ")
        }`
      );
    }
    if (hasTriage) lines.push(`Days since discovery: ${triage.daysElapsed}`);
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every step is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- [${windowLabel(item.window)}] ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasScore, hasRisk, hasTriage, score, risk, triage]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Breach response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Password Reuse Breach Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A reused password turns one breach into many, because credential-stuffing tools try the same
          email-and-password pair everywhere automatically. Tick which other accounts share the
          password to see how far it could spread, then work through the rotation, 2FA and password
          manager steps in the order that limits the damage first.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Response score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the password reuse response plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
          aria-label={hasScore ? `Response score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical steps still open",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Blast radius", hasRisk ? risk.tierLabel : DASH],
            ["Days since discovery", hasTriage ? NUM.format(triage.daysElapsed) : DASH],
            ["Steps past their window", hasTriage ? NUM.format(triage.overdue.length) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Rotating low-value accounts
              does not help while the reused password still reaches your email, your money, or has no
              2FA behind it.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Which other accounts use the same password?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick categories only &mdash; never type account names or the password itself. This is the
          step that decides how bad the breach actually is: a password that only reaches one low-value
          account is a nuisance, the same password on your email or bank is not.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ACCOUNT_CATEGORIES.map((field) => (
            <label
              key={field.id}
              htmlFor={`category-${field.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
            >
              <input
                id={`category-${field.id}`}
                type="checkbox"
                checked={categories.includes(field.id)}
                onChange={() => toggleCategory(field.id)}
                className="h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <span className="min-w-0 text-sm font-medium">{field.label}</span>
            </label>
          ))}
        </div>

        {risk.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {risk.error}
          </p>
        ) : (
          <div className="mt-4 rounded-md border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Blast radius
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{risk.tierLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{risk.tierHint}</p>
            <div
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Blast radius ${risk.percent} out of 100`}
            >
              <span className="block h-full bg-[var(--warning)]" style={{ width: `${risk.percent}%` }} />
            </div>
            {risk.chainRisk ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-[var(--danger)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  The reused password reaches your email or a banking account. Either one can reset or
                  drain accounts beyond itself, so the email and financial rotation steps below outrank
                  everything else on this page.
                </span>
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="discovered-on">
              Date you learned about the breach
            </label>
            <input
              id="discovered-on"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              max={today}
              value={discovered}
              onChange={(event) => setDiscovered(event.target.value)}
            />
          </div>
          <div className="self-end text-sm text-[var(--muted-foreground)]">
            <p>
              Each step has a window &mdash; 24 hours, a week, a month, or ongoing. Credential-stuffing
              runs start within hours of a dump going public, so anything still open past its window is
              listed below.
            </p>
          </div>
        </div>

        {triage.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {triage.error}
          </p>
        ) : triage.overdue.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Nothing is past its window at day {NUM.format(triage.daysElapsed)}.
          </p>
        ) : (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              {triage.overdue.length} step{triage.overdue.length === 1 ? "" : "s"} past the window at
              day {NUM.format(triage.daysElapsed)}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {triage.overdue.map((item) => (
                <li key={item.id} className="flex flex-wrap gap-2">
                  <span className="font-semibold text-[var(--warning)]">
                    {windowLabel(item.window)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggleStep(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                            {windowLabel(item.window)}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Rotating only the breached site and stopping there. The site that got breached is rarely
            the one that gets emptied &mdash; it is whichever other account still has the same password.
          </li>
          <li>
            Picking one new password and reusing that across every account you rotate. That recreates
            the exact problem you are trying to fix, one breach later.
          </li>
          <li>
            Treating SMS codes as a full backstop. A SIM swap can intercept them without needing the
            password at all; an authenticator app or passkey does not have that weakness.
          </li>
          <li>
            Skipping the password manager because rotating this one breach felt like enough. Without it,
            the next breach starts the same list from scratch.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not security advice for a business or organisation. The page never asks
        for your actual password and nothing you tick leaves this browser tab. If money has already
        moved, contact your bank and the relevant cybercrime authority straight away.
      </p>
    </main>
  );
}
