"use client";

import { Activity, CircleDollarSign, FileText, SearchCheck } from "lucide-react";
import { EmptyState, PanelCard, StatusChip, formatWhen } from "./shared";

function isToday(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date) return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default function OverviewPanel({ runs, settings, pendingTopics, pendingProposals }) {
  const todayRuns = runs.filter((r) => isToday(r.startedAt));
  const blogToday = todayRuns.filter((r) => r.kind === "blog").reduce((sum, r) => sum + (r.createdCount ?? r.created?.length ?? 0), 0);
  const seoToday = todayRuns.filter((r) => r.kind === "seo").reduce((sum, r) => sum + (r.createdCount ?? r.created?.length ?? 0), 0);
  const costToday = todayRuns.reduce((sum, r) => sum + (Number(r.costEstimate) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Blog drafts today" value={`${blogToday} / ${settings.blog.dailyLimit}`} hint={`${pendingTopics} topic(s) waiting`} />
        <Stat icon={SearchCheck} label="SEO proposals today" value={`${seoToday} / ${settings.seo.dailyPageLimit}`} hint={`${pendingProposals} pending review`} />
        <Stat icon={Activity} label="Runs today" value={todayRuns.length} hint="Hourly cron + manual triggers" />
        <Stat icon={CircleDollarSign} label="Est. cost today" value={`$${costToday.toFixed(2)}`} hint="OpenAI token estimate" />
      </div>

      <PanelCard title="Recent runs" caption="Every lane execution, newest first.">
        {!runs.length ? (
          <EmptyState message="No runs yet. Enable lanes in Settings, add topics, and the hourly cron takes it from there." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4">Lane</th>
                  <th className="pb-2 pr-4">Trigger</th>
                  <th className="pb-2 pr-4">Started</th>
                  <th className="pb-2 pr-4">Created</th>
                  <th className="pb-2 pr-4">Failed</th>
                  <th className="pb-2 pr-4">Cost</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((run) => (
                  <tr key={run.id} className="text-foreground">
                    <td className="py-2.5 pr-4 font-semibold capitalize">{run.kind}</td>
                    <td className="py-2.5 pr-4 text-muted">{run.trigger}{run.startedBy && run.startedBy !== "cron" ? ` · ${run.startedBy}` : ""}</td>
                    <td className="py-2.5 pr-4 text-muted">{formatWhen(run.startedAt)}</td>
                    <td className="py-2.5 pr-4">{run.createdCount ?? run.created?.length ?? 0}</td>
                    <td className="py-2.5 pr-4">
                      {(run.failedCount ?? run.failed?.length ?? 0) > 0 ? (
                        <span className="text-danger" title={(run.failed || []).map((f) => f.error).join("\n")}>
                          {run.failedCount ?? run.failed.length}
                        </span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-muted">${(Number(run.costEstimate) || 0).toFixed(3)}</td>
                    <td className="py-2.5"><StatusChip status={run.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </div>
  );
}
