"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ThumbsUp } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";
import AboutEditor from "./AboutEditor";
import AboutPillarsEditor from "./AboutPillarsEditor";
import AboutHeroEditor from "./AboutHeroEditor";

export default function WhyChooseUsPage() {
  const [wcuList, setWcuList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: "", desc: "", image: "" });
  const [activeTab, setActiveTab] = useState("wcu");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await fetch('/api/apexboost/data?section=whyChooseUs');
    const json = await res.json();
    if (json.success) setWcuList(json.data);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", desc: "", image: "" });
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
      updated = wcuList.map(t => t === editingItem ? { ...editingItem, ...form } : t);
    } else {
      updated = [...wcuList, { ...form }];
    }
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'whyChooseUs', data: updated }),
    });
    if (res.ok) {
      setWcuList(updated);
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Item saved successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to save item." });
    }
  };

  const handleDelete = async (item) => {
    const updated = wcuList.filter(t => t !== item);
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'whyChooseUs', data: updated }),
    });
    if (res.ok) {
      setWcuList(updated);
      emitAlert({ type: "success", title: "Success", message: "Item deleted successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete item." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('wcu')}
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'wcu' ? 'border-b-2 border-(--primary) text-(--primary)' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Why Choose Us Cards
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'about' ? 'border-b-2 border-(--primary) text-(--primary)' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Who We Are Content
        </button>
      </div>

      {/* Why Choose Us Tab */}
      {activeTab === 'wcu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Manage Why Choose Us</h1>
              <p className="text-gray-600 text-sm mt-1">Manage value propositions and selling points</p>
            </div>
            <div className="flex gap-2">
              <SectionHeadingEditor
                sectionKey="whyChooseUsHeading"
                defaultHeading={{ eyebrow: "Why Choose Us", title: "The growth partner brands actually trust", highlight: "", subtitle: "We're not just another agency. We're an extension of your team — accountable, transparent and relentlessly focused on your results." }}
              />
              <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wcuList.map((item, index) => (
                <div key={index} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp size={20} className="text-(--primary)" />
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Who We Are Tab */}
      {activeTab === 'about' && (
        <div className="space-y-12">
          <AboutHeroEditor />
          <div className="border-t pt-8">
            <AboutEditor />
          </div>
          <div className="border-t pt-8">
            <AboutPillarsEditor />
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Value Proposition</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={form.image || ""} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                {form.image && (
                  <div className="mt-2">
                    <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={e => { e.target.style.display = "none"; }} />
                  </div>
                )}
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
