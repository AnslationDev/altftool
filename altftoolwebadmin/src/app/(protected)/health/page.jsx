"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSearch,
  Gauge,
  Globe2,
  RefreshCw,
  Rocket,
  Route,
  SearchCheck,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function getScoreTone(score = 0) {
  if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

function getScoreColor(score = 0) {
  if (score >= 90) return "#059669";
  if (score >= 75) return "#d97706";
  return "#e11d48";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatDate(value) {
  if (!value) return "Not generated";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatus(value) {
  const label = String(value || "unknown").replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shortSha(value) {
  return value ? String(value).slice(0, 8) : "Not exposed";
}

function getSignalTone(ok) {
  return ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
}

function StatusBadge({ ok, label }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getSignalTone(ok)}`}>
      {label}
    </span>
  );
}

function ScoreRing({ score }) {
  const color = getScoreColor(score);

  return (
    <div
      className="relative grid h-28 w-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${score * 3.6}deg, #e5e7eb 0deg)`,
      }}
      aria-label={`Score ${score}`}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-950">{score}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Score</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  return (
    <div className="mt-4 h-2 w-full overflow-hidden rounded bg-gray-100">
      <div
        className="h-full rounded transition-[width] duration-300"
        style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
      />
    </div>
  );
}

function MetricCard({ title, value, helper, score, icon: Icon }) {
  return (
    <div className="border border-gray-200 bg-white p-4 shadow-sm rounded-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">{helper}</p>
      <div className={`mt-3 inline-flex rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(score)}`}>
        {score}/100
      </div>
      <ScoreBar score={score} />
    </div>
  );
}

function CheckList({ title, icon: Icon, items }) {
  return (
    <section className="border border-gray-200 bg-white p-4 shadow-sm rounded-md">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-gray-950">{title}</h2>
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              {item.detail && <p className="mt-1 break-words text-xs text-gray-500">{item.detail}</p>}
            </div>
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

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

function DetailTile({ label, value, tone = "gray", mono = false }) {
  const tones = {
    gray: "border-gray-100 bg-gray-50 text-gray-950",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
    amber: "border-amber-100 bg-amber-50 text-amber-950",
    rose: "border-rose-100 bg-rose-50 text-rose-950",
  };

  return (
    <div className={`min-w-0 border p-3 rounded-md ${tones[tone] || tones.gray}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function DeployReadinessPanel({ deploy }) {
  const results = deploy?.results || [];
  const missingSecrets = deploy?.missingSecrets || [];
  const uniqueMissingSecrets = Array.from(
    new Map(missingSecrets.map((secret) => [secret.displayName, secret])).values(),
  );

  return (
    <section className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="deploy-readiness-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Deployment</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Vercel Deploy Readiness</h2>
          </div>
        </div>
        <StatusBadge ok={Boolean(deploy?.ok)} label={deploy?.ok ? "Ready" : "Blocked"} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((result) => (
          <div key={result.name} className="border border-gray-100 bg-gray-50 p-3 rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-950">{result.label}</p>
                <p className="mt-1 break-words font-mono text-xs text-gray-500">{result.projectRoot}</p>
              </div>
              {result.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(result.missing.length ? result.missing : result.present).map((item) => (
                <span
                  key={`${result.name}-${item.displayName}`}
                  className={`rounded border px-2 py-1 text-[11px] font-bold ${
                    result.missing.length
                      ? "border-rose-200 bg-white text-rose-700"
                      : "border-emerald-200 bg-white text-emerald-700"
                  }`}
                >
                  {result.missing.length ? item.displayName : item.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {uniqueMissingSecrets.length > 0 ? (
        <div className="mt-4 border border-rose-100 bg-rose-50 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Missing GitHub Actions Secrets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueMissingSecrets.map((secret) => (
              <span
                key={secret.displayName}
                className="max-w-full break-all rounded border border-rose-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-rose-700"
              >
                {secret.displayName}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Web and admin deploy secrets are available to CI.
        </div>
      )}

      <ScoreBar score={deploy?.score || 0} />
    </section>
  );
}

function sumBuySmartItems(firebaseLiveData) {
  return Object.values(firebaseLiveData?.sections?.buySmart || {}).reduce(
    (sum, item) => sum + Number(item?.itemCount || 0),
    0,
  );
}

function sumConsumerRatingActive(firebaseLiveData) {
  return Object.values(firebaseLiveData?.sections?.consumerRating || {}).reduce(
    (sum, item) => sum + Number(item?.activeCount || 0),
    0,
  );
}

function FirebaseLiveDataPanel({ firebaseLiveData }) {
  const checks = firebaseLiveData?.checks || [];
  const failures = firebaseLiveData?.failures || [];
  const status = firebaseLiveData?.status || "unknown";
  const score = firebaseLiveData?.score || 0;
  const sections = firebaseLiveData?.sections || {};

  return (
    <section className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="firebase-live-data-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Firebase</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Live Firestore Data</h2>
          </div>
        </div>
        <StatusBadge ok={Boolean(firebaseLiveData?.ok)} label={formatStatus(status)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailTile label="Project" value={firebaseLiveData?.projectId || "Not configured"} mono />
        <DetailTile
          label="Read Checks"
          value={`${formatNumber(firebaseLiveData?.passingChecks)}/${formatNumber(firebaseLiveData?.totalChecks)}`}
          tone={score >= 90 ? "emerald" : score >= 60 ? "amber" : "rose"}
        />
        <DetailTile label="BuySmart Items" value={formatNumber(sumBuySmartItems(firebaseLiveData))} />
        <DetailTile label="Published Blogs" value={formatNumber(sections.blogs?.firstPageCount)} />
        <DetailTile label="Displayable Extensions" value={formatNumber(sections.extensions?.displayableCount)} />
        <DetailTile label="Displayable Academy" value={formatNumber(sections.academy?.displayableCount)} />
        <DetailTile label="Trending Videos" value={formatNumber(sections.trendingVideos?.displayableCount)} />
        <DetailTile label="Active Ratings" value={formatNumber(sumConsumerRatingActive(firebaseLiveData))} />
      </div>

      {failures.length > 0 ? (
        <div className="mt-4 border border-rose-100 bg-rose-50 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Live Data Issues</p>
          <div className="mt-2 space-y-2">
            {failures.slice(0, 4).map((failure) => (
              <p key={failure} className="break-words text-xs font-semibold text-rose-700">
                {failure}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Firestore live reads are returning public content data.
        </div>
      )}

      <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-md">
        {checks.slice(0, 8).map((check) => (
          <div key={check.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{check.label}</p>
              <p className="mt-1 break-words text-xs text-gray-500">{check.error || check.detail}</p>
            </div>
            {check.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>

      <ScoreBar score={score} />
    </section>
  );
}

function ProductionFreshnessPanel({ production }) {
  const checks = production?.checks || [];
  const publicHealth = production?.publicHealth;

  return (
    <section className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="production-freshness-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Production</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Public Web Freshness</h2>
          </div>
        </div>
        <StatusBadge ok={(production?.score || 0) >= 90} label={formatStatus(production?.status)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailTile label="Health URL" value={production?.healthUrl || "Not configured"} mono />
        <DetailTile
          label="Live Health"
          value={publicHealth?.label || publicHealth?.status || production?.error || "Not reported"}
          tone={(production?.score || 0) >= 60 ? "emerald" : "rose"}
        />
        <DetailTile label="Expected Commit" value={shortSha(production?.expectedCommit)} mono />
        <DetailTile label="Production Commit" value={shortSha(production?.productionCommit)} mono />
      </div>

      <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-md">
        {checks.map((check) => (
          <div key={check.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{check.label}</p>
              <p className="mt-1 break-words text-xs text-gray-500">{check.error || check.detail}</p>
            </div>
            {check.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>

      <ScoreBar score={production?.score || 0} />
    </section>
  );
}

function ToolIssuesTable({ tools }) {
  return (
    <section className="border border-gray-200 bg-white shadow-sm rounded-md">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-950">Tool Quality Queue</h2>
            <p className="mt-1 text-xs text-gray-500">Lowest scoring registry items first</p>
          </div>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No tool quality issues found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tools.map((tool) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-950">{tool.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(tool.score)}`}>
                      {tool.score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {tool.issues.map((issue) => (
                        <span
                          key={issue}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function QaCoverageTable({ qa }) {
  const tools = qa?.tools || [];

  return (
    <section className="border border-gray-200 bg-white shadow-sm rounded-md" data-testid="tool-health-qa-table">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-950">Top 40 Tool QA Coverage</h2>
            <p className="mt-1 text-xs text-gray-500">Public route health plus deeper functional flow coverage</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
            Routes {formatNumber(qa?.routeCovered)}/{formatNumber(qa?.total)}
          </span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700">
            Functional {formatNumber(qa?.functionalCovered)}
          </span>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No priority QA data found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Route QA</th>
                <th className="px-4 py-3">Functional QA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tools.map((tool) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3 font-bold text-gray-950">#{tool.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-950">{tool.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700">
                      {tool.route}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tool.routeCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Route covered" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" aria-label="Route missing" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tool.functionalCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Functional flow covered" />
                    ) : (
                      <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500">
                        Route smoke
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-950">Loading health snapshot...</p>
          <p className="mt-2 text-sm text-gray-500">Checking tools, SEO, content data, and validation coverage.</p>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHealth = useCallback(async ({ refresh = false } = {}) => {
    if (!user?.getIdToken) return;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const token = await user.getIdToken();
      const response = await fetch("/api/health", {
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
                Registry quality, priority route QA, Firebase data health, SEO readiness, deployment readiness, and production freshness in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadHealth({ refresh: true })}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh health snapshot"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 rounded-md">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && !snapshot ? (
          <LoadingState />
        ) : snapshot ? (
          <>
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
              <FirebaseLiveDataPanel firebaseLiveData={snapshot.firebaseLiveData} />
              <DeployReadinessPanel deploy={snapshot.deploy} />
              <ProductionFreshnessPanel production={snapshot.production} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <MetricCard key={card.title} {...card} />
              ))}
            </section>

            <ToolIssuesTable tools={snapshot.tools.topIssues} />
            <QaCoverageTable qa={snapshot.qa} />

            <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              <CheckList title="Priority QA" icon={ClipboardCheck} items={snapshot.qa.checks} />
              <CheckList title="Firebase Admin" icon={ShieldCheck} items={snapshot.firebaseAdmin.checks || []} />
              <CheckList title="Firebase Live Data" icon={Database} items={snapshot.firebaseLiveData.checks || []} />
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
