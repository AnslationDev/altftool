"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchContactSubmissions,
  updateSubmissionStatus,
  deleteContactSubmission,
} from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import {
  Loader2,
  Trash2,
  Mail,
  Phone,
  RefreshCw,
  Download,
  Search,
  X,
  Building2,
  User,
  CalendarDays,
  MessageSquare,
  ExternalLink,
  Inbox,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "new",         label: "New",         dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "In Progress", dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "replied",     label: "Replied",     dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  { value: "closed",      label: "Closed",      dot: "bg-slate-400",  badge: "bg-slate-50 text-slate-500 border-slate-200" },
];

const statusMap = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Escape a CSV cell value */
function csvCell(val = "") {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

/** Build and trigger a CSV download from an array of submission objects */
function downloadCSV(rows) {
  const headers = ["#", "Name", "Email", "Phone", "Company", "Request Type", "Message", "Status", "Submitted At"];
  const lines = [
    headers.join(","),
    ...rows.map((r, i) =>
      [
        i + 1,
        csvCell(r.name),
        csvCell(r.email),
        csvCell(r.phone),
        csvCell(r.company),
        csvCell(r.subject),
        csvCell(r.message),
        csvCell(statusMap[r.status]?.label ?? r.status),
        csvCell(r.submittedAt ? new Date(r.submittedAt).toLocaleString("en-GB") : ""),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alphobia-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = statusMap[status] ?? { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-500 border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ sub, onClose, onStatusChange, onDelete, updatingId, deletingId }) {
  if (!sub) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <User className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--foreground)]">{sub.name}</p>
              <p className="text-[10px] text-[var(--muted)]">{sub.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[var(--surface-soft)] transition cursor-pointer"
          >
            <X className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Mail className="h-3 w-3" />, label: "Email",        value: sub.email,              link: `mailto:${sub.email}` },
              { icon: <Building2 className="h-3 w-3" />, label: "Company",     value: sub.company || "—",     link: null },
              { icon: <Phone className="h-4 w-4" />, label: "Phone",       value: sub.phone || "—",       link: sub.phone ? `tel:${sub.phone}` : null },
              { icon: <MessageSquare className="h-3 w-3" />, label: "Request Type", value: sub.subject,  link: null, span: 2 },
              { icon: <CalendarDays className="h-3 w-3" />, label: "Submitted",  value: formatDate(sub.submittedAt), link: null, span: 2 },
            ].map((item, idx) => (
              <div key={idx} className={item.span === 2 ? "col-span-2" : ""}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1 mb-1">
                  {item.icon} {item.label}
                </p>
                {item.link ? (
                  <a href={item.link} className="text-sm font-semibold text-blue-600 hover:underline break-all">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold break-words">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Message */}
          {sub.message && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Message</p>
              <div className="bg-[var(--surface-soft)] rounded-md border border-[var(--border)] p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
                {sub.message}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Update Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = sub.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    disabled={updatingId === sub.id}
                    onClick={() => onStatusChange(sub.id, opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold transition cursor-pointer ${
                      active
                        ? `${opt.badge} ring-1 ring-offset-1 ring-current`
                        : "bg-[var(--surface-soft)] border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground)]"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                    {opt.label}
                    {active && updatingId === sub.id && (
                      <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="border-t border-[var(--border)] px-5 py-4 shrink-0 flex items-center gap-2">
          <a
            href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject)}`}
            className="flex-1 btn btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" /> Reply via Email
          </a>
          <button
            type="button"
            disabled={deletingId === sub.id}
            onClick={() => onDelete(sub.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
          >
            {deletingId === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactsTab() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState(null);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [updatingId, setUpdatingId]   = useState(null);
  const [deletingId, setDeletingId]   = useState(null);
  const [sortDir, setSortDir]         = useState("desc"); // "desc" = newest first

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchContactSubmissions();
      setSubmissions(data);
    } catch {
      emitAlert({ type: "error", message: "Failed to load contact submissions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const counts = useMemo(() =>
    STATUS_OPTIONS.reduce((acc, opt) => {
      acc[opt.value] = submissions.filter((s) => s.status === opt.value).length;
      return acc;
    }, {}),
  [submissions]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        [s.name, s.email, s.company, s.subject, s.message]
          .some((f) => f?.toLowerCase().includes(q))
      );
    }
    // Sort by submittedAt
    return [...list].sort((a, b) => {
      const aT = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bT = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return sortDir === "desc" ? bT - aT : aT - bT;
    });
  }, [submissions, filter, search, sortDir]);

  const selected = useMemo(() => submissions.find((s) => s.id === selectedId) ?? null, [submissions, selectedId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateSubmissionStatus(id, newStatus);
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
      emitAlert({ type: "success", message: "Status updated." });
    } catch {
      emitAlert({ type: "error", message: "Failed to update status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this submission?")) return;
    setDeletingId(id);
    try {
      await deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      emitAlert({ type: "success", message: "Submission deleted." });
    } catch {
      emitAlert({ type: "error", message: "Failed to delete submission." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = () => {
    const rows = filtered.length > 0 ? filtered : submissions;
    downloadCSV(rows);
    emitAlert({ type: "success", message: `Exported ${rows.length} submissions to CSV.` });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-slide-in">

      {/* ── Top Bar ── */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold">Contacts &amp; Leads</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {submissions.length} total &nbsp;·&nbsp; {counts["new"] ?? 0} new
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--surface-soft)] hover:bg-[var(--border)] transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--primary)] text-white hover:opacity-90 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {filtered.length > 0 && filter !== "all"
              ? `Download Filtered (${filtered.length})`
              : `Download All (${submissions.length})`}
          </button>
        </div>
      </div>

      {/* ── Filter + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              filter === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            All ({submissions.length})
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                filter === opt.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              {opt.label} ({counts[opt.value] ?? 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-8 pr-8 py-1.5 text-xs w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center space-y-3">
          <Inbox className="h-10 w-10 text-[var(--muted)] mx-auto" />
          <p className="font-semibold text-[var(--foreground)]">No submissions found</p>
          <p className="text-xs text-[var(--muted)]">
            {search
              ? `No results for "${search}".`
              : filter === "all"
              ? "Contact form submissions will appear here once users fill out the form."
              : `No submissions with status "${statusMap[filter]?.label ?? filter}".`}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] text-xs">
                  <th className="text-left px-4 py-3 font-semibold w-8">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Request Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th
                    className="text-left px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap"
                    onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
                  >
                    <span className="flex items-center gap-1">
                      Submitted
                      {sortDir === "desc"
                        ? <ChevronDown className="h-3 w-3" />
                        : <ChevronUp className="h-3 w-3" />}
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((sub, idx) => {
                  const isNew = sub.status === "new";
                  return (
                    <tr
                      key={sub.id}
                      className={`group transition-colors ${
                        selectedId === sub.id
                          ? "bg-[var(--primary)]/5"
                          : "hover:bg-[var(--surface-soft)]"
                      } ${isNew ? "font-medium" : ""}`}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-[var(--muted)]">
                        {idx + 1}
                        {isNew && (
                          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500 align-middle" />
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[var(--foreground)] truncate max-w-[120px] block">
                          {sub.name}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${sub.email}`}
                          className="text-xs text-blue-600 hover:underline truncate max-w-[160px] block"
                        >
                          {sub.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {sub.phone ? (
                          <a href={`tel:${sub.phone}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                            {sub.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-[var(--muted)]">{sub.company || "—"}</span>
                      </td>

                      {/* Request Type */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[var(--foreground)] truncate max-w-[150px] block">
                          {sub.subject}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={sub.status}
                            disabled={updatingId === sub.id}
                            onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                            className="input py-0.5 pl-2 pr-6 text-[10px] cursor-pointer min-w-0 w-auto"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {updatingId === sub.id && (
                            <Loader2 className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-[var(--muted)]" />
                          )}
                        </div>
                      </td>

                      {/* Submitted */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-[var(--muted)]">{formatDateShort(sub.submittedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="View Details"
                            onClick={() => setSelectedId(selectedId === sub.id ? null : sub.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-md bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <a
                            title="Reply via Email"
                            href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject)}`}
                            className="h-7 w-7 flex items-center justify-center rounded-md bg-[var(--surface-soft)] hover:bg-blue-50 hover:text-blue-600 text-[var(--muted)] transition"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                          <button
                            title="Delete"
                            disabled={deletingId === sub.id}
                            onClick={() => handleDelete(sub.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-md bg-[var(--surface-soft)] hover:bg-red-50 hover:text-red-600 text-[var(--muted)] transition disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === sub.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-soft)] flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              Showing {filtered.length} of {submissions.length} submissions
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
            >
              <Download className="h-3 w-3" /> Export to CSV
            </button>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedId && (
        <DetailDrawer
          sub={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          updatingId={updatingId}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}
