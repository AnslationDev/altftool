"use client";

import React, { useState, useEffect } from "react";
import { Heading, Pencil, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function SectionHeadingEditor({ sectionKey, defaultHeading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    eyebrow: defaultHeading?.eyebrow || "",
    title: defaultHeading?.title || "",
    highlight: defaultHeading?.highlight || "",
    subtitle: defaultHeading?.subtitle || "",
  });

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/apexboost/data?section=${sectionKey}`);
        const json = await res.json();
        if (json.success && json.data) {
          setForm({
            eyebrow: json.data.eyebrow ?? defaultHeading?.eyebrow ?? "",
            title: json.data.title ?? defaultHeading?.title ?? "",
            highlight: json.data.highlight ?? defaultHeading?.highlight ?? "",
            subtitle: json.data.subtitle ?? defaultHeading?.subtitle ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load section heading", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, sectionKey, defaultHeading]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, data: form }),
      });
      if (res.ok) {
        emitAlert({ type: "success", title: "Success", message: "Section heading saved!" });
        setIsOpen(false);
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save section heading." });
      }
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error saving section heading." });
    }
  };

  const field = (key, label) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {key === "subtitle" ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
      >
        <Heading size={16} />
        Edit Heading
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Edit Section Heading</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading heading...</div>
            ) : (
              <div className="space-y-4">
                {field("eyebrow", "Eyebrow")}
                {field("title", "Title")}
                {field("highlight", "Highlight (accent text)")}
                {field("subtitle", "Subtitle")}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
              >
                Save Heading
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
