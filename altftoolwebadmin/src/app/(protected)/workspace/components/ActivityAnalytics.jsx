"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, BarChart3, Boxes, FileStack, Users } from "lucide-react";
import { DataState, EmptyState, SectionCard, StatGrid } from "@/ansets";
import { kindMeta } from "./helpers";

const GrowthChart = dynamic(() => import("./GrowthChart"), {
  ssr: false,
  loading: () => <div className="grid h-[200px] place-items-center text-sm text-[var(--muted)]">Loading chart…</div>,
});

function BarRow({ label, count, max, tone = "var(--primary)", onClick, sub }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`block w-full text-left ${
        onClick
          ? "cursor-pointer rounded-lg px-1.5 py-1 transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 truncate text-[var(--foreground)]">{label}{sub ? <span className="ml-1 text-xs text-[var(--muted)]">{sub}</span> : null}</span>
        <span className="shrink-0 font-semibold tabular-nums text-[var(--foreground)]">{count}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </Comp>
  );
}

/** Card heading with its icon, in the shape SectionCard's `title` accepts. */
function PanelTitle({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.9} aria-hidden="true" />
      {children}
    </span>
  );
}

export default function ActivityAnalytics({ path, authFetch, reloadKey, onRetry, onScopeActor, onScopeEntity, onSelectNode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ days: "30" });
    if (path) params.set("path", path);
    authFetch(`/api/activity/analytics?${params}`).then((d) => {
      if (!alive) return;
      // authFetch resolves to null only when the request threw. That is a
      // failure, and it used to render as the flat line "Analytics unavailable."
      // with no way to retry — indistinguishable from "there is nothing here".
      if (d === null) setError("Couldn't load analytics for this part of the workspace.");
      else setData(d);
      setLoading(false);
    });
    return () => { alive = false; };
    // reloadKey is included so the header "Refresh" button refetches analytics.
  }, [path, authFetch, reloadKey]);

  const actionRows = useMemo(() => {
    if (!data?.byAction) return [];
    return Object.entries(data.byAction).map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);
  }, [data]);

  // Defensive: the API always returns these arrays today, but never assume — a
  // partial/older response shape must not white-screen the whole view.
  const childBreakdown = data?.childBreakdown || [];
  const topActors = data?.topActors || [];
  const topEntities = data?.topEntities || [];
  const maxChild = Math.max(1, ...childBreakdown.map((c) => c.count));
  const maxAction = Math.max(1, ...actionRows.map((a) => a.count));
  const maxActor = Math.max(1, ...topActors.map((a) => a.count));
  const maxEntity = Math.max(1, ...topEntities.map((e) => e.count));

  return (
    <DataState
      loading={loading}
      error={error}
      isEmpty={!data}
      onRetry={onRetry}
      loadingVariant="stats"
      empty={
        <EmptyState
          icon={BarChart3}
          title="No analytics for this selection"
          description="Once activity is recorded here, totals and breakdowns will appear."
        />
      }
    >
      {data ? (
        <div className="space-y-5">
          <StatGrid
            columns={4}
            items={[
              { label: "Total activity", value: data.total, icon: Activity },
              { label: `Last ${data.days} days`, value: data.windowTotal, icon: BarChart3, tone: "primary" },
              { label: "Active users", value: data.uniqueActors, icon: Users, tone: "success" },
              { label: "Sub-sections", value: childBreakdown.length, icon: Boxes, tone: "warning" },
            ]}
          />

          <SectionCard headingLevel="h3" title="Activity over time">
            <GrowthChart data={data.growth} />
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard headingLevel="h3" title={<PanelTitle icon={Boxes}>Most active sections</PanelTitle>} flush={!childBreakdown.length}>
              {childBreakdown.length ? (
                <div className="space-y-2.5">
                  {childBreakdown.slice(0, 8).map((c) => (
                    <BarRow key={c.hierarchyPath} label={c.label} count={c.count} max={maxChild} onClick={onSelectNode ? () => onSelectNode(c.hierarchyPath, c.label) : undefined} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Boxes} title="No sub-sections" />
              )}
            </SectionCard>

            <SectionCard headingLevel="h3" title={<PanelTitle icon={BarChart3}>By action</PanelTitle>} flush={!actionRows.length}>
              {actionRows.length ? (
                <div className="space-y-2.5">
                  {actionRows.map((a) => {
                    const m = kindMeta(a.kind);
                    return <BarRow key={a.kind} label={m.label} count={a.count} max={maxAction} tone={m.tone} />;
                  })}
                </div>
              ) : (
                <EmptyState icon={BarChart3} title="No activity yet" />
              )}
            </SectionCard>

            <SectionCard headingLevel="h3" title={<PanelTitle icon={Users}>Most active users</PanelTitle>} flush={!topActors.length}>
              {topActors.length ? (
                <div className="space-y-2.5">
                  {topActors.map((a) => (
                    <BarRow key={a.email} label={a.email} count={a.count} max={maxActor} tone="var(--success)" onClick={a.uid && onScopeActor ? () => onScopeActor(a.uid, a.email) : undefined} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} title="No user activity in window" />
              )}
            </SectionCard>

            <SectionCard headingLevel="h3" title={<PanelTitle icon={FileStack}>Most modified entities</PanelTitle>} flush={!topEntities.length}>
              {topEntities.length ? (
                <div className="space-y-2.5">
                  {topEntities.map((e) => (
                    <BarRow
                      key={`${e.entityType}:${e.entityId}`}
                      label={e.name || e.entityId}
                      sub={e.entityType ? `· ${e.entityType}` : ""}
                      count={e.count} max={maxEntity} tone="var(--info)"
                      onClick={onScopeEntity ? () => onScopeEntity(e.entityType, e.entityId, e.name || e.entityId) : undefined}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileStack} title="No entity activity in window" />
              )}
            </SectionCard>
          </div>
        </div>
      ) : null}
    </DataState>
  );
}
