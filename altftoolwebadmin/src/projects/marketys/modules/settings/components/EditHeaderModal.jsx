"use client";

import { useState, useEffect } from "react";
import {
  X, Save, Loader2, ChevronDown, ChevronRight, Plus, Trash2,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/header";
const DOC_ID = "config";

const INITIAL = {
  logo: { text: "markety", image: "" },
  links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Reviews", href: "/reviews" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/about#faq" },
  ],
  cta: { text: "Book a Schedule", href: "#booking" },
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

export default function EditHeaderModal({ onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
        if (snap.exists()) {
          setForm(deepMerge(INITIAL, snap.data()));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

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
      emitAlert({ type: "success", message: "Header updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to update header" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-6"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Edit Header / Navbar</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <Section title="Logo">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Text</label>
              <input value={form.logo.text} onChange={(e) => update("logo.text", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <ImageUpload value={form.logo.image} onChange={(v) => update("logo.image", v)} label="Logo Image (optional, overrides text)" folder="marketys/header" />
          </Section>

          <Section title="CTA Button">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
              <input value={form.cta.text} onChange={(e) => update("cta.text", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Button Link</label>
              <input value={form.cta.href} onChange={(e) => update("cta.href", e.target.value)}
                placeholder="/booking or #booking" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
            </div>
          </Section>

          <Section title="Navigation Links" defaultOpen={false}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Links</label>
                <button type="button" onClick={() => update("links", [...form.links, { label: "", href: "" }])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="h-3.5 w-3.5" /> Add Link
                </button>
              </div>
              {form.links.map((link, i) => (
                <div key={i} className="group flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase w-6">{i + 1}</span>
                  <input value={link.label} onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...next[i], label: e.target.value };
                    update("links", next);
                  }} placeholder="Label" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={link.href} onChange={(e) => {
                    const next = [...form.links];
                    next[i] = { ...next[i], href: e.target.value };
                    update("links", next);
                  }} placeholder="/path" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <button type="button" onClick={() => update("links", form.links.filter((_, idx) => idx !== i))}
                    className="rounded p-1 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Header
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