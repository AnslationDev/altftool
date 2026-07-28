"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ActivitySquare,
  AlertTriangle,
  BarChart3,
  Clock3,
  Database,
  Layers3,
  RefreshCw,
} from "lucide-react";
import {
  Bone,
  DataState,
  EmptyState,
  ErrorState,
  FilterBar,
  PageHeader,
  SectionCard,
  StatGrid,
} from "@/ansets";
import AnalyticsAlerts from "./components/AnalyticsAlerts";
import ProjectHealthGrid from "./components/ProjectHealthGrid";
import ModuleUsageChart from "./components/ModuleUsageChart";
import RecentUpdatesFeed from "./components/RecentUpdatesFeed";
import {
  formatDateTime,
  formatNumber,
  sortByTimestampDesc,
} from "@/lib/analytics/analytics.utils";
import { getAdminIdToken } from "@/lib/adminIdToken";

const CACHE_KEY = "analytics-dashboard-cache-v1";
const SELECTED_PROJECT_KEY = "analytics-dashboard-selected-project-v1";

const DEFAULT_TITLE = "Cross-project admin health at a glance";
const DEFAULT_DESCRIPTION =
  "A dynamic overview of tracked projects and modules, built from the current project directory structure and live admin data sources.";

const AnalyticsChartsPanel = dynamic(() => import("./components/AnalyticsCharts"), {
  ssr: false,
  loading: () => <AnalyticsChartsFallback />,
});

function readSessionStorage(key) {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readCachedDashboard() {
  const cached = readSessionStorage(CACHE_KEY);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function readCachedProjectSelection() {
  return readSessionStorage(SELECTED_PROJECT_KEY) || "all";
}

/**
 * The chart panel is code-split, so it needs a placeholder shaped like the panel
 * it replaces. Bone (the anset shimmer) keeps it consistent with every other
 * skeleton in the console instead of re-deriving pulse markup here.
 */
function AnalyticsChartsFallback() {
  return (
    <SectionCard
      icon={BarChart3}
      title="Analytics view"
      description="Compare activity by project or by module with switchable metrics."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]" aria-hidden="true">
        <Bone className="h-[320px]" />
        <Bone className="h-[320px]" />
      </div>
    </SectionCard>
  );
}

function RefreshProgress({ progress }) {
  return (
    <div
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--primary-soft)]"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[var(--primary)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(() => readCachedDashboard());
  const [loading, setLoading] = useState(() => !readCachedDashboard());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [error, setError] = useState("");
  // Bumped by the error card's Retry button so the load effect re-runs. Without
  // it a failed first load was terminal — the effect only fires on `dashboard`
  // changing, which never happens once loading has failed.
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(() => readCachedProjectSelection());

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SELECTED_PROJECT_KEY, selectedProjectId);
    } catch {
      // Ignore storage errors.
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (!refreshing) {
      setRefreshProgress(0);
      return;
    }

    setRefreshProgress(8);

    const intervalId = window.setInterval(() => {
      setRefreshProgress((current) => {
        if (current >= 90) return current;

        if (current < 35) return current + 9;
        if (current < 65) return current + 6;
        if (current < 80) return current + 3;
        return current + 1;
      });
    }, 220);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshing]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const token = await getAdminIdToken();

        if (!token) {
          throw new Error("Your session is not ready. Please refresh and try again.");
        }

        // Guard against a hung request: never let the page spin forever. If the
        // server takes too long, abort and surface a retryable error instead.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60_000);
        let response;
        try {
          response = await fetch("/api/analytics", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });
        } catch (fetchErr) {
          if (fetchErr?.name === "AbortError") {
            throw new Error("Analytics took too long to load. Please try Refresh.");
          }
          throw fetchErr;
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error("Analytics could not be loaded.");
        }

        const data = await response.json();
        if (!cancelled) {
          setDashboard(data);
          try {
            window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch {
            // Ignore storage errors.
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Analytics could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    if (!dashboard) {
      loadDashboard();
    }

    return () => {
      cancelled = true;
    };
  }, [dashboard, reloadKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshProgress(0);
    try {
      const token = await getAdminIdToken();

      if (!token) {
        throw new Error("Your session is not ready. Please refresh and try again.");
      }

      const response = await fetch("/api/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Analytics could not be refreshed.");
      }

      const data = await response.json();
      setRefreshProgress(100);
      setDashboard(data);
      setError("");
      try {
        window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage errors.
      }
    } catch (err) {
      setError(err.message || "Analytics could not be refreshed.");
    } finally {
      window.setTimeout(() => {
        setRefreshing(false);
      }, 180);
    }
  };

  const retryInitialLoad = () => {
    setError("");
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const filteredData = useMemo(() => {
    if (!dashboard) return null;

    const projects = selectedProjectId === "all"
      ? dashboard.projects
      : dashboard.projects.filter((project) => project.projectId === selectedProjectId);

    const modules = projects.flatMap((project) =>
      project.modules.map((module) => ({
        ...module,
        projectId: project.projectId,
        projectName: project.projectName,
      })),
    );

    const summary = {
      totalProjects: projects.length,
      totalModules: modules.length,
      totalRecords: modules.reduce((sum, module) => sum + module.totalRecords, 0),
      recentAdditions7d: modules.reduce((sum, module) => sum + module.recentCreatedCount, 0),
      staleModules: modules.filter(
        (module) =>
          !module.lastActivityAtMs ||
          Date.now() - module.lastActivityAtMs >= dashboard.staleDaysThreshold * 86400000,
      ).length,
      activeModules24h: modules.filter(
        (module) => (module.lastActivityAtMs ?? 0) >= Date.now() - 86400000,
      ).length,
    };

    const alerts = modules
      .filter(
        (module) =>
          !module.lastActivityAtMs ||
          Date.now() - module.lastActivityAtMs >= dashboard.staleDaysThreshold * 86400000,
      )
      .map((module) => {
        const ageInDays = module.lastActivityAtMs
          ? Math.floor((Date.now() - module.lastActivityAtMs) / 86400000)
          : null;

        return {
          id: `${module.projectId}-${module.moduleKey}`,
          severity: "danger",
          title: `${module.projectName} / ${module.moduleLabel} needs attention`,
          message: ageInDays == null
            ? `${module.moduleLabel} does not have a recent update signal yet.`
            : `${module.moduleLabel} has not been updated in ${ageInDays} day${ageInDays === 1 ? "" : "s"}.`,
        };
      });

    const recentEntries = sortByTimestampDesc(
      modules.flatMap((module) => module.recentCreated || []),
    ).slice(0, 10);

    const recentUpdates = sortByTimestampDesc(
      modules.flatMap((module) =>
        (module.recentUpdated || []).map((item) => ({
          ...item,
          actionLabel: "Updated content",
        })),
      ),
    ).slice(0, 12);

    const usageMap = new Map();
    modules.forEach((module) => {
      const current = usageMap.get(module.moduleKey) ?? {
        moduleKey: module.moduleKey,
        moduleLabel: module.moduleLabel,
        projects: [],
        recordCount: 0,
        recentCreatedCount: 0,
        recentUpdatedCount: 0,
        latestActivityAtMs: null,
        activityScore: 0,
      };

      current.projects = [...new Set([...current.projects, module.projectName])];
      current.recordCount += module.totalRecords;
      current.recentCreatedCount += module.recentCreatedCount;
      current.recentUpdatedCount += module.recentUpdated?.length ?? 0;
      current.latestActivityAtMs = Math.max(
        current.latestActivityAtMs ?? 0,
        module.lastActivityAtMs ?? 0,
      ) || null;
      current.activityScore =
        current.recentCreatedCount * 3 +
        current.recentUpdatedCount * 2 +
        Math.min(current.recordCount, 25);

      usageMap.set(module.moduleKey, current);
    });

    const moduleUsage = [...usageMap.values()]
      .sort((a, b) => {
        if (b.activityScore !== a.activityScore) {
          return b.activityScore - a.activityScore;
        }

        return (b.latestActivityAtMs ?? 0) - (a.latestActivityAtMs ?? 0);
      })
      .slice(0, 8);

    const activeProject = selectedProjectId === "all"
      ? null
      : projects.find((project) => project.projectId === selectedProjectId) ?? null;

    const moduleOptions = [...new Map(
      modules.map((module) => [
        module.moduleKey,
        { value: module.moduleKey, label: module.moduleLabel },
      ]),
    ).values()].sort((a, b) => a.label.localeCompare(b.label));

    const projectChartData = projects.map((project) => ({
      label: project.projectName,
      totalRecords: project.totalRecords,
      staleModules: project.staleModules,
      recentAdditions7d: project.modules.reduce(
        (sum, module) => sum + (module.recentCreatedCount ?? 0),
        0,
      ),
      recentUpdates7d: project.modules.reduce(
        (sum, module) => sum + (module.recentUpdatedCount ?? module.recentUpdated?.length ?? 0),
        0,
      ),
      dailyCreatedSeries: project.dailyCreatedSeries ?? [],
      dailyUpdatedSeries: project.dailyUpdatedSeries ?? [],
    }));

    const moduleChartData = modules.map((module) => ({
      label: module.moduleLabel,
      totalRecords: module.totalRecords,
      staleModules:
        !module.lastActivityAtMs ||
        Date.now() - module.lastActivityAtMs >= dashboard.staleDaysThreshold * 86400000
          ? 1
          : 0,
      recentAdditions7d: module.recentCreatedCount ?? 0,
      recentUpdates7d: module.recentUpdatedCount ?? module.recentUpdated?.length ?? 0,
      dailyCreatedSeries: module.dailyCreatedSeries ?? [],
      dailyUpdatedSeries: module.dailyUpdatedSeries ?? [],
    }));

    return {
      projects,
      summary,
      alerts,
      recentEntries,
      recentUpdates,
      moduleUsage,
      moduleOptions,
      projectChartData,
      moduleChartData,
      title: activeProject
        ? `${activeProject.projectName} analytics`
        : DEFAULT_TITLE,
      description: activeProject
        ? `A focused view of module freshness, recent additions, and content movement inside ${activeProject.projectName}.`
        : DEFAULT_DESCRIPTION,
    };
  }, [dashboard, selectedProjectId]);

  const projectScopeOptions = useMemo(() => {
    const projects = dashboard?.projects ?? [];
    return [
      { value: "all", label: "All Projects" },
      ...projects.map((project) => ({
        value: project.projectId,
        label: project.projectName,
      })),
    ];
  }, [dashboard]);

  const staleDaysThreshold = dashboard?.staleDaysThreshold ?? 5;
  const summary = filteredData?.summary;

  const summaryTiles = summary
    ? [
        {
          key: "totalRecords",
          label: "Tracked records",
          icon: Database,
          value: formatNumber(summary.totalRecords),
          hint: "Total analyzable records across modules",
        },
        {
          key: "recentAdditions7d",
          label: "Added in 7 days",
          icon: Clock3,
          value: formatNumber(summary.recentAdditions7d),
          hint: "Fresh records added this week",
        },
        {
          key: "totalModules",
          label: "Modules in view",
          icon: Layers3,
          value: formatNumber(summary.totalModules),
          hint: "Tracked modules inside the selected scope",
        },
        {
          key: "staleModules",
          label: "Needs attention",
          icon: AlertTriangle,
          value: formatNumber(summary.staleModules),
          // Tone, not a hardcoded colour: the tile turns danger only when there
          // is actually something stale to act on.
          tone: summary.staleModules > 0 ? "danger" : "default",
          hint: `Modules with no update in the last ${staleDaysThreshold} days`,
        },
        {
          key: "activeModules24h",
          label: "Active in 24h",
          icon: ActivitySquare,
          value: formatNumber(summary.activeModules24h),
          hint: "Modules with activity in the last 24 hours",
        },
      ]
    : [];

  const refreshAction = dashboard ? (
    <>
      <span className="text-xs text-[var(--muted)]">
        Last refreshed {formatDateTime(dashboard.generatedAt)}
      </span>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={refreshing}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
          aria-hidden="true"
        />
        {refreshing ? "Refreshing..." : "Refresh Analytics"}
      </button>
    </>
  ) : null;

  return (
    <div className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
      {/* PageHeader owns its own bottom margin, so the page body is a plain
          block here rather than a gap-6 flex column that would double it. */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          eyebrow="Global analytics"
          icon={BarChart3}
          title={filteredData?.title ?? DEFAULT_TITLE}
          description={filteredData?.description ?? DEFAULT_DESCRIPTION}
          actions={refreshAction}
        >
          {dashboard ? (
            <FilterBar
              filters={[
                {
                  id: "project-scope",
                  key: "project-scope",
                  label: "Project scope",
                  value: selectedProjectId,
                  onChange: setSelectedProjectId,
                  options: projectScopeOptions,
                },
              ]}
              count={
                filteredData
                  ? `${filteredData.projects.length} of ${dashboard.projects.length} projects in scope`
                  : null
              }
              actions={
                // The quick-switch pills are the wide-screen shortcut the select
                // covers everywhere else; both existed before this migration.
                <div className="hidden flex-wrap gap-2 xl:flex">
                  {projectScopeOptions.map((option) => {
                    const active = option.value === selectedProjectId;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedProjectId(option.value)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
                          active
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)]"
                            : "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--primary-soft)]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              }
            />
          ) : null}
        </PageHeader>

        <DataState
          loading={loading && !dashboard}
          // `error` beats `isEmpty`: a failed fetch must never read as "you have
          // no analytics yet", which is exactly how this screen used to fail.
          error={dashboard ? null : error}
          onRetry={retryInitialLoad}
          isEmpty={!dashboard}
          loadingVariant="detail"
          empty={
            <EmptyState
              icon={BarChart3}
              title="Analytics data is not ready yet"
              description="The analytics route is connected, but there are no analyzable records or audit events available yet. Once modules start writing timestamps and activity, this dashboard will populate automatically."
            />
          }
        >
          {dashboard && filteredData ? (
            <div className="flex flex-col gap-6">
              {refreshing ? (
                <div
                  role="status"
                  className="rounded-xl border border-[var(--info)]/40 bg-[var(--info-soft)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm"
                >
                  <p>
                    Refreshing analytics. Existing data stays visible until the new snapshot is ready.
                  </p>
                  <RefreshProgress progress={refreshProgress} />
                </div>
              ) : null}

              {!refreshing && error ? (
                <ErrorState
                  title="Analytics refresh failed"
                  message={error}
                  onRetry={handleRefresh}
                />
              ) : null}

              <StatGrid items={summaryTiles} columns={4} className="xl:grid-cols-5" />

              <AnalyticsChartsPanel
                projectData={filteredData.projectChartData}
                moduleData={filteredData.moduleChartData}
              />

              <ProjectHealthGrid
                projects={filteredData.projects}
                staleDaysThreshold={staleDaysThreshold}
              />

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <AnalyticsAlerts
                  alerts={filteredData.alerts}
                  staleDaysThreshold={staleDaysThreshold}
                />
                <ModuleUsageChart modules={filteredData.moduleUsage} />
              </div>

              <RecentUpdatesFeed
                items={filteredData.recentUpdates}
                moduleOptions={filteredData.moduleOptions}
              />
            </div>
          ) : null}
        </DataState>
      </div>
    </div>
  );
}
