import { CheckCircle2, Gauge, XCircle } from "lucide-react";
import { DetailTile, ScoreBar, StatusBadge } from "./HealthShared";
import { formatDate, formatNumber, formatStatus } from "./healthFormatters";

export default function PerformanceBudgetPanel({ performanceBudget }) {
  const checks = performanceBudget?.checks || [];
  const failures = performanceBudget?.failures || [];
  const warnings = performanceBudget?.warnings || [];
  const totals = performanceBudget?.totals || {};
  const apps = performanceBudget?.apps || [];
  const score = performanceBudget?.score || 0;

  return (
    <section id="performance-budget-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="performance-budget-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Performance</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Budget Report</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Saved strict report from {formatDate(performanceBudget?.generatedAt)}.
            </p>
          </div>
        </div>
        <StatusBadge ok={Boolean(performanceBudget?.ok)} label={formatStatus(performanceBudget?.status)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailTile label="Score" value={`${formatNumber(score)}/100`} tone={score >= 90 ? "emerald" : score >= 75 ? "amber" : "rose"} />
        <DetailTile label="Public images" value={formatNumber(totals.publicImages)} />
        <DetailTile label="Lazy tools" value={formatNumber(totals.dynamicToolImports)} tone="emerald" />
        <DetailTile label="Eager imports" value={formatNumber(totals.directToolImportFiles)} tone={totals.directToolImportFiles ? "rose" : "emerald"} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {apps.map((app) => (
          <div key={app.app} className="border border-gray-100 bg-gray-50 p-3 rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-950">{app.app}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatNumber(app.chunks?.fileCount)} JS chunks, {formatNumber(app.css?.fileCount)} CSS chunks
                </p>
              </div>
              {app.buildPresent ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <DetailTile label="Total JS gzip" value={app.chunks?.totalGzip || "n/a"} />
              <DetailTile label="Largest JS gzip" value={app.chunks?.largest?.gzip || "n/a"} />
            </div>
          </div>
        ))}
      </div>

      {failures.length || warnings.length ? (
        <div className={`mt-4 border p-3 rounded-md ${failures.length ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${failures.length ? "text-rose-700" : "text-amber-700"}`}>
            Budget Actions
          </p>
          <div className="mt-2 space-y-2">
            {[...failures, ...warnings].slice(0, 5).map((issue) => (
              <p key={`${issue.area}-${issue.message}`} className={`break-words text-xs font-semibold ${failures.length ? "text-rose-700" : "text-amber-800"}`}>
                {issue.message || String(issue)}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Bundle, media, and tool lazy-load budgets are clean.
        </div>
      )}

      <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-md">
        {checks.map((check) => (
          <div key={check.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{check.label}</p>
              <p className="mt-1 break-words text-xs text-gray-500">{check.detail}</p>
            </div>
            {check.ok ? (
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
