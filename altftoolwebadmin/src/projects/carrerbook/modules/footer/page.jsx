"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Inbox,
  Loader2,
  Mail,
  PanelBottom,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_FOOTER,
  deleteFooterEmail,
  deleteFooterImage,
  deleteFooterSettings,
  saveFooterSettings,
  subscribeFooterEmails,
  subscribeFooterSettings,
  updateFooterEmailStatus,
  uploadFooterImage,
} from "./service/footer.service";

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
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "No date";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function FooterPreview({ content }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="grid min-h-[360px] gap-8 bg-[linear-gradient(115deg,#030303_0%,#050505_44%,#351f80_100%)] p-8 text-white lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div className="flex flex-col justify-center">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-16 bg-white/70" />
            <span className="text-sm font-bold uppercase tracking-wide">{content.label || DEFAULT_FOOTER.label}</span>
          </div>
          <h2 className="max-w-xl text-5xl font-black leading-none tracking-normal md:text-6xl">
            {content.heading || DEFAULT_FOOTER.heading}
          </h2>
          <p className="mt-8 max-w-xl text-sm font-medium leading-7 text-white/90">
            {content.description || DEFAULT_FOOTER.description}
          </p>
          <div className="mt-10 flex max-w-lg items-center rounded-xl border border-white/50 bg-white/15 p-2">
            <span className="flex-1 px-4 text-sm text-white/50">Email ID</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white/80">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {content.imageUrl ? (
            <img src={content.imageUrl} alt="Stay updated illustration" className="max-h-[330px] w-full object-contain" />
          ) : (
            <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-center text-sm text-white/60">
              Upload right-side illustration
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerBookFooterPage() {
  const [content, setContent] = useState(DEFAULT_FOOTER);
  const [draft, setDraft] = useState(DEFAULT_FOOTER);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let contentReady = false;
    let emailsReady = false;
    const markReady = () => {
      if (contentReady && emailsReady) setLoading(false);
    };

    const offContent = subscribeFooterSettings(
      (data) => {
        contentReady = true;
        setContent(data);
        setDraft(data);
        markReady();
      },
      () => {
        contentReady = true;
        emitAlert({ type: "error", message: "Failed to load footer content" });
        markReady();
      },
    );
    const offEmails = subscribeFooterEmails(
      (data) => {
        emailsReady = true;
        setEmails(data);
        markReady();
      },
      () => {
        emailsReady = true;
        emitAlert({ type: "error", message: "Failed to load email submissions" });
        markReady();
      },
    );
    return () => {
      offContent();
      offEmails();
    };
  }, []);

  const filteredEmails = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emails.filter((item) => {
      const matchesSearch = !q || item.email?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [emails, query, statusFilter]);

  const unreadCount = emails.filter((item) => item.status !== "contacted").length;

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadFooterImage({ file, onProgress: setUploadProgress });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Footer image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const nextErrors = validateFooter(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveFooterSettings(draft);
      emitAlert({ type: "success", message: "Footer content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save footer content." });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteFooterImage(draft.imagePath);
      emitAlert({ type: "success", message: "Footer image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === "content") {
        await deleteFooterSettings();
        emitAlert({ type: "success", message: "Footer content reset." });
      } else {
        await deleteFooterEmail(deleteTarget.id);
        emitAlert({ type: "success", message: "Email deleted." });
      }
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Delete failed." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const markEmail = async (item) => {
    const next = item.status === "contacted" ? "unread" : "contacted";
    try {
      await updateFooterEmailStatus(item.id, next);
      emitAlert({ type: "success", message: `Email marked ${next}.` });
    } catch {
      emitAlert({ type: "error", message: "Failed to update email status." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <PanelBottom className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Footer</h1>
              <p className="text-sm text-gray-500">Manage Stay Updated content and email submissions.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Footer
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Submissions" value={loading ? "-" : emails.length} />
          <StatCard label="Unread" value={loading ? "-" : unreadCount} tone="amber" />
          <StatCard label="Contacted" value={loading ? "-" : emails.length - unreadCount} tone="green" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Footer content</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Stay Updated section</h2>
              </div>
              <button onClick={() => setDraft(content)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Section label" error={errors.label}>
                <input value={draft.label} onChange={(event) => setField("label", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
              </Field>
              <Field label="Heading" error={errors.heading}>
                <input value={draft.heading} onChange={(event) => setField("heading", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea value={draft.description} onChange={(event) => setField("description", event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
              </Field>
              <Field label="Right-side image">
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-gray-200 bg-white">
                      {draft.imageUrl ? <img src={draft.imageUrl} alt="Footer preview" className="max-h-16 max-w-24 object-contain" /> : <ImageIcon className="h-6 w-6 text-gray-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">Upload footer illustration</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP up to 8MB.</p>
                      {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                      <Upload className="h-4 w-4" />
                      Upload
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => handleUpload(event.target.files?.[0])} />
                    </label>
                    {draft.imageUrl ? <button onClick={handleRemoveImage} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Remove</button> : null}
                  </div>
                </div>
              </Field>
              <button onClick={() => setField("active", !draft.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{draft.active ? "Section active" : "Section inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
              <button onClick={() => setDeleteTarget({ type: "content" })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Reset Footer Content
              </button>
            </div>
          </section>

          <section className="space-y-5">
            <FooterPreview content={draft} />
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search emails" className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400" />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 outline-none">
                  <option value="all">All status</option>
                  <option value="unread">Unread</option>
                  <option value="contacted">Contacted</option>
                </select>
                <span className="ml-auto text-xs font-medium text-gray-400">{filteredEmails.length} of {emails.length} emails</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-9 animate-pulse rounded-lg bg-gray-100" /></td></tr>) : null}
                    {!loading && filteredEmails.length ? filteredEmails.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900"><Mail className="mr-2 inline h-4 w-4 text-gray-400" />{item.email}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "contacted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status === "contacted" ? "Contacted" : "Unread"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => markEmail(item)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" aria-label="Toggle email status"><CheckCircle2 className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteTarget({ type: "email", ...item })} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete email"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )) : null}
                    {!loading && !filteredEmails.length ? <tr><td colSpan={4} className="px-4 py-14 text-center"><Inbox className="mx-auto h-8 w-8 text-gray-200" /><p className="mt-3 text-sm font-semibold text-gray-500">No emails found</p><p className="mt-1 text-xs text-gray-400">New frontend submissions appear here live.</p></td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title={deleteTarget.type === "content" ? "Reset footer content" : "Delete email"}
          message={deleteTarget.type === "content" ? "Reset footer content back to defaults?" : `Delete ${deleteTarget.email}?`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function validateFooter(values) {
  const errors = {};
  if (!values.label?.trim()) errors.label = "Section label is required.";
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.description?.trim()) errors.description = "Description is required.";
  return errors;
}
