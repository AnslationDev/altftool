"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gamepad2, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";

import {
  AUDIT_CHECKLIST,
  AUDIT_GROUPS,
  CRITICAL_CAP_PERCENT,
  PLATFORMS,
  REGIMES,
  buildExportPlan,
  scoreAudit,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");
const CRITICAL_COUNT = AUDIT_CHECKLIST.filter((item) => item.critical).length;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  platformId: "steam",
  regimeId: "gdpr",
  requestedOn: "2026-01-15",
  today: "2026-02-01",
};

const STATUS_COPY = {
  waiting: { label: "Within the deadline", tone: "success" },
  "due-soon": { label: "Deadline within a week", tone: "warning" },
  overdue: { label: "Past the first deadline", tone: "warning" },
  escalate: { label: "Past every extension — escalate", tone: "danger" },
  "no-clock": { label: "No statutory deadline applies", tone: "muted" },
};

const TONE_CLASS = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [regimeId, setRegimeId] = useState(DEFAULTS.regimeId);
  const [requestedOn, setRequestedOn] = useState(DEFAULTS.requestedOn);
  const [today, setToday] = useState(DEFAULTS.today);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => buildExportPlan({ platformId, regimeId, requestedOn, today }),
    [platformId, regimeId, requestedOn, today]
  );
  const audit = useMemo(() => scoreAudit(done), [done]);

  const hasPlan = !plan.error;
  const hasAudit = !audit.error;
  const status = hasPlan ? STATUS_COPY[plan.status] : null;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setPlatformId(DEFAULTS.platformId);
    setRegimeId(DEFAULTS.regimeId);
    setRequestedOn(DEFAULTS.requestedOn);
    setToday(DEFAULTS.today);
    setDone([]);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!hasPlan) return "";
    const lines = [
      "Gaming Account Data Export Guide",
      `Platform: ${plan.platform.name}`,
      `Legal basis: ${plan.regime.name}`,
      `Requested on: ${plan.requestedOn}`,
      `Self-serve copy usually lands: ${plan.selfServeFrom} to ${plan.selfServeBy}`,
    ];
    if (plan.hasStatutoryClock) {
      lines.push(`Statutory deadline: ${plan.statutoryDeadline}`);
      lines.push(`Latest lawful date with an extension: ${plan.extendedDeadline}`);
      lines.push(`Days left as of ${plan.today}: ${plan.daysLeft}`);
    } else {
      lines.push("No fixed statutory deadline applies to this request.");
    }
    if (hasAudit) {
      lines.push("", `Audit progress: ${audit.percent}% (${audit.completed}/${audit.total}) — ${audit.bandLabel}`);
      for (const item of audit.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [plan, hasPlan, audit, hasAudit]);

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
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Gaming data export
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gaming Account Data Export Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the export route for your platform, track the legal deadline it has to answer by, and
          work through what the archive actually reveals about your friends, purchases and chat.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gde-platform">
              Platform
            </label>
            <select
              id="gde-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gde-regime">
              Where you are requesting from
            </label>
            <select
              id="gde-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regimeId}
              onChange={(event) => setRegimeId(event.target.value)}
            >
              {REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gde-requested">
              Date you sent the request
            </label>
            <input
              id="gde-requested"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestedOn}
              onChange={(event) => setRequestedOn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gde-today">
              Count the deadline from
            </label>
            <input
              id="gde-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasPlan && plan.hasStatutoryClock ? "Days left to respond" : "Response deadline"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasPlan && plan.hasStatutoryClock && Number.isFinite(plan.daysLeft)
                ? NUM.format(plan.daysLeft)
                : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{status ? status.label : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasPlan
                ? plan.hasStatutoryClock
                  ? `Counted from ${plan.requestedOn} to the ${plan.statutoryDeadline} deadline, measured on ${plan.today}.`
                  : "Fix a date to see the countdown."
                : "Fix the problem above to see a deadline."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the export plan and audit progress"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasPlan && status ? (
          <p className={`mt-4 inline-flex rounded-md px-3 py-1 text-xs font-semibold ${TONE_CLASS[status.tone]}`}>
            {status.label}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Self-serve copy usually arrives", hasPlan ? `${plan.selfServeFrom} to ${plan.selfServeBy}` : DASH],
            ["Days since the request", hasPlan ? NUM.format(plan.daysElapsed) : DASH],
            [
              "Statutory deadline",
              hasPlan ? (plan.hasStatutoryClock ? plan.statutoryDeadline : "None fixed by law") : DASH,
            ],
            [
              "Latest lawful date with an extension",
              hasPlan ? (plan.hasStatutoryClock ? plan.extendedDeadline : "Not applicable") : DASH,
            ],
            ["Delivery format", hasPlan ? plan.platform.format : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasPlan ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Legal basis. </span>
              {plan.regime.basis}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">If they miss it. </span>
              {plan.regime.escalation}
            </p>
          </>
        ) : null}
      </section>

      {hasPlan ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How to request it from {plan.platform.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{plan.platform.route}</p>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            What the export contains
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.platform.includes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Where people go wrong
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.platform.gotchas.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-labelledby="audit-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="audit-heading" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Post-export audit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasAudit ? `${audit.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasAudit ? audit.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasAudit ? audit.bandHint : "Fix the problem below to see progress."}
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasAudit ? `Audit progress ${audit.percent} out of 100` : "Progress unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasAudit ? audit.percent : 0}%` }}
          />
        </div>

        {audit.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {audit.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps reviewed", hasAudit ? `${audit.completed} of ${audit.total}` : DASH],
            ["Weighted points", hasAudit ? `${NUM.format(audit.points)} / ${NUM.format(audit.maxPoints)}` : DASH],
            ["Critical steps outstanding", hasAudit ? `${audit.missingCritical.length} of ${CRITICAL_COUNT}` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasAudit && audit.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. The identity, money and
              storage checks are the ones that change an outcome.
            </span>
          </p>
        ) : null}

        {hasAudit && audit.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {audit.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {hasAudit && audit.remaining.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Every step reviewed.
          </p>
        ) : null}
      </section>

      <section className="mt-6 space-y-4">
        {AUDIT_GROUPS.map((group) => {
          const items = AUDIT_CHECKLIST.filter((item) => item.group === group);
          const stat = hasAudit ? audit.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {stat ? `${stat.done}/${stat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`gde-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`gde-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is uploaded and the page never asks
        for a gamertag, password or code. Turnaround ranges are observed behaviour, not promises;
        the statutory dates are the ones you can act on. This is general information, not legal
        advice &mdash; talk to a lawyer or your data protection authority before formal escalation.
      </p>
    </main>
  );
}
