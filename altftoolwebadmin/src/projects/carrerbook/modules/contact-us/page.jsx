"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Contact,
  Eye,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT,
  deleteContactLead,
  resetContactSettings,
  saveContactSettings,
  subscribeContactLeads,
  subscribeContactSettings,
  updateContactLeadStatus,
} from "./service/contact.service";

const STATUS_STYLES = {
  new: "bg-blue-50 text-blue-700",
  read: "bg-amber-50 text-amber-700",
  contacted: "bg-emerald-50 text-emerald-700",
};

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  }[tone];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function ContactPreview({ content }) {
  const socials = content.socialLinks || [];
  return (
    <div
      className="rounded-2xl p-6 text-white shadow-sm"
      style={{ background: `linear-gradient(110deg, ${content.gradientFrom}, ${content.gradientTo})` }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl p-7" style={{ background: content.cardColor }}>
          <h2 className="text-3xl font-black">{content.title}</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {["name", "email", "website", "skypeId", "companyName"].map((key) => (
              <div key={key} className="rounded-lg border border-white/15 px-4 py-3 text-white/35">
                {content.placeholders?.[key]}
              </div>
            ))}
            <div className="rounded-lg border border-white/15 px-4 py-3 text-white/80">
              {content.placeholders?.queryType}
            </div>
          </div>
          <div className="mt-4 h-24 rounded-lg border border-white/15 px-4 py-3 text-white/35">
            {content.placeholders?.message}
          </div>
          <button className="mt-7 rounded-full bg-amber-500 px-10 py-3 font-bold text-white">
            {content.submitText}
          </button>
          <p className="mt-4 max-w-md text-xs leading-6 text-white/60">{content.successMessage}</p>
        </div>
        <div className="overflow-hidden rounded-xl" style={{ background: content.panelColor }}>
          <div className="p-7">
            <h3 className="text-lg font-black">{content.addressTitle}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/90">{content.addressText}</p>
            <h3 className="mt-8 text-lg font-black">{content.hoursTitle}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/90">{content.hoursText}</p>
            <p className="mt-8 text-sm font-semibold text-teal-400">{content.emailText}</p>
          </div>
          <div className="flex gap-4 bg-white/15 p-7">
            {socials.map((social, index) => (
              <span key={`${social.platform}-${index}`} className="grid h-10 w-10 place-items-center rounded-full text-xs font-black" style={{ background: social.color || "#333" }}>
                {social.platform?.slice(0, 1)?.toUpperCase() || "S"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "No date";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CareerBookContactAdminPage() {
  const [content, setContent] = useState(DEFAULT_CONTACT);
  const [draft, setDraft] = useState(DEFAULT_CONTACT);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [greetingTarget, setGreetingTarget] = useState(null);
  const [greetingForm, setGreetingForm] = useState({ to: "", subject: "", message: "" });
  const [greetingSending, setGreetingSending] = useState(false);
  const [greetingErrors, setGreetingErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let contentReady = false;
    let leadsReady = false;
    const markReady = () => {
      if (contentReady && leadsReady) setLoading(false);
    };
    const offContent = subscribeContactSettings(
      (data) => {
        contentReady = true;
        setContent(data);
        setDraft(data);
        markReady();
      },
      () => {
        contentReady = true;
        emitAlert({ type: "error", message: "Failed to load contact settings" });
        markReady();
      },
    );
    const offLeads = subscribeContactLeads(
      (data) => {
        leadsReady = true;
        setLeads(data);
        markReady();
      },
      () => {
        leadsReady = true;
        emitAlert({ type: "error", message: "Failed to load contact leads" });
        markReady();
      },
    );
    return () => {
      offContent();
      offLeads();
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        [lead.name, lead.email, lead.companyName, lead.queryType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const setPlaceholder = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      placeholders: { ...prev.placeholders, [key]: value },
    }));
  };

  const handleSocialChange = (index, key, value) => {
    setDraft((prev) => {
      const next = [...(prev.socialLinks || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, socialLinks: next };
    });
  };

  const addSocial = () => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: "social", url: "#", color: "#333333" }],
    }));
  };

  const removeSocial = (index) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = async () => {
    const nextErrors = validateContact(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveContactSettings(draft);
      emitAlert({ type: "success", message: "Contact section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact section." });
    } finally {
      setSaving(false);
    }
  };

  const markLead = async (lead, status) => {
    try {
      await updateContactLeadStatus(lead.id, status);
      emitAlert({ type: "success", message: `Lead marked ${status}.` });
    } catch {
      emitAlert({ type: "error", message: "Failed to update lead." });
    }
  };

  const openGreetingModal = (lead) => {
    const subject = interpolateTemplate(content.greetingEmailSubject, lead, content);
    const message = interpolateTemplate(content.greetingEmailTemplate, lead, content);
    setGreetingTarget(lead);
    setGreetingForm({
      to: lead.email || "",
      subject: subject || `Thanks for contacting CareerBook, ${lead.name || "there"}`,
      message: message || `Hi ${lead.name || "there"},\n\nThanks for reaching out to CareerBook.`,
    });
    setGreetingErrors({});
  };

  const handleGreetingField = (key, value) => {
    setGreetingForm((prev) => ({ ...prev, [key]: value }));
    setGreetingErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const sendGreeting = async () => {
    const nextErrors = {};
    if (!greetingForm.to?.trim()) nextErrors.to = "Recipient email is required.";
    if (!greetingForm.subject?.trim()) nextErrors.subject = "Subject is required.";
    if (!greetingForm.message?.trim()) nextErrors.message = "Message is required.";
    setGreetingErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setGreetingSending(true);
    try {
      const target = greetingTarget;
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch("/api/contact/send-greeting", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: target?.id,
          to: greetingForm.to.trim(),
          subject: greetingForm.subject.trim(),
          message: greetingForm.message.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to send greeting email.");
      }

      emitAlert({ type: "success", message: "Greeting email sent." });
      setGreetingTarget(null);
      setGreetingForm({ to: "", subject: "", message: "" });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to send greeting email." });
    } finally {
      setGreetingSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === "settings") {
        await resetContactSettings();
        emitAlert({ type: "success", message: "Contact settings reset." });
      } else {
        await deleteContactLead(deleteTarget.id);
        emitAlert({ type: "success", message: "Lead deleted." });
      }
      setDeleteTarget(null);
      setSelectedLead(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Delete failed." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const counts = {
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Contact className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Contact Us</h1>
              <p className="text-sm text-gray-500">Manage contact content and incoming leads.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Contact
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Leads" value={loading ? "-" : leads.length} />
          <StatCard label="New" value={loading ? "-" : counts.new} tone="blue" />
          <StatCard label="Contacted" value={loading ? "-" : counts.contacted} tone="green" />
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            ["content", "Section Settings"],
            ["leads", "Submitted Leads"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "content" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Editable content</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">Form and info settings</h2>
                </div>
                <button onClick={() => setDraft(content)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Section title" error={errors.title}>
                  <input value={draft.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Submit button text" error={errors.submitText}>
                  <input value={draft.submitText} onChange={(event) => setField("submitText", event.target.value)} className={inputClass} />
                </Field>
                <button
                  onClick={() => setField("autoReplyEnabled", draft.autoReplyEnabled === false)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${
                    draft.autoReplyEnabled !== false
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  <span>{draft.autoReplyEnabled !== false ? "Auto reply enabled" : "Auto reply disabled"}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${draft.autoReplyEnabled !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
                </button>
                <Field label="Greeting email subject" error={errors.greetingEmailSubject}>
                  <input value={draft.greetingEmailSubject || ""} onChange={(event) => setField("greetingEmailSubject", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Greeting email template" error={errors.greetingEmailTemplate}>
                  <textarea value={draft.greetingEmailTemplate || ""} onChange={(event) => setField("greetingEmailTemplate", event.target.value)} rows={6} className={textareaClass} />
                </Field>
                <Field label="Admin notification email" error={errors.adminNotificationEmail}>
                  <input value={draft.adminNotificationEmail || ""} onChange={(event) => setField("adminNotificationEmail", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Form success message" error={errors.successMessage}>
                  <textarea value={draft.successMessage || ""} onChange={(event) => setField("successMessage", event.target.value)} rows={3} className={textareaClass} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(draft.placeholders || {}).map(([key, value]) => (
                    <Field key={key} label={`${key} placeholder`}>
                      <input value={value} onChange={(event) => setPlaceholder(key, event.target.value)} className={inputClass} />
                    </Field>
                  ))}
                </div>
                <Field label="Query dropdown options">
                  <textarea value={(draft.queryOptions || []).join("\n")} onChange={(event) => setField("queryOptions", event.target.value.split("\n"))} rows={5} className={textareaClass} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Address title"><input value={draft.addressTitle} onChange={(event) => setField("addressTitle", event.target.value)} className={inputClass} /></Field>
                  <Field label="Open hours title"><input value={draft.hoursTitle} onChange={(event) => setField("hoursTitle", event.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Address text"><textarea value={draft.addressText} onChange={(event) => setField("addressText", event.target.value)} rows={3} className={textareaClass} /></Field>
                <Field label="Open hours timing"><textarea value={draft.hoursText} onChange={(event) => setField("hoursText", event.target.value)} rows={3} className={textareaClass} /></Field>
                <Field label="Email text"><input value={draft.emailText} onChange={(event) => setField("emailText", event.target.value)} className={inputClass} /></Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Gradient from"><input type="color" value={draft.gradientFrom} onChange={(event) => setField("gradientFrom", event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2" /></Field>
                  <Field label="Gradient to"><input type="color" value={draft.gradientTo} onChange={(event) => setField("gradientTo", event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2" /></Field>
                  <Field label="Card color"><input type="color" value={draft.cardColor} onChange={(event) => setField("cardColor", event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2" /></Field>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Social links</p>
                    <button onClick={addSocial} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">Add</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(draft.socialLinks || []).map((social, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_72px_40px]">
                        <input value={social.platform} onChange={(event) => handleSocialChange(index, "platform", event.target.value)} className={inputClass} placeholder="Platform" />
                        <input value={social.url} onChange={(event) => handleSocialChange(index, "url", event.target.value)} className={inputClass} placeholder="URL" />
                        <input type="color" value={social.color || "#333333"} onChange={(event) => handleSocialChange(index, "color", event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2" />
                        <button onClick={() => removeSocial(index)} className="rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="mx-auto h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setField("active", !draft.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                  <span>{draft.active ? "Section active" : "Section inactive"}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                </button>
                <button onClick={() => setDeleteTarget({ type: "settings" })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Reset Contact Content
                </button>
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><Eye className="h-4 w-4" /> Live preview</div>
              <ContactPreview content={draft} />
            </section>
          </div>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 outline-none">
                <option value="all">All status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="contacted">Contacted</option>
              </select>
              <span className="ml-auto text-xs font-medium text-gray-400">{filteredLeads.length} of {leads.length} leads</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Query</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index}><td colSpan={6} className="px-4 py-3"><div className="h-9 animate-pulse rounded-lg bg-gray-100" /></td></tr>) : null}
                  {!loading && filteredLeads.length ? filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold text-gray-900">{lead.name}</p><p className="text-xs text-gray-400">{lead.email}</p></td>
                      <td className="px-4 py-3 text-gray-600">{lead.queryType}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.companyName || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>{lead.status || "new"}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setSelectedLead(lead)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50" title="View lead">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => openGreetingModal(lead)} className="rounded-lg p-2 text-violet-600 hover:bg-violet-50" title="Send greeting">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button onClick={() => markLead(lead, lead.status === "contacted" ? "read" : "contacted")} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Mark contacted">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget({ type: "lead", ...lead })} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete lead">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : null}
                  {!loading && !filteredLeads.length ? <tr><td colSpan={6} className="px-4 py-16 text-center"><Inbox className="mx-auto h-8 w-8 text-gray-200" /><p className="mt-3 text-sm font-semibold text-gray-500">No leads found</p><p className="mt-1 text-xs text-gray-400">Frontend contact submissions appear here in real time.</p></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {selectedLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Lead details</p><h2 className="mt-1 text-lg font-bold text-gray-900">{selectedLead.name}</h2></div>
              <button onClick={() => setSelectedLead(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-500">Close</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["email", "website", "skypeId", "companyName", "queryType"].map((key) => <Detail key={key} label={key} value={selectedLead[key]} />)}
              <Detail label="emailSent" value={selectedLead.emailSent ? "Yes" : "No"} />
              <Detail label="emailSentAt" value={formatDate(selectedLead.emailSentAt)} />
            </div>
            <Detail label="message" value={selectedLead.message} large />
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  openGreetingModal(selectedLead);
                  setSelectedLead(null);
                }}
                className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Send Greeting
              </button>
              {["new", "read", "contacted"].map((status) => <button key={status} onClick={() => markLead(selectedLead, status)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Mark {status}</button>)}
            </div>
          </div>
        </div>
      ) : null}

      {greetingTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Send Greeting</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Reply to {greetingTarget.name || "lead"}</h2>
              </div>
              <button onClick={() => setGreetingTarget(null)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-500">
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="To" error={greetingErrors.to}>
                <input
                  value={greetingForm.to}
                  onChange={(event) => handleGreetingField("to", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Subject" error={greetingErrors.subject}>
                <input
                  value={greetingForm.subject}
                  onChange={(event) => handleGreetingField("subject", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Message" error={greetingErrors.message}>
                <textarea
                  value={greetingForm.message}
                  onChange={(event) => handleGreetingField("message", event.target.value)}
                  rows={10}
                  className={textareaClass}
                />
              </Field>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-6 text-gray-500">
                Use <code>{`{{name}}`}</code>, <code>{`{{email}}`}</code>, <code>{`{{companyName}}`}</code>, and{" "}
                <code>{`{{queryType}}`}</code> inside the greeting template.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setGreetingTarget(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={sendGreeting}
                disabled={greetingSending}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
              >
                {greetingSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Greeting
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title={deleteTarget.type === "settings" ? "Reset contact content" : "Delete lead"}
          message={deleteTarget.type === "settings" ? "Reset contact section back to defaults?" : `Delete lead from ${deleteTarget.name}?`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function Detail({ label, value, large = false }) {
  return (
    <div className={`mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 ${large ? "sm:col-span-2" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}

function validateContact(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "Section title is required.";
  if (!values.submitText?.trim()) errors.submitText = "Submit text is required.";
  if (values.autoReplyEnabled !== false) {
    if (!values.greetingEmailSubject?.trim()) errors.greetingEmailSubject = "Greeting subject is required.";
    if (!values.greetingEmailTemplate?.trim()) errors.greetingEmailTemplate = "Greeting template is required.";
    if (!values.adminNotificationEmail?.trim()) errors.adminNotificationEmail = "Admin notification email is required.";
  }
  if (!values.successMessage?.trim()) errors.successMessage = "Success message is required.";
  return errors;
}

function interpolateTemplate(template, lead = {}, content = {}) {
  if (!template) return "";
  return String(template)
    .replaceAll("{{name}}", lead.name || "")
    .replaceAll("{{email}}", lead.email || "")
    .replaceAll("{{companyName}}", lead.companyName || "")
    .replaceAll("{{queryType}}", lead.queryType || "")
    .replaceAll("{{successMessage}}", content.successMessage || "");
}

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
