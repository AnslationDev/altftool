"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  TicketIcon,
  Loader2,
  Search,
  ChevronRight,
  MessageCircle,
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
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    stat: "bg-sky-50 border-sky-200 text-sky-700",
    activeStat: "bg-sky-600 text-white border-sky-600",
    dot: "bg-sky-400",
    label: "Open",
    icon: Circle,
  },
  in_progress: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    stat: "bg-amber-50 border-amber-200 text-amber-700",
    activeStat: "bg-amber-500 text-white border-amber-500",
    dot: "bg-amber-400",
    label: "In Progress",
    icon: TrendingUp,
  },
  resolved: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    stat: "bg-emerald-50 border-emerald-200 text-emerald-700",
    activeStat: "bg-emerald-600 text-white border-emerald-600",
    dot: "bg-emerald-400",
    label: "Resolved",
    icon: CheckCircle2,
  },
  closed: {
    badge: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    stat: "bg-gray-50 border-gray-200 text-gray-500",
    activeStat: "bg-gray-700 text-white border-gray-700",
    dot: "bg-gray-400",
    label: "Closed",
    icon: AlertCircle,
  },
};

const PRIORITY_CONFIG = {
  low: { badge: "bg-gray-50 text-gray-500 ring-1 ring-gray-200", label: "Low" },
  medium: { badge: "bg-amber-50 text-amber-600 ring-1 ring-amber-200", label: "Medium" },
  high: { badge: "bg-rose-50 text-rose-600 ring-1 ring-rose-200", label: "High" },
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
      <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center">
        <TicketIcon className="w-7 h-7 text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600">No tickets found</p>
        <p className="text-xs text-gray-400 mt-1">
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
      className="w-full text-left px-5 py-4 hover:bg-gray-50/70 transition-colors group"
    >
      {/* Mobile layout */}
      <div className="sm:hidden flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
            {ticket.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityCfg.badge}`}>
              {priorityCfg.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
              {statusCfg.label}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {fmtDate(ticket.createdAt)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px_90px_32px] gap-4 items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
            {ticket.title}
          </p>
          {ticket.assignedTo && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
              <UserCheck className="w-2.5 h-2.5" /> Assigned
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 w-fit">
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
        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(ticket.createdAt)}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
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
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Support Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-700 min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-700 min-w-[140px]"
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
            <span className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{" "}
              <span className="font-bold text-gray-700">{tickets.length}</span> tickets
            </span>
          </div>
        )}

        {/* Ticket table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-sm text-gray-400">Loading tickets…</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <>
              {/* Table header (desktop only) */}
              <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px_90px_32px] gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Ticket</span>
                <span>Type</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Date</span>
                <span />
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">
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