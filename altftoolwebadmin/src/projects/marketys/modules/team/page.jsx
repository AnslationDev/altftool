"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search, Pencil, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import AddTeamMemberModal from "./components/AddTeamMemberModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/team";

export default function MarketysTeam() {
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const loadMembers = async () => {
    try {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      setMembers([
        { id: "marcus", name: "Marcus Vance", role: "CEO & Co-Founder", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", bio: "Former growth director at Google with 15+ years of digital marketing innovation.", active: true },
        { id: "sarah", name: "Sarah Sterling", role: "Chief of Growth & Strategy", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", bio: "Affiliate network scaling specialist who has directed $100M+ in advertising spend.", active: true },
        { id: "david", name: "David Reyes", role: "VP of Paid Media", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", bio: "Former Meta & Google certified media buyer. Managed $50M+ in annual ad budgets.", active: true },
        { id: "elena", name: "Elena Torres", role: "Head of Analytics & Attribution", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", bio: "Server-side tracking architect specializing in GTM, Conversion APIs, and custom BI dashboards.", active: true },
      ]);
    } finally {
      setLoaded(true);
    }
  };

  if (!loaded) loadMembers();

  const handleSave = () => loadMembers();
  const handleEdit = (m) => { setEditMember(m); setShowModal(true); };
  const handleAdd = () => { setEditMember(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditMember(null); };

  const handleReset = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id))));
      emitAlert({ type: "success", message: "Team reset to defaults" });
      loadMembers();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this team member?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      emitAlert({ type: "success", message: "Member deleted" });
      loadMembers();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete member" });
    }
  };

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members displayed on About page</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={handleReset} />
          <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {m.avatar && (
                      <img src={m.avatar} alt="" className="h-8 w-8 rounded-full border border-gray-200 object-cover" />
                    )}
                    <span className="font-medium text-gray-900">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.active !== false ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {m.active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(m)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddTeamMemberModal existingMember={editMember} onClose={handleClose} onSaved={handleSave} />
      )}
    </div>
  );
}
