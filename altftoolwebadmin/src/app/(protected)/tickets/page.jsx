"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { useAuth } from "@/context/AuthContext";
import {
  TicketIcon,
  Loader2,
  Search,
  ChevronRight,
  Clock,
  UserCheck,
  X,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    badge: "bg-[var(--info-soft)] text-[var(--info)] ring-1 ring-[var(--border)]",
    stat: "bg-[var(--info-soft)] border-[var(--border)] text-[var(--info)]",
    activeStat: "bg-[var(--info)] text-[var(--primary-foreground)] border-[var(--info)]",
    dot: "bg-[var(--info)]",
    label: "Open",
    icon: Circle,
  },
  in_progress: {
    badge: "bg-[var(--warning-soft)] text-[var(--warning)] ring-1 ring-[var(--border)]",
    stat: "bg-[var(--warning-soft)] border-[var(--border)] text-[var(--warning)]",
    activeStat: "bg-[var(--warning)] text-[var(--primary-foreground)] border-[var(--warning)]",
    dot: "bg-[var(--warning)]",
    label: "In Progress",
    icon: TrendingUp,
  },
  resolved: {
    badge: "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--border)]",
    stat: "bg-[var(--success-soft)] border-[var(--border)] text-[var(--success)]",
    activeStat: "bg-[var(--success)] text-[var(--primary-foreground)] border-[var(--success)]",
    dot: "bg-[var(--success)]",
    label: "Resolved",
    icon: CheckCircle2,
  },
  closed: {
    badge: "bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]",
    stat: "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--muted)]",
    activeStat: "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]",
    dot: "bg-[var(--muted)]",
    label: "Closed",
    icon: AlertCircle,
  },
};

const PRIORITY_CONFIG = {
  low: { badge: "bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]", label: "Low" },
  medium: { badge: "bg-[var(--warning-soft)] text-[var(--warning)] ring-1 ring-[var(--border)]", label: "Medium" },
  high: { badge: "bg-[var(--danger-soft)] text-[var(--danger)] ring-1 ring-[var(--border)]", label: "High" },
};

const TYPE_LABEL = { bug: "🐛 Bug", feature: "✨ Feature", query: "💬 Query" };

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

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ status, count, active, onClick }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col p-4 rounded-2xl border transition-all duration-150 text-left group ${
        active
          ? cfg.activeStat + " shadow-md"
          : cfg.stat + " hover:shadow-sm hover:scale-[1.01]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${active ? "opacity-80" : "opacity-60"}`} />
        {active && <X className="w-3 h-3 opacity-60" />}
      </div>
      <p className={`text-2xl font-black tabular-nums leading-none`}>{count}</p>
      <p className={`text-[11px] font-bold mt-1 ${active ? "opacity-80" : "opacity-60"}`}>
        {cfg.label}
      </p>
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-3xl bg-[var(--surface-soft)] flex items-center justify-center">
        <TicketIcon className="w-7 h-7 text-[var(--muted)]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--muted)]">No tickets found</p>
        <p className="text-xs text-[var(--muted)] mt-1">
          {hasFilters ? "Try adjusting your filters" : "All caught up!"}
        </p>
      </div>
    </div>
  );
}

// ── Ticket row ────────────────────────────────────────────────────────────────

function TicketRow({ ticket, onClick }) {
  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.low;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 hover:bg-[var(--surface-soft)] transition-colors group"
    >
      {/* Mobile layout */}
      <div className="sm:hidden flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate transition-colors">
            {ticket.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityCfg.badge}`}>
              {priorityCfg.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
              {statusCfg.label}
            </span>
            <span className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {fmtDate(ticket.createdAt)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--muted)] shrink-0 mt-1 transition-colors" />
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px_90px_32px] gap-4 items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate transition-colors">
            {ticket.title}
          </p>
          {ticket.assignedTo && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--muted)] mt-0.5">
              <UserCheck className="w-2.5 h-2.5" /> Assigned
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--border)] w-fit">
          {TYPE_LABEL[ticket.type] ?? ticket.type}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${priorityCfg.badge}`}>
          {priorityCfg.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCfg.badge}`}>
            {statusCfg.label}
          </span>
        </div>
        <span className="text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(ticket.createdAt)}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] transition-colors" />
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SupportManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "support_tickets"),
      where("isDeleted", "!=", true),
      orderBy("isDeleted"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const activeFilterCount = [statusFilter, priorityFilter, search].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Page header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">Support Management</h1>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {loading ? "Loading…" : `${tickets.length} total ticket${tickets.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {(["open", "in_progress", "resolved", "closed"]).map((s) => (
              <StatCard
                key={s}
                status={s}
                count={counts[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-5 space-y-4">

        {/* Search + filters bar */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-3 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] placeholder:text-[var(--muted)] transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggles */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition ${
                showFilters || priorityFilter
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--primary-foreground)]/20 text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface-soft)] transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-4 flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] focus:outline-none focus:[box-shadow:var(--focus-ring)] text-[var(--foreground)] min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] focus:outline-none focus:[box-shadow:var(--focus-ring)] text-[var(--foreground)] min-w-[140px]"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        )}

        {/* Results summary */}
        {hasFilters && !loading && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-[var(--muted)]">
              Showing <span className="font-bold text-[var(--foreground)]">{filtered.length}</span> of{" "}
              <span className="font-bold text-[var(--foreground)]">{tickets.length}</span> tickets
            </span>
          </div>
        )}

        {/* Ticket table */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
              <p className="text-sm text-[var(--muted)]">Loading tickets…</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <>
              {/* Table header (desktop only) */}
              <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px_90px_32px] gap-4 px-5 py-3 bg-[var(--surface-soft)] border-b border-[var(--border)] text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                <span>Ticket</span>
                <span>Type</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Date</span>
                <span />
              </div>

              <div className="divide-y divide-[var(--border)]">
                {filtered.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-[var(--surface-soft)] border-t border-[var(--border)]">
                <p className="text-[11px] text-[var(--muted)]">
                  {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                  {hasFilters ? " matching filters" : " total"}
                </p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
