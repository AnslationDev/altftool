"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, Mail, Plus, Save, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT_PAGE,
  DEFAULT_CONTACT_SETTINGS,
  LEAD_STATUSES,
  deleteContactLead,
  deleteNewsletterEmail,
  saveContactPage,
  saveContactSettings,
  subscribeContactLeads,
  subscribeContactPage,
  subscribeContactSettings,
  subscribeNewsletterEmails,
  updateLeadStatus,
} from "./service/contact.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
            <h1 className="text-xl font-bold text-gray-900">Infovasta Contact</h1>
            <p className="text-sm text-gray-500">Manage contact page settings, page content, leads, and captured newsletter emails.</p>
          </div>
        </div>

        <ContactSettingsCard />
        <ContactPageCard />
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
  const [errors, setErrors] = useState({});

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
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setFormLabel(key, value) {
    setSettings((prev) => ({ ...prev, formLabels: { ...prev.formLabels, [key]: value } }));
  }

  function addSocial() {
    setSettings((prev) => ({ ...prev, socials: [...(prev.socials || []), { icon: "", href: "" }] }));
  }

  function updateSocial(index, field, value) {
    setSettings((prev) => {
      const next = [...(prev.socials || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, socials: next };
    });
  }

  function removeSocial(index) {
    setSettings((prev) => ({ ...prev, socials: (prev.socials || []).filter((_, i) => i !== index) }));
  }

  async function save() {
    const nextErrors = {};
    if (settings.email && !EMAIL_REGEX.test(settings.email)) nextErrors.email = "Enter a valid email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Settings</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Details & form (contact/settings)</h2>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address"><input value={settings.address || ""} onChange={(event) => setField("address", event.target.value)} className={inputClass} /></Field>
            <Field label="Phone"><input value={settings.phone || ""} onChange={(event) => setField("phone", event.target.value)} className={inputClass} /></Field>
            <Field label="Email" error={errors.email}><input value={settings.email || ""} onChange={(event) => setField("email", event.target.value)} className={inputClass} /></Field>
            <Field label="Hours"><input value={settings.hours || ""} onChange={(event) => setField("hours", event.target.value)} className={inputClass} placeholder="Mon – Fri, 9:00 AM – 6:00 PM" /></Field>
            <div className="sm:col-span-2">
              <Field label="Map Query"><input value={settings.mapQuery || ""} onChange={(event) => setField("mapQuery", event.target.value)} className={inputClass} placeholder="Address to search on the map" /></Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Social Links</p>
            <div className="space-y-3">
              {(settings.socials || []).length ? (settings.socials || []).map((row, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_1.4fr_44px]">
                  <Field label="Icon"><input value={row.icon || ""} onChange={(event) => updateSocial(index, "icon", event.target.value)} className={inputClass} placeholder="logo-facebook" /></Field>
                  <Field label="Link"><input value={row.href || ""} onChange={(event) => updateSocial(index, "href", event.target.value)} className={inputClass} placeholder="https://facebook.com/..." /></Field>
                  <button onClick={() => removeSocial(index)} className="mt-6 flex h-11 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-400">No social links yet.</p>
              )}
              <button onClick={addSocial} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <Plus className="h-4 w-4" /> Add social link
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Form Labels</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name Field Label"><input value={settings.formLabels?.name || ""} onChange={(event) => setFormLabel("name", event.target.value)} className={inputClass} /></Field>
              <Field label="Email Field Label"><input value={settings.formLabels?.email || ""} onChange={(event) => setFormLabel("email", event.target.value)} className={inputClass} /></Field>
              <Field label="Subject Field Label"><input value={settings.formLabels?.subject || ""} onChange={(event) => setFormLabel("subject", event.target.value)} className={inputClass} /></Field>
              <Field label="Message Field Label"><input value={settings.formLabels?.message || ""} onChange={(event) => setFormLabel("message", event.target.value)} className={inputClass} /></Field>
              <Field label="Submit Button Label"><input value={settings.formLabels?.submitLabel || ""} onChange={(event) => setFormLabel("submitLabel", event.target.value)} className={inputClass} /></Field>
              <Field label="Success Heading"><input value={settings.formLabels?.successHeading || ""} onChange={(event) => setFormLabel("successHeading", event.target.value)} className={inputClass} /></Field>
              <div className="sm:col-span-2">
                <Field label="Success Body"><textarea value={settings.formLabels?.successBody || ""} onChange={(event) => setFormLabel("successBody", event.target.value)} rows={2} className={textareaClass} /></Field>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ page content ------------------------------- */

function ContactPageCard() {
  const [page, setPage] = useState(DEFAULT_CONTACT_PAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeContactPage(
      (data) => {
        setPage(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact page content." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  function setField(key, value) {
    setPage((prev) => ({ ...prev, [key]: value }));
  }

  function setNested(section, key, value) {
    setPage((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveContactPage(page);
      emitAlert({ type: "success", message: "Contact page content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact page content." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Page Content</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Contact page (pages/contact)</h2>
        </div>
        <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {loading ? (
        <div className="mt-5 h-56 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="mt-5 space-y-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Meta</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meta Title"><input value={page.meta?.title || ""} onChange={(event) => setNested("meta", "title", event.target.value)} className={inputClass} /></Field>
              <Field label="Meta Description"><input value={page.meta?.description || ""} onChange={(event) => setNested("meta", "description", event.target.value)} className={inputClass} /></Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Hero</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Eyebrow"><input value={page.hero?.eyebrow || ""} onChange={(event) => setNested("hero", "eyebrow", event.target.value)} className={inputClass} /></Field>
              <Field label="Title"><input value={page.hero?.title || ""} onChange={(event) => setNested("hero", "title", event.target.value)} className={inputClass} /></Field>
              <Field label="Highlight"><input value={page.hero?.highlight || ""} onChange={(event) => setNested("hero", "highlight", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Description"><textarea value={page.hero?.description || ""} onChange={(event) => setNested("hero", "description", event.target.value)} rows={2} className={textareaClass} /></Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Info Labels</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address Label"><input value={page.infoLabels?.address || ""} onChange={(event) => setNested("infoLabels", "address", event.target.value)} className={inputClass} /></Field>
              <Field label="Phone Label"><input value={page.infoLabels?.phone || ""} onChange={(event) => setNested("infoLabels", "phone", event.target.value)} className={inputClass} /></Field>
              <Field label="Email Label"><input value={page.infoLabels?.email || ""} onChange={(event) => setNested("infoLabels", "email", event.target.value)} className={inputClass} /></Field>
              <Field label="Hours Label"><input value={page.infoLabels?.hours || ""} onChange={(event) => setNested("infoLabels", "hours", event.target.value)} className={inputClass} /></Field>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <Field label="Map Title"><input value={page.mapTitle || ""} onChange={(event) => setField("mapTitle", event.target.value)} className={inputClass} placeholder="InfoVsta office location" /></Field>
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
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}><td colSpan={7} className="px-4 py-3"><div className="h-9 animate-pulse rounded-lg bg-gray-100" /></td></tr>
              ))
            ) : filteredLeads.length ? filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{lead.name || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-gray-900">{lead.email}</a> : "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.subject || "-"}</td>
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
                <td colSpan={7} className="px-4 py-14 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-gray-200" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">No contact form submissions yet.</p>
                  <p className="mt-1 text-xs text-gray-400">Submissions from the Infovasta contact form appear here in real time.</p>
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
