"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { RefreshCw } from "lucide-react";
import AnalyticsHero from "./components/AnalyticsHero";
import AnalyticsAlerts from "./components/AnalyticsAlerts";
import ProjectHealthGrid from "./components/ProjectHealthGrid";
import ModuleUsageChart from "./components/ModuleUsageChart";
import RecentUpdatesFeed from "./components/RecentUpdatesFeed";
// import RecentDataTable from "./components/RecentDataTable";
import AnalyticsEmptyState from "./components/AnalyticsEmptyState";
import ProjectSelector from "./components/ProjectSelector";
import AnalyticsCharts from "./components/AnalyticsCharts";
import { sortByTimestampDesc } from "@/lib/analytics/analytics.utils";

const CACHE_KEY = "analytics-dashboard-cache-v1";
const SELECTED_PROJECT_KEY = "analytics-dashboard-selected-project-v1";

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

function LoadingCard({ message = "Loading analytics snapshot..." }) {
  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">{message}</p>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Analytics combines project records across modules, so the first fetch can take a little longer.
          </p>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
      </div>
      <div className="mt-6 h-4 w-32 rounded bg-gray-200" />
      <div className="mt-4 h-8 w-64 rounded bg-gray-200" />
      <div className="mt-6 grid gap-4 md:grid-cols-4 xl:grid-cols-5">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="border border-gray-200 bg-gray-50 p-4">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RefreshProgress({ progress }) {
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden bg-blue-100">
      <div
        className="h-full bg-blue-600 transition-[width] duration-300 ease-out"
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
        const token = await getAuth().currentUser?.getIdToken();

        if (!token) {
          throw new Error("Your session is not ready. Please refresh and try again.");
        }

        const response = await fetch("/api/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [dashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshProgress(0);
    try {
      const token = await getAuth().currentUser?.getIdToken();

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
        : "Cross-project admin health at a glance",
      description: activeProject
        ? `A focused view of module freshness, recent additions, and content movement inside ${activeProject.projectName}.`
        : "A dynamic overview of tracked projects and modules, built from the current project directory structure and live admin data sources.",
    };
  }, [dashboard, selectedProjectId]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        {loading ? (
          <>
            <LoadingCard message="Preparing analytics overview..." />
            <LoadingCard message="Collecting module activity and recent updates..." />
          </>
        ) : error && !dashboard ? (
          <div className="border border-rose-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics unavailable</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{error}</p>
          </div>
        ) : !dashboard ? (
          <AnalyticsEmptyState />
        ) : (
          <>
            <ProjectSelector
              projects={dashboard.projects}
              selectedProjectId={selectedProjectId}
              onSelect={setSelectedProjectId}
              actions={(
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh Analytics"}
                </button>
              )}
            />
            {refreshing && (
              <div className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm">
                <p>
                  Refreshing analytics. Existing data stays visible until the new snapshot is ready.
                </p>
                <RefreshProgress progress={refreshProgress} />
              </div>
            )}
            {!refreshing && error ? (
              <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
                {error}
              </div>
            ) : null}
            <AnalyticsHero
              summary={filteredData.summary}
              generatedAt={dashboard.generatedAt}
              title={filteredData.title}
              description={filteredData.description}
            />
            {/* <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"> */}
              <AnalyticsCharts
                projectData={filteredData.projectChartData}
                moduleData={filteredData.moduleChartData}
              />
              
            {/* </div> */}
            <ProjectHealthGrid
                projects={filteredData.projects}
                staleDaysThreshold={dashboard.staleDaysThreshold}
              />
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              
              <AnalyticsAlerts
                alerts={filteredData.alerts}
                staleDaysThreshold={dashboard.staleDaysThreshold}
              />
              <ModuleUsageChart modules={filteredData.moduleUsage} />
            </div>
            <div className="">
              <RecentUpdatesFeed
                items={filteredData.recentUpdates}
                moduleOptions={filteredData.moduleOptions}
              />
              {/* <RecentDataTable
                entries={filteredData.recentEntries}
                moduleOptions={filteredData.moduleOptions}
              /> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
