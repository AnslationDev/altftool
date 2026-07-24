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
  Search,
  SearchCheck,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ROUTE_FILTERS = [
  { key: "all", label: "All signals" },
  { key: "issues", label: "Blocking" },
  { key: "advisories", label: "Advisories" },
];

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
      className: "border-danger bg-danger-soft text-danger",
      icon: XCircle,
    };
  }
  return {
    label: status === "not-run" ? "Not run" : "Watch",
    className: "border-warning bg-warning-soft text-warning",
    icon: AlertTriangle,
  };
}

function StatusBadge({ status, label }) {
  const tone = statusTone(status);
  const Icon = tone.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label || tone.label}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "primary" }) {
  const iconTone =
    tone === "danger"
      ? "bg-danger-soft text-danger"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : tone === "success"
          ? "bg-success-soft text-success"
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
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${iconTone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
    </article>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-label="Loading health dashboard">
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface-soft" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-border bg-surface-soft"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-border bg-surface-soft" />
    </div>
  );
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

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <SectionHeader
        icon={Route}
        eyebrow="Build-derived inventory"
        title="Route quality"
        description={`${formatNumber(routeQuality?.totals?.routes)} rendered routes grouped by surface, metadata state, canonical coverage, and index policy.`}
        action={
          <StatusBadge
            status={routeQuality?.status}
            label={`${formatNumber(routeQuality?.score)}/100`}
          />
        }
      />

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">
        <MetricCard
          icon={Route}
          label="Rendered routes"
          value={formatNumber(routeQuality?.totals?.routes)}
          detail={`${formatNumber(routeQuality?.totals?.indexable)} indexable and ${formatNumber(routeQuality?.totals?.noindex)} noindex`}
        />
        <MetricCard
          icon={SearchCheck}
          label="Sitemap coverage"
          value={`${formatNumber(routeQuality?.totals?.sitemapCoverage)}%`}
          detail={`${formatNumber(routeQuality?.totals?.sitemapCovered)} canonical targets covered`}
          tone={
            routeQuality?.totals?.sitemapCoverage === 100
              ? "success"
              : "warning"
          }
        />
        <MetricCard
          icon={ShieldCheck}
          label="Index conflicts"
          value={formatNumber(routeQuality?.totals?.indexConflicts)}
          detail="Noindex routes that still appear in the XML sitemap"
          tone={routeQuality?.totals?.indexConflicts ? "danger" : "success"}
        />
        <MetricCard
          icon={FileSearch}
          label="Advisory routes"
          value={formatNumber(routeQuality?.totals?.routesWithAdvisories)}
          detail="Non-blocking title, description, or rendered H1 opportunities"
          tone={
            routeQuality?.totals?.routesWithAdvisories ? "warning" : "success"
          }
        />
      </div>

      <div className="overflow-x-auto border-b border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-soft text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 sm:px-5">Surface</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Routes</th>
              <th className="px-4 py-3">Index policy</th>
              <th className="px-4 py-3">Sitemap</th>
              <th className="px-4 py-3">Signals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((group) => (
              <tr key={group.group} className="hover:bg-surface-soft">
                <td className="px-4 py-3 font-semibold text-foreground sm:px-5">
                  {group.group}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={
                      group.issues
                        ? "attention"
                        : group.advisories
                          ? "watch"
                          : "healthy"
                    }
                    label={`${formatNumber(group.score)}/100`}
                  />
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatNumber(group.routes)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatNumber(group.indexable)} index ·{" "}
                  {formatNumber(group.noindex)} noindex
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatNumber(group.sitemapCoverage)}%
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatNumber(group.issues)} blocking ·{" "}
                  {formatNumber(group.advisories)} advisory
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Route watchlist
            </h3>
            <p className="mt-1 text-xs text-muted">
              Blocking index issues first, followed by metadata advisories.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex rounded-lg border border-border bg-surface-soft p-1">
              {ROUTE_FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  aria-pressed={filter === item.key}
                  className={`h-10 rounded-md px-3 text-xs font-semibold transition ${
                    filter === item.key
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input h-10 w-full pl-9 sm:w-72"
                placeholder="Search route or issue"
                aria-label="Search route watchlist"
              />
            </label>
          </div>
        </div>

        {filteredWatchlist.length ? (
          <div className="mt-4 divide-y divide-border rounded-lg border border-border">
            {filteredWatchlist.slice(0, 20).map((item) => {
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
                      <span className="text-xs font-semibold text-muted">
                        {item.group} · {item.indexState}
                      </span>
                    </div>
                    <p className="mt-2 break-all font-mono text-xs font-semibold text-foreground">
                      {item.route}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
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
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-success bg-success-soft p-4 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            No routes match this watchlist filter.
          </div>
        )}
      </div>
    </section>
  );
}

function ProductionMonitoringSection({ monitoring, onRefresh, refreshing }) {
  const probes = monitoring?.probes || [];
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <SectionHeader
        icon={Activity}
        eyebrow="Synthetic production checks"
        title="Critical route monitor"
        description="On-demand, cache-aware probes validate response status, expected content, and latency without continuous polling cost."
        action={
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="btn btn-outline h-10 gap-2"
            title="Run live production route probes"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Run live checks
          </button>
        }
      />

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">
        <MetricCard
          icon={CheckCircle2}
          label="Passing"
          value={`${formatNumber(monitoring?.totals?.passing)}/${formatNumber(monitoring?.totals?.probes)}`}
          detail={`Checked ${formatDate(monitoring?.checkedAt)}`}
          tone={
            monitoring?.totals?.failing
              ? "danger"
              : monitoring?.totals?.slow
                ? "warning"
                : "success"
          }
        />
        <MetricCard
          icon={Clock3}
          label="P95 response"
          value={
            monitoring?.performance
              ? formatDuration(monitoring.performance.p95Ms)
              : "Saved"
          }
          detail={
            monitoring?.thresholds
              ? `Slow threshold ${formatDuration(monitoring.thresholds.slowMs)}`
              : "Run live checks for current latency"
          }
          tone={monitoring?.totals?.slow ? "warning" : "primary"}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Slow routes"
          value={formatNumber(monitoring?.totals?.slow)}
          detail="Healthy response with latency above the route budget"
          tone={monitoring?.totals?.slow ? "warning" : "success"}
        />
        <MetricCard
          icon={XCircle}
          label="Failing routes"
          value={formatNumber(monitoring?.totals?.failing)}
          detail="Bad status, content contract, timeout, or runtime error"
          tone={monitoring?.totals?.failing ? "danger" : "success"}
        />
      </div>

      {probes.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-soft text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 sm:px-5">Surface</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">HTTP</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {probes.map((probe) => (
                <tr key={probe.key} className="hover:bg-surface-soft">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-semibold text-foreground">{probe.label}</p>
                    <a
                      href={probe.finalUrl || probe.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-primary"
                    >
                      {probe.path}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {probe.status || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {formatDuration(probe.durationMs)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {probe.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            {monitoring?.detail ||
              "The lite snapshot avoids live network probes. Run live checks for current route status and latency."}
          </p>
          <StatusBadge status={monitoring?.status} />
        </div>
      )}
    </section>
  );
}

function ToolReadinessSection({ tools }) {
  const readiness = tools?.readiness;
  const counts = readiness?.counts || {};
  const risks = readiness?.topRisks || [];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <SectionHeader
        icon={ListChecks}
        eyebrow="Microtool evidence"
        title="Tool readiness"
        description={readiness?.description}
        action={
          <Link href="/health/tools" className="btn btn-primary h-10 gap-2">
            Open inventory
            <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">
        <MetricCard
          icon={CheckCircle2}
          label="Working"
          value={formatNumber(counts.working)}
          detail={`${formatNumber(readiness?.total)} registered tools analyzed`}
          tone="success"
        />
        <MetricCard
          icon={Activity}
          label="API required"
          value={formatNumber(counts["api-required"])}
          detail={`${formatNumber(readiness?.api?.counts?.configured)} configured · ${formatNumber(readiness?.api?.counts?.["missing-config"])} missing config`}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Partial"
          value={formatNumber(counts.partial)}
          detail={`${formatNumber(readiness?.priority?.needsAttention)} priority tools need stronger evidence`}
          tone={counts.partial ? "warning" : "success"}
        />
        <MetricCard
          icon={XCircle}
          label="Broken"
          value={formatNumber(counts.broken)}
          detail={`${formatNumber(readiness?.automatedCoverage)}% automated evidence coverage`}
          tone={counts.broken ? "danger" : "success"}
        />
      </div>

      {risks.length ? (
        <div className="divide-y divide-border">
          {risks.slice(0, 8).map((item) => (
            <div
              key={item.slug}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"
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
                <p className="mt-2 font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">{item.slug}</p>
                <p className="mt-1 text-xs leading-5 text-muted">
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
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-5 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          No static readiness risks were detected.
        </div>
      )}
    </section>
  );
}

function IndexControlSection({ routeQuality }) {
  const checks = routeQuality?.checks || [];
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <SectionHeader
        icon={SearchCheck}
        eyebrow="Crawler policy"
        title="SEO index control"
        description="Rendered robots directives, canonical ownership, and sitemap membership are checked from the same production build."
        action={
          <Link
            href="/altftool/seo/pages"
            className="btn btn-primary h-10 gap-2"
          >
            Manage index rules
            <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />
      <div className="divide-y divide-border">
        {checks.map((check) => (
          <div
            key={check.key}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="flex items-start gap-3">
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {check.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
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
      <div className="flex flex-wrap gap-2 border-t border-border bg-surface-soft px-4 py-3 sm:px-5">
        <a
          href="https://www.altftool.com/sitemap.xml"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline h-9 gap-2 text-xs"
        >
          Sitemap
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href="https://www.altftool.com/robots.txt"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline h-9 gap-2 text-xs"
        >
          Robots
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          href="/altftool/seo/search-console"
          className="btn btn-outline h-9 gap-2 text-xs"
        >
          Search Console
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
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
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <SectionHeader
        icon={Gauge}
        eyebrow="Supporting gates"
        title="Runtime and release signals"
        description="The overall score is a normalized weighted average; adding more checks can no longer inflate it above 100."
      />
      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((signal) => (
          <article key={signal.label} className="bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {signal.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {signal.detail}
                </p>
              </div>
              <span className="text-lg font-bold text-foreground">
                {formatNumber(signal.score)}
              </span>
            </div>
            <div className="mt-3">
              <StatusBadge status={signal.status} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function QualityProductionHealthDashboard() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHealth = useCallback(
    async ({ live = false } = {}) => {
      if (!user?.getIdToken) return;
      live ? setRefreshing(true) : setLoading(true);
      setError("");

      try {
        const token = await user.getIdToken();
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
    [user],
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

  if (loading && !snapshot) {
    return (
      <div className="min-h-full bg-background px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full bg-background px-4 py-5 sm:px-6 lg:px-8"
      data-testid="health-dashboard"
    >
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  AltFTool operations
                </p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">
                  Quality and production health
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  Real rendered routes, crawler policy, runtime gates, Firebase,
                  and on-demand production probes in one release workspace.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <Clock3 className="h-4 w-4" />
                {snapshot?.mode === "live" ? "Live" : "Lite"} snapshot ·{" "}
                {formatDate(snapshot?.generatedAt)}
              </span>
              <button
                type="button"
                onClick={() => loadHealth({ live: true })}
                disabled={refreshing}
                className="btn btn-primary h-10 gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh live
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-foreground">
                {formatNumber(snapshot?.overall?.score)}
              </span>
              <div>
                <StatusBadge
                  status={snapshot?.overall?.status}
                  label={snapshot?.overall?.label}
                />
                <p className="mt-1 text-xs text-muted">
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
        </header>

        {error ? (
          <div className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-soft p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => loadHealth({ live: true })}
              className="btn btn-outline h-9 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : null}

        {snapshot ? (
          <>
            <RouteQualitySection routeQuality={snapshot.routeQuality} />
            <ToolReadinessSection tools={snapshot.tools} />
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <ProductionMonitoringSection
                monitoring={snapshot.productionMonitoring}
                onRefresh={() => loadHealth({ live: true })}
                refreshing={refreshing}
              />
              <IndexControlSection routeQuality={snapshot.routeQuality} />
            </div>
            <SystemSignals snapshot={snapshot} />

            <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Wrench className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Recommended actions
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    Next fixes from current evidence
                  </h2>
                </div>
              </div>
              <ol className="mt-4 grid gap-3 lg:grid-cols-2">
                {(snapshot.recommendations || []).map(
                  (recommendation, index) => (
                    <li
                      key={recommendation}
                      className="flex gap-3 rounded-lg border border-border bg-surface-soft p-3 text-sm leading-6 text-muted"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      {recommendation}
                    </li>
                  ),
                )}
              </ol>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
            <p className="mt-3 font-semibold text-foreground">
              No health snapshot is available.
            </p>
            <button
              type="button"
              onClick={() => loadHealth({ live: true })}
              className="btn btn-primary mt-4 h-10 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Load live health
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
