"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import {
  Filter, RefreshCw, ArrowLeft, Search, X, User, Boxes, Shield,
  ChevronLeft, ChevronRight, CalendarDays, Info,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

// ─── Admin list cache (module-level, lives for the tab session) ───────────────
let adminCache = null;
let adminCachePromise = null;

async function getAdmins() {
  if (adminCache) return adminCache;
  if (!adminCachePromise) {
    const user = getAuth().currentUser;
    if (!user) return [];

    adminCachePromise = user.getIdToken(true)
      .then((token) => fetch("/api/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      }))
      .then((r) => r.ok ? r.json() : { admins: [] })
      .then((d) => { adminCache = d.admins || []; return adminCache; })
      .catch(() => { adminCachePromise = null; return []; });
  }
  return adminCachePromise;
}

// ─── Skeleton row ──────────────────────────────────────────────────────────

function SkeletonRows({ cols = 6, rows = 8 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-[var(--border)]">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-[var(--surface-soft)] rounded animate-pulse" style={{ width: `${60 + (j * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  ));
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
      const user = getAuth().currentUser;
      if (!user) {
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        return;
      }
      const token = await user.getIdToken(true);

      const params = new URLSearchParams({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
        pageSize: "30",
      });
      if (cursor) params.set("cursor", String(cursor));

      const res = await fetch(`/api/admin/audit/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        emitAlert({ type: "error", message: "Not authorized to view audit logs" });
        return;
      }

      setLogs(data.logs || []);
      setHasMore(data.hasMore ?? false);
      setMeta(data.meta ?? null);
      nextCursorRef.current = data.nextCursor ?? null;
    } catch {
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

  // Apply date filter
  const applyFilters = () => {
    const s = fromInputDate(stagedStart, false) ?? defaultStart;
    const e = fromInputDate(stagedEnd, true) ?? now;
    if (s > e) {
      emitAlert({ type: "error", message: "Start date must be before end date." });
      return;
    }
    setStartDateMs(s);
    setEndDateMs(e);
    // Reset pagination
    setCursorStack([null]);
    setPageIndex(0);
    fetchPage({ start: s, end: e, cursor: null });
  };

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

  // ── TanStack Table ─────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      accessorKey: "createdAtMs", header: "Time", size: 210,
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">{fmtTime(getValue())}</span>
      ),
    },
    {
      accessorKey: "action", header: "Action", size: 180,
      cell: ({ getValue }) => {
        const a = getValue();
        return (
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0" />
            <span className="text-sm font-semibold text-[var(--foreground)]">{ACTION_LABELS[a] || a}</span>
          </span>
        );
      },
    },
    {
      id: "actor", header: "Actor", size: 240,
      cell: ({ row }) => {
        const actor = adminMap[row.original.actorUid];
        return (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <User className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
              <span>{actor?.fullName || row.original.actorEmail || "—"}</span>
            </div>
            {actor?.email && <div className="text-xs text-[var(--muted)] pl-6">{actor.email}</div>}
          </div>
        );
      },
    },
    {
      id: "target", header: "Target", size: 240,
      cell: ({ row }) => {
        const target = adminMap[row.original.targetUid];
        return (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Shield className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
              <span>{target?.fullName || row.original.targetEmail || "—"}</span>
            </div>
            {target?.email && <div className="text-xs text-[var(--muted)] pl-6">{target.email}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: "module", header: "Module", size: 170,
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-1 rounded-full">
          <Boxes className="w-3.5 h-3.5" />
          {getValue() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "summary", header: "Summary", size: 420,
      cell: ({ getValue }) => <span className="text-sm text-[var(--foreground)]">{getValue() || "—"}</span>,
    },
  ], [adminMap]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isDefaultRange =
    Math.abs(startDateMs - defaultStart) < 60_000 && Math.abs(endDateMs - now) < 60_000;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin-management"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="w-4 h-4" /> Admin Management
            </Link>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Audit Log</h1>
            <p className="text-sm text-[var(--muted)]">
              Track admin-management activity (create, update, status changes, password changes).
            </p>
          </div>
          <button
            onClick={() => fetchPage({ start: startDateMs, end: endDateMs, cursor: cursorStack[pageIndex] ?? null, silent: true })}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Date range banner */}
        <div className="flex items-center gap-2 text-xs text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/20 rounded-xl px-4 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          {isDefaultRange
            ? `Showing audit logs from the last ${DEFAULT_DAYS} days`
            : `Showing logs from ${fmtTime(startDateMs)} to ${fmtTime(endDateMs)}`}
        </div>

        {/* Date filter + search bar */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm px-4 py-3 space-y-3">
          {/* Date pickers row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              <CalendarDays className="w-4 h-4" />
              Date Range
            </div>
            <div className="flex items-center justify-center gap-2">
              <label className="text-xs text-[var(--muted)] whitespace-nowrap">From</label>
              <input
                type="date"
                value={stagedStart}
                onChange={(e) => setStagedStart(e.target.value)}
                className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <label className="text-xs text-[var(--muted)] whitespace-nowrap">To</label>
              <input
                type="date"
                value={stagedEnd}
                onChange={(e) => setStagedEnd(e.target.value)}
                className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setStagedStart(toInputDate(defaultStart));
                setStagedEnd(toInputDate(now));
                setStartDateMs(defaultStart);
                setEndDateMs(now);
                setCursorStack([null]);
                setPageIndex(0);
                fetchPage({ start: defaultStart, end: now, cursor: null });
              }}
              className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-soft)] transition"
            >
              Reset
            </button>
          </div>

          {/* Search + column filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions, admins, modules…"
                autoComplete="off"
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] placeholder:text-[var(--muted)] transition"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              <Filter className="w-4 h-4" />
              Filters
            </div>

            <select
              value={whoFilter}
              onChange={(e) => setWhoFilter(e.target.value)}
              className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] cursor-pointer transition min-w-[180px]"
            >
              <option value="all">All admins</option>
              {adminOptions.map((a) => <option key={a.uid} value={a.uid}>{a.email}</option>)}
            </select>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] cursor-pointer transition min-w-[160px]"
            >
              <option value="all">All modules</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] cursor-pointer transition min-w-[180px]"
            >
              <option value="all">All actions</option>
              {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
            </select>

            <span className="ml-auto text-xs text-[var(--muted)] whitespace-nowrap">
              {filtered.length} of {logs.length} on this page
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-[var(--surface-soft)] border-b border-[var(--border)]">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider select-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <SkeletonRows cols={columns.length} rows={8} />
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-16 text-center text-[var(--muted)] text-sm">
                      No audit logs found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-top">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {!loading && logs.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Page {pageIndex + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={pageIndex === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasMore}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
