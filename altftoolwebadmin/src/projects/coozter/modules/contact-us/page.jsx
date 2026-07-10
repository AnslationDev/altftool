"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Contact,
  Eye,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  deleteContactLead,
  subscribeContactLeads,
  updateContactLeadStatus,
} from "./service/contact.service";

const statusStyles = {
  new: "bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]",
  read: "bg-[var(--surface-soft)] text-[var(--muted)]",
  contacted: "bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] text-[var(--success)]",
};

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]";

export default function CoozterContactUsAdminPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeContactLeads(
      (items) => {
        setLeads(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load Coozter leads." });
      },
    );
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const contacted = leads.filter((lead) => lead.status === "contacted").length;
    const fresh = leads.filter((lead) => (lead.status || "new") === "new").length;
    return { total: leads.length, fresh, contacted };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const status = lead.status || "new";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        !search ||
        [lead.name, lead.email, lead.phone, lead.service, lead.company, lead.website, lead.budget]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [leads, query, statusFilter]);

  async function markLead(lead, status) {
    try {
      await updateContactLeadStatus(lead.id, status);
      emitAlert({ type: "success", message: `Lead marked ${status}.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update lead." });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContactLead(deleteTarget.id);
      emitAlert({ type: "success", message: "Lead deleted." });
      setDeleteTarget(null);
      setSelectedLead(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete lead." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--page)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--foreground)] text-[var(--surface)] shadow-[var(--shadow-sm)]">
              <Contact className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">Coozter Contact Us</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Manage contact form submissions and incoming leads.</p>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Leads" value={loading ? "-" : stats.total} icon={<Inbox className="h-5 w-5" />} />
          <StatCard label="New" value={loading ? "-" : stats.fresh} icon={<Mail className="h-5 w-5" />} />
          <StatCard label="Contacted" value={loading ? "-" : stats.contacted} icon={<CheckCircle2 className="h-5 w-5" />} />
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
            <label className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-10 pr-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
                placeholder="Search name, email, service, company..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
            >
              <option value="all">All leads</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="contacted">Contacted</option>
            </select>
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {filteredLeads.length} of {leads.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <Th>Lead</Th>
                  <Th>Phone</Th>
                  <Th>Service</Th>
                  <Th>Budget</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      <span className="mt-2 block">Loading leads...</span>
                    </td>
                  </tr>
                ) : null}

                {!loading && filteredLeads.length ? filteredLeads.map((lead) => (
                  <tr key={lead.id} className="bg-[var(--surface)] transition hover:bg-[var(--surface-soft)]">
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate font-bold text-[var(--foreground)]">{lead.name || "Unnamed lead"}</p>
                      <a href={lead.email ? `mailto:${lead.email}` : undefined} className="mt-1 block truncate text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)]">
                        {lead.email || "-"}
                      </a>
                      <p className="mt-1 truncate text-xs text-[var(--muted)]">{lead.company || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{lead.phone || "-"}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{lead.service || "-"}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{lead.budget || "-"}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status || "new"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setSelectedLead(lead)} className={iconButtonClass} title="View lead" aria-label={`View ${lead.name || "lead"}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => markLead(lead, lead.status === "contacted" ? "read" : "contacted")} className="h-9 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
                          {lead.status === "contacted" ? "Read" : "Contacted"}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(lead)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] text-[var(--danger)] transition hover:bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]" title="Delete lead" aria-label={`Delete ${lead.name || "lead"}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : null}

                {!loading && !filteredLeads.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-[var(--muted)]" />
                      <p className="mt-3 text-sm font-bold text-[var(--muted)]">No contact leads found.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedLead ? (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onMark={markLead}
          onDelete={(lead) => setDeleteTarget(lead)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete lead"
          message={`Delete the contact lead from "${deleteTarget.name || deleteTarget.email || "this visitor"}"?`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </main>
  );
}

function LeadDetailsModal({ lead, onClose, onMark, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--primary)]">Lead details</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">{lead.name || "Unnamed lead"}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{lead.email || "-"}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detail label="Phone" value={lead.phone} icon={<Phone className="h-4 w-4" />} />
          <Detail label="Service" value={lead.service} icon={<BriefcaseBusiness className="h-4 w-4" />} />
          <Detail label="Budget" value={lead.budget} />
          <Detail label="Company" value={lead.company} />
          <Detail label="Website" value={lead.website} />
          <Detail label="Created" value={formatDate(lead.createdAt)} />
        </div>

        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Message</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--foreground)]">{lead.message || "-"}</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {["new", "read", "contacted"].map((status) => (
            <button key={status} type="button" onClick={() => onMark(lead, status)} className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold capitalize text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
              Mark {status}
            </button>
          ))}
          <button type="button" onClick={() => onDelete(lead)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] px-4 text-sm font-semibold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{icon}{label}</p>
      <p className="mt-2 inline-flex rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xl font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-bold">{children}</th>;
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[status] || statusStyles.new}`}>
      {status}
    </span>
  );
}

function Detail({ label, value, icon = null }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{icon}{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">{value || "-"}</p>
    </div>
  );
}

function formatDate(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
