"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  Gauge,
  ListChecks,
  RefreshCw,
  Route,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  DataState,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  PageHeader,
  SectionCard,
  StatGrid,
} from "@/ansets";
import { getAdminIdToken } from "@/lib/adminIdToken";

const ROUTE_FILTER_OPTIONS = [
  { value: "all", label: "All signals" },
  { value: "issues", label: "Blocking" },
  { value: "advisories", label: "Advisories" },
];

const WATCHLIST_LIMIT = 20;

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Not generated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(value) {
  const duration = Number(value) || 0;
  return duration >= 1000
    ? `${(duration / 1000).toFixed(duration >= 10_000 ? 0 : 1)}s`
    : `${duration}ms`;
}

function statusTone(status) {
  if (
    [
      "healthy",
      "ready",
      "fresh",
      "pass",
      "clean",
      "lite-ready",
      "working",
    ].includes(status)
  ) {
    return {
      label: "Healthy",
      className: "border-success bg-success-soft text-success",
      icon: CheckCircle2,
    };
  }
  if (
    [
      "attention",
      "blocked",
      "stale",
      "fail",
      "read-failed",
      "stale-or-unavailable",
      "unavailable",
      "broken",
    ].includes(status)
  ) {
    return {
      label: "Attention",
      // Badge copy is normal-size text, so it uses the text-safe danger token.
      className:
        "border-danger bg-danger-soft text-[var(--danger-text)]",
      icon: XCircle,
    };
  }
  return {
    label: status === "not-run" ? "Not run" : "Watch",
    className: "border-warning bg-warning-soft text-warning",
    icon: AlertTriangle,
  };
}

/**
 * Health-specific status pill. Kept local: the tone mapping below is derived
 * from this API's status vocabulary, which no other screen shares.
 */
function StatusBadge({ status, label }) {
  const tone = statusTone(status);
  const Icon = tone.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label || tone.label}
    </span>
  );
}

function Muted({ children }) {
  return <span className="text-[var(--muted)]">{children}</span>;
}

function RouteQualitySection({ routeQuality }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const groups = routeQuality?.groups || [];
  const watchlist = routeQuality?.watchlist || [];

  const filteredWatchlist = useMemo(() => {
    const term = query.trim().toLowerCase();
    return watchlist.filter((item) => {
      const matchesQuery =
        !term ||
        item.route?.toLowerCase().includes(term) ||
        item.group?.toLowerCase().includes(term) ||
        item.issues?.some((issue) => issue.toLowerCase().includes(term)) ||
        item.advisories?.some((issue) => issue.toLowerCase().includes(term));
      const matchesFilter =
        filter === "all" ||
        (filter === "issues" && item.issues?.length) ||
        (filter === "advisories" &&
          !item.issues?.length &&
          item.advisories?.length);
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, watchlist]);

  const shownWatchlist = filteredWatchlist.slice(0, WATCHLIST_LIMIT);

  const groupColumns = [
    {
      key: "group",
      header: "Surface",
      render: (group) => (
        <span className="font-semibold text-[var(--foreground)]">
          {group.group}
        </span>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (group) => (
        <StatusBadge
          status={
            group.issues ? "attention" : group.advisories ? "watch" : "healthy"
          }
          label={`${formatNumber(group.score)}/100`}
        />
      ),
    },
    {
      key: "routes",
      header: "Routes",
      render: (group) => <Muted>{formatNumber(group.routes)}</Muted>,
    },
    {
      key: "indexPolicy",
      header: "Index policy",
      render: (group) => (
        <Muted>
          {formatNumber(group.indexable)} index ·{" "}
          {formatNumber(group.noindex)} noindex
        </Muted>
      ),
    },
    {
      key: "sitemapCoverage",
      header: "Sitemap",
      render: (group) => <Muted>{formatNumber(group.sitemapCoverage)}%</Muted>,
    },
    {
      key: "signals",
      header: "Signals",
      render: (group) => (
        <Muted>
          {formatNumber(group.issues)} blocking ·{" "}
          {formatNumber(group.advisories)} advisory
        </Muted>
      ),
    },
  ];

  return (
    <>
      <SectionCard
        icon={Route}
        title="Route quality"
        description={`Build-derived inventory · ${formatNumber(routeQuality?.totals?.routes)} rendered routes grouped by surface, metadata state, canonical coverage, and index policy.`}
        actions={
          <StatusBadge
            status={routeQuality?.status}
            label={`${formatNumber(routeQuality?.score)}/100`}
          />
        }
        bodyClassName="space-y-4"
      >
        <StatGrid
          columns={4}
          items={[
            {
              label: "Rendered routes",
              value: formatNumber(routeQuality?.totals?.routes),
              hint: `${formatNumber(routeQuality?.totals?.indexable)} indexable and ${formatNumber(routeQuality?.totals?.noindex)} noindex`,
              icon: Route,
            },
            {
              label: "Sitemap coverage",
              value: `${formatNumber(routeQuality?.totals?.sitemapCoverage)}%`,
              hint: `${formatNumber(routeQuality?.totals?.sitemapCovered)} canonical targets covered`,
              icon: SearchCheck,
              tone:
                routeQuality?.totals?.sitemapCoverage === 100
                  ? "success"
                  : "warning",
            },
            {
              label: "Index conflicts",
              value: formatNumber(routeQuality?.totals?.indexConflicts),
              hint: "Noindex routes that still appear in the XML sitemap",
              icon: ShieldCheck,
              tone: routeQuality?.totals?.indexConflicts ? "danger" : "success",
            },
            {
              label: "Advisory routes",
              value: formatNumber(routeQuality?.totals?.routesWithAdvisories),
              hint: "Non-blocking title, description, or rendered H1 opportunities",
              icon: FileSearch,
              tone: routeQuality?.totals?.routesWithAdvisories
                ? "warning"
                : "success",
            },
          ]}
        />

        <DataTable
          caption="Route quality by surface"
          columns={groupColumns}
          rows={groups}
          getRowKey={(group) => group.group}
          empty={
            <EmptyState
              icon={Route}
              title="No route groups in this snapshot"
              description="Run a live check to rebuild the rendered-route inventory."
            />
          }
        />
      </SectionCard>

      <SectionCard
        title="Route watchlist"
        description="Blocking index issues first, followed by metadata advisories."
        bodyClassName="space-y-4"
      >
        <FilterBar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search route or issue"
          filters={[
            {
              key: "signal",
              label: "Filter route watchlist by signal",
              value: filter,
              onChange: setFilter,
              options: ROUTE_FILTER_OPTIONS,
            },
          ]}
          count={
            filteredWatchlist.length > WATCHLIST_LIMIT
              ? `Showing ${WATCHLIST_LIMIT} of ${formatNumber(filteredWatchlist.length)} routes`
              : `${formatNumber(filteredWatchlist.length)} of ${formatNumber(watchlist.length)} routes`
          }
        />

        <DataState
          isEmpty={!shownWatchlist.length}
          empty={
            <EmptyState
              icon={CheckCircle2}
              title="No routes match this watchlist filter"
              description="Clear the search box or switch back to all signals to see every watched route."
            />
          }
        >
          <div className="divide-y divide-border rounded-lg border border-border">
            {shownWatchlist.map((item) => {
              const blocking = item.issues?.length > 0;
              return (
                <div
                  key={item.route}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={blocking ? "attention" : "watch"}
                        label={blocking ? "Blocking" : "Advisory"}
                      />
                      <span className="text-xs font-semibold text-[var(--muted)]">
                        {item.group} · {item.indexState}
                      </span>
                    </div>
                    <p className="mt-2 break-all font-mono text-xs font-semibold text-[var(--foreground)]">
                      {item.route}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      {[...(item.issues || []), ...(item.advisories || [])]
                        .slice(0, 3)
                        .join(" · ")}
                    </p>
                  </div>
                  <Link
                    href={`/altftool/seo/pages?path=${encodeURIComponent(item.route)}`}
                    className="btn btn-outline h-9 shrink-0 gap-2 px-3 text-xs"
                  >
                    Edit SEO
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </DataState>
      </SectionCard>
    </>
  );
}

function ProductionMonitoringSection({ monitoring, onRefresh, refreshing }) {
  const probes = monitoring?.probes || [];

  const probeColumns = [
    {
      key: "label",
      header: "Surface",
      render: (probe) => (
        <div>
          <p className="font-semibold text-[var(--foreground)]">{probe.label}</p>
          <a
            href={probe.finalUrl || probe.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-[var(--muted)] hover:text-[var(--primary)]"
          >
            {probe.path}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      ),
    },
    {
      key: "state",
      header: "State",
      render: (probe) => (
        <StatusBadge
          status={
            probe.state === "pass"
              ? "healthy"
              : probe.state === "slow"
                ? "watch"
                : "attention"
          }
          label={probe.state}
        />
      ),
    },
    {
      key: "status",
      header: "HTTP",
      render: (probe) => (
        <span className="font-mono text-xs text-[var(--muted)]">
          {probe.status || "—"}
        </span>
      ),
    },
    {
      key: "durationMs",
      header: "Latency",
      render: (probe) => (
        <span className="font-mono text-xs font-semibold text-[var(--foreground)]">
          {formatDuration(probe.durationMs)}
        </span>
      ),
    },
    {
      key: "detail",
      header: "Contract",
      render: (probe) => (
        <span className="text-xs text-[var(--muted)]">{probe.detail}</span>
      ),
    },
  ];

  return (
    <SectionCard
      icon={Activity}
      title="Critical route monitor"
      description="Synthetic production checks · On-demand, cache-aware probes validate response status, expected content, and latency without continuous polling cost."
      actions={
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="btn btn-outline h-10 gap-2"
          title="Run live production route probes"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
            aria-hidden="true"
          />
          Run live checks
        </button>
      }
      bodyClassName="space-y-4"
    >
      <StatGrid
        columns={4}
        items={[
          {
            label: "Passing",
            value: `${formatNumber(monitoring?.totals?.passing)}/${formatNumber(monitoring?.totals?.probes)}`,
            hint: `Checked ${formatDate(monitoring?.checkedAt)}`,
            icon: CheckCircle2,
            tone: monitoring?.totals?.failing
              ? "danger"
              : monitoring?.totals?.slow
                ? "warning"
                : "success",
          },
          {
            label: "P95 response",
            value: monitoring?.performance
              ? formatDuration(monitoring.performance.p95Ms)
              : "Saved",
            hint: monitoring?.thresholds
              ? `Slow threshold ${formatDuration(monitoring.thresholds.slowMs)}`
              : "Run live checks for current latency",
            icon: Clock3,
            tone: monitoring?.totals?.slow ? "warning" : "primary",
          },
          {
            label: "Slow routes",
            value: formatNumber(monitoring?.totals?.slow),
            hint: "Healthy response with latency above the route budget",
            icon: AlertTriangle,
            tone: monitoring?.totals?.slow ? "warning" : "success",
          },
          {
            label: "Failing routes",
            value: formatNumber(monitoring?.totals?.failing),
            hint: "Bad status, content contract, timeout, or runtime error",
            icon: XCircle,
            tone: monitoring?.totals?.failing ? "danger" : "success",
          },
        ]}
      />

      <DataTable
        caption="Production route probes"
        columns={probeColumns}
        rows={probes}
        getRowKey={(probe) => probe.key}
        empty={
          <EmptyState
            icon={Activity}
            title="No live probe results in this snapshot"
            description={
              monitoring?.detail ||
              "The lite snapshot avoids live network probes. Run live checks for current route status and latency."
            }
            action={<StatusBadge status={monitoring?.status} />}
          />
        }
      />
    </SectionCard>
  );
}

function ToolReadinessSection({ tools }) {
  const readiness = tools?.readiness;
  const counts = readiness?.counts || {};
  const risks = readiness?.topRisks || [];

  return (
    <SectionCard
      icon={ListChecks}
      title="Tool readiness"
      description={["Microtool evidence", readiness?.description]
        .filter(Boolean)
        .join(" · ")}
      actions={
        <Link href="/health/tools" className="btn btn-primary h-10 gap-2">
          Open inventory
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
      bodyClassName="space-y-4"
    >
      <StatGrid
        columns={4}
        items={[
          {
            label: "Working",
            value: formatNumber(counts.working),
            hint: `${formatNumber(readiness?.total)} registered tools analyzed`,
            icon: CheckCircle2,
            tone: "success",
          },
          {
            label: "API required",
            value: formatNumber(counts["api-required"]),
            hint: `${formatNumber(readiness?.api?.counts?.configured)} configured · ${formatNumber(readiness?.api?.counts?.["missing-config"])} missing config`,
            icon: Activity,
          },
          {
            label: "Partial",
            value: formatNumber(counts.partial),
            hint: `${formatNumber(readiness?.priority?.needsAttention)} priority tools need stronger evidence`,
            icon: AlertTriangle,
            tone: counts.partial ? "warning" : "success",
          },
          {
            label: "Broken",
            value: formatNumber(counts.broken),
            hint: `${formatNumber(readiness?.automatedCoverage)}% automated evidence coverage`,
            icon: XCircle,
            tone: counts.broken ? "danger" : "success",
          },
        ]}
      />

      <DataState
        isEmpty={!risks.length}
        empty={
          <EmptyState
            icon={CheckCircle2}
            title="No static readiness risks were detected"
            description="Every registered tool cleared the build-time evidence checks in this snapshot."
          />
        }
      >
        <div className="divide-y divide-border rounded-lg border border-border">
          {risks.slice(0, 8).map((item) => (
            <div
              key={item.slug}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} label={item.status} />
                  {item.priority ? (
                    <span className="rounded-full border border-info bg-info-soft px-2.5 py-1 text-xs font-semibold text-info">
                      Priority
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 font-semibold text-[var(--foreground)]">
                  {item.name}
                </p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  {item.slug}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {item.issues?.[0] ||
                    item.recommendations?.[0] ||
                    "External API availability needs runtime verification."}
                </p>
              </div>
              <Link
                href="/health/tools"
                className="btn btn-outline h-9 shrink-0 gap-2 px-3 text-xs"
              >
                Inspect
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </DataState>
    </SectionCard>
  );
}

function IndexControlSection({ routeQuality }) {
  const checks = routeQuality?.checks || [];

  return (
    <SectionCard
      icon={SearchCheck}
      title="SEO index control"
      description="Crawler policy · Rendered robots directives, canonical ownership, and sitemap membership are checked from the same production build."
      actions={
        <Link href="/altftool/seo/pages" className="btn btn-primary h-10 gap-2">
          Manage index rules
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
      flush
      footer={
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.altftool.com/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline h-9 gap-2 text-xs"
          >
            Sitemap
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href="https://www.altftool.com/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline h-9 gap-2 text-xs"
          >
            Robots
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/altftool/seo/search-console"
            className="btn btn-outline h-9 gap-2 text-xs"
          >
            Search Console
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <DataState
        isEmpty={!checks.length}
        empty={
          <EmptyState
            icon={SearchCheck}
            title="No crawler-policy checks in this snapshot"
            description="Run a live check to re-evaluate robots directives, canonicals, and sitemap membership."
          />
        }
      >
        <div className="divide-y divide-border">
          {checks.map((check) => (
            <div
              key={check.key}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex items-start gap-3">
                {check.ok ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {check.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {check.detail}
                  </p>
                </div>
              </div>
              <StatusBadge
                status={check.ok ? "healthy" : "attention"}
                label={check.ok ? "Pass" : "Fix"}
              />
            </div>
          ))}
        </div>
      </DataState>
    </SectionCard>
  );
}

function SystemSignals({ snapshot }) {
  const signals = [
    {
      label: "Runtime gates",
      status: snapshot?.runtimeQuality?.status,
      score: snapshot?.runtimeQuality?.score,
      detail: `${snapshot?.runtimeQuality?.summary?.pass || 0}/${snapshot?.runtimeQuality?.summary?.total || 0} strict gates passing`,
    },
    {
      label: "Firebase live data",
      status: snapshot?.firebaseLiveData?.status,
      score: snapshot?.firebaseLiveData?.score,
      detail: `${snapshot?.firebaseLiveData?.passingChecks || 0}/${snapshot?.firebaseLiveData?.totalChecks || 0} reads passing`,
    },
    {
      label: "Firebase integrity",
      status: snapshot?.firebaseDataIntegrity?.status,
      score: snapshot?.firebaseDataIntegrity?.score,
      detail: `${snapshot?.firebaseDataIntegrity?.passingChecks || 0}/${snapshot?.firebaseDataIntegrity?.totalChecks || 0} integrity checks passing`,
    },
    {
      label: "Performance budget",
      status: snapshot?.performanceBudget?.status,
      score: snapshot?.performanceBudget?.score,
      detail: `${formatNumber(snapshot?.performanceBudget?.totals?.dynamicToolImports)} lazy tool imports`,
    },
    {
      label: "Production freshness",
      status: snapshot?.production?.status,
      score: snapshot?.production?.score,
      detail: snapshot?.production?.productionCommit
        ? `Commit ${snapshot.production.productionCommit.slice(0, 8)}`
        : "Production commit signal unavailable",
    },
    {
      label: "Deploy readiness",
      status: snapshot?.deploy?.status,
      score: snapshot?.deploy?.score,
      detail: `${formatNumber(snapshot?.deploy?.missingSecrets?.length)} deployment configuration gaps`,
    },
  ];

  return (
    <SectionCard
      icon={Gauge}
      title="Runtime and release signals"
      description="Supporting gates · The overall score is a normalized weighted average; adding more checks can no longer inflate it above 100."
      flush
      className="overflow-hidden"
    >
      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((signal) => (
          <article key={signal.label} className="bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {signal.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {signal.detail}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
                {formatNumber(signal.score)}
              </span>
            </div>
            <div className="mt-3">
              <StatusBadge status={signal.status} />
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

export default function QualityProductionHealthDashboard() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHealth = useCallback(
    async ({ live = false } = {}) => {
      live ? setRefreshing(true) : setLoading(true);
      setError("");

      try {
        // Resolve the token at call time via getAdminIdToken(), which works in
        // BOTH auth modes (Firebase session and the local-dev admin session).
        // Reading `user.getIdToken` from AuthContext instead would dead-end any
        // mode that renders this page without a Firebase user: the guard would
        // latch an error that Retry re-enters forever. Here Retry re-reads the
        // live session, so it can actually succeed.
        const token = await getAdminIdToken();
        if (!token) {
          throw new Error(
            "Your admin session is not ready, so the health snapshot could not be requested. Refresh the page, then retry.",
          );
        }
        const endpoint = live ? "/api/health?fresh=1" : "/api/health?lite=1";
        const response = await fetch(endpoint, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Health snapshot could not be loaded.");
        }
        setSnapshot(payload);
      } catch (requestError) {
        setError(
          requestError?.message || "Health snapshot could not be loaded.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const releaseGateSummary = useMemo(() => {
    const gates = snapshot?.releaseGates?.gates || snapshot?.releaseGates || [];
    const list = Array.isArray(gates) ? gates : [];
    return {
      total: list.length,
      pass: list.filter((gate) => gate.status === "pass").length,
      warn: list.filter((gate) => gate.status === "warn").length,
      block: list.filter((gate) => gate.status === "block").length,
    };
  }, [snapshot]);

  const retryLive = () => loadHealth({ live: true });

  return (
    <div
      className="min-h-full bg-background px-4 py-5 sm:px-6 lg:px-8"
      data-testid="health-dashboard"
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="AltFTool operations"
          icon={Activity}
          title="Quality and production health"
          description="Real rendered routes, crawler policy, runtime gates, Firebase, and on-demand production probes in one release workspace."
          actions={
            <>
              <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {snapshot?.mode === "live" ? "Live" : "Lite"} snapshot ·{" "}
                {formatDate(snapshot?.generatedAt)}
              </span>
              <button
                type="button"
                onClick={retryLive}
                disabled={refreshing}
                className="btn btn-primary h-10 gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
                  aria-hidden="true"
                />
                Refresh live
              </button>
            </>
          }
        />

        <div className="space-y-5">
          {snapshot ? (
            <SectionCard>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold tabular-nums text-[var(--foreground)]">
                    {formatNumber(snapshot?.overall?.score)}
                  </span>
                  <div>
                    <StatusBadge
                      status={snapshot?.overall?.status}
                      label={snapshot?.overall?.label}
                    />
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Normalized release-health score
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    status={releaseGateSummary.block ? "attention" : "healthy"}
                    label={`${releaseGateSummary.pass}/${releaseGateSummary.total} gates pass`}
                  />
                  {releaseGateSummary.warn ? (
                    <StatusBadge
                      status="watch"
                      label={`${releaseGateSummary.warn} warnings`}
                    />
                  ) : null}
                  {releaseGateSummary.block ? (
                    <StatusBadge
                      status="attention"
                      label={`${releaseGateSummary.block} blockers`}
                    />
                  ) : null}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {/* A failed refresh keeps the previous snapshot on screen, so the
              failure is reported next to the stale data instead of replacing
              it. With no snapshot at all the DataState below owns the error. */}
          {error && snapshot ? (
            <ErrorState
              title="Live refresh failed"
              message={error}
              onRetry={retryLive}
            />
          ) : null}

          <DataState
            loading={loading && !snapshot}
            error={snapshot ? null : error || null}
            isEmpty={!snapshot}
            onRetry={retryLive}
            loadingVariant="detail"
            empty={
              <SectionCard>
                <EmptyState
                  icon={Activity}
                  title="No health snapshot is available."
                  description="Nothing has been generated for this environment yet. Run a live check to build the first snapshot."
                  action={
                    <button
                      type="button"
                      onClick={retryLive}
                      className="btn btn-primary h-10 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Load live health
                    </button>
                  }
                />
              </SectionCard>
            }
          >
            <div className="space-y-5">
              <RouteQualitySection routeQuality={snapshot?.routeQuality} />
              <ToolReadinessSection tools={snapshot?.tools} />
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <ProductionMonitoringSection
                  monitoring={snapshot?.productionMonitoring}
                  onRefresh={retryLive}
                  refreshing={refreshing}
                />
                <IndexControlSection routeQuality={snapshot?.routeQuality} />
              </div>
              <SystemSignals snapshot={snapshot} />

              <SectionCard
                title="Next fixes from current evidence"
                description="Recommended actions · the follow-up work this snapshot's evidence points at."
              >
                <DataState
                  isEmpty={!snapshot?.recommendations?.length}
                  empty={
                    <EmptyState
                      icon={Gauge}
                      title="No follow-up actions"
                      description="This snapshot did not produce any recommended fixes."
                    />
                  }
                >
                  <ol className="grid gap-3 lg:grid-cols-2">
                    {(snapshot?.recommendations || []).map(
                      (recommendation, index) => (
                        <li
                          key={recommendation}
                          className="flex gap-3 rounded-lg border border-border bg-surface-soft p-3 text-sm leading-6 text-[var(--muted)]"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {index + 1}
                          </span>
                          {recommendation}
                        </li>
                      ),
                    )}
                  </ol>
                </DataState>
              </SectionCard>
            </div>
          </DataState>
        </div>
      </div>
    </div>
  );
}
