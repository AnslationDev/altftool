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

const ROUTE = "/infodrif/contact/leads";

const cardClass = "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const selectClass =
  "h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]";

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const STATUS_STYLES = {
  new: "bg-info-soft text-info ring-1 ring-[color-mix(in_srgb,var(--info)_35%,transparent)]",
  contacted:
    "bg-success-soft text-success ring-1 ring-[color-mix(in_srgb,var(--success)_35%,transparent)]",
  closed: "bg-surface-soft text-muted ring-1 ring-border",
};

function StatCard({ label, value, tone = "muted" }) {
  const toneClass = {
    muted: "bg-surface-soft text-foreground",
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
  }[tone];

  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xl font-bold ${toneClass}`}>
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

function toMillis(value) {
  if (!value) return 0;
  if (value?.toDate) return value.toDate().getTime();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value) {
  const millis = toMillis(value);
  if (!millis) return "No date";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(millis));
}

export default function InfodrifContactLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeContactLeads(
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact leads." });
        setLoading(false);
      },
    );
  }, []);

  const sortedLeads = useMemo(
    () => [...leads].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
    [leads],
  );

  const filteredLeads = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedLeads.filter((lead) => {
      const matchesSearch =
        !queryText ||
        [lead.name, lead.email, lead.message].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
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

  async function handleStatusChange(lead, status) {
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
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update lead status." });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContactLead(deleteTarget.id);
      emitAlert({
        type: "success",
        message: `Lead from ${deleteTarget.name || "contact"} deleted.`,
      });
      logAuditEvent({
        module: "contact",
        action: "LEAD_DELETE",
        entityType: "contactLead",
        entityId: deleteTarget.id,
        summary: `Deleted lead ${deleteTarget.name}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete lead." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodrif Contact Leads</h1>
              <p className="text-sm text-muted">Review and manage contact form submissions.</p>
            </div>
          </div>
          <Link href="/infodrif/contact" className={outlineButtonClass}>
            <ArrowLeft className="h-4 w-4" />
            Back to Contact Settings
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Leads" value={loading ? "-" : counts.total} />
          <StatCard label="New" value={loading ? "-" : counts.new} tone="info" />
          <StatCard label="Contacted" value={loading ? "-" : counts.contacted} tone="success" />
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-soft px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads"
                className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">All status</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredLeads.length} of {leads.length} leads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-md bg-surface-soft" />
                      </td>
                    </tr>
                  ))
                ) : filteredLeads.length ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{lead.name || "-"}</td>
                      <td className="px-4 py-3 text-muted">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="hover:text-foreground">
                            {lead.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="max-w-[280px] px-4 py-3 text-muted">
                        <span className="line-clamp-2 text-xs" title={lead.message}>
                          {lead.message || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={lead.status} />
                          <select
                            value={lead.status || "new"}
                            onChange={(event) => handleStatusChange(lead, event.target.value)}
                            className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]"
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
                      <td className="px-4 py-3 text-muted">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                              aria-label={`Email ${lead.name || "lead"}`}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lead)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
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
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        No contact form submissions yet.
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Submissions from the Infodrif contact form appear here in real time.
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
          message={`Delete the lead from "${
            deleteTarget.name || deleteTarget.email || "this contact"
          }"? This cannot be undone.`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
