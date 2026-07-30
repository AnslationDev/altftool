"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { Badge, Button, Select } from "@altftool/ui";
import {
  BulkActionsBar,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  StatTile,
  useAdminResource,
  useTableControls,
} from "@/ansets";
import {
  TicketIcon,
  Clock,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Circle,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ── Status + priority vocabulary ──────────────────────────────────────────────
//
// `tone` feeds the Badge primitive, `statTone` feeds StatTile (which has no
// "info" tone — open maps to primary there). Neither hardcodes a colour.

const STATUS_CONFIG = {
  open: { tone: "info", statTone: "primary", label: "Open", icon: Circle },
  in_progress: {
    tone: "warning",
    statTone: "warning",
    label: "In Progress",
    icon: TrendingUp,
  },
  resolved: {
    tone: "success",
    statTone: "success",
    label: "Resolved",
    icon: CheckCircle2,
  },
  closed: { tone: "neutral", statTone: "default", label: "Closed", icon: AlertCircle },
};

const STATUS_ORDER = ["open", "in_progress", "resolved", "closed"];

const PRIORITY_CONFIG = {
  low: { tone: "neutral", label: "Low" },
  medium: { tone: "warning", label: "Medium" },
  high: { tone: "danger", label: "High" },
};

const TYPE_LABEL = { bug: "🐛 Bug", feature: "✨ Feature", query: "💬 Query" };

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Module scope so useTableControls' memo keeps a stable identity across renders.
const SEARCH_FIELDS = ["title"];

// Firestore doc/UID ids are never the literal string "unassigned", so it is
// safe as a sentinel for "no assignedTo" without colliding with a real admin id.
const UNASSIGNED_ASSIGNEE = "unassigned";

const TABLE_FILTERS = {
  status: (row, value) => row.status === value,
  priority: (row, value) => row.priority === value,
  assignedTo: (row, value) =>
    value === UNASSIGNED_ASSIGNEE ? !row.assignedTo : row.assignedTo === value,
};

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Clickable KPI ─────────────────────────────────────────────────────────────
//
// StatTile has no click affordance and must not be forked, so the tile stays the
// anset and the button wraps it. The selected ring lives on the wrapper rather
// than overriding the tile's border, because `cn` concatenates (no tw-merge).

function StatusFilterTile({ status, count, active, unavailable, onClick }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        unavailable
          ? `Filter by ${cfg.label} — count unavailable`
          : `Filter by ${cfg.label} — ${count}`
      }
      className={`rounded-xl text-left transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
        active ? "ring-2 ring-[var(--primary)]" : "hover:shadow-md"
      }`}
    >
      <StatTile
        label={cfg.label}
        value={unavailable ? "—" : count}
        hint={active ? "Active filter" : undefined}
        tone={cfg.statTone}
        icon={cfg.icon}
        className="h-full"
      />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SupportManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkClosing, setBulkClosing] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [assignPick, setAssignPick] = useState("");
  const [reopeningIds, setReopeningIds] = useState(() => new Set());

  const { data: assignableAdmins } = useAdminResource("/api/admin/list", {
    select: (json) =>
      (json.admins ?? []).filter((a) => a.isActive !== false && a.roleType === "superadmin"),
    initial: [],
  });

  const {
    search,
    onSearchChange,
    filterValues,
    setFilter,
    rows: visibleTickets,
    total,
    matched,
  } = useTableControls(tickets, {
    searchFields: SEARCH_FIELDS,
    filters: TABLE_FILTERS,
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError("");
    const q = query(
      collection(db, "support_tickets"),
      where("isDeleted", "!=", true),
      orderBy("isDeleted"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadError("");
        setLoading(false);
      },
      (err) => {
        setTickets([]);
        setLoadError(
          err?.code === "permission-denied"
            ? "Your admin account does not have permission to read support tickets."
            : "The ticket list is temporarily unavailable. Please try again."
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, reloadKey]);

  const statusFilter = filterValues.status ?? "";
  const priorityFilter = filterValues.priority ?? "";
  const assignedToFilter = filterValues.assignedTo ?? "";
  const hasFilters = Boolean(search || statusFilter || priorityFilter || assignedToFilter);

  const assigneeOptions = useMemo(() => {
    const opts = [
      { value: "", label: "All assignees" },
      { value: UNASSIGNED_ASSIGNEE, label: "Unassigned" },
    ];
    for (const a of assignableAdmins) {
      opts.push({ value: a.id, label: a.fullName || a.email || "Admin" });
    }
    return opts;
  }, [assignableAdmins]);

  const reopeningSelected = [...selectedIds].some((id) => reopeningIds.has(id));
  // Close / reopen / assign all PATCH the same tickets — without a shared busy
  // flag, e.g. clicking "Close selected" then immediately "Reopen selected"
  // fires two concurrent PATCHes at the same rows with no defined order.
  const bulkActionBusy = bulkClosing || bulkAssigning || reopeningSelected;

  const counts = useMemo(() => {
    const result = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    for (const t of tickets) {
      if (t.status in result) result[t.status] += 1;
    }
    return result;
  }, [tickets]);

  // While the list is loading or the listener has failed, `tickets` is empty for
  // reasons unrelated to the real counts — never assert a factual zero then.
  const countsUnavailable = loading || Boolean(loadError);

  const clearFilters = () => {
    onSearchChange("");
    setFilter("status", "");
    setFilter("priority", "");
    setFilter("assignedTo", "");
  };

  const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const exportCsv = useCallback((rowsToExport) => {
    const header = ["Title", "Type", "Priority", "Status", "Assigned", "Created"];
    const lines = [header.map(csvCell).join(",")];
    for (const t of rowsToExport) {
      lines.push(
        [
          t.title,
          TYPE_LABEL[t.type] ?? t.type,
          PRIORITY_CONFIG[t.priority]?.label ?? t.priority,
          STATUS_CONFIG[t.status]?.label ?? t.status,
          t.assignedTo ? "Yes" : "No",
          t.createdAt ? new Date(t.createdAt).toISOString() : "",
        ]
          .map(csvCell)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const bulkCloseSelected = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (
      !window.confirm(
        `Close ${ids.length} ticket${ids.length === 1 ? "" : "s"}? This can be reopened later from each ticket.`,
      )
    ) {
      return;
    }
    setBulkClosing(true);
    try {
      const token = await getAdminIdToken(true);
      if (!token) {
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        return;
      }
      const results = await Promise.allSettled(
        ids.map((ticketId) =>
          fetch("/api/support/update-status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ticketId, status: "closed" }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed for ${ticketId}`);
          }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed) {
        emitAlert({
          type: "warning",
          message: `Closed ${ids.length - failed} of ${ids.length} tickets. ${failed} failed — try again for those.`,
        });
      } else {
        emitAlert({ type: "success", message: `Closed ${ids.length} ticket${ids.length === 1 ? "" : "s"}.` });
      }
      setSelectedIds(new Set());
    } finally {
      setBulkClosing(false);
    }
  }, [selectedIds]);

  const bulkAssignSelected = useCallback(
    async (adminId) => {
      const ids = [...selectedIds];
      if (!ids.length) return;
      setBulkAssigning(true);
      try {
        const token = await getAdminIdToken(true);
        if (!token) {
          emitAlert({ type: "error", message: "Session expired. Please log in again." });
          return;
        }
        const results = await Promise.allSettled(
          ids.map((ticketId) =>
            fetch("/api/support/update-status", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ticketId, assignedTo: adminId || null }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed for ${ticketId}`);
            }),
          ),
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        const verb = adminId ? "Assigned" : "Unassigned";
        if (failed) {
          emitAlert({
            type: "warning",
            message: `${verb} ${ids.length - failed} of ${ids.length} tickets. ${failed} failed — try again for those.`,
          });
        } else {
          emitAlert({
            type: "success",
            message: `${verb} ${ids.length} ticket${ids.length === 1 ? "" : "s"}.`,
          });
        }
        setSelectedIds(new Set());
      } finally {
        setBulkAssigning(false);
      }
    },
    [selectedIds],
  );

  // Shared by the per-row "reopen" icon (closed tickets only) and the bulk
  // "Reopen selected" action — both PATCH the same endpoint the ticket detail
  // page uses, so behaviour (closedAt/autoDeleteAt/isDeleted reset) stays identical.
  const reopenTickets = useCallback(async (ids) => {
    if (!ids.length) return;
    setReopeningIds((prev) => new Set([...prev, ...ids]));
    try {
      const token = await getAdminIdToken(true);
      if (!token) {
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        return;
      }
      const results = await Promise.allSettled(
        ids.map((ticketId) =>
          fetch("/api/support/reopen", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ticketId }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed for ${ticketId}`);
          }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed) {
        emitAlert({
          type: "warning",
          message: `Reopened ${ids.length - failed} of ${ids.length} tickets. ${failed} failed — try again for those.`,
        });
      } else {
        emitAlert({
          type: "success",
          message: `Reopened ${ids.length} ticket${ids.length === 1 ? "" : "s"}.`,
        });
      }
      // Only drop the ids this call actually touched — a per-row reopen must
      // not silently clear an unrelated multi-row selection.
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } finally {
      setReopeningIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  }, []);

  // The row-level reopen icon only ever renders for closed tickets (see the
  // comment above renderRowActions), but the bulk "Reopen selected" button
  // was calling reopenTickets() on the raw selection with no such filter and
  // no confirmation — silently forcing any open/in-progress/resolved ticket
  // caught in a mixed-status selection back to "open".
  const bulkReopenSelected = useCallback(() => {
    const closedIds = [...selectedIds].filter(
      (id) => tickets.find((t) => t.id === id)?.status === "closed",
    );
    if (!closedIds.length) {
      emitAlert({ type: "info", message: "None of the selected tickets are closed." });
      return;
    }
    if (
      !window.confirm(
        `Reopen ${closedIds.length} closed ticket${closedIds.length === 1 ? "" : "s"}?${
          closedIds.length < selectedIds.size
            ? ` (${selectedIds.size - closedIds.length} selected ticket${selectedIds.size - closedIds.length === 1 ? " isn't" : "s aren't"} closed and will be skipped.)`
            : ""
        }`,
      )
    ) {
      return;
    }
    reopenTickets(closedIds);
  }, [selectedIds, tickets, reopenTickets]);

  // Only closed tickets get a row action — reopening any other status makes
  // no sense, and the endpoint already forces status back to "open" regardless
  // of what it currently is.
  const renderRowActions = (t) => {
    if (t.status !== "closed") return null;
    const reopening = reopeningIds.has(t.id);
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          reopenTickets([t.id]);
        }}
        disabled={reopening}
        aria-label={`Reopen "${t.title}"`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-30"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${reopening ? "animate-spin motion-reduce:animate-none" : ""}`}
          aria-hidden="true"
        />
      </button>
    );
  };

  const headerDescription = loading
    ? "Loading…"
    : loadError
    ? "Ticket list unavailable"
    : `${total} total ticket${total !== 1 ? "s" : ""}`;

  const countLabel = loading
    ? "Loading…"
    : loadError
    ? "Unavailable"
    : hasFilters
    ? `${matched} of ${total} tickets`
    : `${total} ticket${total !== 1 ? "s" : ""}`;

  const columns = [
    {
      key: "title",
      header: "Ticket",
      render: (t) => {
        const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
        const priorityCfg = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.low;
        return (
          <div className="min-w-0">
            <Link
              href={`/tickets/${t.id}`}
              onClick={(event) => event.stopPropagation()}
              className="block truncate rounded-sm text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {t.title}
            </Link>

            {t.assignedTo ? (
              <span className="mt-0.5 hidden items-center gap-1 text-xs text-[var(--muted)] sm:inline-flex">
                <UserCheck className="h-3 w-3" aria-hidden="true" /> Assigned
              </span>
            ) : null}

            {/* Narrow screens: restate the columns that are hidden below `sm`. */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
              <Badge tone={priorityCfg.tone}>{priorityCfg.label}</Badge>
              <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {fmtDate(t.createdAt)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      hideBelow: "sm",
      width: "8.5rem",
      render: (t) => <Badge tone="primary">{TYPE_LABEL[t.type] ?? t.type}</Badge>,
    },
    {
      key: "priority",
      header: "Priority",
      hideBelow: "sm",
      width: "7rem",
      render: (t) => {
        const cfg = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.low;
        return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
      },
    },
    {
      key: "status",
      header: "Status",
      hideBelow: "sm",
      width: "8rem",
      render: (t) => {
        const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
        return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "Date",
      hideBelow: "sm",
      align: "right",
      width: "7rem",
      render: (t) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {fmtDate(t.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        icon={TicketIcon}
        title="Support Management"
        description={headerDescription}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <StatusFilterTile
              key={s}
              status={s}
              count={counts[s]}
              unavailable={countsUnavailable}
              active={statusFilter === s}
              onClick={() => setFilter("status", statusFilter === s ? "" : s)}
            />
          ))}
        </div>
      </PageHeader>

      <div className="space-y-4">
        <FilterBar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search tickets by title…"
          filters={[
            {
              key: "status",
              label: "Filter by status",
              value: statusFilter,
              onChange: (value) => setFilter("status", value),
              options: STATUS_OPTIONS,
            },
            {
              key: "priority",
              label: "Filter by priority",
              value: priorityFilter,
              onChange: (value) => setFilter("priority", value),
              options: PRIORITY_OPTIONS,
            },
            {
              key: "assignedTo",
              label: "Filter by assignee",
              value: assignedToFilter,
              onChange: (value) => setFilter("assignedTo", value),
              options: assigneeOptions,
            },
          ]}
          count={countLabel}
          actions={
            <>
              {visibleTickets.length ? (
                <Button variant="ghost" size="sm" onClick={() => exportCsv(visibleTickets)}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Export CSV
                </Button>
              ) : null}
              {hasFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              ) : null}
            </>
          }
        />

        <BulkActionsBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} noun="ticket">
          <Button variant="secondary" size="sm" onClick={bulkCloseSelected} disabled={bulkActionBusy}>
            {bulkClosing ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            {bulkClosing ? "Closing…" : "Close selected"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={bulkReopenSelected}
            disabled={bulkActionBusy}
          >
            {reopeningSelected ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {reopeningSelected ? "Reopening…" : "Reopen selected"}
          </Button>
          <div className="w-44 shrink-0">
            <Select
              aria-label="Assign selected tickets to"
              value={assignPick}
              disabled={bulkActionBusy}
              onChange={(event) => {
                const value = event.target.value;
                setAssignPick(value);
                if (!value) return;
                bulkAssignSelected(value === UNASSIGNED_ASSIGNEE ? "" : value).finally(() =>
                  setAssignPick(""),
                );
              }}
            >
              <option value="" disabled>
                {bulkAssigning ? "Assigning…" : "Assign to…"}
              </option>
              <option value={UNASSIGNED_ASSIGNEE}>Unassign</option>
              {assignableAdmins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName || a.email || "Admin"}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportCsv(tickets.filter((t) => selectedIds.has(t.id)))}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export selected
          </Button>
        </BulkActionsBar>

        <DataTable
          columns={columns}
          rows={visibleTickets}
          getRowKey={(t) => t.id}
          selectable
          selectedKeys={selectedIds}
          onSelectionChange={setSelectedIds}
          rowActions={renderRowActions}
          loading={loading}
          error={loadError || null}
          onRetry={() => setReloadKey((k) => k + 1)}
          onRowClick={(t) => router.push(`/tickets/${t.id}`)}
          caption="All support tickets raised across the platform"
          empty={
            <EmptyState
              icon={TicketIcon}
              title="No tickets found"
              description={
                hasFilters ? "Try adjusting your filters." : "All caught up!"
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null
              }
            />
          }
        />
      </div>
    </div>
  );
}
