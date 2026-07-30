"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { subscribeAboutContent, saveAboutContent } from "../service/apexboost.service";

export default function AboutEditor() {
  const [form, setForm] = useState({
    eyebrow: "", title: "", subtitle: "", image: "",
    badgeTitle: "", badgeSubtitle: "",
    buttonText: "", buttonLink: "", points: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAboutContent(
      (data) => {
        setForm(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", title: "Error", message: "Failed to load Who We Are section." });
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAboutContent(form);
      emitAlert({ type: "success", title: "Success", message: "Who We Are saved successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save Who We Are section." });
    } finally {
      setSaving(false);
    }
  };

  const updatePoint = (index, val) => {
    const newPoints = [...(form.points || [])];
    newPoints[index] = val;
    setForm({ ...form, points: newPoints });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Who We Are Section</h2>
          <p className="text-gray-600 text-sm mt-1">Manage the main intro section</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm">
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
            <input type="text" value={form.eyebrow || ""} onChange={e => setForm({...form, eyebrow: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={form.title || ""} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea rows={3} value={form.subtitle || ""} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" value={form.image || ""} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Title</label>
            <input type="text" value={form.badgeTitle || ""} onChange={e => setForm({...form, badgeTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Subtitle</label>
            <input type="text" value={form.badgeSubtitle || ""} onChange={e => setForm({...form, badgeSubtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input type="text" value={form.buttonText || ""} onChange={e => setForm({...form, buttonText: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
            <input type="text" value={form.buttonLink || ""} onChange={e => setForm({...form, buttonLink: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Bullet Points (4 max recommended)</label>
          <div className="space-y-3">
            {[0,1,2,3].map(i => (
              <input key={i} type="text" value={form.points?.[i] || ""} onChange={e => updatePoint(i, e.target.value)} placeholder={`Point ${i+1}`} className="w-full px-4 py-2 border rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
