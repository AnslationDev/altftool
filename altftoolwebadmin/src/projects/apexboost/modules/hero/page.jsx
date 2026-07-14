"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Plus, Trash2, CheckCircle } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

const BLANK_FORM = {
  badge: "",
  heading: "",
  headingHighlight: "",
  description: "",
  primaryBtn: "Get Started",
  secondaryBtn: "Book Consultation",
  demoBtn: "Watch Demo",
  reviewText: "4.9/5 · 520+ reviews",
  heroImages: ["", "", "", ""],
  floatingCards: [
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ],
};

export default function HeroPage() {
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/apexboost/data?section=hero");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setForm({
          badge: d.badge || "",
          heading: d.heading || "",
          headingHighlight: d.headingHighlight || "",
          description: d.description || "",
          primaryBtn: d.primaryBtn || "Get Started",
          secondaryBtn: d.secondaryBtn || "Book Consultation",
          demoBtn: d.demoBtn || "Watch Demo",
          reviewText: d.reviewText || "4.9/5 · 520+ reviews",
          heroImages: d.heroImages?.length ? [...d.heroImages, ...["","","",""]].slice(0,4) : ["","","",""],
          floatingCards: d.floatingCards?.length ? d.floatingCards : [{ label: "", value: "" },{ label: "", value: "" },{ label: "", value: "" }],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hero", data: form }),
      });
      if (res.ok) {
        setSaved(true);
        emitAlert({ type: "success", title: "Success", message: "Hero section saved successfully!" });
        setTimeout(() => setSaved(false), 3000);
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save hero section." });
      }
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", title: "Error", message: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const setImage = (i, val) => {
    const imgs = [...form.heroImages];
    imgs[i] = val;
    setForm({ ...form, heroImages: imgs });
  };

  const addImage = () => setForm({ ...form, heroImages: [...form.heroImages, ""] });
  const removeImage = (i) => setForm({ ...form, heroImages: form.heroImages.filter((_, idx) => idx !== i) });

  const setCard = (i, key, val) => {
    const cards = form.floatingCards.map((c, idx) => idx === i ? { ...c, [key]: val } : c);
    setForm({ ...form, floatingCards: cards });
  };
  const addCard = () => setForm({ ...form, floatingCards: [...form.floatingCards, { label: "", value: "" }] });
  const removeCard = (i) => setForm({ ...form, floatingCards: form.floatingCards.filter((_, idx) => idx !== i) });

  const inp = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm";
  const label = (txt) => <label className="block text-sm font-medium text-gray-700 mb-1">{txt}</label>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Hero Section</h1>
          <p className="text-gray-600 text-sm mt-1">Edit the homepage hero — text, images & floating cards</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            <RefreshCw size={16} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
          >
            {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? <><RefreshCw size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* ── Text Content ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Text Content</h2>
        <div>
          {label("Badge / Eyebrow Text")}
          <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className={inp} placeholder="#1 Performance Marketing Agency 2026" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {label("Heading")}
            <input type="text" value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} className={inp} placeholder="We Engineer Marketing Growth That Compounds" />
          </div>
          <div>
            {label("Heading Highlight (gradient word)")}
            <input type="text" value={form.headingHighlight} onChange={e => setForm({ ...form, headingHighlight: e.target.value })} className={inp} placeholder="Marketing Growth" />
          </div>
        </div>
        <div>
          {label("Description / Subtext")}
          <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {label("Primary Button Text")}
            <input type="text" value={form.primaryBtn} onChange={e => setForm({ ...form, primaryBtn: e.target.value })} className={inp} />
          </div>
          <div>
            {label("Secondary Button Text")}
            <input type="text" value={form.secondaryBtn} onChange={e => setForm({ ...form, secondaryBtn: e.target.value })} className={inp} />
          </div>
          <div>
            {label("Demo Button Text")}
            <input type="text" value={form.demoBtn} onChange={e => setForm({ ...form, demoBtn: e.target.value })} className={inp} />
          </div>
        </div>
        <div>
          {label("Review Text (bottom badge)")}
          <input type="text" value={form.reviewText} onChange={e => setForm({ ...form, reviewText: e.target.value })} className={inp} placeholder="4.9/5 · 520+ reviews" />
        </div>
      </div>

      {/* ── Hero Images (slideshow) ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Hero Slideshow Images</h2>
          <button onClick={addImage} className="flex items-center gap-1 text-sm text-(--primary) border border-(--primary) px-3 py-1.5 rounded-lg hover:bg-blue-50">
            <Plus size={14} /> Add Image
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.heroImages.map((img, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                {label(`Image ${i + 1} URL`)}
                <button onClick={() => removeImage(i)} className="ml-auto p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
              </div>
              <input type="text" value={img} onChange={e => setImage(i, e.target.value)} className={inp} placeholder="https://images.unsplash.com/..." />
              {img && (
                <img src={img} alt={`Hero ${i+1}`} className="w-full h-28 object-cover rounded-lg border" onError={e => { e.target.style.display = "none"; }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating Cards ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Floating Stat Cards</h2>
          <button onClick={addCard} className="flex items-center gap-1 text-sm text-(--primary) border border-(--primary) px-3 py-1.5 rounded-lg hover:bg-blue-50">
            <Plus size={14} /> Add Card
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {form.floatingCards.map((card, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Card {i + 1}</span>
                <button onClick={() => removeCard(i)} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
              </div>
              <div>
                {label("Label")}
                <input type="text" value={card.label} onChange={e => setCard(i, "label", e.target.value)} className={inp} placeholder="ROAS Today" />
              </div>
              <div>
                {label("Value")}
                <input type="text" value={card.value} onChange={e => setCard(i, "value", e.target.value)} className={inp} placeholder="7.4x" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
