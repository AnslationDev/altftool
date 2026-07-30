"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";
import { createPortfolioItem, deletePortfolioItem, subscribePortfolioItems, updatePortfolioItem } from "../service/apexboost.service";

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: "", client: "", category: "Digital Marketing", result: "", metric: "", image: "" });

  useEffect(() => {
    const unsubscribe = subscribePortfolioItems(
      (data) => setPortfolioItems(data),
      () => emitAlert({ type: "error", title: "Error", message: "Failed to load portfolio items." }),
    );
    return unsubscribe;
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: "", client: "", category: "Digital Marketing", result: "", metric: "", image: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const nextOrder = portfolioItems.length
      ? Math.max(...portfolioItems.map((item) => Number(item.order) || 0)) + 1
      : 1;
    try {
      if (editingItem) {
        await updatePortfolioItem(editingItem.id, { ...form, order: editingItem.order ?? 0 });
      } else {
        await createPortfolioItem({ ...form, order: nextOrder });
      }
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Portfolio item saved successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save portfolio item." });
    }
  };

  const handleDelete = async (item) => {
    try {
      await deletePortfolioItem(item.id);
      emitAlert({ type: "success", title: "Success", message: "Portfolio item deleted successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete portfolio item." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Portfolio</h1>
          <p className="text-gray-600 text-sm mt-1">Showcase your work and case studies</p>
        </div>
        <div className="flex gap-2">
          <SectionHeadingEditor sectionKey="portfolioHeading" defaultHeading={{ eyebrow: "Our Work", title: "Campaigns that", highlight: "move the needle", subtitle: "A curated look at the results we drive across Digital, Affiliate and Advertising marketing." }} />
          <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs mb-1">{item.client}</p>
                <p className="text-gray-600 text-sm mb-3">{item.category}</p>
                <p className="text-(--primary) font-semibold text-sm mb-3">{item.result} ({item.metric})</p>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Portfolio Item</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input type="text" value={form.client} onChange={e => setForm({...form, client: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)">
                  <option>Digital Marketing</option>
                  <option>Advertising</option>
                  <option>Affiliate</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  <input type="text" value={form.result} onChange={e => setForm({...form, result: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                  <input type="text" value={form.metric} onChange={e => setForm({...form, metric: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
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
