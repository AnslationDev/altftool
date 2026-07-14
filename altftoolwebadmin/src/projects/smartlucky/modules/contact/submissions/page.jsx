"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, User, Phone, MessageSquare, Clock, Eye, Download, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { fetchContactSubmissions, saveContactSubmissions } from "../shared/contactSubmissionsService";
import { Field, TextArea } from "../shared/fields";

const clone = (v) => JSON.parse(JSON.stringify(v));

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchContactSubmissions();
        if (active) setSubmissions(data);
      } catch (err) {
        emitAlert({ type: "error", title: "Failed to load", message: err?.message });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this submission?")) return;
    setDeletingId(id);
    try {
      const next = submissions.filter((s) => s.id !== id);
      await saveContactSubmissions(next);
      setSubmissions(next);
      emitAlert({ type: "success", title: "Deleted", message: "Submission removed." });
    } catch (err) {
      emitAlert({ type: "error", title: "Delete failed", message: err?.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ["ID", "Name", "Email", "Company", "Phone", "Service", "Message", "Submitted At"],
      ...submissions.map((s) => [
        s.id,
        s.name,
        s.email,
        s.company,
        s.phone || "",
        s.service,
        s.message.replace(/\n/g, " ").slice(0, 200),
        s.submittedAt?.toDate ? s.submittedAt.toDate().toISOString() : new Date(s.submittedAt).toISOString(),
      ]),
    ].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading submissions…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Contact Form Submissions</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">View and manage all contact form entries.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {selectedSubmission ? (
        <DetailView submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-soft)]">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">No submissions yet.</td>
                  </tr>
                ) : (
                  submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                      <td className="p-3 font-medium text-[var(--foreground)]">{s.name}</td>
                      <td className="p-3">
                        <a href={`mailto:${s.email}`} className="text-[var(--primary)] hover:underline">{s.email}</a>
                      </td>
                      <td className="p-3 text-[var(--muted)]">{s.company || "—"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {s.service}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {s.submittedAt?.toDate ? s.submittedAt.toDate().toLocaleString() : new Date(s.submittedAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setSelectedSubmission(s)}
                            className="inline-flex items-center gap-1 rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deletingId === s.id}
                            className="inline-flex items-center gap-1 rounded-lg p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-50/10 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailView({ submission, onClose }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)]">Submission Details</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">{submission.name} <{submission.email}></p>
          </div>
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
            Back to list
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <DetailRow label="ID" value={submission.id} />
        <DetailRow label="Name" value={submission.name} icon={User} />
        <DetailRow label="Email" value={submission.email} icon={Mail} copyable />
        <DetailRow label="Company" value={submission.company || "—"} icon={MessageSquare} />
        <DetailRow label="Phone" value={submission.phone || "—"} icon={Phone} copyable />
        <DetailRow label="Service" value={submission.service} icon={MessageSquare} />
        <DetailRow label="Submitted" value={submission.submittedAt?.toDate ? submission.submittedAt.toDate().toLocaleString() : new Date(submission.submittedAt).toLocaleString()} icon={Clock} />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Message</h4>
          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{submission.message}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon, copyable }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
          <p className="text-sm text-[var(--foreground)] break-words">{value}</p>
        </div>
        {copyable && value && value !== "—" && (
          <button
            onClick={() => { navigator.clipboard.writeText(value); emitAlert({ type: "success", title: "Copied", message: `${label} copied to clipboard.` }); }}
            className="flex-shrink-0 rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
            title="Copy"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}