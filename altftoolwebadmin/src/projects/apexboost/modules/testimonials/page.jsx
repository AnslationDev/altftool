"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import SectionHeadingEditor from "../../../../components/admin/SectionHeadingEditor";
import { emitAlert } from "@/lib/alertBus";
import {
  subscribeTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../service/apexboost.service";

export default function TestimonialsPage() {
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", company: "", rating: 5, quote: "", color: "from-brand to-brand-cyan", image: "" });

  useEffect(() => {
    const unsubscribe = subscribeTestimonials(
      (data) => setTestimonialsList(data),
      () => emitAlert({ type: "error", title: "Error", message: "Failed to load testimonials." }),
    );
    return unsubscribe;
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", role: "", company: "", rating: 5, quote: "", color: "from-brand to-brand-cyan", image: "" });
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
        await updateTestimonial(editingItem.id, { ...editingItem, ...form });
      } else {
        await createTestimonial({
          ...form,
          name: form.name || `Testimonial ${testimonialsList.length + 1}`,
          order: testimonialsList.length,
        });
      }
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Testimonial saved successfully!" });
    } catch (error) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save testimonial." });
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteTestimonial(item.id);
      emitAlert({ type: "success", title: "Success", message: "Testimonial deleted successfully!" });
    } catch (error) {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete testimonial." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Testimonials</h1>
          <p className="text-gray-600 text-sm mt-1">Manage customer testimonials and reviews</p>
        </div>
        <div className="flex gap-2">
          <SectionHeadingEditor sectionKey="testimonialsHeading" defaultHeading={{ eyebrow: "Client Reviews", title: "Trusted by brands that", highlight: "demand results", subtitle: "Real words from real clients — brands that came to us for growth and found a long-term partner." }} />
          <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialsList.map((testimonial, index) => (
            <div key={index} className="border rounded-xl p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {testimonial.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(testimonial)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(testimonial)} className="p-2 border rounded-lg hover:bg-red-50">
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
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Testimonial</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                <textarea rows={3} value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value) || 5})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
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
