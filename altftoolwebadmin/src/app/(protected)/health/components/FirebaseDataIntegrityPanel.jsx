import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { DetailTile, StatusBadge } from "./HealthShared";
import { formatDate, formatNumber, formatStatus } from "./healthFormatters";

export default function FirebaseDataIntegrityPanel({ firebaseDataIntegrity }) {
  const checks = firebaseDataIntegrity?.checks || [];
  const failures = firebaseDataIntegrity?.failures || [];
  const warnings = firebaseDataIntegrity?.warnings || [];
  const sections = firebaseDataIntegrity?.sections || {};
  const score = firebaseDataIntegrity?.score || 0;

  return (
    <section id="firebase-data-integrity-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="firebase-data-integrity-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Firebase</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Data Integrity</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Live sampled content validation from {formatDate(firebaseDataIntegrity?.generatedAt)}.
            </p>
          </div>
        </div>
        <StatusBadge ok={Boolean(firebaseDataIntegrity?.ok)} label={formatStatus(firebaseDataIntegrity?.status)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailTile label="Score" value={`${formatNumber(score)}/100`} tone={score >= 90 ? "emerald" : score >= 75 ? "amber" : "rose"} />
        <DetailTile label="Checks" value={`${formatNumber(firebaseDataIntegrity?.passingChecks)}/${formatNumber(firebaseDataIntegrity?.totalChecks)}`} />
        <DetailTile label="Failures" value={formatNumber(failures.length)} tone={failures.length ? "rose" : "emerald"} />
        <DetailTile label="Warnings" value={formatNumber(warnings.length)} tone={warnings.length ? "amber" : "emerald"} />
        <DetailTile label="Blogs sampled" value={formatNumber(sections.blogs?.sampled)} />
        <DetailTile label="Extensions" value={formatNumber(sections.extensions?.displayableCount)} />
        <DetailTile label="Academy" value={formatNumber(sections.academy?.displayableCount)} />
        <DetailTile label="Videos" value={formatNumber(sections.trendingVideos?.displayableCount)} />
      </div>

      {failures.length || warnings.length ? (
        <div className={`mt-4 border p-3 rounded-md ${failures.length ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${failures.length ? "text-rose-700" : "text-amber-700"}`}>
            Integrity Actions
          </p>
          <div className="mt-2 space-y-2">
            {[...failures, ...warnings].slice(0, 5).map((issue) => (
              <p key={`${issue.section}-${issue.message}`} className={`break-words text-xs font-semibold ${failures.length ? "text-rose-700" : "text-amber-800"}`}>
                {issue.message || String(issue)}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Sampled Firebase content is strict-gate clean.
        </div>
      )}

      <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-md">
        {checks.slice(0, 8).map((check) => (
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
