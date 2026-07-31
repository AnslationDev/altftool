"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileJson2,
  FlaskConical,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  PencilLine,
  PlayCircle,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  Trash2,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzeActions,
  buildDryRunReport,
  EFFECT_META,
  parseActionCalls,
} from "../lib/analyzeActions.mjs";

const SAMPLE_JSON = JSON.stringify(
  [
    {
      tool: "update_file",
      arguments: {
        path: "src/config.json",
        content: "{ \"feature\": true }",
        dryRun: true,
        backup: "src/config.json.bak",
        allowedPaths: ["src/config.json"],
      },
    },
    {
      name: "send_email",
      arguments: {
        to: ["team@example.com"],
        subject: "Release is ready",
        body: "Please review the deployment.",
        confirmed: false,
      },
    },
    {
      function: {
        name: "transfer_funds",
        arguments: JSON.stringify({
          recipient: "vendor-42",
          amount: 1250,
          currency: "USD",
          idempotencyKey: "invoice-1042",
        }),
      },
    },
  ],
  null,
  2,
);

const RISK_STYLE = {
  critical: "border-danger bg-danger-soft text-danger",
  high: "border-danger bg-danger-soft text-danger",
  medium: "border-warning bg-warning-soft text-foreground",
  low: "border-success bg-success-soft text-success",
};

const EFFECT_STYLE = {
  write: "bg-primary-soft text-primary",
  deletion: "bg-danger-soft text-danger",
  message: "bg-warning-soft text-foreground",
  money: "bg-danger-soft text-danger",
  external: "bg-warning-soft text-foreground",
  execution: "bg-danger-soft text-danger",
  read: "bg-success-soft text-success",
};

const EFFECT_ICONS = {
  write: PencilLine,
  deletion: Trash2,
  message: MessageSquareText,
  money: Banknote,
  external: Globe2,
  execution: TerminalSquare,
  read: Eye,
};

function downloadText(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Panel({ title, description, children, icon: Icon }) {
  return (
    <section className="tool-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, tone = "default" }) {
  const valueClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-primary";

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-black leading-none ${valueClass}`}>{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

function EffectBadge({ effectKey }) {
  const Icon = EFFECT_ICONS[effectKey];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-bold ${EFFECT_STYLE[effectKey]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {EFFECT_META[effectKey].label}
    </span>
  );
}

function EffectCountRow({ effectKey, count, total }) {
  const Icon = EFFECT_ICONS[effectKey];
  const isPresent = count > 0;
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
        isPresent ? "border-border bg-surface-soft" : "border-border/60 bg-background"
      }`}
    >
      <span
        className={`flex min-w-0 items-center gap-2 font-semibold ${
          isPresent ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{EFFECT_META[effectKey].label}</span>
      </span>
      <span
        className={`shrink-0 rounded-pill px-2.5 py-1 text-xs font-bold ${
          isPresent ? EFFECT_STYLE[effectKey] : "bg-surface-soft text-muted-foreground"
        }`}
        aria-label={`${count} of ${total} calls`}
      >
        {count}/{total}
      </span>
    </li>
  );
}

function ActionCard({ action }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Proposed call {action.index + 1}
          </p>
          <h3 className="mt-1 break-words font-mono text-lg font-bold text-foreground">
            {action.name}
          </h3>
        </div>
        <span
          className={`inline-flex rounded-pill border px-3 py-1.5 text-xs font-bold ${RISK_STYLE[action.risk.level]}`}
          aria-label={`${action.risk.label}, heuristic score ${action.risk.score}`}
        >
          {action.risk.label} · {action.risk.score}
        </span>
      </div>

      <p className="mt-4 rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-foreground">
        {action.preview}
      </p>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Detected action types">
        {action.effectKeys.length ? (
          action.effectKeys.map((effectKey) => (
            <EffectBadge key={effectKey} effectKey={effectKey} />
          ))
        ) : (
          <span className="rounded-pill bg-surface-soft px-3 py-1.5 text-xs font-bold text-muted-foreground">
            No known effect pattern
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-bold text-foreground">Targets found</h4>
          {action.targets.length ? (
            <dl className="mt-3 space-y-3">
              {action.targets.map((target) => (
                <div key={`${target.path}-${target.value}`} className="min-w-0">
                  <dt className="break-all font-mono text-xs font-semibold text-muted-foreground">
                    {target.path}
                  </dt>
                  <dd className="mt-1 break-words text-sm text-foreground">{target.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No explicit path, recipient, URL, account, or other target was identified.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-bold text-foreground">Reversibility</h4>
          <p
            className={`mt-3 font-bold ${
              action.reversibility.level === "likely-irreversible"
                ? "text-danger"
                : action.reversibility.level === "potentially-reversible"
                  ? "text-success"
                  : "text-foreground"
            }`}
          >
            {action.reversibility.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {action.reversibility.detail}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-bold text-foreground">Safeguards detected</h4>
          {action.safeguards.present.length ? (
            <ul className="mt-3 space-y-2">
              {action.safeguards.present.map(({ id, label }) => (
                <li key={id} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No explicit safeguards were detected in this call.
            </p>
          )}
        </section>
      </div>

      <section
        className={`mt-4 rounded-lg border p-4 ${
          action.safeguards.missing.length
            ? "border-warning bg-warning-soft"
            : "border-success bg-success-soft"
        }`}
      >
        <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
          {action.safeguards.missing.length ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          )}
          Safeguards to review
        </h4>
        {action.safeguards.missing.length ? (
          <ul className="mt-2 grid gap-2 text-sm text-foreground sm:grid-cols-2">
            {action.safeguards.missing.map(({ id, label }) => (
              <li key={id}>• {label}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-foreground">
            No expected safeguard signal is missing for the detected action type.
          </p>
        )}
      </section>
    </article>
  );
}

export default function AgentActionDryRunSimulator() {
  const [source, setSource] = useState(SAMPLE_JSON);
  const [copyState, setCopyState] = useState("idle");

  const parsed = useMemo(() => parseActionCalls(source), [source]);
  const result = useMemo(
    () => (parsed.ok ? analyzeActions(parsed.value) : null),
    [parsed],
  );
  const report = result ? buildDryRunReport(result) : "";

  const copyReport = async () => {
    const didCopy = await safeCopyText(report);
    setCopyState(didCopy ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ScanSearch className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Agent Action Dry-Run Simulator
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Preview only
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Inspect proposed AI agent tool-call JSON before approval. See likely targets,
                external effects, reversibility, and missing safeguards without running a tool.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Simulator guarantees">
            {[
              ["Runs locally", LockKeyhole],
              ["Nothing executed", PlayCircle],
              ["No history", ShieldCheck],
            ].map(([label, Icon]) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-surface-soft px-3 text-xs font-bold text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section
        className="mt-6 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4"
        aria-label="Static analysis limitation"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-foreground">
          <strong>This is a review aid, not a sandbox.</strong> It never executes the JSON.
          Heuristics can miss custom tool behavior, and a low score does not prove an action is safe.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Panel
            title="Proposed tool calls"
            description="Paste one JSON object, an array, or a common function/tool-calls wrapper. Analysis updates locally as you type."
            icon={FileJson2}
          >
            <label htmlFor="agent-actions-json" className="sr-only">
              Proposed agent tool-call JSON
            </label>
            <textarea
              id="agent-actions-json"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-invalid={!parsed.ok}
              aria-describedby={!parsed.ok ? "agent-actions-error" : "agent-actions-help"}
              className="min-h-96 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/35"
            />
            <p id="agent-actions-help" className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Input stays in this browser tab. It is not uploaded, saved, shared, or executed.
            </p>
            {!parsed.ok ? (
              <p
                id="agent-actions-error"
                role="alert"
                className="mt-3 rounded-lg border border-danger bg-danger-soft p-3 text-sm text-danger"
              >
                {parsed.error}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSource(SAMPLE_JSON)}
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Load safe demo
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSource("")}
                disabled={!source}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copyReport}
                disabled={!result}
              >
                <Clipboard className="h-4 w-4" aria-hidden="true" />
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy report"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => downloadText("agent-action-dry-run-report.txt", report)}
                disabled={!result}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download report
              </button>
            </div>
          </Panel>
        </div>

        <aside className="space-y-6 xl:col-span-2">
          <Panel
            title="What is checked"
            description="Deterministic signals make the same JSON produce the same review."
            icon={ShieldAlert}
          >
            <ul className="space-y-3 text-sm leading-relaxed text-foreground">
              {[
                "Writes, deletions, messages, money movement, external calls, execution, and reads",
                "Paths, recipients, URLs, repositories, accounts, tables, and other explicit targets",
                "Confirmation, preview, recovery, idempotency, scope, and allowlist signals",
                "Likely reversibility and a transparent review score per proposed call",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Important limits"
            description="JSON describes intent, not the runtime's real authority."
            icon={AlertTriangle}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Custom or vague tool names may evade pattern matching.</li>
              <li>• A safeguard flag may exist without being enforced.</li>
              <li>• Hidden permissions, redirects, and runtime code are not visible here.</li>
              <li>• Verify scope, credentials, destination, and human approval separately.</li>
            </ul>
          </Panel>
        </aside>
      </div>

      {result ? (
        <>
          <section aria-label="Dry-run summary" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Calls" value={result.actions.length} detail="JSON actions successfully parsed." />
            <Metric
              label="Side effects"
              value={result.sideEffectCount}
              detail="Calls with at least one mutation or external signal."
              tone={result.sideEffectCount ? "warning" : "success"}
            />
            <Metric
              label="Highest review"
              value={result.highestRisk.label.replace(" review", "")}
              detail={`Highest heuristic score: ${result.highestRisk.score}.`}
              tone={
                ["critical", "high"].includes(result.highestRisk.level)
                  ? "danger"
                  : result.highestRisk.level === "medium"
                    ? "warning"
                    : "success"
              }
            />
            <Metric
              label="Missing prompts"
              value={result.missingSafeguardCount}
              detail="Safeguards worth checking before approval."
              tone={result.missingSafeguardCount ? "warning" : "success"}
            />
          </section>

          <section aria-labelledby="effect-breakdown-heading" className="mt-6 tool-card p-5 sm:p-6">
            <h2 id="effect-breakdown-heading" className="text-sm font-bold text-foreground">
              Effect type breakdown
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              How many of the {result.actions.length} parsed call
              {result.actions.length === 1 ? "" : "s"} matched each effect type.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(result.counts).map(([effectKey, count]) => (
                <EffectCountRow
                  key={effectKey}
                  effectKey={effectKey}
                  count={count}
                  total={result.actions.length}
                />
              ))}
            </ul>
          </section>

          <section className="mt-6" aria-labelledby="preview-heading">
            <div className="mb-4">
              <h2 id="preview-heading" className="text-xl font-bold text-foreground">
                Action-by-action preview
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are static predictions. Nothing below is an execution result.
              </p>
            </div>
            <div className="space-y-4">
              {result.actions.map((action) => (
                <ActionCard key={`${action.index}-${action.name}`} action={action} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <FileJson2 className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-foreground">Valid JSON required</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fix the input to generate a local dry-run preview.
          </p>
        </section>
      )}
    </main>
  );
}
