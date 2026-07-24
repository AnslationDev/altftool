"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Braces,
  CheckCircle2,
  Download,
  FileJson2,
  Gauge,
  Info,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import {
  buildCountsOnlyReport,
  lintToolCalls,
  parsePolicy,
  parseToolCallLog,
  RULE_LABELS,
} from "../lib/policyLinter.mjs";

const SAMPLE_POLICY = JSON.stringify(
  {
    allowedTools: ["read_*", "send_email", "charge_customer"],
    deniedTools: ["read_secrets", "shell_exec"],
    allowedPathPrefixes: ["/workspace/project", "docs/"],
    allowedDomains: ["api.example.com", "*.trusted.example"],
    allowedRecipients: ["ops@example.com", "@trusted.example"],
    numericLimits: {
      amount: 500,
      quantity: 10,
      timeoutMs: 30000,
    },
    confirmation: {
      requiredForTools: ["send_email", "charge_customer"],
      acceptedFlags: ["confirmed", "userConfirmed"],
    },
  },
  null,
  2,
);

const SAMPLE_CALLS = [
  {
    tool: "read_file",
    arguments: {
      path: "/workspace/project/docs/plan.md",
    },
  },
  {
    tool: "send_email",
    arguments: {
      to: "external@example.net",
      endpoint: "https://notify.trusted.example/send",
      confirmed: false,
    },
  },
  {
    function: {
      name: "charge_customer",
      arguments: JSON.stringify({
        amount: 900,
        quantity: 1,
        userConfirmed: true,
      }),
    },
  },
  {
    tool: "shell_exec",
    arguments: {
      command: "synthetic command",
    },
  },
]
  .map((call) => JSON.stringify(call))
  .join("\n");

const OUTCOME_STYLE = {
  pass: "border-success bg-success-soft text-success",
  violation: "border-danger bg-danger-soft text-danger",
  warning: "border-warning bg-warning-soft text-warning",
};

const OUTCOME_LABEL = {
  pass: "Pass",
  violation: "Violation",
  warning: "Warning",
};

const TEXTAREA_CLASS =
  "mt-3 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]";

function MetricCard({ detail, label, tone = "primary", value }) {
  const toneClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-primary";

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>
  );
}

function FindingRow({ finding }) {
  const isViolation = finding.level === "violation";
  return (
    <li
      className={`rounded-lg border p-4 ${
        isViolation
          ? "border-danger bg-danger-soft"
          : "border-warning bg-warning-soft"
      }`}
    >
      <div className="flex items-start gap-3">
        {isViolation ? (
          <ShieldAlert
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-danger"
          />
        ) : (
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
        )}
        <div className="min-w-0">
          <p className="font-bold text-foreground">
            {RULE_LABELS[finding.rule] ?? finding.rule}
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{finding.message}</p>
          {finding.argumentPath ? (
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
              {finding.argumentPath}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function CallResult({ call }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Call {call.index + 1}
          </p>
          <h3 className="mt-1 break-all font-mono text-lg font-bold text-foreground">
            {call.toolName}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${OUTCOME_STYLE[call.outcome]}`}
        >
          {OUTCOME_LABEL[call.outcome]}
        </span>
      </div>

      {call.findings.length ? (
        <ul className="mt-4 space-y-3">
          {call.findings.map((finding, index) => (
            <FindingRow
              key={`${finding.rule}-${finding.argumentPath ?? "call"}-${index}`}
              finding={finding}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <p className="text-sm leading-6 text-foreground">
            This call passed every configured rule that the linter could evaluate.
          </p>
        </div>
      )}
    </article>
  );
}

function RuleCountList({ result }) {
  const rows = [
    ...Object.entries(result.violationCountsByRule).map(([rule, count]) => ({
      count,
      level: "Violation",
      rule,
      tone: "text-danger",
    })),
    ...Object.entries(result.warningCountsByRule).map(([rule, count]) => ({
      count,
      level: "Warning",
      rule,
      tone: "text-warning",
    })),
  ];

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-success bg-success-soft p-5 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-6 w-6 text-success" />
        <p className="mt-2 font-semibold text-foreground">
          No violations or warnings were counted.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Rule</th>
            <th className="px-4 py-3 font-semibold">Level</th>
            <th className="px-4 py-3 text-right font-semibold">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row) => (
            <tr key={`${row.level}-${row.rule}`}>
              <td className="px-4 py-3 font-medium text-foreground">
                {RULE_LABELS[row.rule] ?? row.rule}
              </td>
              <td className={`px-4 py-3 font-semibold ${row.tone}`}>{row.level}</td>
              <td className="px-4 py-3 text-right font-bold text-foreground">
                {row.count.toLocaleString("en-US")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolCallArgumentPolicyLinter() {
  const [policySource, setPolicySource] = useState(SAMPLE_POLICY);
  const [callSource, setCallSource] = useState(SAMPLE_CALLS);
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState({ errors: [], warnings: [] });

  function runLint() {
    const parsedPolicy = parsePolicy(policySource);
    const parsedCalls = parseToolCallLog(callSource);
    const errors = [...parsedPolicy.errors, ...parsedCalls.errors];
    const warnings = [...parsedPolicy.warnings, ...parsedCalls.warnings];
    setMessages({ errors, warnings });

    if (errors.length) {
      setResult(null);
      return;
    }

    setResult(lintToolCalls(parsedPolicy.policy, parsedCalls.calls));
  }

  function loadSample() {
    setPolicySource(SAMPLE_POLICY);
    setCallSource(SAMPLE_CALLS);
    setResult(null);
    setMessages({ errors: [], warnings: [] });
  }

  function clearAll() {
    setPolicySource("");
    setCallSource("");
    setResult(null);
    setMessages({ errors: [], warnings: [] });
  }

  function downloadReport() {
    if (!result) return;
    const report = buildCountsOnlyReport(result);
    const url = URL.createObjectURL(
      new Blob([report], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altftool-tool-call-policy-lint-counts.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Tool-Call Argument Policy Linter
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Check AI tool-call JSON or JSONL against explicit rules for tool names,
          paths, domains, recipients, numeric ceilings and confirmation flags before
          any runtime sees it.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">
              Static, local and non-executing
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              The linter only parses text in this tab. It never calls a tool, opens a
              path, contacts a domain or recipient, uploads inputs, uses network
              access, or stores your policy and log.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-2" aria-label="Lint inputs">
        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Policy JSON</h2>
              <p id="policy-help" className="mt-1 text-sm leading-6 text-muted-foreground">
                Define explicit allowlists, deny rules, ceilings and confirmation
                requirements.
              </p>
            </div>
          </div>
          <label htmlFor="policy-json" className="sr-only">
            Policy JSON
          </label>
          <textarea
            id="policy-json"
            value={policySource}
            onChange={(event) => {
              setPolicySource(event.target.value);
              setResult(null);
            }}
            aria-describedby="policy-help"
            spellCheck="false"
            className={TEXTAREA_CLASS}
            placeholder='{ "allowedTools": ["read_*"] }'
          />
        </div>

        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileJson2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Tool-call JSON or JSONL
              </h2>
              <p id="calls-help" className="mt-1 text-sm leading-6 text-muted-foreground">
                Paste an array, a single call, a wrapped calls array, or one JSON
                object per line.
              </p>
            </div>
          </div>
          <label htmlFor="tool-call-log" className="sr-only">
            Tool-call JSON or JSONL
          </label>
          <textarea
            id="tool-call-log"
            value={callSource}
            onChange={(event) => {
              setCallSource(event.target.value);
              setResult(null);
            }}
            aria-describedby="calls-help"
            spellCheck="false"
            className={TEXTAREA_CLASS}
            placeholder='{"tool":"read_file","arguments":{"path":"docs/a.txt"}}'
          />
        </div>
      </section>

      <section className="tool-card mt-6" aria-label="Lint controls">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Results show tool names and argument paths, but never echo argument
            values. The downloadable report contains aggregate counts only.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={runLint}>
              <PlayCircle aria-hidden="true" className="h-4 w-4" />
              Lint calls
            </button>
            <button type="button" className="btn-secondary" onClick={loadSample}>
              <Braces aria-hidden="true" className="h-4 w-4" />
              Load sample
            </button>
            <button type="button" className="btn-secondary" onClick={clearAll}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {messages.errors.length ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-danger bg-danger-soft p-4"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-danger"
              />
              <div>
                <p className="font-bold text-foreground">Fix the input before linting</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
                  {messages.errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {messages.warnings.length ? (
          <div
            role="status"
            className="mt-5 rounded-lg border border-warning bg-warning-soft p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-warning"
              />
              <div>
                <p className="font-bold text-foreground">Input coverage notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
                  {messages.warnings.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {result ? (
        <div aria-live="polite">
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Calls"
              value={result.summary.calls}
              detail="Parsed within the safe call limit"
            />
            <MetricCard
              label="Passed"
              value={result.summary.passedCalls}
              detail="No configured finding"
              tone="success"
            />
            <MetricCard
              label="Violation calls"
              value={result.summary.callsWithViolations}
              detail="At least one blocking finding"
              tone="danger"
            />
            <MetricCard
              label="Violations"
              value={result.summary.violations}
              detail="All blocking findings"
              tone="danger"
            />
            <MetricCard
              label="Warnings"
              value={result.summary.warnings}
              detail="Incomplete or unverifiable checks"
              tone="warning"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="tool-card min-w-0" aria-labelledby="call-results-title">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <ListChecks aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="call-results-title"
                    className="text-2xl font-bold text-foreground"
                  >
                    Per-call findings
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Argument values are intentionally omitted from every finding.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {result.callResults.map((call) => (
                  <CallResult key={`${call.index}-${call.toolName}`} call={call} />
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="tool-card" aria-labelledby="rule-counts-title">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Gauge aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <h2
                        id="rule-counts-title"
                        className="text-2xl font-bold text-foreground"
                      >
                        Counts by rule
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        This aggregate view is safe to export without call details.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={downloadReport}
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Download counts-only report
                  </button>
                </div>
                <div className="mt-5">
                  <RuleCountList result={result} />
                </div>
              </section>

              <section className="tool-card" aria-labelledby="coverage-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="coverage-title" className="text-2xl font-bold text-foreground">
                      Configured policy coverage
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Number of rules supplied in each supported family.
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ["Allowed tools", result.policyCoverage.allowedToolRules],
                    ["Denied tools", result.policyCoverage.deniedToolRules],
                    ["Path prefixes", result.policyCoverage.allowedPathPrefixRules],
                    ["Domains", result.policyCoverage.allowedDomainRules],
                    ["Recipients", result.policyCoverage.allowedRecipientRules],
                    ["Numeric limits", result.policyCoverage.numericLimitRules],
                    ["Confirmation tools", result.policyCoverage.confirmationToolRules],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-surface-soft p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-lg font-bold text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <ListChecks aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Lint results will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review the sample policy and JSONL calls above, then select “Lint calls”
            to see deterministic per-rule findings.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Braces aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Supported policy keys</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Unknown top-level keys are ignored with a warning.
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-3">
            {[
              ["allowedTools / deniedTools", "Exact names or * wildcard patterns."],
              ["allowedPathPrefixes", "Lexical file and directory prefixes."],
              ["allowedDomains", "Exact hostnames or *.example.com subdomain rules."],
              ["allowedRecipients", "Exact recipients, wildcards or @domain rules."],
              ["numericLimits", "Field-name to maximum absolute numeric value."],
              [
                "confirmation",
                "requiredForTools plus acceptedFlags that must contain an affirmative value.",
              ],
            ].map(([term, description]) => (
              <div key={term} className="rounded-lg border border-border bg-surface p-4">
                <dt className="font-mono text-sm font-bold text-primary">{term}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
              <Info aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Static-analysis limits
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                A passing result is not proof that a runtime will enforce the policy.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "Only recognized tool-name and argument shapes are checked; hidden state, defaults and runtime transformations are outside coverage.",
              "Paths are normalized lexically. Symlinks, aliases, environment variables, mount boundaries and permissions are not resolved.",
              "Domains are parsed from supplied arguments only. Redirects, DNS, IP ownership and network behavior are not checked.",
              "Recipient rules compare supplied strings; aliases, forwarding, groups and address-book expansion are not resolved.",
              "Numeric ceilings use absolute values without currency, unit, exchange-rate or precision conversion.",
              "The first 500 calls and bounded nested arguments are analyzed; a warning marks partial traversal.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
