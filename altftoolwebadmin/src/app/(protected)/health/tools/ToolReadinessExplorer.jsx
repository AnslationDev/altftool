"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  ExternalLink,
  FlaskConical,
  KeyRound,
  RadioTower,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  PageHeader,
  SectionCard,
  StatGrid,
} from "@/ansets";
import { useAuth } from "@/context/AuthContext";
import { getAdminIdToken } from "@/lib/adminIdToken";

const STATUS_FILTERS = [
  { value: "all", label: "All tools" },
  { value: "working", label: "Working" },
  { value: "api-required", label: "API required" },
  { value: "partial", label: "Partial" },
  { value: "broken", label: "Broken" },
];
const API_FILTERS = [
  { value: "all", label: "All API states" },
  { value: "configured", label: "Configured" },
  { value: "missing-config", label: "Missing config" },
  { value: "runtime-check", label: "Runtime check" },
  { value: "not-required", label: "No API required" },
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
    // Badge copy is normal-size text, so it uses the text-safe danger token.
    className: "border-danger bg-danger-soft text-[var(--danger-text)]",
  };
}

function StatusBadge({ status }) {
  const tone = statusTone(status);
  const Icon = tone.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
            className: "border-danger bg-danger-soft text-[var(--danger-text)]",
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
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
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
  // Bumped by the error state's Try again, so a failed load has a way forward
  // without changing any filter.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        // getAdminIdToken() (not user.getIdToken() directly) so this also
        // works under a local-admin dev session, which has no real Firebase
        // user at all — reading it straight off `user` left this effect
        // permanently bailing via the guard below, spinning forever with no
        // error and no retry affordance.
        const token = await getAdminIdToken();
        if (!token) {
          throw new Error("Your session isn't ready. Sign in again and retry.");
        }
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
  }, [apiStatus, deferredQuery, page, reloadKey, status, user]);

  const summary = payload?.summary;
  const counts = summary?.counts || {};
  const apiSummary = summary?.api || {};
  const apiCounts = apiSummary?.counts || {};
  const items = payload?.items || [];
  const pagination = payload?.pagination;
  const activeFilterLabel = useMemo(
    () =>
      STATUS_FILTERS.find((item) => item.value === status)?.label ||
      "All tools",
    [status],
  );

  const retry = () => setReloadKey((value) => value + 1);

  const columns = [
    {
      key: "tool",
      header: "Tool",
      render: (item) => (
        <div>
          <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
          <p className="mt-1 font-mono text-xs text-[var(--muted)]">
            {item.slug}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{item.category}</p>
        </div>
      ),
    },
    {
      key: "state",
      header: "State",
      render: (item) => (
        <div>
          <StatusBadge status={item.status} />
          {item.apiReadiness?.required ? (
            <div className="mt-2">
              <ApiStatusBadge status={item.apiReadiness.status} />
            </div>
          ) : null}
          <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
            Score {formatNumber(item.score)}
          </p>
        </div>
      ),
    },
    {
      key: "evidence",
      header: "Evidence",
      render: (item) => (
        <div className="text-xs leading-5 text-[var(--muted)]">
          <p>
            {item.evidence?.sourceFiles || 0} files ·{" "}
            {item.evidence?.automatedTest ? "tested" : "no test"}
          </p>
          {item.apiReadiness?.providers?.length ? (
            <p className="mt-1 text-[var(--foreground)]">
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
                      : "border-danger bg-danger-soft text-[var(--danger-text)]"
                  }`}
                >
                  {entry.name}
                </span>
              ))}
            </div>
          ) : null}
          {item.issues?.length ? (
            <p className="mt-1 flex items-start gap-1.5">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
                aria-hidden="true"
              />
              <span>{item.issues.slice(0, 2).join(" · ")}</span>
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: "24rem",
      render: (item) => (
        <span className="text-xs leading-5 text-[var(--muted)]">
          {item.recommendations?.[0] || "Keep regression evidence current."}
        </span>
      ),
    },
    {
      key: "open",
      header: "Open",
      align: "right",
      render: (item) => (
        <a
          href={`https://www.altftool.com${item.route}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline h-9 gap-2 px-3 text-xs"
          title={`Open ${item.name}`}
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          breadcrumbs={[
            { label: "Health", href: "/health" },
            { label: "Tool readiness" },
          ]}
          eyebrow="Build-time evidence"
          icon={Wrench}
          title="Tool readiness inventory"
          description="Structure, interactions, automated coverage, unfinished signals, and provider configuration contracts for every registered microtool."
          actions={
            <span className="rounded-full border border-border bg-surface-soft px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
              Secret-safe status only · no credential values
            </span>
          }
        />

        <div className="space-y-5">
          <StatGrid
            columns={4}
            items={[
              {
                label: "Working",
                value: formatNumber(counts.working),
                hint: `${formatNumber(summary?.total)} registered tools`,
                icon: CheckCircle2,
                tone: "success",
              },
              {
                label: "API tools",
                value: formatNumber(apiSummary?.tools),
                hint: `${formatNumber(apiSummary?.providerCount)} detected providers`,
                icon: CloudCog,
              },
              {
                label: "Configured",
                value: formatNumber(apiCounts.configured),
                hint: `${formatNumber(apiSummary?.configuredEnvKeys?.length)} configured env contracts`,
                icon: ShieldCheck,
                tone: "success",
              },
              {
                label: "Missing config",
                value: formatNumber(apiCounts["missing-config"]),
                hint: `${formatNumber(apiSummary?.missingEnvKeys?.length)} missing env contracts`,
                icon: KeyRound,
                tone: apiCounts["missing-config"] ? "danger" : "success",
              },
              {
                label: "Runtime checks",
                value: formatNumber(apiCounts["runtime-check"]),
                hint: "Public or runtime-provided endpoints",
                icon: RadioTower,
              },
              {
                label: "Partial",
                value: formatNumber(counts.partial),
                hint: "Needs stronger implementation evidence",
                icon: AlertTriangle,
                tone: "warning",
              },
              {
                label: "Broken",
                value: formatNumber(counts.broken),
                hint: "Structural failures in registered tools",
                icon: XCircle,
                tone: counts.broken ? "danger" : "success",
              },
              {
                label: "Automated coverage",
                value: `${formatNumber(summary?.automatedCoverage)}%`,
                hint: `${formatNumber(summary?.automatedTests)} tools with deterministic evidence`,
                icon: FlaskConical,
                tone: summary?.automatedCoverage >= 80 ? "success" : "warning",
              },
            ]}
          />

          <SectionCard
            title={activeFilterLabel}
            description={`${formatNumber(pagination?.total)} matching tools`}
            bodyClassName="space-y-4"
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[var(--muted)]">
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
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
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
                      !pagination ||
                      pagination.page >= pagination.pages ||
                      loading
                    }
                    className="btn btn-outline h-10 gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            }
          >
            <FilterBar
              search={query}
              onSearchChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              searchPlaceholder="Search tool, provider, route, or env key"
              filters={[
                {
                  key: "status",
                  label: "Filter by readiness status",
                  value: status,
                  onChange: (value) => {
                    setStatus(value);
                    setPage(1);
                  },
                  options: STATUS_FILTERS,
                },
                {
                  key: "apiStatus",
                  label: "Filter by API readiness",
                  value: apiStatus,
                  onChange: (value) => {
                    setApiStatus(value);
                    setPage(1);
                  },
                  options: API_FILTERS,
                },
              ]}
            />

            {/* A failed reload keeps the previous page of results on screen, so
                the failure is reported next to the stale data instead of
                replacing it. With no payload the table below owns the error. */}
            {error && payload ? (
              <ErrorState
                title="Tool readiness could not be refreshed"
                message={error}
                onRetry={retry}
              />
            ) : null}

            <DataTable
              caption="Registered microtools and their readiness evidence"
              columns={columns}
              rows={items}
              getRowKey={(item) => item.slug}
              loading={loading && !payload}
              error={payload ? null : error || null}
              onRetry={retry}
              empty={
                <EmptyState
                  icon={Wrench}
                  title="No tools match this search and status filter"
                  description="Clear the search box or switch back to all tools and all API states."
                />
              }
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
