"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileJson2,
  Gauge,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Undo2,
  XCircle,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzePlan,
  buildValidationReport,
} from "../lib/validatePlan.mjs";

const JSON_SAMPLE = JSON.stringify(
  {
    goal: "Release version 2.8 safely",
    safeguards: {
      backup: "Create a database snapshot named pre-v2.8 in the recovery vault before changes.",
      checkpoint: "Create Git tag named pre-v2.8 before deployment.",
      confirmation: "Get approval from the release owner before any external write.",
      rollback: "Rollback by deploying version 2.7.3 and restore from snapshot pre-v2.8.",
    },
    actions: [
      {
        name: "Inspect release status",
        description: "Read the current deployment and database migration state.",
      },
      {
        name: "Deploy version 2.8",
        description: "Release the approved build to production.",
      },
      {
        name: "Delete obsolete staging rows",
        description: "Remove records listed in the approved cleanup file.",
      },
      {
        name: "Send customer announcement",
        description: "Email all customers after release health checks pass.",
      },
    ],
  },
  null,
  2,
);

const LINE_SAMPLE = `1. Inspect the current repository status
2. Create a checkpoint named before-config-update
3. Ask the user for confirmation before changing production
4. Update the production configuration
5. Rollback by reverting to checkpoint before-config-update
6. Send a completion message to the project channel`;

const CLASSIFICATION_STYLE = {
  reversible: {
    label: "Reversible",
    className:
      "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
    icon: CheckCircle2,
  },
  recoverable: {
    label: "Recoverable",
    className:
      "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--foreground)]",
    icon: RotateCcw,
  },
  irreversible: {
    label: "Irreversible",
    className:
      "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
    icon: XCircle,
  },
};

const RISK_STYLE = {
  high: "bg-[var(--danger-soft)] text-[var(--danger)]",
  medium: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  low: "bg-[var(--success-soft)] text-[var(--success)]",
};

function downloadText(filename, content) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, tone = "low" }) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </p>
      <p
        className={`mt-2 inline-flex rounded-md px-3 py-1 text-2xl font-black ${RISK_STYLE[tone]}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-[var(--muted-foreground)]">
        {detail}
      </p>
    </article>
  );
}

function SafeguardCard({ safeguard }) {
  const Icon = safeguard.detailed
    ? CheckCircle2
    : safeguard.mentioned
      ? AlertTriangle
      : XCircle;
  const status = safeguard.detailed
    ? "Detailed"
    : safeguard.mentioned
      ? "Too vague"
      : "Not found";
  const className = safeguard.detailed
    ? "bg-[var(--success-soft)] text-[var(--success)]"
    : safeguard.mentioned
      ? "bg-[var(--warning-soft)] text-[var(--foreground)]"
      : "bg-[var(--danger-soft)] text-[var(--danger)]";

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-bold text-[var(--foreground)]">{safeguard.label}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{status}</p>
        </div>
      </div>
    </article>
  );
}

function ActionCard({ action }) {
  const style = CLASSIFICATION_STYLE[action.classification];
  const ClassificationIcon = style.icon;

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Action {action.index}
          </p>
          <h3 className="mt-1 break-words text-lg font-bold text-[var(--foreground)]">
            {action.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${style.className}`}
          >
            <ClassificationIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {style.label}
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${RISK_STYLE[action.risk]}`}
          >
            {action.risk} review
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
        {action.reason}
      </p>
      <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">
        Evidence confidence: {action.confidence}
      </p>

      {action.evidence.length ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Matched evidence
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {action.evidence.map((item, index) => (
              <span
                key={`${item.type}-${item.matched}-${index}`}
                className="rounded-full bg-[var(--section-highlight)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                “{item.matched}” → {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
          No recognized phrase. Treat this as uncertain and review it manually.
        </p>
      )}

      {action.missingSafeguards.length ? (
        <div className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <TriangleAlert
              className="h-4 w-4 text-[var(--warning)]"
              aria-hidden="true"
            />
            Safeguards to clarify
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--foreground)]">
            {action.missingSafeguards.map((item) => (
              <li key={item.key}>• {item.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default function AgentUndoPlanValidator() {
  const [planText, setPlanText] = useState(JSON_SAMPLE);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => analyzePlan(planText), [planText]);
  const report = result.ok ? buildValidationReport(result) : "";

  const copyReport = async () => {
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Agent safety
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--success)]">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Local only
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Agent Undo Plan Validator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Review a proposed agent plan before it acts. Find irreversible
                steps, external side effects, and incomplete recovery details
                without executing a single action.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] p-4 text-sm leading-6 text-[var(--muted-foreground)] lg:max-w-sm">
              Your input stays in this browser tab. It is not uploaded, saved,
              shared, or used to contact any service.
            </div>
          </div>
        </header>

        <Panel
          title="Paste the proposed plan"
          description="Use a JSON array/object with actions or ordinary numbered, bulleted, or line-separated steps."
        >
          <label
            htmlFor="agent-plan"
            className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"
          >
            <FileJson2 className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Action plan
          </label>
          <textarea
            id="agent-plan"
            value={planText}
            onChange={(event) => setPlanText(event.target.value)}
            className="mt-2 min-h-96 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            spellCheck={false}
            aria-invalid={!result.ok}
            aria-describedby={!result.ok ? "agent-plan-error" : "agent-plan-help"}
          />
          <p
            id="agent-plan-help"
            className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]"
          >
            Analysis updates locally as you type. The tool does not run commands,
            URLs, APIs, or agent steps.
          </p>
          {!result.ok ? (
            <p
              id="agent-plan-error"
              role="alert"
              className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {result.error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPlanText(JSON_SAMPLE)}
              className="btn-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Load JSON sample
            </button>
            <button
              type="button"
              onClick={() => setPlanText(LINE_SAMPLE)}
              className="btn-secondary"
            >
              Load line sample
            </button>
            <button
              type="button"
              onClick={() => setPlanText("")}
              className="btn-secondary"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={copyReport}
              disabled={!result.ok}
              className="btn-secondary"
            >
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText("agent-undo-plan-validation.txt", report)
              }
              disabled={!result.ok}
              className="btn-secondary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download report
            </button>
          </div>
        </Panel>

        {result.ok ? (
          <>
            <section aria-label="Plan review summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <Metric
                label="Actions"
                value={result.actions.length}
                detail={`${result.format.toUpperCase()} input`}
              />
              <Metric
                label="Reversible"
                value={result.counts.reversible}
                detail="No change or described undo."
              />
              <Metric
                label="Recoverable"
                value={result.counts.recoverable}
                detail="Recovery appears possible."
                tone="medium"
              />
              <Metric
                label="Irreversible"
                value={result.counts.irreversible}
                detail="Consequences may remain."
                tone={result.counts.irreversible ? "high" : "low"}
              />
              <Metric
                label="Destructive"
                value={result.counts.destructive}
                detail="Potential data loss."
                tone={result.counts.destructive ? "high" : "low"}
              />
              <Metric
                label="External"
                value={result.counts.external}
                detail="Affects another system."
                tone={result.counts.external ? "medium" : "low"}
              />
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <Panel
                title="Plan safeguards"
                description="A mention is not enough: each safeguard needs a usable target, owner, or recovery method."
              >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {Object.values(result.safeguards).map((safeguard) => (
                    <SafeguardCard
                      key={safeguard.key}
                      safeguard={safeguard}
                    />
                  ))}
                </div>
              </Panel>

              <div className="space-y-6 xl:col-span-2">
                <Panel
                  title="Action-by-action evidence"
                  description="Each result names the phrases that influenced it so you can challenge false positives."
                >
                  <div className="space-y-4">
                    {result.actions.map((action) => (
                      <ActionCard key={action.index} action={action} />
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            <section
              aria-label="Analysis limitations"
              className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-bold text-[var(--foreground)]">
                    Static review, not a safety guarantee
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--foreground)]">
                    {result.limitations.map((limitation) => (
                      <li key={limitation}>• {limitation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
            <Gauge
              className="mx-auto h-8 w-8 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <h2 className="mt-3 text-lg font-bold">Waiting for a plan</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Paste JSON or one proposed action per line to start the local review.
            </p>
          </section>
        )}

        <footer className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]"
            aria-hidden="true"
          />
          <p>
            Privacy promise: no network requests, account connection, browser
            storage, analytics payload, or execution is added by this tool.
          </p>
        </footer>
      </div>
    </main>
  );
}
