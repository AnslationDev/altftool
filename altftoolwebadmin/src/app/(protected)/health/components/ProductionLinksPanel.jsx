import { CheckCircle2, Globe2, XCircle } from "lucide-react";
import { DetailTile } from "./HealthShared";
import { formatDate, formatNumber, formatStatus, getGateTone } from "./healthFormatters";

export default function ProductionLinksPanel({ productionLinks }) {
  const checks = productionLinks?.checks || [];
  const totals = productionLinks?.totals || {};
  const pages = productionLinks?.pages || [];
  const failures = productionLinks?.failures || [];
  const warnings = productionLinks?.warnings || [];
  const notices = productionLinks?.notices || [];
  const score = productionLinks?.score || 0;

  return (
    <section id="production-links-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="production-links-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Production</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Links and Images</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Saved strict surface probe from {formatDate(productionLinks?.generatedAt)}.
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getGateTone(productionLinks?.ok ? "pass" : productionLinks?.failures?.length ? "block" : "warn")}`}>
          {formatStatus(productionLinks?.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailTile label="Score" value={`${formatNumber(score)}/100`} tone={score >= 90 ? "emerald" : score >= 75 ? "amber" : "rose"} />
        <DetailTile label="Pages" value={formatNumber(totals.pages || pages.length)} />
        <DetailTile label="Links" value={formatNumber(totals.linksChecked)} />
        <DetailTile label="Images" value={formatNumber(totals.imagesChecked)} />
        <DetailTile label="Failures" value={formatNumber(failures.length)} tone={failures.length ? "rose" : "emerald"} />
        <DetailTile label="Warnings" value={formatNumber(warnings.length)} tone={warnings.length ? "amber" : "emerald"} />
        <DetailTile label="Notices" value={formatNumber(notices.length || totals.notices)} tone={notices.length || totals.notices ? "amber" : "emerald"} />
        <DetailTile label="Base URL" value={productionLinks?.baseUrl || "Not generated"} mono />
      </div>

      {failures.length || warnings.length ? (
        <div className={`mt-4 border p-3 rounded-md ${failures.length ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${failures.length ? "text-rose-700" : "text-amber-700"}`}>
            Surface Actions
          </p>
          <div className="mt-2 space-y-2">
            {[...failures, ...warnings].slice(0, 5).map((issue, index) => (
              <p key={`${issue.pageUrl || "page"}-${issue.targetUrl || issue.message}-${index}`} className={`break-words text-xs font-semibold ${failures.length ? "text-rose-700" : "text-amber-800"}`}>
                {issue.pageUrl ? `${issue.pageUrl}: ` : ""}{issue.message || String(issue)}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Production pages, internal links, and images are clean in the saved strict report.
        </div>
      )}

      {pages.length > 0 ? (
        <div className="mt-4 overflow-x-auto border border-gray-100 rounded-md">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Links</th>
                <th className="px-3 py-2">Images</th>
                <th className="px-3 py-2">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {pages.slice(0, 6).map((page) => {
                const issueCount = (page.failures?.length || 0) + (page.warnings?.length || 0);

                return (
                  <tr key={page.pageUrl}>
                    <td className="max-w-[280px] px-3 py-2">
                      <p className="break-all font-mono text-xs font-semibold text-gray-700">{page.pageUrl}</p>
                      {page.title ? <p className="mt-1 truncate text-xs text-gray-500">{page.title}</p> : null}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded border px-2 py-1 text-xs font-semibold ${page.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(page.counts?.checkedLinks)}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(page.counts?.checkedImages)}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(issueCount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

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
