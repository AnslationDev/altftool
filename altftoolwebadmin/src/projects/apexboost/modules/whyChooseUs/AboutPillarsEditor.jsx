"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function AboutPillarsEditor() {
  const [list, setList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: "", desc: "", icon: "Target" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/apexboost/data?section=aboutPillars");
    const json = await res.json();
    if (json.success && json.data) {
      setList(json.data);
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", desc: "", icon: "Target" });
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
      updated = list.map(t => t === editingItem ? { ...editingItem, ...form } : t);
    } else {
      updated = [...list, { ...form }];
    }
    const res = await fetch("/api/apexboost/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "aboutPillars", data: updated }),
    });
    if (res.ok) {
      setList(updated);
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Pillar saved successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to save pillar." });
    }
  };

  const handleDelete = async (item) => {
    const updated = list.filter(t => t !== item);
    const res = await fetch("/api/apexboost/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "aboutPillars", data: updated }),
    });
    if (res.ok) {
      setList(updated);
      emitAlert({ type: "success", title: "Success", message: "Pillar deleted successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete pillar." });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Who We Are - Pillars</h2>
          <p className="text-gray-600 text-sm mt-1">Manage Mission, Vision, Goals cards</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm">
          <Plus size={16} /> Add Pillar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item, index) => (
            <div key={index} className="border rounded-xl p-4 hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} className="text-(--primary)" />
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(item)} className="p-2 border rounded-lg hover:bg-red-50">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Pillar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
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
