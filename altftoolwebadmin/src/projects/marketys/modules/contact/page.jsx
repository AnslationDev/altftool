"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Eye, Trash2, Archive, RotateCcw, Sparkles, Settings } from "lucide-react";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { emitAlert } from "@/lib/alertBus";
import ResetButton from "../../components/ResetButton";
import EditContactHeroModal from "./components/EditContactHeroModal";

const COLLECTION = "projects/marketys/contacts";
const HERO_COLLECTION = "projects/marketys/contact-page";
const HERO_DOC = "config";

const HERO_INITIAL = {
  hero: {
    badge: "CLIENT ENGAGEMENT PORTAL",
    title: "Let's Start Your Growth Conversation",
    highlight: "Growth Conversation",
    description: "Schedule a strategy review. Get direct insights on channels, affiliate programs, and margins optimization setup from our expert growth desk.",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
  },
};

export default function MarketysContact() {
  const [submissions, setSubmissions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [search, setSearch] = useState("");

  const loadSubmissions = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.date || 0);
        const db = b.createdAt?.toDate?.() || new Date(b.date || 0);
        return db - da;
      });
      setSubmissions(docs);
    } catch {
      setSubmissions([]);
    }
    try {
      const heroSnap = await getDoc(doc(db, HERO_COLLECTION, HERO_DOC));
      setHeroData(heroSnap.exists() ? heroSnap.data() : HERO_INITIAL);
    } catch {
      setHeroData(HERO_INITIAL);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { loadSubmissions(); }, []);

  const handleReset = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id))));
      emitAlert({ type: "success", message: "Contacts reset" });
      loadSubmissions();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this submission?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      emitAlert({ type: "success", message: "Submission deleted" });
      loadSubmissions();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete" });
    }
  };

  const filtered = submissions.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage contact form inquiries</p>
        </div>
        <ResetButton onReset={handleReset} label="Clear All" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search submissions..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {heroData && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Hero Section</h3>
                <p className="text-xs text-gray-500 mt-0.5">{heroData.hero?.title || "..."} | {heroData.hero?.badge || "..."}</p>
              </div>
            </div>
            <button onClick={() => setShowHeroModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
              <Settings className="h-3.5 w-3.5" /> Edit Hero
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{s.company || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{s.budget || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{s.date || s.createdAt?.toDate?.()?.toLocaleDateString?.() || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "new" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
                    {s.status === "new" ? "New" : "Read"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showHeroModal && (
        <EditContactHeroModal
          existingData={heroData}
          onClose={() => setShowHeroModal(false)}
          onSaved={() => { loadSubmissions(); setShowHeroModal(false); }}
        />
      )}
    </div>
  );
}
