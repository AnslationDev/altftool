"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, Mail, Save, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT_SETTINGS,
  LEAD_STATUSES,
  deleteContactLead,
  deleteNewsletterEmail,
  saveContactSettings,
  subscribeContactLeads,
  subscribeContactSettings,
  subscribeNewsletterEmails,
  updateLeadStatus,
} from "./service/contact.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const STATUS_LABELS = { new: "New", contacted: "Contacted", closed: "Closed" };
const STATUS_STYLES = {
  new: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  contacted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  closed: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

function toMillis(value) {
  if (!value) return 0;
  if (value?.toDate) return value.toDate().getTime();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value) {
  const millis = toMillis(value);
  if (!millis) return "No date";
  return new Date(millis).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offerhoppr Contact</h1>
            <p className="text-sm text-gray-500">Manage contact page settings, leads, and captured newsletter emails.</p>
          </div>
        </div>

        <ContactSettingsCard />
        <LeadsCard />
        <NewsletterCard />
      </div>
    </div>
  );
}

/* ------------------------------- settings -------------------------------- */

function ContactSettingsCard() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeContactSettings(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact settings." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveContactSettings(settings);
      emitAlert({ type: "success", message: "Contact settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact settings." });
    } finally {
      setSaving(false);
    }
  }

  const topicsText = (settings.topics || []).join("\n");
  const budgetText = (settings.budgetRanges || []).join("\n");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Page</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Page content &amp; form options</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{dirty ? "Unsaved" : "Saved"}</span>
          <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="mt-5 space-y-6">
          <div className="space-y-4">
            <Field label="Headline"><input value={settings.headline || ""} onChange={(event) => setField("headline", event.target.value)} className={inputClass} /></Field>
            <Field label="Subcopy"><textarea value={settings.subcopy || ""} onChange={(event) => setField("subcopy", event.target.value)} rows={2} className={textareaClass} /></Field>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Form Options</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={'"What Do You Need Help With?" topics (one per line)'}>
                <textarea value={topicsText} onChange={(event) => setField("topics", event.target.value.split("\n"))} rows={6} className={textareaClass} />
              </Field>
              <Field label="Budget Ranges (one per line)">
                <textarea value={budgetText} onChange={(event) => setField("budgetRanges", event.target.value.split("\n"))} rows={6} className={textareaClass} />
              </Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Availability</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Office Hours"><input value={settings.officeHours || ""} onChange={(event) => setField("officeHours", event.target.value)} className={inputClass} /></Field>
              <Field label="Response Time"><input value={settings.responseTime || ""} onChange={(event) => setField("responseTime", event.target.value)} className={inputClass} /></Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- leads --------------------------------- */

function LeadsCard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeContactLeads(
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact leads." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const sortedLeads = useMemo(
    () => [...leads].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
    [leads],
  );

  const filteredLeads = useMemo(
    () => sortedLeads.filter((lead) => statusFilter === "all" || lead.status === statusFilter),
    [sortedLeads, statusFilter],
  );

  async function handleStatusChange(lead, status) {
    if (status === lead.status) return;
    try {
      await updateLeadStatus(lead.id, status);
      emitAlert({ type: "success", message: `Marked ${lead.name || "lead"} as ${status}.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update lead status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContactLead(deleteTarget.id);
      emitAlert({ type: "success", message: `Lead from ${deleteTarget.name || "contact"} deleted.` });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete lead." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inbox</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Contact Leads</h2>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ml-auto rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 outline-none">
          <option value="all">All status</option>
          {LEAD_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
        </select>
        <span className="text-xs font-medium text-gray-400">{filteredLeads.length} of {leads.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}><td colSpan={8} className="px-4 py-3"><div className="h-9 animate-pulse rounded-lg bg-gray-100" /></td></tr>
              ))
            ) : filteredLeads.length ? filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{lead.name || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-gray-900">{lead.email}</a> : "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.topic || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.budget || "-"}</td>
                <td className="px-4 py-3 text-gray-500">
                  <span className="line-clamp-2 max-w-[220px]" title={lead.message}>
                    {lead.message ? `${lead.message.slice(0, 60)}${lead.message.length > 60 ? "…" : ""}` : "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>{STATUS_LABELS[lead.status] || "New"}</span>
                    <select value={lead.status || "new"} onChange={(event) => handleStatusChange(lead, event.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 outline-none" aria-label={`Update status for ${lead.name || "lead"}`}>
                      {LEAD_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {lead.email ? <a href={`mailto:${lead.email}`} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50" aria-label={`Email ${lead.name || "lead"}`}><Mail className="h-4 w-4" /></a> : null}
                    <button type="button" onClick={() => setDeleteTarget(lead)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete lead from ${lead.name || "contact"}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-gray-200" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">No contact form submissions yet.</p>
                  <p className="mt-1 text-xs text-gray-400">Submissions from the Offerhoppr contact form appear here in real time.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete lead"
          message={`Delete the lead from "${deleteTarget.name || deleteTarget.email || "this contact"}"? This cannot be undone.`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

/* ----------------------------- newsletter -------------------------------- */

function NewsletterCard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeNewsletterEmails(
      (data) => {
        setEmails(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load newsletter emails." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(
    () => [...emails].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
    [emails],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNewsletterEmail(deleteTarget.id);
      emitAlert({ type: "success", message: "Newsletter email removed." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to remove email." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Captured Emails</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Newsletter Signups</h2>
        </div>
        <span className="ml-auto text-xs font-medium text-gray-400">{emails.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}><td colSpan={5} className="px-4 py-3"><div className="h-9 animate-pulse rounded-lg bg-gray-100" /></td></tr>
              ))
            ) : sorted.length ? sorted.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{item.email || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{item.source || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{item.status || "new"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${item.email || "email"}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <Mail className="mx-auto h-8 w-8 text-gray-200" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">No newsletter emails captured yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete newsletter email"
          message={`Remove "${deleteTarget.email || "this email"}" from the captured list?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
