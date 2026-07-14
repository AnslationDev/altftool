"use client";

import React, { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";

export default function FooterConfigEditor() {
  const [form, setForm] = useState({
    subscribeTitle: "",
    subscribeDesc: "",
    companyDesc: "",
    address: "",
    email: "",
    phone: "",
    copyright: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/apexboost/data?section=footerConfig');
        const json = await res.json();
        if (json.success && json.data) {
          setForm(json.data);
        }
      } catch (err) {
        console.error("Failed to load footer config", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/apexboost/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'footerConfig', data: form }),
      });
      if (res.ok) {
        emitAlert({ type: "success", title: "Success", message: "Footer settings saved!" });
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save footer settings." });
      }
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error saving footer settings." });
    }
  };

  if (isLoading) return <div className="p-4 text-center text-sm text-gray-500">Loading footer settings...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Footer Configuration</h2>
          <p className="text-sm text-gray-500">Customize the text, description, and contact info in the footer</p>
        </div>
        <button onClick={handleSave} className="bg-(--primary) text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          Save Footer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Newsletter / Subscribe Section</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (supports HTML)</label>
            <input
              type="text"
              value={form.subscribeTitle}
              onChange={e => setForm({ ...form, subscribeTitle: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.subscribeDesc}
              onChange={e => setForm({ ...form, subscribeDesc: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>

          <h3 className="font-semibold text-gray-700 mt-6">Company Info</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description (Below Logo)</label>
            <textarea
              rows={3}
              value={form.companyDesc}
              onChange={e => setForm({ ...form, companyDesc: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Contact &amp; Copyright</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
            <input
              type="text"
              value={form.copyright}
              onChange={e => setForm({ ...form, copyright: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
