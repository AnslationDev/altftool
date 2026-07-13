"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GitBranch } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";

export default function ProcessPage() {
  const [processList, setProcessList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: "", desc: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await fetch('/api/apexboost/data?section=process');
    const json = await res.json();
    if (json.success) setProcessList(json.data);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", desc: "" });
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
      updated = processList.map(t => t === editingItem ? { ...editingItem, ...form } : t);
    } else {
      updated = [...processList, { ...form }];
    }
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'process', data: updated }),
    });
    if (res.ok) {
      setProcessList(updated);
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Process step saved successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to save process step." });
    }
  };

  const handleDelete = async (item) => {
    const updated = processList.filter(t => t !== item);
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'process', data: updated }),
    });
    if (res.ok) {
      setProcessList(updated);
      emitAlert({ type: "success", title: "Success", message: "Process step deleted successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete process step." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Process</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your delivery process steps</p>
        </div>
        <div className="flex gap-2">
          <SectionHeadingEditor sectionKey="processHeading" defaultHeading={{ eyebrow: "Our Process", title: "A proven path from idea to impact", highlight: "", subtitle: "Eight disciplined steps that turn raw ambition into predictable, scalable marketing growth." }} />
          <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Step
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processList.map((step, index) => (
            <div key={index} className="border rounded-xl p-6 hover:shadow-lg transition text-center">
              <GitBranch size={32} className="text-(--primary) mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{index + 1}. {step.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{step.desc}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => openEdit(step)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit size={18} className="text-gray-600" />
                </button>
                <button onClick={() => handleDelete(step)} className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Process Step</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
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
