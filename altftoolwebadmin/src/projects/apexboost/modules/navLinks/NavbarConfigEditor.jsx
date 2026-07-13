"use client";

import React, { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";

export default function NavbarConfigEditor() {
  const [form, setForm] = useState({
    logoTextFirst: "",
    logoTextSecond: "",
    logoIcon: "",
    buttonText: "",
    buttonLink: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/apexboost/data?section=navbarConfig');
        const json = await res.json();
        if (json.success && json.data) {
          setForm(json.data);
        }
      } catch (err) {
        console.error("Failed to load navbar config", err);
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
        body: JSON.stringify({ section: 'navbarConfig', data: form }),
      });
      if (res.ok) {
        emitAlert({ type: "success", title: "Success", message: "Navbar settings saved!" });
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save navbar settings." });
      }
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error saving navbar settings." });
    }
  };

  if (isLoading) return <div className="p-4 text-center text-sm text-gray-500">Loading settings...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Branding &amp; Actions</h2>
          <p className="text-sm text-gray-500">Customize logo text, icon, and the main navigation button</p>
        </div>
        <button onClick={handleSave} className="bg-(--primary) text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Logo Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text (First Part)</label>
            <input
              type="text"
              value={form.logoTextFirst}
              onChange={e => setForm({ ...form, logoTextFirst: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <p className="text-xs text-gray-500 mt-1">e.g. Apex</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text (Highlighted Part)</label>
            <input
              type="text"
              value={form.logoTextSecond}
              onChange={e => setForm({ ...form, logoTextSecond: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <p className="text-xs text-gray-500 mt-1">e.g. Boost</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Icon URL (Optional)</label>
            <input
              type="text"
              value={form.logoIcon || ""}
              onChange={e => setForm({ ...form, logoIcon: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
              placeholder="https://... (Leave blank for default icon)"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Button Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={form.buttonText}
              onChange={e => setForm({ ...form, buttonText: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
            <input
              type="text"
              value={form.buttonLink}
              onChange={e => setForm({ ...form, buttonLink: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <p className="text-xs text-gray-500 mt-1">e.g. /contact</p>
          </div>
        </div>
      </div>
    </div>
  );
}
