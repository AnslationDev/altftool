"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MessageSquare } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";
import { subscribeFaqItems, createFaqItem, updateFaqItem, deleteFaqItem } from "../service/apexboost.service";

export default function FaqPage() {
  const [faqList, setFaqList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ q: "", a: "" });

  useEffect(() => {
    const unsubscribe = subscribeFaqItems(
      (data) => setFaqList(data),
      () => emitAlert({ type: "error", title: "Error", message: "Failed to load FAQ." }),
    );
    return unsubscribe;
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ q: "", a: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await updateFaqItem(editingItem.id, { ...editingItem, ...form });
      } else {
        const nextOrder = faqList.length
          ? Math.max(...faqList.map((item) => Number(item.order) || 0)) + 1
          : 0;
        await createFaqItem({ ...form, order: nextOrder });
      }
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "FAQ saved successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save FAQ." });
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteFaqItem(item.id);
      emitAlert({ type: "success", title: "Success", message: "FAQ deleted successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete FAQ." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage FAQ</h1>
          <p className="text-gray-600 text-sm mt-1">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-2">
          <SectionHeadingEditor sectionKey="faqHeading" defaultHeading={{ eyebrow: "FAQ", title: "Answers to your", highlight: "growth questions", subtitle: "Everything you need to know about working with us across Digital, Affiliate and Advertising marketing." }} />
          <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add FAQ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="space-y-4">
          {faqList.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-(--primary) mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-gray-600 text-sm">{item.a}</p>
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
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} FAQ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input type="text" value={form.q} onChange={e => setForm({...form, q: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea rows={4} value={form.a} onChange={e => setForm({...form, a: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
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
