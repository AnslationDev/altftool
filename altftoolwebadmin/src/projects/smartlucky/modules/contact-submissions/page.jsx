"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, MapPin, MessageSquare, Eye, Download, Trash2, Calendar } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { getModuleDocRef } from "../shared/collectionService";
import { getDoc, setDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { SMARTLUCKY_PROJECT_ROOT } from "@altftool/core/firebasePaths";

const SUBMISSIONS_DOC = doc(db, ...SMARTLUCKY_PROJECT_ROOT, "contact", "submissions");

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(SUBMISSIONS_DOC);
        if (active) setSubmissions(snap.exists() ? (snap.data().items || []) : []);
      } catch (err) {
        if (active) emitAlert({ type: "error", title: "Load failed", message: err?.message });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this submission?")) return;
    setDeleting(id);
    try {
      const next = submissions.filter((s) => s.id !== id);
      await setDoc(SUBMISSIONS_DOC, { items: next, updatedAt: serverTimestamp() }, { merge: true });
      setSubmissions(next);
      emitAlert({ type: "success", title: "Deleted", message: "Submission removed." });
    } catch (err) {
      emitAlert({ type: "error", title: "Delete failed", message: err?.message });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  if (loading) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading submissions…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div>
          <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Contact Form Submissions</h1>
          <p className="mt-0.5 text-xs text-[var(--muted)]">All form submissions from the Contact page.</p>
        </div>
      </div>

      {selected ? (
        <article className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <header className="border-b border-[var(--border)] p-4 sm:p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--foreground)]">Submission Details</h2>
              <p className="text-xs text-[var(--muted)]">Received {formatDate(selected.submittedAt)}</p>
            </div>
            <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
              <Eye className="w-3.5 h-3.5" /> Back to list
            </button>
          </header>
          <div className="p-4 sm:p-6 space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">Name</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{selected.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">Email</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]"><a href={`mailto:${selected.email}`} className="text-[var(--primary)] hover:underline">{selected.email}</a></dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">Company</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{selected.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">Phone</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{selected.phone || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[var(--muted)]">Service</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{selected.service || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-[var(--muted)]">Submitted</dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{formatDate(selected.submittedAt)}</dd>
              </div>
            </dl>
            <div>
              <dt className="text-xs font-semibold text-[var(--muted)]">Message</dt>
              <dd className="mt-2 whitespace-pre-wrap text-[var(--foreground)] bg-[var(--surface-soft)] rounded-xl p-4">{selected.message}</dd>
            </div>
          </div>
          <footer className="border-t border-[var(--border)] p-4 flex justify-end">
            <button onClick={() => handleDelete(selected.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </footer>
        </article>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--muted)]">
          <MessageSquare className="w-14 h-14 mb-4 opacity-30" />
          <p className="font-medium">No submissions yet</p>
          <p className="text-sm mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-soft)]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--surface-soft)] transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{formatDate(s.submittedAt)}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{s.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{s.email}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{s.company || "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{s.service || "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted)] max-w-xs truncate">{s.message?.slice(0, 80)}…</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(s); }} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}