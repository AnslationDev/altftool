"use client";

import React, { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";
import { subscribeAboutHero, saveAboutHero } from "../service/apexboost.service";

export default function AboutHeroEditor() {
  const [form, setForm] = useState({
    eyebrow: "",
    title: "",
    descLeft: "",
    descRight: "",
    buttonText: "",
    buttonLink: "",
    image: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAboutHero(
      (data) => {
        setForm(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to load about hero", err);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    try {
      await saveAboutHero(form);
      emitAlert({ type: "success", title: "Success", message: "About Hero saved successfully!" });
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Failed to save About Hero." });
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">About Hero Section</h2>
          <p className="text-sm text-gray-500">The main banner describing what you do</p>
        </div>
        <button onClick={handleSave} className="bg-(--primary) text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
            <input
              type="text"
              value={form.eyebrow}
              onChange={e => setForm({ ...form, eyebrow: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (supports HTML like &amp;)</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Left Description</label>
            <textarea
              rows={4}
              value={form.descLeft}
              onChange={e => setForm({ ...form, descLeft: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Right Description</label>
            <textarea
              rows={4}
              value={form.descRight}
              onChange={e => setForm({ ...form, descRight: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
