"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardPaste,
  Download,
  ExternalLink,
  FileCode2,
  Info,
  KeyRound,
  ListChecks,
  LockKeyhole,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  Timer,
} from "lucide-react";

import {
  auditAuthenticationExperience,
  authenticationAuditLimits,
  buildAuthenticationAuditReport,
  defaultAuthenticationChecklist,
} from "../lib/auditAuthentication.mjs";

const SAMPLE_HTML = `<form aria-labelledby="sign-in-title">
  <h2 id="sign-in-title">Sign in</h2>
  <label for="account">Email</label>
  <input id="account" name="account" type="email" autocomplete="username">

  <label for="password">Password</label>
  <input
    id="password"
    name="password"
    type="password"
    autocomplete="current-password"
    onpaste="return false"
  >

  <p class="login-error">The details were not accepted.</p>
  <p>Solve this CAPTCHA to continue.</p>
  <button type="submit">Sign in</button>
</form>`;

const CHECKLIST_FIELDS = [
  {
    key: "pasteSupport",
    label: "Paste in password and code fields",
    icon: ClipboardPaste,
    options: [
      ["unknown", "Not tested / unknown"],
      ["allowed", "Paste works"],
      ["blocked", "Paste is blocked"],
    ],
  },
  {
    key: "passwordManagerSupport",
    label: "Password-manager and browser autofill",
    icon: LockKeyhole,
    options: [
      ["unknown", "Not tested / unknown"],
      ["works", "Works in tested tools"],
      ["blocked", "Blocked or filled values rejected"],
    ],
  },
  {
    key: "codeEntrySupport",
    label: "Verification-code entry",
    icon: KeyRound,
    options: [
      ["unknown", "Not tested / unknown"],
      ["paste-or-autofill", "Paste or autofill works"],
      ["manual-transcription-only", "Manual transcription is required"],
      ["not-applicable", "No verification-code step"],
    ],
  },
  {
    key: "cognitiveRequirement",
    label: "Cognitive function test",
    icon: Brain,
    options: [
      ["unknown", "Not tested / unknown"],
      ["none", "No cognitive test"],
      ["assisted-or-alternative", "Assistance or non-cognitive path exists"],
      [
        "forced-recall-or-transcription",
        "Forced recall, puzzle, or transcription",
      ],
      ["object-recognition-only", "Object recognition only"],
      ["personal-content-only", "User-provided non-text content only"],
    ],
  },
  {
    key: "alternativeMethod",
    label: "Alternative authentication method",
    icon: ShieldCheck,
    options: [
      ["unknown", "Not tested / unknown"],
      ["available", "Available and usable"],
      ["unavailable", "No alternative is available"],
      ["not-applicable", "No cognitive step"],
    ],
  },
  {
    key: "timeoutSupport",
    label: "Content-set time limit",
    icon: Timer,
    options: [
      ["unknown", "Not tested / unknown"],
      ["no-content-limit", "No content-set limit"],
      ["turn-off-or-adjust", "Can turn off or widely adjust"],
      ["warn-and-extend", "Warning and sufficient extension"],
      ["essential-exception", "Essential or real-time exception claimed"],
      ["unsupported", "Limit has no user control"],
    ],
  },
  {
    key: "errorRecovery",
    label: "Error explanation and recovery",
    icon: Info,
    options: [
      ["unknown", "Not tested / unknown"],
      ["clear-text-and-suggestion", "Clear text and safe correction guidance"],
      ["generic-or-unclear", "Generic or unclear errors"],
      ["no-recovery-path", "No usable recovery path"],
    ],
  },
];

const SOURCES = [
  {
    title: "Understanding SC 3.3.8 — Accessible Authentication (Minimum)",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum",
  },
  {
    title: "Understanding SC 3.3.9 — Accessible Authentication (Enhanced)",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced",
  },
  {
    title: "Understanding SC 2.2.1 — Timing Adjustable",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable",
  },
  {
    title: "Understanding SC 1.3.5 — Identify Input Purpose",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose",
  },
  {
    title: "Understanding SC 3.3.1 — Error Identification",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification",
  },
  {
    title: "Understanding SC 3.3.3 — Error Suggestion",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion",
  },
];

const FINDING_STYLE = {
  high: {
    Icon: AlertTriangle,
    box: "border-danger bg-danger-soft",
    badge: "bg-danger-soft text-danger",
    label: "High priority",
  },
  medium: {
    Icon: AlertTriangle,
    box: "border-warning bg-warning-soft",
    badge: "bg-warning-soft text-foreground",
    label: "Needs attention",
  },
  review: {
    Icon: Info,
    box: "border-border bg-surface",
    badge: "bg-surface-soft text-foreground",
    label: "Manual review",
  },
};

const ASSESSMENT_STYLE = {
  action: {
    Icon: AlertTriangle,
    box: "border-danger bg-danger-soft",
    icon: "bg-danger-soft text-danger",
  },
  review: {
    Icon: Info,
    box: "border-warning bg-warning-soft",
    icon: "bg-warning-soft text-foreground",
  },
  clear: {
    Icon: CheckCircle2,
    box: "border-success bg-success-soft",
    icon: "bg-success-soft text-success",
  },
};

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "accessible-authentication-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Assessment({ result }) {
  const style = ASSESSMENT_STYLE[result.assessment.level];
  const Icon = style.Icon;
  return (
    <section
      className={`rounded-xl border p-5 sm:p-6 ${style.box}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Limited local review
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {result.assessment.description}
          </p>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["High priority", result.counts.high],
          ["Needs attention", result.counts.medium],
          ["Manual review", result.counts.review],
          ["Elements inspected", result.stats.elementsInspected],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 text-2xl font-black text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FindingCard({ item }) {
  const style = FINDING_STYLE[item.severity];
  const Icon = style.Icon;
  return (
    <article className={`rounded-xl border p-5 ${style.box}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon
            className="mt-1 h-5 w-5 shrink-0 text-foreground"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {item.reference}
            </p>
            <h3 className="mt-1 font-bold text-foreground">{item.title}</h3>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
        >
          {style.label}
          {item.count > 1 ? ` · ${item.count}` : ""}
        </span>
      </div>
      <dl className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Why review it
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-foreground">
            {item.reason}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Suggested next check
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-foreground">
            {item.action}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Evidence: {item.origin}. No source excerpt is stored in the result.
      </p>
    </article>
  );
}

export default function AccessibleAuthenticationAuditor() {
  const [source, setSource] = useState("");
  const [checklist, setChecklist] = useState({
    ...defaultAuthenticationChecklist,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const report = useMemo(
    () => (result?.ok ? buildAuthenticationAuditReport(result) : null),
    [result],
  );
  const observedCount = useMemo(
    () =>
      CHECKLIST_FIELDS.filter((field) => checklist[field.key] !== "unknown")
        .length + Number(Boolean(checklist.timeoutSeconds)),
    [checklist],
  );

  const invalidateResult = () => {
    setResult(null);
    setError("");
  };

  const updateSource = (value) => {
    setSource(value.slice(0, authenticationAuditLimits.maxSourceLength));
    invalidateResult();
  };

  const updateChecklist = (key, value) => {
    setChecklist((current) => ({ ...current, [key]: value }));
    invalidateResult();
  };

  const runAudit = () => {
    const next = auditAuthenticationExperience({ source, checklist });
    if (!next.ok) {
      setError(next.errors.join(" "));
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setSource("");
    setChecklist({ ...defaultAuthenticationChecklist });
    setResult(null);
    setError("");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Local, inert authentication review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Accessible Authentication Auditor
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Inspect pasted authentication markup and record observed flow
              behavior for paste, password-manager, cognitive, timeout,
              verification-code, and error-recovery risks.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="font-bold text-foreground">Not a conformance test</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Static cues and checklist answers cannot prove WCAG conformance,
              legal compliance, security, or usability across the complete
              authentication flow.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <FileCode2
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Optional HTML source
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste an authentication fragment. It is parsed as inert text and
                never rendered or executed.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary min-h-10 px-4"
              onClick={() => updateSource(SAMPLE_HTML)}
            >
              Load review sample
            </button>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Authentication HTML source</span>
            <textarea
              className="input-field min-h-80 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder='<input type="password" autocomplete="current-password">'
              spellCheck="false"
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {source.length.toLocaleString()} /{" "}
              {authenticationAuditLimits.maxSourceLength.toLocaleString()}{" "}
              characters
            </span>
            <span>
              No URL fetch, DOM rendering, script execution, or storage
            </span>
          </div>
        </section>

        <aside className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Official references
          </h2>
          <ul className="mt-4 space-y-3">
            {SOURCES.map((sourceItem) => (
              <li key={sourceItem.href}>
                <a
                  className="inline-flex items-start gap-2 text-sm font-semibold leading-6 text-primary underline-offset-4 hover:underline"
                  href={sourceItem.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{sourceItem.title}</span>
                  <ExternalLink
                    className="mt-1 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Official W3C/WAI material reviewed 24 July 2026. Understanding
            documents explain criteria and techniques; they do not certify this
            result.
          </p>
        </aside>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
              Observed flow checklist
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Test the real login, recovery, multi-factor, and rate-limited
              states. Leave anything untested as unknown.
            </p>
          </div>
          <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
            {observedCount} observations recorded
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CHECKLIST_FIELDS.map((field) => {
            const Icon = field.icon;
            return (
              <label
                key={field.key}
                className="rounded-lg border border-border bg-surface-soft p-4"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  {field.label}
                </span>
                <select
                  className="input-field mt-3 w-full"
                  value={checklist[field.key]}
                  onChange={(event) =>
                    updateChecklist(field.key, event.target.value)
                  }
                >
                  {field.options.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
          <label className="rounded-lg border border-border bg-surface-soft p-4">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Timer className="h-4 w-4 text-primary" aria-hidden="true" />
              Known time limit in seconds
            </span>
            <input
              className="input-field mt-3 w-full"
              type="number"
              inputMode="numeric"
              min="1"
              max="72000"
              step="1"
              value={checklist.timeoutSeconds}
              onChange={(event) =>
                updateChecklist("timeoutSeconds", event.target.value)
              }
              placeholder="Optional"
            />
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              Duration alone is not a pass/fail signal; record the matching
              control above.
            </span>
          </label>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11 px-5"
          onClick={runAudit}
        >
          <SearchCheck className="h-4 w-4" aria-hidden="true" />
          Review authentication flow
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11 px-5"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {report ? (
          <button
            type="button"
            className="btn-secondary min-h-11 px-5"
            onClick={() => downloadReport(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download counts-only JSON
          </button>
        ) : null}
      </div>

      {result?.ok ? (
        <div className="space-y-6">
          <Assessment result={result} />

          {result.scope.sourceTruncated ? (
            <p
              className="rounded-lg border border-warning bg-warning-soft p-4 text-sm text-foreground"
              role="status"
            >
              The source reached a safety limit. Results cover only the bounded
              portion that was inspected.
            </p>
          ) : null}

          {result.findings.length ? (
            <section aria-labelledby="auth-findings-title">
              <h2
                id="auth-findings-title"
                className="text-xl font-bold text-foreground"
              >
                Review cues
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Heuristics show where to test next; they do not prove a failure
                by themselves unless the recorded behavior confirms the barrier.
              </p>
              <div className="mt-4 grid gap-4">
                {result.findings.map((item) => (
                  <FindingCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-success bg-success-soft p-5">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2
                  className="h-5 w-5 text-success"
                  aria-hidden="true"
                />
                No configured cue was found
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Test keyboard and assistive-technology behavior, conditional
                challenges, recovery, lockout, autofill, and every multi-factor
                step before drawing a conclusion.
              </p>
            </section>
          )}
        </div>
      ) : null}
    </main>
  );
}
