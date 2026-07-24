"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Download,
  FileJson2,
  ListChecks,
  RotateCcw,
  ShieldPlus,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildPermissionPolicy,
  serializePermissionPolicy,
} from "../lib/buildPolicy.mjs";

const SAMPLE = {
  allowedTools: "read.*\nlist.*\nsend.email",
  deniedTools: "delete.*\nshell.*",
  allowedPathPrefixes: "/workspace/project\n/workspace/exports",
  allowedDomains: "api.example.com\n*.trusted.example",
  allowedRecipients: "ops@example.com\n@company.example",
  numericLimits: "amount = 2500\nretries = 3",
  requiredConfirmationTools: "send.*\nwrite.*",
  acceptedConfirmationFlags: "confirmed\napproved",
};

const EMPTY = Object.fromEntries(Object.keys(SAMPLE).map((key) => [key, ""]));

const FIELD_GROUPS = [
  {
    title: "Tool names",
    fields: [
      {
        key: "allowedTools",
        label: "Allowed tool patterns",
        help: "One name or wildcard per line, such as read.*",
      },
      {
        key: "deniedTools",
        label: "Denied tool patterns",
        help: "Deny takes precedence over allow",
      },
    ],
  },
  {
    title: "Targets",
    fields: [
      {
        key: "allowedPathPrefixes",
        label: "Allowed path prefixes",
        help: "Prefer absolute Unix or Windows paths",
      },
      {
        key: "allowedDomains",
        label: "Allowed domains",
        help: "Hostnames only; *.example.com means subdomains only",
      },
      {
        key: "allowedRecipients",
        label: "Allowed recipients",
        help: "Exact addresses, wildcards, or @domain suffixes",
      },
    ],
  },
  {
    title: "Limits and confirmation",
    fields: [
      {
        key: "numericLimits",
        label: "Numeric ceilings",
        help: "One field = maximum per line",
      },
      {
        key: "requiredConfirmationTools",
        label: "Tools requiring confirmation",
        help: "Tool patterns checked for a confirmation flag",
      },
      {
        key: "acceptedConfirmationFlags",
        label: "Accepted confirmation flags",
        help: "Argument field names such as confirmed or approved",
      },
    ],
  },
];

function downloadPolicy(text) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "agent-permission-policy.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AgentPermissionPolicyBuilder() {
  const [fields, setFields] = useState(EMPTY);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => buildPermissionPolicy(fields), [fields]);
  const policyText = useMemo(() => serializePermissionPolicy(result), [result]);

  const update = (key, value) => {
    setFields((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const copyPolicy = async () => {
    if (!policyText) return;
    const didCopy = await safeCopyText(policyText);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <ShieldPlus className="h-4 w-4" aria-hidden="true" />
              Explicit least-privilege draft
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Agent Permission Policy Builder
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Create a reviewable JSON policy for agent tool names and sensitive argument targets.
              The generated format works with ALTFTool’s Tool-Call Argument Policy Linter.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Drafted only in this tab</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              This tool creates text. It does not install a policy, connect to an agent, or grant
              any permission.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={() => setFields(SAMPLE)}
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Load safe example
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={() => {
            setFields(EMPTY);
            setCopied(false);
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          {FIELD_GROUPS.map((group) => (
            <section
              key={group.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-bold text-[var(--foreground)]">{group.title}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => (
                  <label
                    key={field.key}
                    className={
                      group.fields.length % 2 && field === group.fields.at(-1)
                        ? "space-y-2 md:col-span-2"
                        : "space-y-2"
                    }
                  >
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {field.label}
                    </span>
                    <span className="block text-xs leading-5 text-[var(--muted-foreground)]">
                      {field.help}
                    </span>
                    <textarea
                      className="input-field min-h-32 w-full resize-y font-mono text-sm"
                      value={fields[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      spellCheck="false"
                    />
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-6 xl:col-span-2 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Policy JSON</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Empty rule groups stay explicit for easier review.
                </p>
              </div>
              <FileJson2 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
            </div>

            {result.errors.length ? (
              <ul
                className="mt-4 space-y-2 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
                role="alert"
              >
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}

            {result.warnings.length ? (
              <ul className="mt-4 space-y-2 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
                {result.warnings.map((warning) => (
                  <li key={warning} className="flex gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]"
                      aria-hidden="true"
                    />
                    {warning}
                  </li>
                ))}
              </ul>
            ) : null}

            <pre className="mt-4 max-h-screen min-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-xs leading-6 text-[var(--foreground)]">
              {policyText || "Fix the validation errors to generate policy JSON."}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary inline-flex min-h-11 items-center gap-2 px-4"
                onClick={copyPolicy}
                disabled={!policyText}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4"
                onClick={() => downloadPolicy(policyText)}
                disabled={!policyText}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
            <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
                aria-hidden="true"
              />
              A JSON policy has no effect unless the consuming runtime enforces every rule
              fail-closed. Wildcards, symlinks, redirects, encoded targets, nested values, and tool
              aliases need independent runtime controls and audit logs.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
