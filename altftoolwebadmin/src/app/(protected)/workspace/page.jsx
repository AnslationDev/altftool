"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, BarChart3, Layers, RefreshCw, User, X } from "lucide-react";
import { Button, IconButton } from "@altftool/ui";
import { DataState, EmptyState, PageHeader, SectionCard } from "@/ansets";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { readApiJson, getErrorMessage } from "@/lib/apiClient";
import { emitAlert } from "@/lib/alertBus";
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
  const [feedError, setFeedError] = useState(null);
  // Bumped every time the feed (node/scope/reload) changes, so an in-flight
  // "load more" for the previous feed can detect it and drop its stale page.
  const feedTokenRef = useRef(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Throwing variant — used by this page so a 401/500/offline is reported as a
  // failure instead of being flattened into an empty timeline.
  const requestJson = useCallback(async (url) => {
    const token = await getAdminIdToken();
    if (!token) {
      throw new Error("Your session isn't ready — please sign in again.");
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    return readApiJson(res, `Couldn't load workspace activity (${res.status}).`);
  }, []);

  // Non-throwing wrapper kept for the child components (ExplorerTree,
  // ActivityAnalytics), which treat a null result as "this request failed".
  const authFetch = useCallback(
    async (url) => {
      try {
        return await requestJson(url);
      } catch {
        return null;
      }
    },
    [requestJson],
  );

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
    feedTokenRef.current += 1; // new feed — invalidate any in-flight "load more"
    let alive = true;
    setLoading(true);
    setEvents([]);
    setFeedError(null);
    requestJson(`/api/activity/events?${eventsParams()}`)
      .then((data) => {
        if (!alive) return;
        setEvents(data?.events || []);
        setNextCursor(data?.nextCursor || null);
        setHasMore(Boolean(data?.hasMore));
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setEvents([]);
        setNextCursor(null);
        setHasMore(false);
        setFeedError(getErrorMessage(err, "Couldn't load workspace activity."));
        setLoading(false);
      });
    return () => { alive = false; };
  }, [view, eventsParams, requestJson, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    const token = feedTokenRef.current;
    setLoadingMore(true);
    try {
      const data = await requestJson(`/api/activity/events?${eventsParams(nextCursor)}`);
      // The node/scope changed while this page was in flight — drop it so events
      // from the previous feed don't get appended to the new one.
      if (token !== feedTokenRef.current) return;
      setEvents((prev) => [...prev, ...(data?.events || [])]);
      setNextCursor(data?.nextCursor || null);
      setHasMore(Boolean(data?.hasMore));
    } catch (err) {
      if (token !== feedTokenRef.current) return;
      // Keep nextCursor/hasMore so the "Load more" control stays available as
      // the retry affordance instead of silently dead-ending the list.
      emitAlert({ type: "error", message: getErrorMessage(err, "Couldn't load more activity.") });
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, eventsParams, requestJson]);

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

  const filtersActive = filters.kind !== "all" || Boolean(filters.search.trim());

  // Panel heading: the active scope chip, or the selected tree node. Rendered as
  // the SectionCard's h2 so the page keeps exactly one h1 (the PageHeader).
  const panelTitle = scope ? (
    <span className="flex items-center gap-2">
      <User className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
      {scope.type === "actor" ? "User" : "Entity"}: {scope.label}
    </span>
  ) : (
    selected.label
  );

  const panelDescription = scope
    ? "Every recorded action for this scope, newest first."
    : selected.path
      ? selected.path.split("/").join(" › ")
      : "Everything across the workspace";

  const panelActions = scope ? (
    <IconButton onClick={clearScope} aria-label="Clear scope">
      <X className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  ) : (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {[
        { k: "timeline", label: "Timeline", icon: Activity },
        { k: "analytics", label: "Analytics", icon: BarChart3 },
      ].map((t) => (
        <button
          key={t.k}
          type="button"
          onClick={() => setView(t.k)}
          aria-pressed={view === t.k}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
            view === t.k
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          icon={Layers}
          title="Workspace Activity"
          description="Explore every project, application, module, and feature — and the activity within."
          actions={
            <Button variant="secondary" onClick={reload}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
          }
        />

        <MigrationBanner />

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <SectionCard title="Projects" flush className="h-max lg:sticky lg:top-4">
            <div className="max-h-[70vh] overflow-y-auto p-3">
              <ExplorerTree
                selectedPath={scope ? "__scope__" : selected.path}
                onSelect={selectNode}
                authFetch={authFetch}
              />
            </div>
          </SectionCard>

          <SectionCard title={panelTitle} description={panelDescription} actions={panelActions}>
            {view === "analytics" && !scope ? (
              <ActivityAnalytics
                path={selected.path}
                authFetch={authFetch}
                reloadKey={reloadKey}
                onRetry={reload}
                onSelectNode={selectNode}
                onScopeActor={scopeActor}
                onScopeEntity={scopeEntity}
              />
            ) : (
              <>
                <ActivityFilters
                  filters={filters}
                  onChange={setFilters}
                  availableKinds={availableKinds}
                  count={
                    events.length
                      ? `${filtered.length} of ${events.length} events`
                      : null
                  }
                  className="mb-4"
                />
                <DataState
                  loading={loading}
                  error={feedError}
                  isEmpty={!filtered.length}
                  onRetry={reload}
                  loadingVariant="table"
                  rows={6}
                  empty={
                    <EmptyState
                      title={filtersActive ? "No matching activity" : "No activity here yet"}
                      description={
                        filtersActive
                          ? "No event in this feed matches the current search and filter."
                          : "Actions in this part of the workspace will appear here as they happen."
                      }
                    />
                  }
                >
                  <ActivityTimeline
                    events={filtered}
                    hasMore={hasMore}
                    onLoadMore={loadMore}
                    loadingMore={loadingMore}
                    onSelectEvent={setDrawerEvent}
                  />
                </DataState>
              </>
            )}
          </SectionCard>
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
