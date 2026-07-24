"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Clipboard,
  Download,
  FileJson2,
  LockKeyhole,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildAuditReport,
  compareManifests,
  parseManifest,
} from "../lib/analyzeManifest.mjs";

const PREVIOUS_SAMPLE = JSON.stringify(
  {
    name: "workspace-helper",
    version: "1.2.0",
    tools: [
      {
        name: "search_docs",
        description: "Search project documentation",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
      {
        name: "read_file",
        description: "Read one project file",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
    ],
  },
  null,
  2,
);

const NEXT_SAMPLE = JSON.stringify(
  {
    name: "workspace-helper",
    version: "2.0.0",
    tools: [
      {
        name: "search_docs",
        description: "Search project documentation and remote URLs",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            url: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "run_command",
        description: "Execute a shell command in the workspace",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string" },
            cwd: { type: "string" },
          },
          required: ["command"],
        },
      },
      {
        name: "delete_file",
        description: "Delete a file from the filesystem",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
    ],
  },
  null,
  2,
);

const RISK_STYLE = {
  high: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
  medium: "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--foreground)]",
  low: "border-[var(--border-strong)] bg-[var(--section-highlight)] text-[var(--foreground)]",
  none: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
};

function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
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
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : tone === "warning"
        ? "bg-[var(--warning-soft)] text-[var(--foreground)]"
        : tone === "success"
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-3 py-1 text-2xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{detail}</p>
    </article>
  );
}

function JsonEditor({ id, label, value, onChange, error }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-[var(--foreground)]">
          {label}
        </label>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]">
          <FileJson2 className="h-3.5 w-3.5" aria-hidden="true" />
          JSON
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-80 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        spellCheck={false}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RiskBadge({ risk }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${RISK_STYLE[risk.level]}`}>
      {risk.level === "none" ? "No keyword signal" : `${risk.level} risk`}
    </span>
  );
}

function ToolFinding({ tool, kind }) {
  const icon =
    kind === "added" ? (
      <PlusCircle className="h-5 w-5 text-[var(--danger)]" aria-hidden="true" />
    ) : kind === "removed" ? (
      <MinusCircle className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden="true" />
    ) : (
      <RefreshCw className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
    );

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="break-words font-bold text-[var(--foreground)]">{tool.name}</h3>
            <p className="mt-1 break-words text-sm leading-6 text-[var(--muted-foreground)]">
              {tool.description || "No description provided."}
            </p>
          </div>
        </div>
        <RiskBadge risk={tool.risk} />
      </div>

      {kind === "changed" && tool.changes?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-[var(--foreground)]">
          {tool.changes.map((change) => (
            <li key={change}>• {change}</li>
          ))}
        </ul>
      ) : null}

      {tool.risk.signals.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tool.risk.signals.map((signal) => (
            <span
              key={signal.id}
              className="rounded-full bg-[var(--section-highlight)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]"
            >
              {signal.label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function McpPermissionDiffAuditor() {
  const [previousText, setPreviousText] = useState(PREVIOUS_SAMPLE);
  const [nextText, setNextText] = useState(NEXT_SAMPLE);
  const [copied, setCopied] = useState(false);

  const previous = useMemo(() => parseManifest(previousText), [previousText]);
  const next = useMemo(() => parseManifest(nextText), [nextText]);
  const result = useMemo(
    () => (previous.ok && next.ok ? compareManifests(previous.value, next.value) : null),
    [next, previous],
  );

  const report = result ? buildAuditReport(result) : "";

  const copyReport = async () => {
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  const loadSample = () => {
    setPreviousText(PREVIOUS_SAMPLE);
    setNextText(NEXT_SAMPLE);
  };

  const swapManifests = () => {
    setPreviousText(nextText);
    setNextText(previousText);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Agent security
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--success)]">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Local static analysis
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                MCP Permission Diff Auditor
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Compare an installed MCP manifest with an upgrade before granting it more power. The auditor
                never connects to or executes an MCP server.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] p-4 text-sm leading-6 text-[var(--muted-foreground)] lg:max-w-sm">
              Keyword findings are review prompts, not proof that a tool is malicious or safe.
            </div>
          </div>
        </header>

        <Panel
          title="Compare manifests"
          description="Paste JSON exported from the old and new MCP server versions. Common nested tool-list shapes are supported."
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <JsonEditor
              id="previous-manifest"
              label="Previous manifest"
              value={previousText}
              onChange={setPreviousText}
              error={previous.ok ? "" : previous.error}
            />
            <JsonEditor
              id="next-manifest"
              label="Proposed manifest"
              value={nextText}
              onChange={setNextText}
              error={next.ok ? "" : next.error}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={loadSample} className="btn-primary">
              Load safe demo
            </button>
            <button type="button" onClick={swapManifests} className="btn-secondary">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Swap versions
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviousText("");
                setNextText("");
              }}
              className="btn-secondary"
            >
              Clear
            </button>
            <button type="button" onClick={copyReport} disabled={!result} className="btn-secondary">
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={() => downloadText("mcp-permission-diff-audit.txt", report)}
              disabled={!result}
              className="btn-secondary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download report
            </button>
          </div>
        </Panel>

        {result ? (
          <>
            <section aria-label="Audit summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Added" value={result.added.length} detail="Newly exposed tools." tone={result.added.length ? "warning" : "success"} />
              <Metric label="Removed" value={result.removed.length} detail="No longer exposed." />
              <Metric label="Changed" value={result.changed.length} detail="Schema or metadata changed." tone={result.changed.length ? "warning" : "success"} />
              <Metric label="High risk" value={result.highRisk.length} detail="Manual review required." tone={result.highRisk.length ? "danger" : "success"} />
              <Metric label="Unchanged" value={result.unchangedCount} detail="Same tool definition." tone="success" />
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel
                title="Added capabilities"
                description="New tools can expand the server's effective authority even when the server name stays unchanged."
              >
                <div className="space-y-3">
                  {result.added.length ? (
                    result.added.map((tool) => <ToolFinding key={tool.name} tool={tool} kind="added" />)
                  ) : (
                    <EmptyState message="No tools were added." />
                  )}
                </div>
              </Panel>

              <Panel
                title="Changed capabilities"
                description="Review new inputs, required fields, annotations, and description changes."
              >
                <div className="space-y-3">
                  {result.changed.length ? (
                    result.changed.map((tool) => <ToolFinding key={tool.name} tool={tool} kind="changed" />)
                  ) : (
                    <EmptyState message="No existing tool definitions changed." />
                  )}
                </div>
              </Panel>
            </div>

            <Panel title="Removed capabilities" description="Removed tools may break existing agent workflows.">
              <div className="grid gap-3 lg:grid-cols-2">
                {result.removed.length ? (
                  result.removed.map((tool) => <ToolFinding key={tool.name} tool={tool} kind="removed" />)
                ) : (
                  <EmptyState message="No tools were removed." />
                )}
              </div>
            </Panel>

            <section
              aria-label="Safety reminder"
              className="flex items-start gap-3 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm leading-6 text-[var(--foreground)]"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              <p>
                Review the server publisher, source code, runtime sandbox, network destinations, and approval
                policy separately. A clean static diff does not guarantee safe behavior.
              </p>
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
            <FileJson2 className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">Valid JSON required</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Fix both manifest inputs to generate a permission diff.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--success-soft)] p-4 text-sm text-[var(--foreground)]">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden="true" />
      {message}
    </div>
  );
}
