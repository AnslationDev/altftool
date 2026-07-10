"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/contact-page";
const DOC_ID = "config";

const INITIAL = {
  hero: {
    badge: "CLIENT ENGAGEMENT PORTAL",
    title: "Let's Start Your Growth Conversation",
    highlight: "Growth Conversation",
    description: "Schedule a strategy review. Get direct insights on channels, affiliate programs, and margins optimization setup from our expert growth desk.",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
  },
};

export default function EditContactHeroModal({ existingData, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      const e = existingData.hero || {};
      setForm({
        hero: {
          badge: e.badge || INITIAL.hero.badge,
          title: e.title || INITIAL.hero.title,
          highlight: e.highlight || INITIAL.hero.highlight,
          description: e.description || INITIAL.hero.description,
          bgImage: e.bgImage || INITIAL.hero.bgImage,
        },
      });
    }
  }, [existingData]);

  const updateHero = (field, value) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        hero: form.hero,
        updatedAt: serverTimestamp(),
      });
      emitAlert({ type: "success", message: "Contact page hero updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to save" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Contact Page Hero</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
            <input value={form.hero.badge} onChange={(e) => updateHero("badge", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input value={form.hero.title} onChange={(e) => updateHero("title", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Highlight (colored span)</label>
              <input value={form.hero.highlight} onChange={(e) => updateHero("highlight", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.hero.description} onChange={(e) => updateHero("description", e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>

          <ImageUpload value={form.hero.bgImage} onChange={(v) => updateHero("bgImage", v)} label="Background Image" folder="marketys/contact" />

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Hero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
