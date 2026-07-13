"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function CTAPage() {
  const [form, setForm] = useState({
    badge: "",
    title: "",
    desc: "",
    button1Text: "",
    button1Link: "",
    button2Text: "",
    button2Link: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/apexboost/data?section=cta");
    const json = await res.json();
    if (json.success && json.data) {
      setForm(json.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "cta", data: form }),
      });
      if (res.ok) {
        emitAlert({ type: "success", title: "Success", message: "Call to Action saved successfully!" });
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save Call to Action." });
      }
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", title: "Error", message: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Call to Action</h1>
          <p className="text-gray-600 text-sm mt-1">Edit the main CTA section at the bottom of the page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-4xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Eyebrow)</label>
          <input
            type="text"
            value={form.badge || ""}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            placeholder="e.g. Your growth starts today"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            placeholder="e.g. Ready to turn marketing into your biggest growth lever?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.desc || ""}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            placeholder="e.g. Join 520+ brands scaling with ApexBoost..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Primary Button</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={form.button1Text || ""}
                  onChange={(e) => setForm({ ...form, button1Text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={form.button1Link || ""}
                  onChange={(e) => setForm({ ...form, button1Link: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Secondary Button</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={form.button2Text || ""}
                  onChange={(e) => setForm({ ...form, button2Text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={form.button2Link || ""}
                  onChange={(e) => setForm({ ...form, button2Link: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
