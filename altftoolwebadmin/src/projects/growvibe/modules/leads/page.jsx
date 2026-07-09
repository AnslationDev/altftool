"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Phone,
  Trash2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { emitAlert } from "@/lib/alertBus";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

const LEADS_PATH = ["projects", "growvibe", "leads"];

function formatDate(value) {
  try {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "—";
  }
}

export default function GrowvibeLeadsAdminPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, ...LEADS_PATH), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setLeads(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load leads." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const unreadCount = useMemo(
    () => leads.filter((lead) => lead.status !== "read").length,
    [leads],
  );
  const visible = useMemo(() => {
    if (filter === "unread") return leads.filter((l) => l.status !== "read");
    if (filter === "read") return leads.filter((l) => l.status === "read");
    return leads;
  }, [leads, filter]);

  async function toggleStatus(lead) {
    try {
      await updateDoc(doc(db, ...LEADS_PATH, lead.id), {
        status: lead.status === "read" ? "unread" : "read",
      });
    } catch (error) {
      emitAlert({ type: "error", message: "Could not update lead status." });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, ...LEADS_PATH, deleteTarget.id));
      emitAlert({ type: "success", message: "Lead deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: "Could not delete lead." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Contact form submissions from the GrowVibe website — live.
          </p>
        </div>
        <div className="flex gap-3">
          {[
            ["Total", leads.length, "blue"],
            ["Unread", unreadCount, unreadCount ? "amber" : "green"],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
              <p
                className={`mt-1 text-xl font-black ${
                  tone === "amber" ? "text-amber-500" : tone === "green" ? "text-green-600" : "text-indigo-600"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
              filter === key
                ? "bg-gray-900 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid min-h-[280px] place-items-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <div>
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-500">No leads here yet</p>
            <p className="mt-1 text-xs text-gray-400">
              New contact form submissions will appear automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((lead) => {
            const unread = lead.status !== "read";
            return (
              <article
                key={lead.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  unread ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base font-black text-gray-900">{lead.name || "—"}</h2>
                      {unread ? (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-600">
                          New
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-gray-500">
                          Read
                        </span>
                      )}
                      {lead.service ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                          {lead.service}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-gray-500">
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600">
                        <Mail className="h-3.5 w-3.5" /> {lead.email || "—"}
                      </a>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600">
                          <Phone className="h-3.5 w-3.5" /> {lead.phone}
                        </a>
                      ) : null}
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      {unread ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      {unread ? "Mark read" : "Mark unread"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {lead.message ? (
                  <p className="mt-3 rounded-xl bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-700">
                    {lead.message}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete lead"
          message={`Delete the lead from "${deleteTarget.name || deleteTarget.email}"? This cannot be undone.`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
