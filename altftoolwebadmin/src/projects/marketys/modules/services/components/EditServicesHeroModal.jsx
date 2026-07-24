"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Sparkles, Plus, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/services-page";
const DOC_ID = "config";

const INITIAL = {
  hero: {
    badge: "CAPABILITIES DIRECTORY",
    title: "Channels Designed for",
    highlight: "Scale & Profit",
    description: "Expand your company's potential. Click on any custom marketing channel card below to examine launch roadmaps, setup briefs, and target circular performance metrics.",
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
  },
  stats: [
    { end: 50, prefix: "$", suffix: "M+", label: "Client Spend Managed", color: "text-blue-400" },
    { end: 3, suffix: ".8x", label: "Average Campaign ROAS", color: "text-cyan-400" },
    { end: 99, suffix: ".8%", label: "Attribution Accuracy", color: "text-indigo-400" },
  ],
};

const COLOR_OPTIONS = [
  "text-blue-400", "text-cyan-400", "text-indigo-400", "text-emerald-400",
  "text-amber-400", "text-purple-400", "text-rose-400", "text-teal-400",
];

export default function EditServicesHeroModal({ existingData, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      setForm({
        hero: {
          badge: existingData.hero?.badge || INITIAL.hero.badge,
          title: existingData.hero?.title || INITIAL.hero.title,
          highlight: existingData.hero?.highlight || INITIAL.hero.highlight,
          description: existingData.hero?.description || INITIAL.hero.description,
          bgImage: existingData.hero?.bgImage || INITIAL.hero.bgImage,
        },
        stats: existingData.stats?.length > 0
          ? existingData.stats.map((s) => ({ ...s }))
          : [...INITIAL.stats],
      });
    }
  }, [existingData]);

  const updateHero = (field, value) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateStat = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.stats];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, stats: next };
    });
  };

  const addStat = () => {
    setForm((prev) => ({
      ...prev,
      stats: [...prev.stats, { end: 0, prefix: "", suffix: "", label: "", color: "text-blue-400" }],
    }));
  };

  const removeStat = (index) => {
    setForm((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        hero: form.hero,
        stats: form.stats.filter((s) => s.label.trim()),
        updatedAt: serverTimestamp(),
      });
      emitAlert({ type: "success", message: "Services page hero updated" });
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
          <h2 className="text-lg font-bold text-gray-900">Edit Services Page Hero</h2>
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

          <ImageUpload value={form.hero.bgImage} onChange={(v) => updateHero("bgImage", v)} label="Background Image" folder="marketys/services" />

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Hero Stats Cards</label>
              <button type="button" onClick={addStat}
                className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add Stat</button>
            </div>
            <div className="space-y-3">
              {form.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="flex gap-1">
                      <input value={stat.prefix} onChange={(e) => updateStat(i, "prefix", e.target.value)} placeholder="$"
                        className="w-10 rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none text-center" />
                      <input type="number" value={stat.end} onChange={(e) => updateStat(i, "end", Number(e.target.value))}
                        className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none" />
                      <input value={stat.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} placeholder="M+"
                        className="w-12 rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none text-center" />
                    </div>
                    <input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label"
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none" />
                  </div>
                  <select value={stat.color} onChange={(e) => updateStat(i, "color", e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none">
                    {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c.replace("text-", "").replace("-400", "")}</option>)}
                  </select>
                  {form.stats.length > 1 && (
                    <button type="button" onClick={() => removeStat(i)}
                      className="rounded p-1 text-gray-300 hover:text-red-500 mt-0.5"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
