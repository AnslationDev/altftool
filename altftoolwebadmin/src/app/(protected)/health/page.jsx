"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Database,
  FileSearch,
  Gauge,
  Globe2,
  ListChecks,
  RefreshCw,
  Rocket,
  Route,
  SearchCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminCredentialReadinessPanel from "./components/AdminCredentialReadinessPanel";
import ArtifactFreshnessPanel from "./components/ArtifactFreshnessPanel";
import BlogContentHealthPanel from "./components/BlogContentHealthPanel";
import DeployReadinessPanel from "./components/DeployReadinessPanel";
import FirebaseDataIntegrityPanel from "./components/FirebaseDataIntegrityPanel";
import FirebaseLiveDataPanel from "./components/FirebaseLiveDataPanel";
import FixCenterPanel from "./components/FixCenterPanel";
import HealthLoadingState from "./components/HealthLoadingState";
import PerformanceBudgetPanel from "./components/PerformanceBudgetPanel";
import ProductionFreshnessPanel from "./components/ProductionFreshnessPanel";
import ProductionLinksPanel from "./components/ProductionLinksPanel";
import QaCoverageTable from "./components/QaCoverageTable";
import ReleaseDoctorArtifactPanel from "./components/ReleaseDoctorArtifactPanel";
import ReleaseGateCommandCenter from "./components/ReleaseGateCommandCenter";
import ReleaseHistoryPanel from "./components/ReleaseHistoryPanel";
import ReleaseRunbookPanel from "./components/ReleaseRunbookPanel";
import RouteQaReportPanel from "./components/RouteQaReportPanel";
import RuntimeQualityPanel from "./components/RuntimeQualityPanel";
import ToolIssuesTable from "./components/ToolIssuesTable";
import { CheckList, MetricCard, ScoreRing } from "./components/HealthShared";
import {
  formatDate,
  formatDuration,
  formatGateStatus,
  formatNumber,
  formatStatus,
  getScoreTone,
} from "./components/healthFormatters";

function deployReadinessItems(deploy) {
  return (deploy?.results || []).map((result) => ({
    key: result.name,
    label: result.label,
    detail: result.ok
      ? `${result.projectRoot} is ready`
      : `Missing ${result.missing.map((item) => item.displayName || item.names.join(" or ")).join(", ")}`,
    ok: result.ok,
  }));
}

export default function HealthPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHealth = useCallback(async ({ refresh = false, live = false } = {}) => {
    if (!user?.getIdToken) return;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const token = await user.getIdToken();
      const endpoint = live || refresh ? "/api/health?fresh=1" : "/api/health?lite=1";
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Health snapshot could not be loaded.");
      }

      setSnapshot(payload);
    } catch (err) {
      setError(err.message || "Health snapshot could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const summaryCards = useMemo(() => {
    if (!snapshot) return [];

    return [
      {
        title: "Tool Quality",
        value: `${snapshot.tools.healthy}/${snapshot.tools.total}`,
        helper: `${snapshot.tools.needsAttention} tools need registry, entry, config, or metadata attention.`,
        score: snapshot.tools.averageScore,
        icon: Wrench,
      },
      {
        title: "Priority QA",
        value: `${snapshot.qa.routeCovered}/${snapshot.qa.total}`,
        helper: `${snapshot.qa.functionalCovered} priority tools also have deeper functional flow coverage.`,
        score: snapshot.qa.score,
        icon: ClipboardCheck,
      },
      {
        title: "Route QA Report",
        value: snapshot.routeQa?.checkedAt ? `${snapshot.routeQa.totals.failures} failures` : "Not run",
        helper: snapshot.routeQa?.checkedAt
          ? `${snapshot.routeQa.totals.routes} routes, ${snapshot.routeQa.totals.browserProbes} browser probes, P95 ${formatDuration(snapshot.routeQa.performance.p95Ms)}.`
          : "Run npm run qa:routes:report to save route QA and slow-route timings.",
        score: snapshot.routeQa?.score || 0,
        icon: Route,
      },
      {
        title: "Runtime Quality",
        value: snapshot.runtimeQuality?.ok ? "Ready" : `${snapshot.runtimeQuality?.summary?.block || 0} blocked`,
        helper: "Strict route QA, Firebase live-data, Firebase integrity, and performance gates.",
        score: snapshot.runtimeQuality?.score || 0,
        icon: Gauge,
      },
      {
        title: "SEO Readiness",
        value: `${snapshot.seo.score}%`,
        helper: "Sitemap, robots, metadata helpers, and structured data coverage.",
        score: snapshot.seo.score,
        icon: SearchCheck,
      },
      {
        title: "Content Data",
        value: `${snapshot.content.score}%`,
        helper: "Blogs, BuySmart stores, exclusive deals, and news data availability.",
        score: snapshot.content.score,
        icon: Database,
      },
      {
        title: "Blog Content",
        value: `${snapshot.blogContent?.totals?.ready || 0}/${snapshot.blogContent?.totals?.total || 0}`,
        helper: `${snapshot.blogContent?.totals?.withSources || 0} cited, ${snapshot.blogContent?.totals?.withFaq || 0} FAQ-ready, ${snapshot.blogContent?.totals?.withLinks || 0} internally linked blogs.`,
        score: snapshot.blogContent?.score || 0,
        icon: BookOpenCheck,
      },
      {
        title: "Firebase Admin",
        value: formatStatus(snapshot.firebaseAdmin.status),
        helper: snapshot.firebaseAdmin.firestoreReadable
          ? "Admin SDK credentials are configured and Firestore reads are working."
          : "Admin SDK credentials or Firestore read access need attention.",
        score: snapshot.firebaseAdmin.score,
        icon: ShieldCheck,
      },
      {
        title: "Live Firebase Data",
        value: formatStatus(snapshot.firebaseLiveData.status),
        helper: `${snapshot.firebaseLiveData.passingChecks}/${snapshot.firebaseLiveData.totalChecks} Firestore live-data checks are passing.`,
        score: snapshot.firebaseLiveData.score,
        icon: Database,
      },
      {
        title: "Firebase Integrity",
        value: formatStatus(snapshot.firebaseDataIntegrity.status),
        helper: `${snapshot.firebaseDataIntegrity.passingChecks}/${snapshot.firebaseDataIntegrity.totalChecks} sampled content integrity checks are passing.`,
        score: snapshot.firebaseDataIntegrity.score,
        icon: ShieldCheck,
      },
      {
        title: "Performance Budget",
        value: formatStatus(snapshot.performanceBudget.status),
        helper: `${snapshot.performanceBudget.totals.publicImages} images and ${snapshot.performanceBudget.totals.dynamicToolImports} lazy tool imports checked.`,
        score: snapshot.performanceBudget.score,
        icon: Gauge,
      },
      {
        title: "Production Links",
        value: formatStatus(snapshot.productionLinks?.status),
        helper: `${snapshot.productionLinks?.totals?.pages || 0} pages, ${snapshot.productionLinks?.totals?.linksChecked || 0} links, and ${snapshot.productionLinks?.totals?.imagesChecked || 0} images checked.`,
        score: snapshot.productionLinks?.score || 0,
        icon: Globe2,
      },
      {
        title: "Doctor Artifact",
        value: formatGateStatus(snapshot.releaseDoctorArtifact?.status),
        helper: `${snapshot.releaseDoctorArtifact?.summary?.counts?.pass || 0} pass, ${snapshot.releaseDoctorArtifact?.summary?.counts?.warn || 0} warn, ${snapshot.releaseDoctorArtifact?.summary?.counts?.block || 0} block checks saved.`,
        score: snapshot.releaseDoctorArtifact?.score || 0,
        icon: ListChecks,
      },
      {
        title: "Fix Center",
        value: snapshot.fixCenter?.counts?.total ? `${snapshot.fixCenter.counts.total} open` : "Clear",
        helper: `${snapshot.fixCenter?.counts?.block || 0} blockers, ${snapshot.fixCenter?.counts?.warn || 0} warnings, ${snapshot.fixCenter?.counts?.command || 0} runnable commands.`,
        score: snapshot.fixCenter?.score || 0,
        icon: Wrench,
      },
      {
        title: "Release History",
        value: `${snapshot.releaseHistory?.savedEntryCount || 0} saved`,
        helper: `${(snapshot.releaseHistory?.metrics || []).filter((metric) => metric.delta < 0).length} regressions, ${(snapshot.releaseHistory?.metrics || []).filter((metric) => metric.current?.status === "watch" || metric.current?.status === "blocked").length} watch metrics.`,
        score: snapshot.releaseHistory?.score || 0,
        icon: Clock3,
      },
      {
        title: "Automation",
        value: `${snapshot.automation.score}%`,
        helper: "Smoke tests, route audit, build scripts, and full validation wiring.",
        score: snapshot.automation.score,
        icon: Route,
      },
      {
        title: "Deploy Readiness",
        value: snapshot.deploy.ok ? "Ready" : `${snapshot.deploy.missingSecrets.length} gaps`,
        helper: "Vercel token, org, web project, and admin project deployment secrets.",
        score: snapshot.deploy.score,
        icon: Rocket,
      },
      {
        title: "Production Freshness",
        value: snapshot.production.status,
        helper: snapshot.production.error || "Public /api/health freshness, status, and commit signal.",
        score: snapshot.production.score,
        icon: Globe2,
      },
    ];
  }, [snapshot]);

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-5 sm:px-6 lg:px-8" data-testid="health-dashboard">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 border border-gray-200 bg-white p-5 shadow-sm rounded-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-gray-950 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">System Health</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-950">AltFTool Health</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Registry quality, priority route QA, strict runtime gates, Firebase data health, performance budgets, SEO readiness, deployment readiness, and production freshness in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadHealth({ refresh: true, live: true })}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh live health snapshot"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh live
          </button>
        </div>

        {error && (
          <div className="flex flex-col gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 rounded-md sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => loadHealth({ refresh: true, live: true })}
              disabled={refreshing || loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Retry
            </button>
          </div>
        )}

        {loading && !snapshot ? (
          <HealthLoadingState />
        ) : snapshot ? (
          <>
            <ReleaseGateCommandCenter
              snapshot={snapshot}
              onRefresh={() => loadHealth({ refresh: true, live: true })}
              refreshing={refreshing}
              loading={loading}
            />

            {snapshot.mode === "lite" ? (
              <div className="flex flex-col gap-3 border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 rounded-md lg:flex-row lg:items-center lg:justify-between" data-testid="health-lite-banner">
                <div>
                  <p className="font-bold">Fast lite snapshot</p>
                  <p className="mt-1 leading-6">
                    Live Firebase and production probes are skipped here for speed. Use Refresh live when you want the full release signal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadHealth({ refresh: true, live: true })}
                  disabled={refreshing || loading}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-sky-200 bg-white px-3 text-xs font-bold text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh live
                </button>
              </div>
            ) : null}

            <ArtifactFreshnessPanel snapshot={snapshot} />

            <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <FixCenterPanel fixCenter={snapshot.fixCenter} />
              <ReleaseHistoryPanel releaseHistory={snapshot.releaseHistory} />
            </section>

            <RuntimeQualityPanel runtimeQuality={snapshot.runtimeQuality} />

            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border border-gray-200 bg-white p-5 shadow-sm rounded-md">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className={`inline-flex rounded border px-2.5 py-1 text-xs font-semibold capitalize ${getScoreTone(snapshot.overall.score)}`}>
                      {snapshot.overall.label}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-gray-950">Overall Health</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Generated {formatDate(snapshot.generatedAt)}
                    </p>
                  </div>
                  <ScoreRing score={snapshot.overall.score} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categories</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.tools.categories)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tool Folders</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.tools.directories)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Registry Gaps</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.tools.registryWithoutDir.length + snapshot.tools.orphanToolDirs.length)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority Routes</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.qa.routeCovered)}/{formatNumber(snapshot.qa.total)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Feature Flows</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.qa.functionalCovered)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Firebase Reads</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.firebaseLiveData.passingChecks)}/{formatNumber(snapshot.firebaseLiveData.totalChecks)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Runtime Gates</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.runtimeQuality?.summary?.pass)}/{formatNumber(snapshot.runtimeQuality?.summary?.total)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Integrity Checks</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.firebaseDataIntegrity.passingChecks)}/{formatNumber(snapshot.firebaseDataIntegrity.totalChecks)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Perf Score</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.performanceBudget.score)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prod Links</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.productionLinks?.totals?.linksChecked)}/{formatNumber(snapshot.productionLinks?.totals?.imagesChecked)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Doctor Checks</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">
                      {formatNumber(snapshot.releaseDoctorArtifact?.summary?.counts?.pass)}/{formatNumber((snapshot.releaseDoctorArtifact?.checks || []).length)}
                    </p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fix Actions</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.fixCenter?.counts?.total)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">History Points</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.releaseHistory?.savedEntryCount)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Blog Health</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.blogContent?.score || 0)}</p>
                  </div>
                  <div className="border border-gray-100 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Deploy Gaps</p>
                    <p className="mt-2 text-xl font-bold text-gray-950">{formatNumber(snapshot.deploy.missingSecrets.length)}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 bg-white p-5 shadow-sm rounded-md">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-950">Next Actions</h2>
                </div>

                <div className="mt-4 space-y-3">
                  {snapshot.recommendations.map((recommendation) => (
                    <div key={recommendation} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <AdminCredentialReadinessPanel firebaseAdmin={snapshot.firebaseAdmin} />
              <FirebaseLiveDataPanel firebaseLiveData={snapshot.firebaseLiveData} />
              <FirebaseDataIntegrityPanel firebaseDataIntegrity={snapshot.firebaseDataIntegrity} />
              <PerformanceBudgetPanel performanceBudget={snapshot.performanceBudget} />
              <ProductionLinksPanel productionLinks={snapshot.productionLinks} />
              <ReleaseDoctorArtifactPanel releaseDoctorArtifact={snapshot.releaseDoctorArtifact} />
              <BlogContentHealthPanel blogContent={snapshot.blogContent} />
              <DeployReadinessPanel deploy={snapshot.deploy} />
              <ProductionFreshnessPanel production={snapshot.production} />
              <ReleaseRunbookPanel
                deploy={snapshot.deploy}
                production={snapshot.production}
                firebaseAdmin={snapshot.firebaseAdmin}
                firebaseLiveData={snapshot.firebaseLiveData}
                firebaseDataIntegrity={snapshot.firebaseDataIntegrity}
                performanceBudget={snapshot.performanceBudget}
                productionLinks={snapshot.productionLinks}
                releaseDoctorArtifact={snapshot.releaseDoctorArtifact}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <MetricCard key={card.title} {...card} />
              ))}
            </section>

            <ToolIssuesTable tools={snapshot.tools.topIssues} />
            <RouteQaReportPanel routeQa={snapshot.routeQa} />
            <QaCoverageTable qa={snapshot.qa} />

            <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              <CheckList title="Priority QA" icon={ClipboardCheck} items={snapshot.qa.checks} />
              <CheckList title="Firebase Admin" icon={ShieldCheck} items={snapshot.firebaseAdmin.checks || []} />
              <CheckList title="Firebase Live Data" icon={Database} items={snapshot.firebaseLiveData.checks || []} />
              <CheckList title="Firebase Integrity" icon={ShieldCheck} items={snapshot.firebaseDataIntegrity.checks || []} />
              <CheckList title="Performance Budget" icon={Gauge} items={snapshot.performanceBudget.checks || []} />
              <CheckList title="Production Links" icon={Globe2} items={snapshot.productionLinks?.checks || []} />
              <CheckList title="Release Doctor Artifact" icon={ListChecks} items={snapshot.releaseDoctorArtifact?.qualityChecks || []} />
              <CheckList title="Fix Center" icon={Wrench} items={snapshot.fixCenter?.checks || []} />
              <CheckList title="Release History" icon={Clock3} items={snapshot.releaseHistory?.checks || []} />
              <CheckList title="Blog Content Health" icon={BookOpenCheck} items={snapshot.blogContent?.checks || []} />
              <CheckList title="SEO Checks" icon={FileSearch} items={snapshot.seo.checks} />
              <CheckList title="Validation Checks" icon={Gauge} items={snapshot.automation.checks} />
              <CheckList title="Deploy Readiness" icon={Rocket} items={deployReadinessItems(snapshot.deploy)} />
              <CheckList title="Production Freshness" icon={Globe2} items={snapshot.production.checks || []} />
              <section className="border border-gray-200 bg-white p-4 shadow-sm rounded-md">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
                    <Database className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-950">Content Metrics</h2>
                </div>

                <div className="mt-4 divide-y divide-gray-100">
                  {snapshot.content.metrics.map((metric) => (
                    <div key={metric.key} className="flex items-center justify-between gap-3 py-3">
                      <p className="text-sm font-semibold text-gray-900">{metric.label}</p>
                      <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700">
                        {formatNumber(metric.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
