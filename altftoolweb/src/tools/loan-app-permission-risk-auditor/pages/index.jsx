"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileCode2,
  Info,
  ListChecks,
  LockKeyhole,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzePermissionInput,
  buildAuditReport,
} from "../lib/auditPermissions.mjs";

const SAMPLE_MANIFEST = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.READ_CONTACTS" />
  <uses-permission android:name="android.permission.READ_SMS" />
  <uses-permission android:name="android.permission.READ_CALL_LOG" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

  <application>
    <service
      android:name=".AssistService"
      android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" />
  </application>
</manifest>`;

const LEVEL_STYLES = {
  high: {
    panel: "border-[var(--danger)] bg-[var(--danger-soft)]",
    badge: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
    icon: "text-[var(--danger)]",
  },
  medium: {
    panel: "border-[var(--warning)] bg-[var(--warning-soft)]",
    badge:
      "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--foreground)]",
    icon: "text-[var(--warning)]",
  },
  low: {
    panel: "border-[var(--info)] bg-[var(--info-soft)]",
    badge: "border-[var(--info)] bg-[var(--info-soft)] text-[var(--foreground)]",
    icon: "text-[var(--info)]",
  },
  none: {
    panel: "border-[var(--success)] bg-[var(--success-soft)]",
    badge:
      "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
    icon: "text-[var(--success)]",
  },
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

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{value}</p>
          <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">
            {detail}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function LevelBadge({ level }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.low;
  const label =
    level === "high"
      ? "High attention"
      : level === "medium"
        ? "Elevated attention"
        : level === "none"
          ? "No focused signal"
          : "Review";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${style.badge}`}
    >
      {label}
    </span>
  );
}

function PermissionGroup({ group }) {
  const style = LEVEL_STYLES[group.attention] || LEVEL_STYLES.low;

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-[var(--foreground)]">{group.label}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {group.permissions.length} focused permission
            {group.permissions.length === 1 ? "" : "s"}
          </p>
        </div>
        <LevelBadge level={group.attention} />
      </div>

      <ul className="mt-4 space-y-3">
        {group.permissions.map((permission) => (
          <li
            key={permission.name}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <code className="break-all text-xs font-bold text-[var(--foreground)] sm:text-sm">
                  {permission.name}
                </code>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {permission.explanation}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function LoanAppPermissionRiskAuditor() {
  const [input, setInput] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const audit = useMemo(
    () => analyzePermissionInput(submittedInput),
    [submittedInput],
  );
  const report = useMemo(() => buildAuditReport(audit), [audit]);
  const reviewStyle = LEVEL_STYLES[audit.reviewLevel.key] || LEVEL_STYLES.low;

  function handleAnalyze(event) {
    event.preventDefault();
    setSubmittedInput(input);
    setSubmitted(true);
    setCopied(false);
  }

  function loadSample() {
    setInput(SAMPLE_MANIFEST);
    setSubmittedInput(SAMPLE_MANIFEST);
    setSubmitted(true);
    setCopied(false);
  }

  function clearAll() {
    setInput("");
    setSubmittedInput("");
    setSubmitted(false);
    setCopied(false);
  }

  async function copyReport() {
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                  Local Android permission review
                </p>
                <h1 className="mt-1 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
                  Loan App Permission Risk Auditor
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
              Paste an AndroidManifest.xml or permission list to understand sensitive
              access and combinations that deserve extra scrutiny in a lending app.
              Analysis stays in this browser.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-[var(--foreground)] sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["No upload", LockKeyhole],
              ["No APK execution", Smartphone],
              ["No fraud verdict", ShieldCheck],
            ].map(([label, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg bg-[var(--section-highlight)] px-3 py-2 font-semibold"
              >
                <Icon className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <SectionCard
          title="Paste permissions"
          description="Use a complete AndroidManifest.xml or a comma/newline-separated list such as READ_CONTACTS, READ_SMS."
          icon={FileCode2}
        >
          <form onSubmit={handleAnalyze}>
            <label
              htmlFor="loan-app-permissions"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Manifest XML or permission list
            </label>
            <textarea
              id="loan-app-permissions"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`android.permission.READ_CONTACTS\nandroid.permission.READ_SMS`}
              className="mt-2 min-h-80 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 sm:text-sm"
              spellCheck={false}
              aria-describedby="loan-app-permissions-help"
            />
            <p
              id="loan-app-permissions-help"
              className="mt-2 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]"
            >
              <LockKeyhole
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
                aria-hidden="true"
              />
              Text is processed locally. Do not paste passwords, OTPs, private keys,
              or customer data.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary min-h-10 gap-2">
                <SearchCheck className="h-4 w-4" aria-hidden="true" />
                Analyze permissions
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="btn-secondary min-h-10 gap-2"
              >
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Load example
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="btn-secondary min-h-10 gap-2"
                disabled={!input && !submitted}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="What this check means"
          description="A permission declaration is a request for capability, not proof that access was granted or used."
          icon={Info}
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--info)] bg-[var(--info-soft)] p-4">
              <h3 className="font-bold text-[var(--foreground)]">
                Calibrated, not accusatory
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                Legitimate apps may declare some sensitive permissions for documented
                features. The relevant question is whether each request is necessary,
                proportionate, clearly explained, and actually granted by the user.
              </p>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-[var(--foreground)]">
              {[
                "This is a focused permission checklist, not a malware or code scan.",
                "Android version, target SDK, app role, and device policy can change what a declaration permits.",
                "Accessibility, overlays, unknown-app installs, and device admin require separate special access or activation.",
                "The tool never uploads, installs, or runs an APK.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      {submitted ? (
        <div className="space-y-5" aria-live="polite">
          <section
            className={`rounded-xl border p-5 shadow-sm sm:p-6 ${reviewStyle.panel}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {audit.reviewLevel.key === "none" ? (
                  <CheckCircle2
                    className={`mt-0.5 h-6 w-6 shrink-0 ${reviewStyle.icon}`}
                    aria-hidden="true"
                  />
                ) : (
                  <TriangleAlert
                    className={`mt-0.5 h-6 w-6 shrink-0 ${reviewStyle.icon}`}
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {audit.inputKind}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[var(--foreground)] sm:text-2xl">
                    {audit.reviewLevel.label}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground)]">
                    {audit.reviewLevel.summary}
                  </p>
                </div>
              </div>
              <LevelBadge level={audit.reviewLevel.key} />
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Declared found"
              value={audit.permissions.length}
              detail="Unique Android permissions parsed"
              icon={FileCode2}
            />
            <MetricCard
              label="Focused signals"
              value={audit.classifiedCount}
              detail="Permissions covered by this checklist"
              icon={ShieldAlert}
            />
            <MetricCard
              label="Sensitive groups"
              value={audit.groups.length}
              detail="Types of personal or special access"
              icon={ListChecks}
            />
            <MetricCard
              label="Combinations"
              value={audit.combinations.length}
              detail="Patterns needing contextual review"
              icon={AlertTriangle}
            />
          </div>

          {audit.permissions.length === 0 ? (
            <section className="rounded-xl border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-bold text-[var(--foreground)]">
                    No Android permission names detected
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                    Paste entries such as android.permission.READ_CONTACTS or the
                    corresponding READ_CONTACTS shorthand.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
              <SectionCard
                title="Permission findings"
                description="Groups are ordered by the highest attention level found inside each group."
                icon={ShieldAlert}
              >
                {audit.groups.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {audit.groups.map((group) => (
                      <PermissionGroup key={group.id} group={group} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4">
                    <p className="text-sm leading-6 text-[var(--foreground)]">
                      No permission from this focused sensitive-access checklist was
                      detected. Review the unclassified declarations and the app’s
                      privacy disclosures separately.
                    </p>
                  </div>
                )}

                {audit.unclassifiedCount ? (
                  <details className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <summary className="cursor-pointer font-bold text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                      Other declared permissions ({audit.unclassifiedCount})
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {audit.permissions
                        .filter((permission) => !permission.classified)
                        .map((permission) => (
                          <code
                            key={permission.name}
                            className="rounded-md bg-[var(--section-highlight)] px-2.5 py-1 text-xs text-[var(--foreground)]"
                          >
                            {permission.name}
                          </code>
                        ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                      These are outside this tool’s focused checklist, not automatically
                      safe. Review them against official Android documentation and the
                      app’s stated feature.
                    </p>
                  </details>
                ) : null}
              </SectionCard>

              <div className="space-y-5">
                <SectionCard
                  title="Combination checks"
                  description="Combinations can reveal broader capability than one permission considered alone."
                  icon={AlertTriangle}
                >
                  {audit.combinations.length ? (
                    <div className="space-y-3">
                      {audit.combinations.map((combination) => (
                        <article
                          key={combination.id}
                          className={`rounded-lg border p-4 ${
                            LEVEL_STYLES[combination.level].panel
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-bold text-[var(--foreground)]">
                              {combination.title}
                            </h3>
                            <LevelBadge level={combination.level} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                            {combination.explanation}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
                      No focused multi-permission combination was detected. Individual
                      permissions may still need review.
                    </p>
                  )}
                </SectionCard>

                <SectionCard
                  title="Safer next steps"
                  description="Android labels and menu paths can vary by device."
                  icon={ClipboardCheck}
                >
                  <ol className="space-y-3">
                    {audit.remediation.map((step, index) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--section-highlight)] text-xs font-black text-[var(--primary)]">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              </div>
            </div>
          )}

          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-[var(--foreground)]">Keep the review</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Copy or download a text report. It contains permission names, not your
                  original manifest.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-10 gap-2"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy report"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadText("loan-app-permission-review.txt", report)
                  }
                  className="btn-secondary min-h-10 gap-2"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download report
                </button>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]"
              aria-hidden="true"
            />
            <p>
              <strong>Important:</strong> this result does not establish that an app is
              safe, malicious, abusive, or fraudulent. It reviews declared permission
              patterns only; a complete assessment also needs app provenance, behavior,
              data practices, and independent security analysis.
            </p>
          </div>
        </div>
      ) : (
        <section className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-8 text-center">
          <SearchCheck
            className="mx-auto h-9 w-9 text-[var(--primary)]"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-lg font-bold text-[var(--foreground)]">
            Results will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
            Paste a manifest or permission list, then choose Analyze permissions.
          </p>
        </section>
      )}
    </div>
  );
}
