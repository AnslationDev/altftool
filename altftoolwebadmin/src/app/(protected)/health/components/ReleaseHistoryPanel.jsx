import { Clock3 } from "lucide-react";
import { DetailTile, SparkBars } from "./HealthShared";
import {
  formatDate,
  formatDelta,
  formatGateStatus,
  formatNumber,
  getGateTone,
  getTrendTone,
} from "./healthFormatters";

export default function ReleaseHistoryPanel({ releaseHistory }) {
  const metrics = releaseHistory?.metrics || [];
  const timeline = releaseHistory?.timeline || [];
  const regressions = metrics.filter((metric) => metric.delta < 0);
  const watchMetrics = metrics.filter((metric) => metric.current?.status === "watch" || metric.current?.status === "blocked");

  return (
    <section id="release-history-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="release-history-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Release history</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Score Trends</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Current snapshot compared with saved release-history points from {formatDate(releaseHistory?.generatedAt)}.
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getGateTone(releaseHistory?.status === "blocked" ? "block" : releaseHistory?.status === "watch" ? "warn" : "pass")}`}>
          {formatGateStatus(releaseHistory?.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailTile label="Trend score" value={`${formatNumber(releaseHistory?.score)}/100`} tone={(releaseHistory?.score || 0) >= 90 ? "emerald" : "amber"} />
        <DetailTile label="Saved points" value={formatNumber(releaseHistory?.savedEntryCount)} />
        <DetailTile label="Regressions" value={formatNumber(regressions.length)} tone={regressions.length ? "rose" : "emerald"} />
        <DetailTile label="Watch metrics" value={formatNumber(watchMetrics.length)} tone={watchMetrics.length ? "amber" : "emerald"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.key} className="border border-gray-100 bg-gray-50 p-3 rounded-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-950">{metric.label}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Previous {metric.previous ? `${formatNumber(metric.previous.score)}/100` : "baseline"}
                </p>
              </div>
              <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${getTrendTone(metric.delta)}`}>
                {formatDelta(metric.delta)}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-950">{formatNumber(metric.current?.score)}</p>
            <SparkBars points={metric.points} />
          </div>
        ))}
      </div>

      {timeline.length > 0 ? (
        <div className="mt-4 overflow-x-auto border border-gray-100 rounded-md">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Point</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Release Doctor</th>
                <th className="px-3 py-2">Production Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {timeline.slice(-5).reverse().map((entry) => {
                const doctor = (entry.metrics || []).find((metric) => metric.key === "release-doctor");
                const links = (entry.metrics || []).find((metric) => metric.key === "production-links");

                return (
                  <tr key={entry.id || entry.generatedAt}>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-700">{formatDate(entry.generatedAt)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded border px-2 py-1 text-xs font-semibold ${getGateTone(entry.status === "blocked" ? "block" : entry.status === "watch" ? "warn" : "pass")}`}>
                        {formatGateStatus(entry.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(entry.score)}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(doctor?.score)}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(links?.score)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
