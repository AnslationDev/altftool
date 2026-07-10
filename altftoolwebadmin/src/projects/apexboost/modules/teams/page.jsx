"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function TeamsPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", email: "" });

  useEffect(() => {
    const res = fetch('/api/apexboost/data?section=teams').then(r => r.json()).then(j => {
      if (j.success) setTeamMembers(j.data);
    }).catch(() => {
      setTeamMembers([
        { id: 1, name: "John Doe", role: "CEO", email: "john@example.com" },
        { id: 2, name: "Jane Smith", role: "CTO", email: "jane@example.com" },
      ]);
    });
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", role: "", email: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    let updated;
    if (editingItem) {
      updated = teamMembers.map(t => t.id === editingItem.id ? { ...editingItem, ...form } : t);
    } else {
      updated = [...teamMembers, { ...form, id: Date.now() }];
    }
    try {
      await fetch('/api/apexboost/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'teams', data: updated }),
      });
    } catch {}
    setTeamMembers(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (item) => {
    const updated = teamMembers.filter(t => t.id !== item.id);
    try {
      await fetch('/api/apexboost/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'teams', data: updated }),
      });
    } catch {}
    setTeamMembers(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Teams</h1>
          <p className="text-gray-600 text-sm mt-1">Manage team members and roles</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="border rounded-xl p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{member.email}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(member)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(member)} className="p-2 border rounded-lg hover:bg-red-50">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Team Member</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSave} className="bg-(--primary) text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
