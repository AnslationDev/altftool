"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Coins,
  Download,
  FileSearch,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  analyzeUsageLogs,
  buildUsageReport,
} from "../lib/analyzeUsage.mjs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SAMPLE_LOG = JSON.stringify(
  [
    {
      model: "sample-local-model",
      prompt: "Summarize this public product note.",
      usage: { input_tokens: 1200, output_tokens: 260 },
    },
    {
      model: "sample-local-model",
      prompt: "Rewrite this public paragraph.",
      usage: { input_tokens: 800, output_tokens: 180 },
    },
  ],
  null,
  2,
);
const SAMPLE_RATES = JSON.stringify(
  {
    "sample-local-model": {
      inputPerMillion: 1,
      outputPerMillion: 2,
    },
  },
  null,
  2,
);

function formatTokens(value) {
  return Number(value || 0).toLocaleString();
}

function downloadReport(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "llm-cost-privacy-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function LlmCostPrivacyAnalyzer() {
  const fileRef = useRef(null);
  const [logSource, setLogSource] = useState("");
  const [rateSource, setRateSource] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const report = useMemo(
    () => (result?.ok ? buildUsageReport(result) : null),
    [result],
  );

  const invalidate = () => {
    setResult(null);
    setError("");
  };

  const readFile = async (file) => {
    invalidate();
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a JSON, JSONL, CSV, or TSV log up to 8 MB.");
      return;
    }
    try {
      setLogSource(await file.text());
    } catch {
      setError("The selected usage log could not be read as text.");
    }
  };

  const analyze = () => {
    const next = analyzeUsageLogs(logSource, rateSource);
    if (!next.ok) {
      setError(next.error);
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setLogSource("");
    setRateSource("");
    setCurrency("USD");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const costFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.trim().toUpperCase() || "USD",
        maximumFractionDigits: 6,
      });
    } catch {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
    }
  }, [currency]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Coins className="h-4 w-4" aria-hidden="true" />
              User-priced local log analysis
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              LLM Cost &amp; Privacy Analyzer
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Summarize recorded tokens and estimate cost with rates you provide. Scan prompt-like
              fields for common personal-data and secret patterns without uploading the log.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">No built-in price claims</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Provider pricing changes. Enter rates from your current contract, billing page, or
              invoice in cost per one million tokens.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Usage log</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Common JSON wrappers, JSONL, CSV, and TSV are supported.
              </p>
            </div>
            <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Open log
              <input
                ref={fileRef}
                type="file"
                accept=".json,.jsonl,.csv,.tsv,.txt,application/json,text/plain,text/csv"
                className="sr-only"
                onChange={(event) => void readFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Usage log contents</span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-xs"
              value={logSource}
              onChange={(event) => {
                setLogSource(event.target.value);
                invalidate();
              }}
              placeholder='[{"model":"model-name","usage":{"input_tokens":100,"output_tokens":20}}]'
              spellCheck="false"
            />
          </label>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Token rates</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              JSON object keyed by model; optional * supplies a fallback.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Token-rate JSON</span>
              <textarea
                className="input-field min-h-52 w-full resize-y font-mono text-xs"
                value={rateSource}
                onChange={(event) => {
                  setRateSource(event.target.value);
                  invalidate();
                }}
                placeholder='{"model-name":{"inputPerMillion":1,"outputPerMillion":2}}'
                spellCheck="false"
              />
            </label>
            <label className="mt-4 block space-y-2 text-sm font-bold text-[var(--foreground)]">
              Currency code for display
              <input
                className="input-field min-h-11 w-full uppercase"
                value={currency}
                maxLength={3}
                onChange={(event) => setCurrency(event.target.value.replace(/[^A-Za-z]/g, ""))}
                placeholder="USD"
              />
            </label>
            <button
              type="button"
              className="btn-secondary mt-4 min-h-10 w-full px-4"
              onClick={() => {
                setLogSource(SAMPLE_LOG);
                setRateSource(SAMPLE_RATES);
                invalidate();
              }}
            >
              Load safe example
            </button>
          </section>

          <section className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5">
            <h2 className="font-bold text-[var(--foreground)]">Logs may contain live secrets</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Prefer a locally exported, access-controlled copy. Do not share the source log or
              assume a zero-signal result means every sensitive value was absent.
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
          onClick={analyze}
          disabled={!logSource.trim()}
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Analyze locally
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
              ["Requests", result.requestCount],
              ["Models", result.modelCount],
              ["Input tokens", formatTokens(result.inputTokens)],
              ["Output tokens", formatTokens(result.outputTokens)],
              ["Estimated cost", costFormatter.format(result.estimatedCost)],
              ["Privacy signals", result.privacySignalCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-1 break-words text-xl font-black text-[var(--foreground)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {result.truncated ? (
            <p className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
              A local processing limit was reached, so these totals or privacy signals may be
              incomplete.
            </p>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-5">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">Model summary</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    A request is priced only when its model rate and split input/output tokens are
                    available.
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
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-3 py-3">Model</th>
                      <th className="px-3 py-3">Requests</th>
                      <th className="px-3 py-3">Input</th>
                      <th className="px-3 py-3">Output</th>
                      <th className="px-3 py-3">Unallocated</th>
                      <th className="px-3 py-3">Estimated cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.models.map((model) => (
                      <tr key={model.model} className="border-b border-[var(--border)]">
                        <td className="break-all px-3 py-3 font-mono text-[var(--foreground)]">
                          {model.model}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {model.requestCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {formatTokens(model.inputTokens)}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {formatTokens(model.outputTokens)}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {formatTokens(model.unallocatedTokens)}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">
                          {costFormatter.format(model.estimatedCost)}
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                            {model.pricedRequestCount}/{model.requestCount} priced
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="space-y-6 xl:col-span-2">
              <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                  Privacy signal counts
                </h2>
                {result.privacySignals.length ? (
                  <ul className="mt-4 space-y-2">
                    {result.privacySignals.map((signal) => (
                      <li
                        key={signal.type}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      >
                        <span className="text-[var(--foreground)]">{signal.label}</span>
                        <span className="font-bold text-[var(--primary)]">{signal.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                    No configured pattern matched the scanned prompt-like fields.
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
                <h2 className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                  <ReceiptText className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
                  Reconcile with billing
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Cached tokens, batch discounts, tools, images, audio, taxes, free tiers, rounding,
                  currency conversion, retries, and provider-specific metering can make an invoice
                  differ from this estimate.
                </p>
              </section>
            </aside>
          </div>
        </section>
      ) : (
        <section className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card)] p-6 text-center">
          <div>
            <Coins className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden="true" />
            <p className="mt-3 font-bold text-[var(--foreground)]">No analysis yet</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Token and privacy summaries will appear here.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          Parsed logs can omit requests, cached usage, provider-side processing, or sensitive
          context. Treat cost as an estimate and privacy matches as review cues—not a complete
          billing audit or data-loss verdict.
        </p>
      </section>
    </main>
  );
}
