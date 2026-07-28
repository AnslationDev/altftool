"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@altftool/ui";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  ScrollText,
  Shield,
  User,
} from "lucide-react";

import { emitAlert } from "@/lib/alertBus";
import { getAdminIdToken } from "@/lib/adminIdToken";
import {
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  SectionCard,
} from "@/ansets";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(ms) {
  if (!ms) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date(ms));
}

function toInputDate(ms) {
  if (!ms) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function fromInputDate(str, endOfDay = false) {
  if (!str) return null;
  const d = new Date(str);
  if (endOfDay) { d.setHours(23, 59, 59, 999); }
  return d.getTime();
}

const ACTION_LABELS = {
  ADMIN_CREATE: "Admin created",
  ADMIN_UPDATE: "Admin updated",
  ADMIN_STATUS_TOGGLE: "Status changed",
  ADMIN_PASSWORD_CHANGE: "Password changed",
};

const DEFAULT_DAYS = 10;

/** Matches the control styling FilterBar uses, so the date inputs sit in the
 *  same visual family as the search box and the dropdown filters. */
const DATE_CONTROL =
  "h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] transition focus:border-[var(--primary)] focus:outline-none focus-visible:[box-shadow:var(--focus-ring)]";

/** Operator-facing copy for a failed audit-log request (never echo raw internals). */
function describeAuditError(status) {
  if (status === 401) return "Your session has expired. Sign in again to view audit logs.";
  if (status === 403) return "You are not authorized to view audit logs.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status >= 500) return "The audit service is temporarily unavailable. Please try again.";
  return "Couldn't load audit logs. Please try again.";
}

// ─── Admin list cache (module-level, lives for the tab session) ───────────────
let adminCache = null;
let adminCachePromise = null;

async function getAdmins() {
  if (adminCache) return adminCache;
  if (!adminCachePromise) {
    const token = await getAdminIdToken(true);
    if (!token) return [];

    adminCachePromise = Promise.resolve(token)
      .then((token) => fetch("/api/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      }))
      // Never cache a failed response as if it were an empty admin list — throw so
      // the .catch below clears the promise and the next call retries.
      .then((r) => {
        if (!r.ok) throw new Error(`admin-list-${r.status}`);
        return r.json();
      })
      .then((d) => { adminCache = d.admins || []; return adminCache; })
      .catch(() => { adminCachePromise = null; return []; });
  }
  return adminCachePromise;
}

// ─── Main component ────────────────────────────────────────────────────────

export default function AdminAuditLogPage() {
  const now = Date.now();
  const defaultStart = now - DEFAULT_DAYS * 24 * 60 * 60 * 1000;

  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [meta, setMeta] = useState(null);
  // Persistent load failure — handed to DataTable so a failed request renders the
  // error state with a Retry, never an empty table.
  const [loadError, setLoadError] = useState(null);

  // Date range state — controlled inputs
  const [startDateMs, setStartDateMs] = useState(defaultStart);
  const [endDateMs, setEndDateMs] = useState(now);
  // Staged filters (committed only on "Apply")
  const [stagedStart, setStagedStart] = useState(toInputDate(defaultStart));
  const [stagedEnd, setStagedEnd] = useState(toInputDate(now));

  // Pagination: stack of cursors. Index 0 = first page (no cursor).
  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0); // which cursor in stack we're using
  // Next-page cursor from the most recent fetch (ref so handleNext reads the latest value)
  const nextCursorRef = useRef(null);

  // Client-side filters (applied on already-fetched page)
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [whoFilter, setWhoFilter] = useState("all");

  // Fetch admins once (cached)
  useEffect(() => {
    getAdmins().then(setAdmins);
  }, []);

  const adminMap = useMemo(() => {
    const map = {};
    admins.forEach((a) => { map[a.id] = { email: a.email, fullName: a.fullName }; });
    return map;
  }, [admins]);

  const adminOptions = useMemo(() =>
    admins
      .filter((a) => a.id && a.email)
      .map((a) => ({ uid: a.id, email: a.email }))
      .sort((a, b) => a.email.localeCompare(b.email)),
    [admins]
  );

  // ── Fetch a page ──────────────────────────────────────────────────────────
  const fetchPage = useCallback(async ({ start, end, cursor, silent = false }) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // getAdminIdToken() (not getAuth().currentUser) because it also covers the
      // local-admin dev session, which has no Firebase user at all. Reading
      // Firebase directly made this page permanently unusable under that mode —
      // every load hit the branch below and showed "Your session has expired"
      // to an operator who was, in fact, signed in.
      const token = await getAdminIdToken(true);
      if (!token) {
        setLoadError("Your session has expired. Please sign in again.");
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        return;
      }

      const params = new URLSearchParams({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
        pageSize: "30",
      });
      if (cursor) params.set("cursor", String(cursor));

      const res = await fetch(`/api/admin/audit/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = describeAuditError(res.status);
        setLoadError(message);
        emitAlert({ type: "error", message });
        return;
      }

      setLoadError(null);
      setLogs(data?.logs || []);
      setHasMore(data?.hasMore ?? false);
      setMeta(data?.meta ?? null);
      nextCursorRef.current = data?.nextCursor ?? null;
    } catch {
      setLoadError("Network error while loading audit logs. Check your connection and try again.");
      emitAlert({ type: "error", message: "Network error while loading audit logs" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage({ start: startDateMs, end: endDateMs, cursor: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When pageIndex changes, fetch corresponding cursor
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    fetchPage({
      start: startDateMs,
      end: endDateMs,
      cursor: cursorStack[pageIndex] ?? null,
    });
  }, [pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply date filter.
  //
  // setPageIndex(0) below is a no-op (and fires no effect) when the operator
  // is already on page 1 — the "when pageIndex changes" effect further up
  // only runs on an actual change. So a direct fetchPage() here is required
  // for that case, but firing it unconditionally meant that filtering from
  // page 2+ triggered TWO identical requests: this one, plus the one the
  // pageIndex effect fires because 0 !== the previous page index.
  const applyFilters = () => {
    const s = fromInputDate(stagedStart, false) ?? defaultStart;
    const e = fromInputDate(stagedEnd, true) ?? now;
    if (s > e) {
      emitAlert({ type: "error", message: "Start date must be before end date." });
      return;
    }
    const alreadyOnFirstPage = pageIndex === 0;
    setStartDateMs(s);
    setEndDateMs(e);
    // Reset pagination
    setCursorStack([null]);
    setPageIndex(0);
    if (alreadyOnFirstPage) {
      fetchPage({ start: s, end: e, cursor: null });
    }
  };

  const resetFilters = () => {
    const alreadyOnFirstPage = pageIndex === 0;
    setStagedStart(toInputDate(defaultStart));
    setStagedEnd(toInputDate(now));
    setStartDateMs(defaultStart);
    setEndDateMs(now);
    setCursorStack([null]);
    setPageIndex(0);
    if (alreadyOnFirstPage) {
      fetchPage({ start: defaultStart, end: now, cursor: null });
    }
  };

  const reloadCurrentPage = useCallback(
    (silent = false) =>
      fetchPage({
        start: startDateMs,
        end: endDateMs,
        cursor: cursorStack[pageIndex] ?? null,
        silent,
      }),
    [fetchPage, startDateMs, endDateMs, cursorStack, pageIndex],
  );

  const handleNext = () => {
    if (!hasMore || nextCursorRef.current == null) return;
    const newStack = [...cursorStack.slice(0, pageIndex + 1), nextCursorRef.current];
    setCursorStack(newStack);
    setPageIndex(pageIndex + 1);
  };

  const handlePrev = () => {
    if (pageIndex === 0) return;
    setPageIndex(pageIndex - 1);
  };

  // ── Client-side filtering of the fetched page ─────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
      if (actionFilter !== "all" && l.action !== actionFilter) return false;
      if (whoFilter !== "all" && l.actorUid !== whoFilter && l.targetUid !== whoFilter) return false;
      if (q) {
        const hay = [l.summary, l.actorEmail, l.targetEmail, l.action, l.module]
          .map((v) => String(v || "").toLowerCase())
          .join(" ");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, moduleFilter, actionFilter, whoFilter, search]);

  const modules = useMemo(() => [...new Set(logs.map((l) => l.module).filter(Boolean))].sort(), [logs]);
  const actions = useMemo(() => [...new Set(logs.map((l) => l.action).filter(Boolean))].sort(), [logs]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: "createdAtMs", header: "Time", width: 210,
      render: (log) => (
        <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
          {fmtTime(log.createdAtMs)}
        </span>
      ),
    },
    {
      key: "action", header: "Action", width: 180,
      render: (log) => (
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {ACTION_LABELS[log.action] || log.action}
          </span>
        </span>
      ),
    },
    {
      key: "actor", header: "Actor", width: 240,
      render: (log) => {
        const actor = adminMap[log.actorUid];
        return (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <User className="w-4 h-4 text-[var(--muted)] flex-shrink-0" aria-hidden="true" />
              <span>{actor?.fullName || log.actorEmail || "—"}</span>
            </div>
            {actor?.email && <div className="text-xs text-[var(--muted)] pl-6">{actor.email}</div>}
          </div>
        );
      },
    },
    {
      key: "target", header: "Target", width: 240,
      render: (log) => {
        const target = adminMap[log.targetUid];
        return (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Shield className="w-4 h-4 text-[var(--muted)] flex-shrink-0" aria-hidden="true" />
              <span>{target?.fullName || log.targetEmail || "—"}</span>
            </div>
            {target?.email && <div className="text-xs text-[var(--muted)] pl-6">{target.email}</div>}
          </div>
        );
      },
    },
    {
      key: "module", header: "Module", width: 170,
      render: (log) => (
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-1 rounded-full">
          <Boxes className="w-3.5 h-3.5" aria-hidden="true" />
          {log.module || "—"}
        </span>
      ),
    },
    {
      key: "summary", header: "Summary", width: 420,
      render: (log) => <span className="text-sm text-[var(--foreground)]">{log.summary || "—"}</span>,
    },
  ], [adminMap]);

  const isDefaultRange =
    Math.abs(startDateMs - defaultStart) < 60_000 && Math.abs(endDateMs - now) < 60_000;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6 py-7">
        <PageHeader
          breadcrumbs={[
            { label: "Admin Management", href: "/admin-management" },
            { label: "Audit Log" },
          ]}
          icon={ScrollText}
          title="Audit Log"
          description="Track admin-management activity (create, update, status changes, password changes)."
          actions={
            <Button
              variant="secondary"
              onClick={() => reloadCurrentPage(true)}
              disabled={refreshing || loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
          }
        />

        <div className="space-y-5">
          {/* Date range banner */}
          <div className="flex items-center gap-2 text-xs text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/20 rounded-xl px-4 py-2">
            <Info className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {isDefaultRange
              ? `Showing audit logs from the last ${DEFAULT_DAYS} days`
              : `Showing logs from ${fmtTime(startDateMs)} to ${fmtTime(endDateMs)}`}
          </div>

          {/* Date range — server-side filter, committed on Apply */}
          <SectionCard
            title="Date range"
            actions={
              <>
                <Button size="sm" onClick={applyFilters}>
                  Apply
                </Button>
                <Button size="sm" variant="secondary" onClick={resetFilters}>
                  Reset
                </Button>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="audit-start-date"
                  className="text-xs text-[var(--muted)] whitespace-nowrap"
                >
                  From
                </label>
                <input
                  id="audit-start-date"
                  type="date"
                  value={stagedStart}
                  onChange={(e) => setStagedStart(e.target.value)}
                  className={DATE_CONTROL}
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="audit-end-date"
                  className="text-xs text-[var(--muted)] whitespace-nowrap"
                >
                  To
                </label>
                <input
                  id="audit-end-date"
                  type="date"
                  value={stagedEnd}
                  onChange={(e) => setStagedEnd(e.target.value)}
                  className={DATE_CONTROL}
                />
              </div>
            </div>
          </SectionCard>

          {/* Search + column filters — applied to the fetched page */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search actions, admins, modules…"
            filters={[
              {
                key: "who",
                label: "Filter by admin",
                value: whoFilter,
                onChange: setWhoFilter,
                options: [
                  { value: "all", label: "All admins" },
                  ...adminOptions.map((a) => ({ value: a.uid, label: a.email })),
                ],
              },
              {
                key: "module",
                label: "Filter by module",
                value: moduleFilter,
                onChange: setModuleFilter,
                options: [
                  { value: "all", label: "All modules" },
                  ...modules.map((m) => ({ value: m, label: m })),
                ],
              },
              {
                key: "action",
                label: "Filter by action",
                value: actionFilter,
                onChange: setActionFilter,
                options: [
                  { value: "all", label: "All actions" },
                  ...actions.map((a) => ({ value: a, label: ACTION_LABELS[a] || a })),
                ],
              },
            ]}
            count={`${filtered.length} of ${logs.length} on this page`}
          />

          <DataTable
            caption="Admin management audit log"
            columns={columns}
            rows={filtered}
            loading={loading}
            error={loadError}
            onRetry={() => reloadCurrentPage(false)}
            errorTitle="Couldn’t load audit logs"
            empty={
              <SectionCard>
                <EmptyState
                  icon={ScrollText}
                  title="No audit logs found"
                  description="Nothing was recorded for the selected date range, or the filters above exclude everything on this page."
                />
              </SectionCard>
            }
          />

          {/* Pagination footer */}
          {!loading && !loadError && logs.length > 0 && (
            <SectionCard
              flush
              bodyClassName="flex items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--muted)]"
            >
              <span>Page {pageIndex + 1}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handlePrev}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleNext}
                  disabled={!hasMore}
                >
                  Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
