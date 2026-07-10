"use client";

import { useState, useEffect } from "react";
import {
  X, Save, Loader2, ChevronDown, ChevronRight, Plus, Trash2,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "projects/marketys/footer";
const DOC_ID = "config";

const INITIAL = {
  groups: [
    {
      title: "Solutions",
      links: [
        { label: "Digital Marketing", href: "/services#digital-marketing" },
        { label: "Affiliate Programs", href: "/services#affiliate-marketing" },
        { label: "Digital Advertising", href: "/services#paid-advertisement" },
        { label: "Growth Plans", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog & Guides", href: "/blog" },
        { label: "Client Reviews", href: "/reviews" },
        { label: "FAQ", href: "/about#faq" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
        { label: "Contact Support", href: "/support" },
      ],
    },
  ],
  social: [
    { platform: "Twitter", url: "https://twitter.com", icon: "Twitter" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { platform: "Facebook", url: "https://facebook.com", icon: "Facebook" },
    { platform: "YouTube", url: "https://youtube.com", icon: "Youtube" },
  ],
  contact: {
    email: "growth@velox.agency",
    phone: "+91 77730 00000",
    address: "Betul, Madhya Pradesh, India",
  },
  copyright: "\u00a9 2026 markety. All rights reserved.",
};

const SOCIAL_ICON_OPTIONS = ["Twitter", "Linkedin", "Facebook", "Youtube", "Instagram", "Github", "Dribbble"];

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

export default function EditFooterModal({ onClose, onSaved }) {
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
      emitAlert({ type: "success", message: "Footer updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to update footer" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-xl bg-white p-6"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Edit Footer</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <Section title="Contact Info">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input value={form.contact.email} onChange={(e) => update("contact.email", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input value={form.contact.phone} onChange={(e) => update("contact.phone", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input value={form.contact.address} onChange={(e) => update("contact.address", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Copyright Text</label>
              <input value={form.copyright} onChange={(e) => update("copyright", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
            </div>
          </Section>

          <Section title="Link Groups" defaultOpen={false}>
            <ArrayField
              label="Group"
              items={form.groups}
              onChange={(v) => update("groups", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
                    placeholder="Group title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Links</p>
                    {item.links.map((link, li) => (
                      <div key={li} className="flex gap-2 mb-1">
                        <input value={link.label} onChange={(e) => {
                          const nl = [...item.links]; nl[li] = { ...nl[li], label: e.target.value }; onChange({ ...item, links: nl });
                        }} placeholder="Label" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                        <input value={link.href} onChange={(e) => {
                          const nl = [...item.links]; nl[li] = { ...nl[li], href: e.target.value }; onChange({ ...item, links: nl });
                        }} placeholder="/path" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                        <button type="button" onClick={() => onChange({ ...item, links: item.links.filter((_, idx) => idx !== li) })}
                          className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => onChange({ ...item, links: [...item.links, { label: "", href: "" }] })}
                      className="text-xs text-blue-600 font-medium">+ Add link</button>
                  </div>
                </div>
              )}
              onAdd={() => update("groups", [...form.groups, { title: "", links: [{ label: "", href: "" }] }])}
              addLabel="Add Group"
            />
          </Section>

          <Section title="Social Links" defaultOpen={false}>
            <ArrayField
              label="Social"
              items={form.social}
              onChange={(v) => update("social", v)}
              renderItem={(item, i, onChange) => (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Icon</label>
                    <select value={item.icon} onChange={(e) => onChange({ ...item, icon: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none">
                      {SOCIAL_ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <input value={item.platform} onChange={(e) => onChange({ ...item, platform: e.target.value })}
                    placeholder="Platform" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={item.url} onChange={(e) => onChange({ ...item, url: e.target.value })}
                    placeholder="URL" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              )}
              onAdd={() => update("social", [...form.social, { platform: "", url: "", icon: "Twitter" }])}
              addLabel="Add Social"
            />
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Footer
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