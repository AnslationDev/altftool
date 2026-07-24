"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  ExternalLink,
  FlaskConical,
  KeyRound,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STATUS_FILTERS = [
  { key: "all", label: "All tools" },
  { key: "working", label: "Working" },
  { key: "api-required", label: "API required" },
  { key: "partial", label: "Partial" },
  { key: "broken", label: "Broken" },
];
const API_FILTERS = [
  { key: "all", label: "All API states" },
  { key: "configured", label: "Configured" },
  { key: "missing-config", label: "Missing config" },
  { key: "runtime-check", label: "Runtime check" },
  { key: "not-required", label: "No API required" },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function statusTone(status) {
  if (status === "working") {
    return {
      label: "Working",
      icon: CheckCircle2,
      className: "border-success bg-success-soft text-success",
    };
  }
  if (status === "api-required") {
    return {
      label: "API required",
      icon: CloudCog,
      className: "border-info bg-info-soft text-info",
    };
  }
  if (status === "partial") {
    return {
      label: "Partial",
      icon: AlertTriangle,
      className: "border-warning bg-warning-soft text-warning",
    };
  }
  return {
    label: "Broken",
    icon: XCircle,
    className: "border-danger bg-danger-soft text-danger",
  };
}

function StatusBadge({ status }) {
  const tone = statusTone(status);
  const Icon = tone.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {tone.label}
    </span>
  );
}

function ApiStatusBadge({ status }) {
  const config =
    status === "configured"
      ? {
          label: "Configured",
          icon: ShieldCheck,
          className: "border-success bg-success-soft text-success",
        }
      : status === "missing-config"
        ? {
            label: "Missing config",
            icon: KeyRound,
            className: "border-danger bg-danger-soft text-danger",
          }
        : {
            label: "Runtime check",
            icon: RadioTower,
            className: "border-info bg-info-soft text-info",
          };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, tone = "primary" }) {
  const iconClass =
    tone === "success"
      ? "bg-success-soft text-success"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : tone === "danger"
          ? "bg-danger-soft text-danger"
          : "bg-primary-soft text-primary";

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
    </article>
  );
}

export default function ToolReadinessExplorer() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState("all");
  const [apiStatus, setApiStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.getIdToken) return undefined;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await user.getIdToken();
        const params = new URLSearchParams({
          status,
          apiStatus,
          page: String(page),
          pageSize: "40",
        });
        if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
        const response = await fetch(`/api/health/tools?${params}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Tool readiness could not be loaded.");
        }
        setPayload(data);
      } catch (requestError) {
        if (requestError?.name !== "AbortError") {
          setError(
            requestError?.message || "Tool readiness could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [apiStatus, deferredQuery, page, status, user]);

  const summary = payload?.summary;
  const counts = summary?.counts || {};
  const apiSummary = summary?.api || {};
  const apiCounts = apiSummary?.counts || {};
  const items = payload?.items || [];
  const pagination = payload?.pagination;
  const activeFilterLabel = useMemo(
    () =>
      STATUS_FILTERS.find((item) => item.key === status)?.label || "All tools",
    [status],
  );

  function selectStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  return (
    <div className="min-h-full bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <Link
            href="/health"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Health dashboard
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Build-time evidence
                </p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">
                  Tool readiness inventory
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  Structure, interactions, automated coverage, unfinished
                  signals, and provider configuration contracts for every
                  registered microtool.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-surface-soft px-3 py-1.5 text-xs font-semibold text-muted">
              Secret-safe status only · no credential values
            </span>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={CheckCircle2}
            label="Working"
            value={formatNumber(counts.working)}
            detail={`${formatNumber(summary?.total)} registered tools`}
            tone="success"
          />
          <SummaryCard
            icon={CloudCog}
            label="API tools"
            value={formatNumber(apiSummary?.tools)}
            detail={`${formatNumber(apiSummary?.providerCount)} detected providers`}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Configured"
            value={formatNumber(apiCounts.configured)}
            detail={`${formatNumber(apiSummary?.configuredEnvKeys?.length)} configured env contracts`}
            tone="success"
          />
          <SummaryCard
            icon={KeyRound}
            label="Missing config"
            value={formatNumber(apiCounts["missing-config"])}
            detail={`${formatNumber(apiSummary?.missingEnvKeys?.length)} missing env contracts`}
            tone={apiCounts["missing-config"] ? "danger" : "success"}
          />
          <SummaryCard
            icon={RadioTower}
            label="Runtime checks"
            value={formatNumber(apiCounts["runtime-check"])}
            detail="Public or runtime-provided endpoints"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Partial"
            value={formatNumber(counts.partial)}
            detail="Needs stronger implementation evidence"
            tone="warning"
          />
          <SummaryCard
            icon={XCircle}
            label="Broken"
            value={formatNumber(counts.broken)}
            detail="Structural failures in registered tools"
            tone={counts.broken ? "danger" : "success"}
          />
          <SummaryCard
            icon={FlaskConical}
            label="Automated coverage"
            value={`${formatNumber(summary?.automatedCoverage)}%`}
            detail={`${formatNumber(summary?.automatedTests)} tools with deterministic evidence`}
            tone={summary?.automatedCoverage >= 80 ? "success" : "warning"}
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {activeFilterLabel}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {formatNumber(pagination?.total)} matching tools
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <select
                value={apiStatus}
                onChange={(event) => {
                  setApiStatus(event.target.value);
                  setPage(1);
                }}
                className="input h-10 min-w-44"
                aria-label="Filter by API readiness"
              >
                {API_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <label className="relative w-full lg:w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  className="input h-10 w-full pl-9"
                  placeholder="Search tool, provider, route, or env key"
                  aria-label="Search tool readiness inventory"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => selectStatus(filter.key)}
                aria-pressed={status === filter.key}
                className={`h-10 shrink-0 rounded-lg border px-3 text-xs font-semibold transition ${
                  status === filter.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted hover:bg-surface-soft hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {loading && !payload ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm font-semibold text-muted">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading tool evidence
            </div>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-soft text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 sm:px-5">Tool</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Evidence</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3 text-right">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr
                      key={item.slug}
                      className="align-top hover:bg-surface-soft"
                    >
                      <td className="px-4 py-4 sm:px-5">
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted">
                          {item.slug}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {item.category}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                        {item.apiReadiness?.required ? (
                          <div className="mt-2">
                            <ApiStatusBadge status={item.apiReadiness.status} />
                          </div>
                        ) : null}
                        <p className="mt-2 text-xs font-semibold text-muted">
                          Score {formatNumber(item.score)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs leading-5 text-muted">
                        <p>
                          {item.evidence?.sourceFiles || 0} files ·{" "}
                          {item.evidence?.automatedTest ? "tested" : "no test"}
                        </p>
                        {item.apiReadiness?.providers?.length ? (
                          <p className="mt-1 text-foreground">
                            {item.apiReadiness.providers
                              .map((provider) => provider.name)
                              .join(" · ")}
                          </p>
                        ) : null}
                        {item.apiReadiness?.environment?.length ? (
                          <div className="mt-2 flex max-w-md flex-wrap gap-1.5">
                            {item.apiReadiness.environment.map((entry) => (
                              <span
                                key={entry.name}
                                className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                                  entry.configured
                                    ? "border-success bg-success-soft text-success"
                                    : "border-danger bg-danger-soft text-danger"
                                }`}
                              >
                                {entry.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {item.issues?.length ? (
                          <p className="mt-1 text-warning">
                            {item.issues.slice(0, 2).join(" · ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-md px-4 py-4 text-xs leading-5 text-muted">
                        {item.recommendations?.[0] ||
                          "Keep regression evidence current."}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <a
                          href={`https://www.altftool.com${item.route}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline h-9 gap-2 px-3 text-xs"
                          title={`Open ${item.name}`}
                        >
                          Open
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-muted">
              No tools match this search and status filter.
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Page {formatNumber(pagination?.page)} of{" "}
              {formatNumber(pagination?.pages)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={!pagination || pagination.page <= 1 || loading}
                className="btn btn-outline h-10 gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((value) =>
                    Math.min(pagination?.pages || value, value + 1),
                  )
                }
                disabled={
                  !pagination || pagination.page >= pagination.pages || loading
                }
                className="btn btn-outline h-10 gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
