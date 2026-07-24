"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Download,
  FileSearch,
  Network,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  analyzeHar,
  buildEgressReport,
} from "../lib/analyzeHar.mjs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SAMPLE_HAR = JSON.stringify(
  {
    log: {
      version: "1.2",
      entries: [
        {
          request: {
            method: "POST",
            url: "http://127.0.0.1:8080/infer",
            headers: [{ name: "Content-Type", value: "application/json" }],
            bodySize: 240,
          },
          response: { status: 200, bodySize: 1024, content: { size: 1024 } },
        },
        {
          request: {
            method: "POST",
            url: "https://telemetry.example.test/event?source=desktop",
            headers: [],
            bodySize: 80,
          },
          response: { status: 204, bodySize: 0, content: { size: 0 } },
        },
      ],
    },
  },
  null,
  2,
);

const SCOPE_STYLES = {
  loopback: "border-[var(--success)] bg-[var(--success-soft)]",
  expected: "border-[var(--primary)] bg-[var(--primary-soft)]",
  unlisted: "border-[var(--warning)] bg-[var(--warning-soft)]",
};

function formatBytes(bytes) {
  const safe = Math.max(0, Number(bytes) || 0);
  if (safe < 1024) return `${Math.round(safe)} B`;
  if (safe < 1024 ** 2) return `${(safe / 1024).toFixed(1)} KB`;
  return `${(safe / 1024 ** 2).toFixed(1)} MB`;
}

function downloadReport(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "local-ai-egress-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function LocalAiDataEgressMonitor() {
  const fileRef = useRef(null);
  const [source, setSource] = useState("");
  const [expectedHosts, setExpectedHosts] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const report = useMemo(
    () => (result?.ok ? buildEgressReport(result) : null),
    [result],
  );

  const updateSource = (value) => {
    setSource(value);
    setResult(null);
    setError("");
  };

  const readFile = async (file) => {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a HAR or JSON trace up to 10 MB.");
      return;
    }
    try {
      updateSource(await file.text());
    } catch {
      setError("The selected trace could not be read as text.");
    }
  };

  const inspect = () => {
    const next = analyzeHar(source, expectedHosts);
    if (!next.ok) {
      setError(next.error);
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setSource("");
    setExpectedHosts("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Network className="h-4 w-4" aria-hidden="true" />
              Offline HAR trace review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Local AI Data-Egress Monitor
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Inspect a browser or desktop-app HAR capture to see which hosts were contacted and
              where outbound bodies, credential-header names, or sensitive query-field names
              appeared. The trace stays in this tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Not a live packet monitor</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Only traffic recorded in the supplied trace can be reviewed. Request and response
              bodies are never displayed.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">HAR JSON</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Export from a browser network panel or a trusted local capture tool.
              </p>
            </div>
            <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Open HAR
              <input
                ref={fileRef}
                type="file"
                accept=".har,.json,application/json"
                className="sr-only"
                onChange={(event) => void readFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">HAR JSON contents</span>
            <textarea
              className="input-field min-h-80 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder='{"log":{"entries":[]}}'
              spellCheck="false"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary min-h-10 px-4"
              onClick={() => updateSource(SAMPLE_HAR)}
            >
              Load safe example
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Expected remote hosts
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Optional. One hostname per line. Loopback hosts are recognized automatically.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Expected remote hostnames</span>
              <textarea
                className="input-field min-h-36 w-full resize-y font-mono text-sm"
                value={expectedHosts}
                onChange={(event) => {
                  setExpectedHosts(event.target.value);
                  setResult(null);
                  setError("");
                }}
                placeholder={"api.example.com\n*.trusted.example"}
                spellCheck="false"
              />
            </label>
          </section>

          <section className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5">
            <h2 className="font-bold text-[var(--foreground)]">HAR files can contain secrets</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Do not share the original trace. It may include cookies, authorization headers,
              prompts, uploads, account URLs, and response content even though this UI hides them.
            </p>
          </section>
        </aside>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={inspect}
          disabled={!source.trim()}
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Inspect trace
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {result ? (
        <section className="space-y-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Requests", result.entryCount],
              ["Hosts", result.hostCount],
              ["Loopback", result.loopbackRequestCount],
              ["Expected", result.expectedRequestCount],
              ["Unlisted", result.unlistedRequestCount],
              ["Unlisted bodies", result.unlistedBodyRequestCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>

          {result.truncated ? (
            <p className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
              The trace exceeded a local safety limit, so this summary is incomplete.
            </p>
          ) : null}

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Host inventory</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  “Unlisted” means outside loopback and your expected-host list—not necessarily
                  malicious.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={() => downloadReport(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Counts-only report
              </button>
            </div>

            {result.hosts.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-3 py-3">Host</th>
                      <th className="px-3 py-3">Scope</th>
                      <th className="px-3 py-3">Requests</th>
                      <th className="px-3 py-3">Bodies</th>
                      <th className="px-3 py-3">Credential headers</th>
                      <th className="px-3 py-3">Sensitive query names</th>
                      <th className="px-3 py-3">Recorded bytes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.hosts.map((host) => (
                      <tr key={host.host} className="border-b border-[var(--border)]">
                        <td className="break-all px-3 py-3 font-mono text-[var(--foreground)]">
                          {host.host}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold uppercase text-[var(--foreground)] ${SCOPE_STYLES[host.scope]}`}
                          >
                            {host.scope}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {host.requestCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {host.bodyRequestCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {host.credentialHeaderRequestCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {host.sensitiveQueryRequestCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          ↑ {formatBytes(host.requestBodyBytes)} · ↓{" "}
                          {formatBytes(host.responseBytes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted-foreground)]">
                No valid request URL was found in the inspected entries.
              </p>
            )}
          </section>

          {result.unlistedRequestCount === 0 ? (
            <p className="flex gap-2 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                aria-hidden="true"
              />
              No recorded request went beyond loopback or your expected-host list. This does not
              prove that unrecorded traffic, service workers, native processes, DNS requests, or
              later sessions stayed local.
            </p>
          ) : (
            <p className="flex gap-2 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
                aria-hidden="true"
              />
              Review every unlisted host and outbound-body request against the app’s documented
              architecture and your consent. A request’s presence alone does not reveal its
              purpose or prove data misuse.
            </p>
          )}
        </section>
      ) : (
        <section className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card)] p-6 text-center">
          <div>
            <Activity className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden="true" />
            <p className="mt-3 font-bold text-[var(--foreground)]">No trace inspected yet</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Results summarize metadata only and never display captured bodies.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
