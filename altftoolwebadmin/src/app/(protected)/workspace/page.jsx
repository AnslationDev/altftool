"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { Activity, BarChart3, ChevronRight, Layers, RefreshCw, User, X } from "lucide-react";
import ExplorerTree from "./components/ExplorerTree";
import ActivityTimeline from "./components/ActivityTimeline";
import ActivityAnalytics from "./components/ActivityAnalytics";
import ActivityFilters from "./components/ActivityFilters";
import EventDetailDrawer from "./components/EventDetailDrawer";
import MigrationBanner from "./components/MigrationBanner";
import { breadcrumb } from "./components/helpers";

const PAGE_SIZE = 40;

export default function WorkspaceExplorerPage() {
  const [selected, setSelected] = useState({ path: "", label: "All Activity" });
  const [view, setView] = useState("timeline"); // "timeline" | "analytics"
  const [scope, setScope] = useState(null); // {type:"actor"|"entity", …} for User/Entity views
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({ search: "", kind: "all" });
  const [drawerEvent, setDrawerEvent] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const authFetch = useCallback(async (url) => {
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return null;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const eventsParams = useCallback((cursor) => {
    const p = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
    if (cursor) p.set("cursor", String(cursor));
    if (scope?.type === "entity") { if (scope.entityType) p.set("entityType", scope.entityType); p.set("entityId", scope.entityId); }
    else if (scope?.type === "actor") p.set("actorUid", scope.actorUid);
    else if (selected.path) p.set("path", selected.path);
    return p;
  }, [scope, selected.path]);

  // First page whenever node / scope / reload changes (timeline view only).
  useEffect(() => {
    if (view !== "timeline") return;
    let alive = true;
    setLoading(true);
    setEvents([]);
    authFetch(`/api/activity/events?${eventsParams()}`).then((data) => {
      if (!alive) return;
      setEvents(data?.events || []);
      setNextCursor(data?.nextCursor || null);
      setHasMore(Boolean(data?.hasMore));
      setLoading(false);
    });
    return () => { alive = false; };
  }, [view, eventsParams, authFetch, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    const data = await authFetch(`/api/activity/events?${eventsParams(nextCursor)}`);
    setEvents((prev) => [...prev, ...(data?.events || [])]);
    setNextCursor(data?.nextCursor || null);
    setHasMore(Boolean(data?.hasMore));
    setLoadingMore(false);
  }, [nextCursor, eventsParams, authFetch]);

  const availableKinds = useMemo(() => new Set(events.map((e) => e.actionKind)), [events]);
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return events.filter((ev) => {
      if (filters.kind !== "all" && ev.actionKind !== filters.kind) return false;
      if (q) {
        const hay = [ev.summary, ev.actorEmail, ev.entityName, ev.action, ...breadcrumb(ev)].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const selectNode = useCallback((path, label) => {
    setScope(null);
    setSelected({ path, label: label || (path ? path.split("/").pop() : "All Activity") });
  }, []);

  const scopeActor = useCallback((actorUid, label) => { setScope({ type: "actor", actorUid, label }); setView("timeline"); }, []);
  const scopeEntity = useCallback((entityType, entityId, label) => { setScope({ type: "entity", entityType, entityId, label }); setView("timeline"); }, []);
  const clearScope = useCallback(() => setScope(null), []);

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[var(--foreground)]">
              <Layers className="h-6 w-6 text-[var(--primary)]" strokeWidth={1.9} />
              Workspace Activity
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Explore every project, application, module, and feature — and the activity within.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <MigrationBanner />

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="h-max rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)] lg:sticky lg:top-4">
            <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Projects</p>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <ExplorerTree selectedPath={scope ? "__scope__" : selected.path} onSelect={selectNode} authFetch={authFetch} />
            </div>
          </aside>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            {/* Header: node breadcrumb OR active scope chip */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                {scope ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft,color-mix(in_srgb,var(--primary)_14%,transparent))] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                      <User className="h-3.5 w-3.5" />
                      {scope.type === "actor" ? "User" : "Entity"}: {scope.label}
                    </span>
                    <button type="button" onClick={clearScope} className="grid h-6 w-6 place-items-center rounded text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Clear scope"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-black tracking-tight text-[var(--foreground)]">{selected.label}</h2>
                    {selected.path ? (
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-[var(--muted)]">
                        {selected.path.split("/").map((seg, i) => (
                          <span key={i} className="flex items-center gap-1">{i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}{seg}</span>
                        ))}
                      </p>
                    ) : <p className="mt-0.5 text-xs text-[var(--muted)]">Everything across the workspace</p>}
                  </>
                )}
              </div>

              {/* View tabs (hidden while a scope is active) */}
              {!scope && (
                <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                  {[{ k: "timeline", label: "Timeline", icon: Activity }, { k: "analytics", label: "Analytics", icon: BarChart3 }].map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => setView(t.k)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition ${
                        view === t.k ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <t.icon className="h-4 w-4" /> {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {view === "analytics" && !scope ? (
              <ActivityAnalytics
                path={selected.path}
                authFetch={authFetch}
                onSelectNode={selectNode}
                onScopeActor={scopeActor}
                onScopeEntity={scopeEntity}
              />
            ) : (
              <>
                <div className="mb-4">
                  <ActivityFilters filters={filters} onChange={setFilters} availableKinds={availableKinds} />
                </div>
                <ActivityTimeline
                  events={filtered}
                  loading={loading}
                  hasMore={hasMore && filters.kind === "all" && !filters.search}
                  onLoadMore={loadMore}
                  loadingMore={loadingMore}
                  onSelectEvent={setDrawerEvent}
                />
              </>
            )}
          </section>
        </div>
      </div>

      <EventDetailDrawer
        event={drawerEvent}
        onClose={() => setDrawerEvent(null)}
        onViewEntity={drawerEvent?.entityId ? () => { scopeEntity(drawerEvent.entityType, drawerEvent.entityId, drawerEvent.entityName || drawerEvent.entityId); setDrawerEvent(null); } : undefined}
      />
    </div>
  );
}
