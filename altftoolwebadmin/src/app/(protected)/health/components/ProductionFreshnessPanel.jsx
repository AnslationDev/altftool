import { CheckCircle2, Globe2, XCircle } from "lucide-react";
import { DetailTile, ScoreBar, StatusBadge } from "./HealthShared";
import { formatStatus, shortSha } from "./healthFormatters";

export default function ProductionFreshnessPanel({ production }) {
  const checks = production?.checks || [];
  const publicHealth = production?.publicHealth;

  return (
    <section id="production-freshness-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="production-freshness-panel">
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
