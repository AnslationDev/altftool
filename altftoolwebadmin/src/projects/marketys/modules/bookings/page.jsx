"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Eye, Trash2, Sparkles, Settings, X } from "lucide-react";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { emitAlert } from "@/lib/alertBus";
import ImageUpload from "../../components/ImageUpload";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/bookings";
const CONFIG_COLLECTION = "projects/marketys/bookings-page";
const CONFIG_DOC = "config";

const CONFIG_INITIAL = {
  booking: {
    ctaText: "Book a Schedule",
    modalTitle: "Book a Schedule",
    modalDescription: "Select your preferred slot and details below. We will send a confirmation link to your email.",
    submitText: "Confirm Schedule",
    successTitle: "Schedule Confirmed!",
    successMessage: "Thank you, {name}. We've sent a calendar invitation and confirmation details to {email}.",
  },
};

export default function MarketysBookings() {
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [config, setConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [search, setSearch] = useState("");

  const loadBookings = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.date || 0);
        const db = b.createdAt?.toDate?.() || new Date(b.date || 0);
        return db - da;
      });
      setBookings(docs);
    } catch {
      setBookings([]);
    }
    try {
      const cfgSnap = await getDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC));
      setConfig(cfgSnap.exists() ? cfgSnap.data() : CONFIG_INITIAL);
    } catch {
      setConfig(CONFIG_INITIAL);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleReset = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id))));
      emitAlert({ type: "success", message: "Bookings reset" });
      loadBookings();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      emitAlert({ type: "success", message: "Booking deleted" });
      loadBookings();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete" });
    }
  };

  const filtered = bookings.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage schedule booking requests</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={handleReset} label="Clear All" />
          {config && (
            <button onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <Settings className="h-4 w-4" /> Booking Content
            </button>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.email}</td>
                <td className="px-4 py-3 text-gray-500">{b.date || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{b.time || "-"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{b.message || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{b.createdAt?.toDate?.()?.toLocaleDateString?.() || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No bookings yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfigModal && config && (
        <EditBookingConfigModal
          existingData={config}
          onClose={() => setShowConfigModal(false)}
          onSaved={() => { loadBookings(); setShowConfigModal(false); }}
        />
      )}
    </div>
  );
}

function EditBookingConfigModal({ existingData, onClose, onSaved }) {
  const [form, setForm] = useState(CONFIG_INITIAL.booking);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData?.booking) {
      setForm({ ...CONFIG_INITIAL.booking, ...existingData.booking });
    }
  }, [existingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC), {
        booking: form,
        updatedAt: new Date().toISOString(),
      });
      emitAlert({ type: "success", message: "Booking content updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to save" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Booking Content</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Button Text</label>
            <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Modal Title</label>
            <input value={form.modalTitle} onChange={(e) => setForm({ ...form, modalTitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Modal Description</label>
            <textarea value={form.modalDescription} onChange={(e) => setForm({ ...form, modalDescription: e.target.value })} rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Submit Button Text</label>
            <input value={form.submitText} onChange={(e) => setForm({ ...form, submitText: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Success Title</label>
            <input value={form.successTitle} onChange={(e) => setForm({ ...form, successTitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Success Message (use {`{name}`} and {`{email}`} placeholders)</label>
            <textarea value={form.successMessage} onChange={(e) => setForm({ ...form, successMessage: e.target.value })} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              Save Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


