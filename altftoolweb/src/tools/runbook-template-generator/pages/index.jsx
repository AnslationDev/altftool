"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import { SEVERITY_LEVELS, buildRunbook, formatDuration } from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  service: "checkout-api",
  alert: "HighCheckoutErrorRate (5xx > 2% for 5m)",
  severityId: "sev2",
  ownerTeam: "Payments Platform",
  escalationContacts: "Payments on-call (primary)\nPlatform SRE (secondary)\nDirector of Engineering (30+ min unresolved)",
  symptoms:
    "Checkout 5xx rate above 2% on the service dashboard\nCustomer reports of failed card payments\nUpstream payment gateway latency climbing",
  checks:
    "Confirm the alert against the error-rate panel, not just the page\nCheck recent deploys and feature flag changes in the last 60 minutes\nCheck pod restarts and OOM kills for the checkout deployment\nCheck the payment gateway status page and its error budget\nCheck database connection pool saturation",
  remediation:
    "Roll back the most recent checkout-api deploy if it landed inside the alert window\nDisable the newest feature flag touching the checkout path\nScale the checkout deployment up by 50% if CPU is saturated\nFail over to the secondary payment gateway if the primary is returning 5xx",
  rollback:
    "Re-enable any flag you turned off once error rate is back under 0.5% for 15 minutes\nScale replicas back to baseline after traffic normalises",
  dashboardUrl: "https://grafana.internal/d/checkout-api/overview",
  logQuery: 'service="checkout-api" AND status>=500',
};

export default function ToolHome() {
  const [service, setService] = useState(DEFAULTS.service);
  const [alert, setAlert] = useState(DEFAULTS.alert);
  const [severityId, setSeverityId] = useState(DEFAULTS.severityId);
  const [ownerTeam, setOwnerTeam] = useState(DEFAULTS.ownerTeam);
  const [escalationContacts, setEscalationContacts] = useState(DEFAULTS.escalationContacts);
  const [symptoms, setSymptoms] = useState(DEFAULTS.symptoms);
  const [checks, setChecks] = useState(DEFAULTS.checks);
  const [remediation, setRemediation] = useState(DEFAULTS.remediation);
  const [rollback, setRollback] = useState(DEFAULTS.rollback);
  const [dashboardUrl, setDashboardUrl] = useState(DEFAULTS.dashboardUrl);
  const [logQuery, setLogQuery] = useState(DEFAULTS.logQuery);
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRunbook({
        service,
        alert,
        severityId,
        ownerTeam,
        escalationContacts,
        symptoms,
        checks,
        remediation,
        rollback,
        dashboardUrl,
        logQuery,
        generatedOn: reviewDate,
      }),
    [
      service,
      alert,
      severityId,
      ownerTeam,
      escalationContacts,
      symptoms,
      checks,
      remediation,
      rollback,
      dashboardUrl,
      logQuery,
      reviewDate,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setService(DEFAULTS.service);
    setAlert(DEFAULTS.alert);
    setSeverityId(DEFAULTS.severityId);
    setOwnerTeam(DEFAULTS.ownerTeam);
    setEscalationContacts(DEFAULTS.escalationContacts);
    setSymptoms(DEFAULTS.symptoms);
    setChecks(DEFAULTS.checks);
    setRemediation(DEFAULTS.remediation);
    setRollback(DEFAULTS.rollback);
    setDashboardUrl(DEFAULTS.dashboardUrl);
    setLogQuery(DEFAULTS.logQuery);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Observability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Runbook Template Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn an alert into a Markdown runbook a half-awake responder can follow: symptoms to confirm,
          checks in order, mitigation before diagnosis, and an escalation ladder with real time targets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-service">
              Service or system
            </label>
            <input
              id="rb-service"
              className={`mt-2 ${INPUT_CLASS}`}
              value={service}
              onChange={(event) => setService(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-alert">
              Alert or failure mode
            </label>
            <input
              id="rb-alert"
              className={`mt-2 ${INPUT_CLASS}`}
              value={alert}
              onChange={(event) => setAlert(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-severity">
              Severity
            </label>
            <select
              id="rb-severity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={severityId}
              onChange={(event) => setSeverityId(event.target.value)}
            >
              {SEVERITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-owner">
              Owning team
            </label>
            <input
              id="rb-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ownerTeam}
              onChange={(event) => setOwnerTeam(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-dashboard">
              Dashboard URL (optional)
            </label>
            <input
              id="rb-dashboard"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dashboardUrl}
              onChange={(event) => setDashboardUrl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-review">
              Last reviewed
            </label>
            <input
              id="rb-review"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reviewDate}
              onChange={(event) => setReviewDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="rb-logquery">
            Log query (optional)
          </label>
          <input
            id="rb-logquery"
            className={`mt-2 ${INPUT_CLASS}`}
            value={logQuery}
            onChange={(event) => setLogQuery(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-symptoms">
              Symptoms
            </label>
            <textarea
              id="rb-symptoms"
              rows={4}
              className={`mt-2 ${AREA_CLASS}`}
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
            />
            <p className={HINT_CLASS}>One per line. What a responder should see before acting.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-checks">
              Diagnostic checks
            </label>
            <textarea
              id="rb-checks"
              rows={5}
              className={`mt-2 ${AREA_CLASS}`}
              value={checks}
              onChange={(event) => setChecks(event.target.value)}
            />
            <p className={HINT_CLASS}>Ordered. Cheapest and most likely cause first.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-remediation">
              Remediation steps
            </label>
            <textarea
              id="rb-remediation"
              rows={5}
              className={`mt-2 ${AREA_CLASS}`}
              value={remediation}
              onChange={(event) => setRemediation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-rollback">
              Rollback steps (optional)
            </label>
            <textarea
              id="rb-rollback"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={rollback}
              onChange={(event) => setRollback(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-escalation">
              Escalation contacts (optional)
            </label>
            <textarea
              id="rb-escalation"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={escalationContacts}
              onChange={(event) => setEscalationContacts(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
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
              Actionable steps in this runbook
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(result.stepCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to generate the document." : `${NUM.format(result.words)} words of Markdown`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated runbook Markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Severity", hasError ? dash : result.severity.label],
            ["Acknowledge within", hasError ? dash : formatDuration(result.ackMinutes)],
            ["Stakeholder updates", hasError ? dash : formatDuration(result.updateMinutes)],
            ["Status page", hasError ? dash : result.severity.statusPage ? "Required" : "Not required"],
            ["Symptoms listed", hasError ? dash : NUM.format(result.symptomCount)],
            ["Diagnostic checks", hasError ? dash : NUM.format(result.checkCount)],
            ["Remediation steps", hasError ? dash : NUM.format(result.remediationCount)],
            ["Document length", hasError ? dash : `${NUM.format(result.lines)} lines`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Generated runbook</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
            <pre className="min-w-[280px] p-4 text-xs leading-6 text-[var(--foreground)]">
              <code>{result.markdown}</code>
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The response targets are common on-call defaults, not a policy. Replace them with your own
        published incident SLA before you put this runbook on rotation.
      </p>
    </main>
  );
}
