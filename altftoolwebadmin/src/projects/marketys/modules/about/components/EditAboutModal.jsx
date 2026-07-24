"use client";

import { useState, useEffect } from "react";
import {
  X, Save, Loader2, ChevronDown, ChevronRight, Plus, Trash2,
  Target, Award, Heart, Shield, Zap, Globe, Star,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/about";
const DOC_ID = "config";

const ICON_OPTIONS = [
  { value: "Target", label: "Target" },
  { value: "Award", label: "Award" },
  { value: "Heart", label: "Heart" },
  { value: "Shield", label: "Shield" },
  { value: "Zap", label: "Zap" },
  { value: "Globe", label: "Globe" },
  { value: "Star", label: "Star" },
];

const INITIAL = {
  hero: {
    bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80",
    title: "We Build The Engine For Your Scale",
    subtitle: "markety is a premium performance marketing agency. We combine advanced attribution analytics, creative design, and strategic media buying to programmatically scale brands across every digital channel.",
  },
  values: [
    {
      icon: "Target",
      title: "Data-First Decisions",
      desc: "Every campaign, creative, and landing page is validated through data. No gut feelings, no guesses—only measurable outcomes.",
      color: "bg-blue-50 text-blue-600 border-blue-100",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    },
    {
      icon: "Zap",
      title: "Speed of Execution",
      desc: "We launch campaigns within 48 hours. Our agile sprint model means your growth never waits for approvals or bureaucracy.",
      color: "bg-amber-50 text-amber-600 border-amber-100",
      image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&q=80",
    },
    {
      icon: "Shield",
      title: "Margin Protection",
      desc: "Profit comes first. We structure every campaign and partnership to protect your blended margins while scaling acquisition.",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    },
    {
      icon: "Globe",
      title: "Global Scale Infrastructure",
      desc: "Our technology stack supports multi-currency, multi-language, and multi-region campaigns from a single unified dashboard.",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    },
  ],
  faqs: [
    { question: "What makes markety different from traditional agencies?", answer: "Unlike traditional agencies that focus on vanity metrics like impressions or clicks, markety is entirely performance-driven. We integrate deep server-side tracking, build high-converting custom creatives in-house, and align our goals directly with your bottom-line blended margins." },
    { question: "How does the 48-hour campaign launch work?", answer: "Our agile sprint model is built for speed. Once onboarded, our team executes creative development, copywriting, technical tracking setup, and campaign structure assembly simultaneously, allowing us to push your ads live within 48 hours." },
    { question: "What is your server-side tracking infrastructure?", answer: "We deploy custom GTM server-side containers and Conversions API (CAPI) integrations to capture up to 99.8% of conversion events, bypassing browser ad-blockers and iOS privacy restrictions for absolute data accuracy." },
    { question: "Do you require long-term contracts?", answer: "No, we believe in retaining partners through measurable performance and clear profit generation. We structure rolling monthly partnerships so we are constantly earning your business." },
    { question: "How do we communicate with our dedicated team?", answer: "Every client is set up with a dedicated Slack channel for daily messaging, as well as a weekly strategy review call with full performance breakdowns and roadmap adjustments." },
  ],
};

function Section({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition text-left">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function ArrayField({ label, items, onChange, renderItem, onAdd, addLabel }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {onAdd && (
          <button type="button" onClick={onAdd}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
          <Plus className="h-3.5 w-3.5" /> {addLabel || "Add"}
        </button>
        )}
      </div>
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{label} {i + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="rounded p-0.5 text-gray-300 hover:text-red-500 transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {renderItem(item, i, (updated) => {
            const next = [...items];
            next[i] = updated;
            onChange(next);
          })}
        </div>
      ))}
    </div>
  );
}

export default function EditAboutModal({ existingData, onClose, onSaved, inline }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      const merged = deepMerge(INITIAL, existingData);
      setForm(merged);
    }
  }, [existingData]);

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      emitAlert({ type: "success", message: "About page updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to update about page" });
    } finally {
      setSubmitting(false);
    }
  };

  if (inline) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Edit About Page</h2>
          <button type="button" onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Section title="Hero Section">
            <ImageUpload value={form.hero.bgImage} onChange={(v) => update("hero.bgImage", v)} label="Background Image" folder="marketys/about" />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <textarea value={form.hero.title} onChange={(e) => update("hero.title", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
              <textarea value={form.hero.subtitle} onChange={(e) => update("hero.subtitle", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </Section>

          <Section title="Core Values" defaultOpen={false}>
            <ArrayField
              label="Value"
              items={form.values}
              onChange={(v) => update("values", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Icon</label>
                      <select value={item.icon} onChange={(e) => onChange({ ...item, icon: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none">
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
                      placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.color} onChange={(e) => onChange({ ...item, color: e.target.value })}
                      placeholder="Color classes" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <ImageUpload value={item.image} onChange={(v) => onChange({ ...item, image: v })} label="Image" folder="marketys/about" />
                  </div>
                </div>
              )}
              onAdd={() => update("values", [...form.values, { icon: "Target", title: "", desc: "", color: "", image: "" }])}
              addLabel="Add Value"
            />
          </Section>

          <Section title="FAQs" defaultOpen={false}>
            <ArrayField
              label="FAQ"
              items={form.faqs}
              onChange={(v) => update("faqs", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <input value={item.question} onChange={(e) => onChange({ ...item, question: e.target.value })}
                    placeholder="Question" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <textarea value={item.answer} onChange={(e) => onChange({ ...item, answer: e.target.value })}
                    placeholder="Answer" rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              )}
              onAdd={() => update("faqs", [...form.faqs, { question: "", answer: "" }])}
              addLabel="Add FAQ"
            />
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save About Page
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Edit About Page</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <Section title="Hero Section">
            <ImageUpload value={form.hero.bgImage} onChange={(v) => update("hero.bgImage", v)} label="Background Image" folder="marketys/about" />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <textarea value={form.hero.title} onChange={(e) => update("hero.title", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
              <textarea value={form.hero.subtitle} onChange={(e) => update("hero.subtitle", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </Section>

          <Section title="Core Values" defaultOpen={false}>
            <ArrayField
              label="Value"
              items={form.values}
              onChange={(v) => update("values", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Icon</label>
                      <select value={item.icon} onChange={(e) => onChange({ ...item, icon: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none">
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
                      placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.color} onChange={(e) => onChange({ ...item, color: e.target.value })}
                      placeholder="Color classes" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <ImageUpload value={item.image} onChange={(v) => onChange({ ...item, image: v })} label="Image" folder="marketys/about" />
                  </div>
                </div>
              )}
              onAdd={() => update("values", [...form.values, { icon: "Target", title: "", desc: "", color: "", image: "" }])}
              addLabel="Add Value"
            />
          </Section>

          <Section title="FAQs" defaultOpen={false}>
            <ArrayField
              label="FAQ"
              items={form.faqs}
              onChange={(v) => update("faqs", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <input value={item.question} onChange={(e) => onChange({ ...item, question: e.target.value })}
                    placeholder="Question" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <textarea value={item.answer} onChange={(e) => onChange({ ...item, answer: e.target.value })}
                    placeholder="Answer" rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              )}
              onAdd={() => update("faqs", [...form.faqs, { question: "", answer: "" }])}
              addLabel="Add FAQ"
            />
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save About Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}