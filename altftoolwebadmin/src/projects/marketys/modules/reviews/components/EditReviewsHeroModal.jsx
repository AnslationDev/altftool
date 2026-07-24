"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/reviews-page";
const DOC_ID = "config";

const INITIAL = {
  hero: {
    badge: "Verified platform reviews",
    title: "Real Reviews from Real Marketers",
    description: "Compare tools with honest insights, user feedback, and measurable outcomes.",
    stats: [
      { value: "4.8/5", label: "Average Rating", sub: "Across top marketing tools" },
      { value: "100%", label: "Verified Reviews", sub: "Every review is checked for trust" },
      { value: "Weekly", label: "Updated Weekly", sub: "Fresh insights on new deals" },
    ],
    featuredReview: {
      quote: "MarketyDeals saved us over $1,200 on our marketing stack this year. The verified ratings and direct discounts make it the ultimate resource for growth teams.",
      author: "Alex J.",
      role: "Growth Director @ SaaS Metrics",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    },
  },
};

export default function EditReviewsHeroModal({ existingData, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      const e = existingData.hero || {};
      setForm({
        hero: {
          badge: e.badge || INITIAL.hero.badge,
          title: e.title || INITIAL.hero.title,
          description: e.description || INITIAL.hero.description,
          stats: e.stats?.length > 0 ? e.stats.map((s) => ({ ...s })) : [...INITIAL.hero.stats],
          featuredReview: {
            quote: e.featuredReview?.quote || INITIAL.hero.featuredReview.quote,
            author: e.featuredReview?.author || INITIAL.hero.featuredReview.author,
            role: e.featuredReview?.role || INITIAL.hero.featuredReview.role,
            avatar: e.featuredReview?.avatar || INITIAL.hero.featuredReview.avatar,
          },
        },
      });
    }
  }, [existingData]);

  const updateHero = (field, value) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateFeature = (field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: { ...prev.hero, featuredReview: { ...prev.hero.featuredReview, [field]: value } },
    }));
  };

  const updateStat = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.hero.stats];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, hero: { ...prev.hero, stats: next } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        hero: form.hero,
        updatedAt: serverTimestamp(),
      });
      emitAlert({ type: "success", message: "Reviews page hero updated" });
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
          <h2 className="text-lg font-bold text-gray-900">Edit Reviews Page Hero</h2>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input value={form.hero.title} onChange={(e) => updateHero("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.hero.description} onChange={(e) => updateHero("description", e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Stats Cards</label>
            <div className="space-y-3">
              {form.hero.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Value"
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none" />
                    <input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label"
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none" />
                    <input value={stat.sub} onChange={(e) => updateStat(i, "sub", e.target.value)} placeholder="Sub text"
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Featured Expert Review</label>
            <div className="space-y-3">
              <textarea value={form.hero.featuredReview.quote} onChange={(e) => updateFeature("quote", e.target.value)} rows={3}
                placeholder="Review quote"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.hero.featuredReview.author} onChange={(e) => updateFeature("author", e.target.value)}
                  placeholder="Author name"
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                <input value={form.hero.featuredReview.role} onChange={(e) => updateFeature("role", e.target.value)}
                  placeholder="Author role"
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <ImageUpload value={form.hero.featuredReview.avatar} onChange={(v) => updateFeature("avatar", v)} label="Author Avatar" folder="marketys/reviews" />
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
