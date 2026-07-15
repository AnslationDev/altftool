"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { ChevronRight, Layers, RefreshCw } from "lucide-react";
import ExplorerTree from "./components/ExplorerTree";
import ActivityTimeline from "./components/ActivityTimeline";
import ActivityFilters from "./components/ActivityFilters";
import EventDetailDrawer from "./components/EventDetailDrawer";
import { breadcrumb } from "./components/helpers";

const PAGE_SIZE = 40;

export default function WorkspaceExplorerPage() {
  const [selected, setSelected] = useState({ path: "", label: "All Activity" });
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

  // Load the first page whenever the selected node (or manual reload) changes.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setEvents([]);
    const params = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
    if (selected.path) params.set("path", selected.path);
    authFetch(`/api/activity/events?${params}`).then((data) => {
      if (!alive) return;
      setEvents(data?.events || []);
      setNextCursor(data?.nextCursor || null);
      setHasMore(Boolean(data?.hasMore));
      setLoading(false);
    });
    return () => { alive = false; };
  }, [selected.path, authFetch, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    const params = new URLSearchParams({ pageSize: String(PAGE_SIZE), cursor: String(nextCursor) });
    if (selected.path) params.set("path", selected.path);
    const data = await authFetch(`/api/activity/events?${params}`);
    setEvents((prev) => [...prev, ...(data?.events || [])]);
    setNextCursor(data?.nextCursor || null);
    setHasMore(Boolean(data?.hasMore));
    setLoadingMore(false);
  }, [nextCursor, selected.path, authFetch]);

  const availableKinds = useMemo(() => new Set(events.map((e) => e.actionKind)), [events]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return events.filter((ev) => {
      if (filters.kind !== "all" && ev.actionKind !== filters.kind) return false;
      if (q) {
        const hay = [ev.summary, ev.actorEmail, ev.entityName, ev.action, ...breadcrumb(ev)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const onSelectNode = useCallback((path, label) => {
    setSelected({ path, label: label || (path ? path.split("/").pop() : "All Activity") });
  }, []);

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

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* Explorer tree */}
          <aside className="h-max rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)] lg:sticky lg:top-4">
            <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Projects</p>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <ExplorerTree selectedPath={selected.path} onSelect={onSelectNode} authFetch={authFetch} />
            </div>
          </aside>

          {/* Detail pane */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <div className="mb-3">
              <h2 className="text-lg font-black tracking-tight text-[var(--foreground)]">{selected.label}</h2>
              {selected.path ? (
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-[var(--muted)]">
                  {selected.path.split("/").map((seg, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}{seg}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-[var(--muted)]">Everything across the workspace</p>
              )}
            </div>

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
          </section>
        </div>
      </div>

      <EventDetailDrawer event={drawerEvent} onClose={() => setDrawerEvent(null)} />
    </div>
  );
}
