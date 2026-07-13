"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function FeaturesPage() {
  const [featuresList, setFeaturesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: "", desc: "", image: "" });
  const [isHeadingModalOpen, setIsHeadingModalOpen] = useState(false);
  const [headingForm, setHeadingForm] = useState({ eyebrow: "", title: "", highlight: "", subtitle: "" });


  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await fetch('/api/apexboost/data?section=features');
    const json = await res.json();
    if (json.success) setFeaturesList(json.data);
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
      updated = featuresList.map(t => t === editingItem ? { ...editingItem, ...form } : t);
    } else {
      updated = [...featuresList, { ...form }];
    }
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'features', data: updated }),
    });
    if (res.ok) {
      setFeaturesList(updated);
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Feature saved successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to save feature." });
    }
  };

  const handleDelete = async (item) => {
    const updated = featuresList.filter(t => t !== item);
    const res = await fetch('/api/apexboost/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'features', data: updated }),
    });
    if (res.ok) {
      setFeaturesList(updated);
      emitAlert({ type: "success", title: "Success", message: "Feature deleted successfully!" });
    } else {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete feature." });
    }
  };

  const loadHeadingData = async () => {
    try {
      const res = await fetch("/api/apexboost/data?section=featuresHeading");
      const json = await res.json();
      if (json.success && json.data) {
        setHeadingForm({
          eyebrow: json.data.eyebrow || "",
          title: json.data.title || "",
          highlight: json.data.highlight || "",
          subtitle: json.data.subtitle || "",
        });
      }
    } catch (err) {
      console.error("Failed to load heading data:", err);
    }
  };

  const openHeadingEditor = () => {
    loadHeadingData();
    setIsHeadingModalOpen(true);
  };

  const handleSaveHeading = async () => {
    const data = {
      eyebrow: headingForm.eyebrow,
      title: headingForm.title,
      highlight: headingForm.highlight,
      subtitle: headingForm.subtitle,
    };
    try {
      const res = await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "featuresHeading", data }),
      });
      if (res.ok) {
        setIsHeadingModalOpen(false);
        emitAlert({ type: "success", title: "Success", message: "Heading saved successfully!" });
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save heading." });
      }
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save heading." });
      console.error("Failed to save heading data:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Features</h1>
          <p className="text-gray-600 text-sm mt-1">Manage key features and highlights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openHeadingEditor} className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            <Edit size={16} /> Main Heading
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Feature
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feature, index) => (
            <div key={index} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
              {feature.image && (
                <div className="relative h-40 bg-gray-100">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Layers size={20} className="text-(--primary) shrink-0" />
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{feature.desc}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(feature)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(feature)} className="p-2 border rounded-lg hover:bg-red-50">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Feature</h2>
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
                <input type="text" value={form.image || ""} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
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

      {isHeadingModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Features Main Heading Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
                <input type="text" value={headingForm.eyebrow} onChange={e => setHeadingForm({...headingForm, eyebrow: e.target.value})} placeholder="Platform Features" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={headingForm.title} onChange={e => setHeadingForm({...headingForm, title: e.target.value})} placeholder="Marketing intelligence," className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlight</label>
                <input type="text" value={headingForm.highlight} onChange={e => setHeadingForm({...headingForm, highlight: e.target.value})} placeholder="in real time" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Description</label>
                <textarea rows={3} value={headingForm.subtitle} onChange={e => setHeadingForm({...headingForm, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsHeadingModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveHeading} className="bg-(--primary) text-white px-4 py-2 rounded">Save Heading</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
