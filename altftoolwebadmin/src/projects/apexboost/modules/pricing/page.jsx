"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", tagline: "", monthly: 0, yearly: 0, popular: false, features: [""], cta: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await fetch('/api/apexboost/data?section=pricing');
    const json = await res.json();
    if (json.success) setPricingPlans(json.data);
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ id: "", name: "", tagline: "", monthly: 0, yearly: 0, popular: false, features: [""], cta: "" });
    setIsModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingItem(plan);
    setForm({ ...plan, features: [...plan.features] });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    let updated;
    if (editingItem) {
      updated = pricingPlans.map(t => t.id === editingItem.id ? { ...editingItem, ...form } : t);
    } else {
      updated = [...pricingPlans, { ...form, id: form.id || `plan-${Date.now()}` }];
    }
    await fetch('/api/apexboost/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'pricing', data: updated }),
    });
    setPricingPlans(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (item) => {
    const updated = pricingPlans.filter(t => t !== item);
    await fetch('/api/apexboost/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'pricing', data: updated }),
    });
    setPricingPlans(updated);
  };

  const addFeature = () => setForm({...form, features: [...form.features, ""]});
  const updateFeature = (i, v) => {
    const f = [...form.features];
    f[i] = v;
    setForm({...form, features: f});
  };
  const removeFeature = (i) => setForm({...form, features: form.features.filter((_, idx) => idx !== i)});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Pricing</h1>
          <p className="text-gray-600 text-sm mt-1">Configure pricing plans and packages</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="border rounded-xl p-6 hover:shadow-lg transition relative">
              {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--primary) text-white px-3 py-1 rounded-full text-xs font-medium">Popular</span>}
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={24} className="text-(--primary)" />
                <h3 className="font-semibold text-lg">{plan.name}</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{plan.monthly ? `$${plan.monthly}/mo` : plan.yearly ? `$${plan.yearly}/yr` : 'Custom'}</p>
              <p className="text-gray-600 mb-4">{plan.tagline}</p>
              <ul className="space-y-2 mb-6">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => openEdit(plan)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(plan)} className="p-2 border rounded-lg hover:bg-red-50">
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
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Add'} Pricing Plan</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan ID</label>
                  <input type="text" value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                  <input type="number" value={form.monthly || ''} onChange={e => setForm({...form, monthly: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price</label>
                  <input type="number" value={form.yearly || ''} onChange={e => setForm({...form, yearly: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.popular} onChange={e => setForm({...form, popular: e.target.checked})} className="w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">Mark as Popular</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                <input type="text" value={form.cta} onChange={e => setForm({...form, cta: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button type="button" onClick={addFeature} className="text-sm text-(--primary) hover:underline">+ Add Feature</button>
                </div>
                {form.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={f} onChange={e => updateFeature(i, e.target.value)} placeholder="Feature" className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                    <button onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </div>
                ))}
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
