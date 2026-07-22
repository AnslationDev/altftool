"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox, Mail, Search, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  LEAD_STATUSES,
  deleteContactLead,
  subscribeContactLeads,
  updateLeadStatus,
} from "./service/leads.service";

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const STATUS_STYLES = {
  new: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  contacted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  closed: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || STATUS_STYLES.new
      }`}
    >
      {STATUS_LABELS[status] || "New"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "No date";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CampaignastraContactLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeContactLeads(
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact leads" });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const sortedLeads = useMemo(() => {
    const toMillis = (value) => {
      if (!value) return 0;
      if (value?.toDate) return value.toDate().getTime();
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };
    return [...leads].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedLeads.filter((lead) => {
      const matchesSearch =
        !queryText ||
        [lead.name, lead.email, lead.phone, lead.service, lead.message]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(queryText));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedLeads, statusFilter]);

  const counts = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
    }),
    [leads],
  );

  const handleStatusChange = async (lead, status) => {
    if (status === lead.status) return;
    try {
      await updateLeadStatus(lead.id, status);
      emitAlert({ type: "success", message: `Marked ${lead.name || "lead"} as ${status}.` });
      logAuditEvent({
        module: "contact",
        action: "LEAD_STATUS_UPDATE",
        entityType: "contactLead",
        entityId: lead.id,
        summary: `Marked lead ${lead.name} as ${status}`,
        route: "/campaignastra/contact/leads",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update lead status." });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContactLead(deleteTarget.id);
      emitAlert({ type: "success", message: `Lead from ${deleteTarget.name || "contact"} deleted.` });
      logAuditEvent({
        module: "contact",
        action: "LEAD_DELETE",
        entityType: "contactLead",
        entityId: deleteTarget.id,
        summary: `Deleted lead ${deleteTarget.name}`,
        route: "/campaignastra/contact/leads",
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete lead." });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Contact Leads</h1>
              <p className="text-sm text-gray-500">
                Review and manage contact form submissions.
              </p>
            </div>
          </div>
          <Link
            href="/campaignastra/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contact Settings
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Leads" value={loading ? "-" : counts.total} />
          <StatCard label="New" value={loading ? "-" : counts.new} tone="blue" />
          <StatCard label="Contacted" value={loading ? "-" : counts.contacted} tone="green" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 outline-none"
            >
              <option value="all">All status</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs font-medium text-gray-400">
              {filteredLeads.length} of {leads.length} leads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredLeads.length ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {lead.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="hover:text-gray-900">
                            {lead.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{lead.phone || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.service || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="line-clamp-2 max-w-[220px]" title={lead.message}>
                          {lead.message
                            ? `${lead.message.slice(0, 60)}${lead.message.length > 60 ? "…" : ""}`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={lead.status} />
                          <select
                            value={lead.status || "new"}
                            onChange={(event) => handleStatusChange(lead, event.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 outline-none"
                            aria-label={`Update status for ${lead.name || "lead"}`}
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                              aria-label={`Email ${lead.name || "lead"}`}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lead)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Delete lead from ${lead.name || "contact"}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-gray-200" />
                      <p className="mt-3 text-sm font-semibold text-gray-500">
                        No contact form submissions yet.
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Submissions from the Campaignastra contact form will appear here in real time.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete lead"
          message={`Delete the lead from "${deleteTarget.name || deleteTarget.email || "this contact"}"? This cannot be undone.`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
