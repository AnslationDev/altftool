import { CheckCircle2, Database, XCircle } from "lucide-react";
import { DetailTile, ScoreBar, StatusBadge } from "./HealthShared";
import { formatNumber, formatStatus } from "./healthFormatters";

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

export default function FirebaseLiveDataPanel({ firebaseLiveData }) {
  const checks = firebaseLiveData?.checks || [];
  const failures = firebaseLiveData?.failures || [];
  const status = firebaseLiveData?.status || "unknown";
  const score = firebaseLiveData?.score || 0;
  const sections = firebaseLiveData?.sections || {};

  return (
    <section id="firebase-live-data-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="firebase-live-data-panel">
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
