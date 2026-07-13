"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Menu } from "lucide-react";
import NavbarConfigEditor from "./NavbarConfigEditor";
import FooterConfigEditor from "./FooterConfigEditor";

export default function NavLinksPage() {
  const [navList, setNavList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ to: "", label: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await fetch('/api/apexboost/data?section=navLinks');
    const json = await res.json();
    if (json.success) setNavList(json.data);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ to: "", label: "" });
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
      updated = navList.map(t => t === editingItem ? { ...editingItem, ...form } : t);
    } else {
      updated = [...navList, { ...form }];
    }
    await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'navLinks', data: updated }),
    });
    setNavList(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (item) => {
    const updated = navList.filter(t => t !== item);
    await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'navLinks', data: updated }),
    });
    setNavList(updated);
  };

  return (
    <div className="space-y-6">
      <NavbarConfigEditor />
      <FooterConfigEditor />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Navigation Links</h1>
          <p className="text-gray-600 text-sm mt-1">Manage navigation menu links</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
          <Plus size={16} /> Add Link
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="space-y-2">
          {navList.map((item, index) => (
            <div key={index} className="flex items-center gap-3 border rounded-lg p-4 hover:shadow-md transition">
              <Menu size={20} className="text-gray-400" />
              <div className="flex-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-gray-500 text-sm ml-3">{item.to}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit size={18} className="text-gray-600" />
                </button>
                <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 rounded-lg">
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
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Nav Link</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                  <input type="text" value={form.to} onChange={e => setForm({...form, to: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
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
