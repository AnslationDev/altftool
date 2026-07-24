import { Route } from "lucide-react";
import { DetailTile, StatusBadge } from "./HealthShared";
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatQualityLabel,
  getQualityTone,
  getScoreTone,
} from "./healthFormatters";

function buildRouteGroupFallback(routeGroups = {}, routeQa = {}) {
  const hasFailures = Number(routeQa?.totals?.failures || 0) > 0;
  const hasWarnings = Number(routeQa?.totals?.warnings || 0) > 0;

  return Object.entries(routeGroups).map(([key, routes]) => {
    const [app, ...groupParts] = key.split(":");
    return {
      app,
      group: groupParts.join(":") || "routes",
      routes,
      score: hasFailures ? 82 : hasWarnings ? 92 : 100,
      failures: 0,
      warnings: 0,
      slowRoutes: 0,
      averageMs: 0,
      p95Ms: 0,
      maxMs: 0,
      statusCounts: {
        pass: routes,
        slow: 0,
        warn: 0,
        fail: 0,
      },
    };
  });
}

function buildRouteMatrixFallback({ failures = [], warnings = [], slowest = [], thresholdMs = 2500 }) {
  const rows = new Map();
  const addRow = (row) => {
    const key = `${row.app}-${row.group}-${row.route}-${row.quality}`;
    if (!rows.has(key)) rows.set(key, row);
  };

  for (const failure of failures) {
    addRow({
      ...failure,
      probe: failure.group?.includes("browser") ? "browser" : "http",
      quality: "fail",
      durationMs: failure.durationMs || 0,
      warnings: failure.warnings || [],
    });
  }

  for (const warning of warnings) {
    addRow({
      app: warning.app,
      group: warning.group,
      route: warning.route,
      probe: warning.group?.includes("browser") ? "browser" : "http",
      status: "warning",
      quality: "warn",
      durationMs: 0,
      ok: true,
      issues: [],
      warnings: [warning.warning],
    });
  }

  for (const route of slowest) {
    addRow({
      ...route,
      probe: route.group?.includes("browser") ? "browser" : "http",
      quality: route.durationMs >= thresholdMs ? "slow" : "pass",
      issues: route.issues || [],
      warnings: route.warnings || [],
    });
  }

  return [...rows.values()];
}

export default function RouteQaReportPanel({ routeQa }) {
  const coldPass = routeQa?.passes?.cold || null;
  const warmPass = routeQa?.passes?.warm || null;
  const activePass = warmPass || coldPass || null;
  const totals = activePass?.totals || routeQa?.totals || {};
  const performance = activePass?.performance || routeQa?.performance || {};
  const failures = routeQa?.failures || [];
  const warnings = routeQa?.warnings || [];
  const slowest = performance.slowest || [];
  const hasReport = Boolean(routeQa?.checkedAt);
  const isHealthy = Boolean(routeQa?.ok && hasReport);
  const hasWarmProfile = Boolean(warmPass);
  const coldPerformance = coldPass?.performance || {};
  const warmPerformance = warmPass?.performance || {};
  const groupMatrix =
    routeQa?.groupMatrix ||
    activePass?.groupMatrix ||
    buildRouteGroupFallback(routeQa?.routeGroups || activePass?.routeGroups, routeQa);
  const routeMatrix =
    routeQa?.matrix ||
    activePass?.matrix ||
    buildRouteMatrixFallback({
      failures,
      warnings,
      slowest,
      thresholdMs: performance.thresholdMs,
    });
  const matrixWatchlist = routeMatrix
    .filter((row) => row.quality !== "pass")
    .slice(0, 8);
  const matrixPreview = matrixWatchlist.length
    ? matrixWatchlist
    : routeMatrix
        .slice()
        .sort((a, b) => Number(b.durationMs || 0) - Number(a.durationMs || 0))
        .slice(0, 8);

  return (
    <section id="route-qa-report-panel" className="border border-[var(--border)] bg-[var(--surface)] shadow-sm rounded-md" data-testid="route-qa-report-panel">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Route QA report</p>
            <h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
              {hasReport ? `${formatNumber(totals.routes)} routes checked` : "No saved route QA report yet"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Last run {formatDate(routeQa?.checkedAt)}.{" "}
              {hasWarmProfile ? "Warm runtime is the active score; cold compile cost is tracked separately." : ""}
              Save a fresh snapshot with{" "}
              <code className="rounded border border-[var(--border)] bg-[var(--surface-soft)] px-1.5 py-0.5 font-mono text-xs text-[var(--foreground)]">
                npm run qa:routes:report
              </code>
              .
            </p>
          </div>
        </div>
        <StatusBadge ok={isHealthy} label={isHealthy ? "Clean" : hasReport ? "Needs review" : "Not run"} />
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-6">
        <DetailTile
          label={hasWarmProfile ? "Warm Score" : "Score"}
          value={`${formatNumber(routeQa?.score)}/100`}
          tone={isHealthy ? "emerald" : "amber"}
        />
        <DetailTile label="Browser Probes" value={formatNumber(totals.browserProbes)} />
        <DetailTile label="Failures" value={formatNumber(totals.failures)} tone={totals.failures ? "rose" : "emerald"} />
        <DetailTile label="Warnings" value={formatNumber(totals.warnings)} tone={totals.warnings ? "amber" : "emerald"} />
        <DetailTile label="P95" value={formatDuration(performance.p95Ms)} tone={performance.p95Ms > performance.thresholdMs ? "amber" : "gray"} />
        <DetailTile label="Slow Routes" value={formatNumber(totals.slowRoutes)} tone={totals.slowRoutes ? "amber" : "emerald"} />
      </div>

      {hasWarmProfile ? (
        <div className="grid gap-3 px-4 pb-4 lg:grid-cols-3">
          <div className="border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-3 rounded-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--warning)]">Cold compile profile</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <DetailTile label="P95" value={formatDuration(coldPerformance.p95Ms)} tone="amber" />
              <DetailTile label="Max" value={formatDuration(coldPerformance.maxMs)} tone="amber" />
              <DetailTile label="Slow" value={formatNumber(coldPass?.totals?.slowRoutes)} tone="amber" />
            </div>
          </div>
          <div className="border border-[var(--success)]/20 bg-[var(--success-soft)] p-3 rounded-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">Warm runtime profile</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <DetailTile label="P95" value={formatDuration(warmPerformance.p95Ms)} tone={warmPerformance.p95Ms > warmPerformance.thresholdMs ? "amber" : "emerald"} />
              <DetailTile label="Max" value={formatDuration(warmPerformance.maxMs)} tone={warmPerformance.maxMs > warmPerformance.thresholdMs ? "amber" : "emerald"} />
              <DetailTile label="Slow" value={formatNumber(warmPass?.totals?.slowRoutes)} tone={warmPass?.totals?.slowRoutes ? "amber" : "emerald"} />
            </div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-3 rounded-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Runtime delta</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <DetailTile
                label="P95 saved"
                value={formatDuration(Math.max(0, Number(coldPerformance.p95Ms || 0) - Number(warmPerformance.p95Ms || 0)))}
              />
              <DetailTile
                label="Max saved"
                value={formatDuration(Math.max(0, Number(coldPerformance.maxMs || 0) - Number(warmPerformance.maxMs || 0)))}
              />
              <DetailTile
                label="Slow cut"
                value={formatNumber(Math.max(0, Number(coldPass?.totals?.slowRoutes || 0) - Number(warmPass?.totals?.slowRoutes || 0)))}
              />
            </div>
          </div>
        </div>
      ) : null}

      {groupMatrix.length > 0 ? (
        <div className="border-t border-[var(--border)]">
          <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Route QA Matrix</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Group-level pass, warning, failure, and warm runtime coverage for release review.
              </p>
            </div>
            <span className="rounded border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]">
              {formatNumber(routeMatrix.length)} probes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Surface</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Routes</th>
                  <th className="px-4 py-3">Signals</th>
                  <th className="px-4 py-3">P95</th>
                  <th className="px-4 py-3">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {groupMatrix.slice(0, 8).map((group) => {
                  const groupHealthy = Number(group.failures || 0) === 0 && Number(group.warnings || 0) === 0;
                  return (
                    <tr key={`${group.app}-${group.group}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[var(--foreground)]">{group.app}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{group.group}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded border px-2 py-1 text-xs font-bold ${getScoreTone(group.score)}`}>
                          {formatNumber(group.score)}/100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">{formatNumber(group.routes)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`rounded border px-2 py-1 text-xs font-semibold ${groupHealthy ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]" : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]"}`}>
                            Pass {formatNumber(group.statusCounts?.pass)}
                          </span>
                          {group.failures ? (
                            <span className="rounded border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-2 py-1 text-xs font-semibold text-[var(--danger)]">
                              Fail {formatNumber(group.failures)}
                            </span>
                          ) : null}
                          {group.warnings ? (
                            <span className="rounded border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-2 py-1 text-xs font-semibold text-[var(--warning)]">
                              Warn {formatNumber(group.warnings)}
                            </span>
                          ) : null}
                          {group.slowRoutes ? (
                            <span className="rounded border border-[var(--info)]/30 bg-[var(--info-soft)] px-2 py-1 text-xs font-semibold text-[var(--info)]">
                              Slow {formatNumber(group.slowRoutes)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--foreground)]">{formatDuration(group.p95Ms)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--foreground)]">{formatDuration(group.maxMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {matrixPreview.length > 0 ? (
        <div className="border-t border-[var(--border)]">
          <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {matrixWatchlist.length ? "Route Watchlist" : "Slowest Route Preview"}
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {matrixWatchlist.length
                  ? "Routes with failures, warnings, or slow runtime first."
                  : "No route issues found; showing the highest runtime probes."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Probe</th>
                  <th className="px-4 py-3">Quality</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {matrixPreview.map((row) => (
                  <tr key={`${row.app}-${row.group}-${row.probe}-${row.route}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--foreground)]">{row.app}</p>
                      <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]">{row.route}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{row.probe}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{row.group}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-1 text-xs font-bold ${getQualityTone(row.quality)}`}>
                        {formatQualityLabel(row.quality)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--foreground)]">{formatDuration(row.durationMs)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[var(--muted)]">
                      {[...(row.issues || []), ...(row.warnings || [])].slice(0, 2).join("; ") || "Clean"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {failures.length > 0 || warnings.length > 0 ? (
        <div className="grid gap-3 px-4 pb-4 lg:grid-cols-2">
          <div className="border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3 rounded-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">Failures</p>
            <div className="mt-2 space-y-2">
              {failures.slice(0, 5).map((failure) => (
                <p key={`${failure.app}-${failure.route}`} className="break-words text-xs font-semibold text-[var(--danger)]">
                  {failure.app} {failure.route}: {(failure.issues || []).join("; ")}
                </p>
              ))}
              {failures.length === 0 ? <p className="text-xs font-semibold text-[var(--success)]">No failures.</p> : null}
            </div>
          </div>

          <div className="border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-3 rounded-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--warning)]">Warnings</p>
            <div className="mt-2 space-y-2">
              {warnings.slice(0, 5).map((warning) => (
                <p key={`${warning.app}-${warning.route}-${warning.warning}`} className="break-words text-xs font-semibold text-[var(--warning)]">
                  {warning.app} {warning.route}: {warning.warning}
                </p>
              ))}
              {warnings.length === 0 ? <p className="text-xs font-semibold text-[var(--success)]">No warnings.</p> : null}
            </div>
          </div>
        </div>
      ) : hasReport ? (
        <div className="px-4 pb-4">
          <div className="border border-[var(--success)]/20 bg-[var(--success-soft)] p-3 text-sm font-semibold text-[var(--success)] rounded-md">
            Latest route QA report is clean.
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--border)]">
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Slow Route Profiler</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {hasWarmProfile ? "Warm runtime view." : "Single pass view."} Threshold {formatDuration(performance.thresholdMs)}. Average {formatDuration(performance.averageMs)}.
            </p>
          </div>
          <span className="rounded border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]">
            Max {formatDuration(performance.maxMs)}
          </span>
        </div>

        {slowest.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-[var(--muted)]">Run the route QA report to collect slow route timings.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {slowest.slice(0, 10).map((route) => (
                  <tr key={`${route.app}-${route.route}-${route.group}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--foreground)]">{route.app}</p>
                      <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]">{route.route}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{route.group}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-1 text-xs font-semibold ${route.ok ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]" : "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-1 font-mono text-xs font-bold ${route.durationMs >= performance.thresholdMs ? "border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--warning)]" : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]"}`}>
                        {formatDuration(route.durationMs)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
