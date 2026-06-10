import { BookOpenCheck } from "lucide-react";
import { DetailTile, ScoreBar, StatusBadge } from "./HealthShared";
import { formatDate, formatNumber, formatStatus, getScoreTone } from "./healthFormatters";

export default function BlogContentHealthPanel({ blogContent }) {
  const totals = blogContent?.totals || {};
  const topIssues = blogContent?.topIssues || [];
  const lowestScoring = blogContent?.lowestScoring || [];
  const score = blogContent?.score || 0;

  return (
    <section id="blog-content-health-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="blog-content-health-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <BookOpenCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Blogs</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Blog Content Health</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Saved {blogContent?.source || "local"} audit from {formatDate(blogContent?.generatedAt)}.
            </p>
          </div>
        </div>
        <StatusBadge ok={Boolean(blogContent?.ok)} label={formatStatus(blogContent?.status)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DetailTile label="Score" value={`${formatNumber(score)}/100`} tone={score >= 86 ? "emerald" : score >= 72 ? "amber" : "rose"} />
        <DetailTile label="Ready" value={`${formatNumber(totals.ready)}/${formatNumber(totals.total)}`} />
        <DetailTile label="With sources" value={formatNumber(totals.withSources)} tone={totals.withSources ? "emerald" : "amber"} />
        <DetailTile label="With FAQ" value={formatNumber(totals.withFaq)} tone={totals.withFaq ? "emerald" : "amber"} />
        <DetailTile label="Internal links" value={formatNumber(totals.withLinks)} tone={totals.withLinks ? "emerald" : "amber"} />
      </div>

      {topIssues.length > 0 ? (
        <div className="mt-4 border border-amber-100 bg-amber-50 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Top content gaps</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topIssues.slice(0, 6).map((issue) => (
              <span
                key={issue.key}
                className="rounded border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-amber-800"
              >
                {issue.label}: {formatNumber(issue.count)}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Saved blog content audit has no open gaps.
        </div>
      )}

      {lowestScoring.length > 0 ? (
        <div className="mt-4 overflow-x-auto border border-gray-100 rounded-md">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Blog</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Missing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {lowestScoring.slice(0, 5).map((item) => (
                <tr key={item.slug || item.title}>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-gray-950">{item.title}</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-500">{item.slug}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(item.score)}`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-gray-600">
                    {(item.missing || []).join(", ") || "Clean"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ScoreBar score={score} />
    </section>
  );
}
