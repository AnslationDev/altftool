"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, BarChart3, Boxes, FileStack, Loader2, Users } from "lucide-react";
import { kindMeta } from "./helpers";

const GrowthChart = dynamic(() => import("./GrowthChart"), {
  ssr: false,
  loading: () => <div className="grid h-[200px] place-items-center text-sm text-[var(--muted)]">Loading chart…</div>,
});

function StatTile({ icon: Icon, label, value, tone = "var(--primary)" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <p className="mt-3 text-2xl font-black tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
    </div>
  );
}

function BarRow({ label, count, max, tone = "var(--primary)", onClick, sub }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`block w-full text-left ${onClick ? "cursor-pointer rounded-lg px-1.5 py-1 transition hover:bg-[var(--surface-soft)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 truncate text-[var(--foreground)]">{label}{sub ? <span className="ml-1 text-xs text-[var(--muted)]">{sub}</span> : null}</span>
        <span className="shrink-0 font-bold tabular-nums text-[var(--foreground)]">{count}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </Comp>
  );
}

function Panel({ title, icon: Icon, children, empty }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
        <Icon className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.9} /> {title}
      </h3>
      {empty ? <p className="py-4 text-center text-xs text-[var(--muted)]">{empty}</p> : children}
    </div>
  );
}

export default function ActivityAnalytics({ path, authFetch, reloadKey, onScopeActor, onScopeEntity, onSelectNode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams({ days: "30" });
    if (path) params.set("path", path);
    authFetch(`/api/activity/analytics?${params}`).then((d) => { if (alive) { setData(d); setLoading(false); } });
    return () => { alive = false; };
    // reloadKey is included so the header "Refresh" button refetches analytics.
  }, [path, authFetch, reloadKey]);

  const actionRows = useMemo(() => {
    if (!data?.byAction) return [];
    return Object.entries(data.byAction).map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);
  }, [data]);

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…</div>;
  }
  if (!data) {
    return <p className="py-16 text-center text-sm text-[var(--muted)]">Analytics unavailable.</p>;
  }

  // Defensive: the API always returns these arrays today, but never assume — a
  // partial/older response shape must not white-screen the whole view.
  const childBreakdown = data.childBreakdown || [];
  const topActors = data.topActors || [];
  const topEntities = data.topEntities || [];
  const maxChild = Math.max(1, ...childBreakdown.map((c) => c.count));
  const maxAction = Math.max(1, ...actionRows.map((a) => a.count));
  const maxActor = Math.max(1, ...topActors.map((a) => a.count));
  const maxEntity = Math.max(1, ...topEntities.map((e) => e.count));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Activity} label="Total activity" value={data.total} />
        <StatTile icon={BarChart3} label={`Last ${data.days} days`} value={data.windowTotal} tone="var(--info)" />
        <StatTile icon={Users} label="Active users" value={data.uniqueActors} tone="var(--success)" />
        <StatTile icon={Boxes} label="Sub-sections" value={childBreakdown.length} tone="var(--warning)" />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="mb-2 text-sm font-black text-[var(--foreground)]">Activity over time</h3>
        <GrowthChart data={data.growth} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most active sections" icon={Boxes} empty={childBreakdown.length ? null : "No sub-sections."}>
          <div className="space-y-2.5">
            {childBreakdown.slice(0, 8).map((c) => (
              <BarRow key={c.hierarchyPath} label={c.label} count={c.count} max={maxChild} onClick={onSelectNode ? () => onSelectNode(c.hierarchyPath, c.label) : undefined} />
            ))}
          </div>
        </Panel>

        <Panel title="By action" icon={BarChart3} empty={actionRows.length ? null : "No activity yet."}>
          <div className="space-y-2.5">
            {actionRows.map((a) => {
              const m = kindMeta(a.kind);
              return <BarRow key={a.kind} label={m.label} count={a.count} max={maxAction} tone={m.tone} />;
            })}
          </div>
        </Panel>

        <Panel title="Most active users" icon={Users} empty={topActors.length ? null : "No user activity in window."}>
          <div className="space-y-2.5">
            {topActors.map((a) => (
              <BarRow key={a.email} label={a.email} count={a.count} max={maxActor} tone="var(--success)" onClick={a.uid && onScopeActor ? () => onScopeActor(a.uid, a.email) : undefined} />
            ))}
          </div>
        </Panel>

        <Panel title="Most modified entities" icon={FileStack} empty={topEntities.length ? null : "No entity activity in window."}>
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
        </Panel>
      </div>
    </div>
  );
}
