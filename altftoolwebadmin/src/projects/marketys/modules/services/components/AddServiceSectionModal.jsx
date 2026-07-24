"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/services";

const CATEGORIES = [
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "affiliate-marketing", label: "Affiliate Marketing" },
  { value: "paid-advertisement", label: "Paid Advertisement" },
];

const INITIAL_SERVICE = {
  id: "",
  category: "digital-marketing",
  title: "",
  subtitle: "",
  tagline: "",
  img: "",
  whatIs: "",
  howWeDo: [{ step: "", detail: "" }],
  features: [""],
  stats: [{ val: "", label: "" }],
  graph: { title: "", labelX: "", labelY: "", points: [0, 0, 0, 0, 0, 0], labels: ["", "", "", "", "", ""], percentage: "" },
  order: 1,
  active: true,
};

export default function AddServiceSectionModal({ existingService, onClose, onSaved }) {
  const isEdit = Boolean(existingService);
  const [form, setForm] = useState(INITIAL_SERVICE);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingService) {
      const s = existingService;
      setForm({
        id: s.id || "",
        category: s.category || "digital-marketing",
        title: s.title || "",
        subtitle: s.subtitle || "",
        tagline: s.tagline || "",
        img: s.img || "",
        whatIs: s.whatIs || "",
        howWeDo: s.howWeDo?.length > 0 ? s.howWeDo.map((h) => ({ step: h.step || "", detail: h.detail || "" })) : [{ step: "", detail: "" }],
        features: s.features?.length > 0 ? [...s.features] : [""],
        stats: s.stats?.length > 0 ? s.stats.map((st) => ({ val: st.val || "", label: st.label || "" })) : [{ val: "", label: "" }],
        graph: {
          title: s.graph?.title || "",
          labelX: s.graph?.labelX || "",
          labelY: s.graph?.labelY || "",
          points: s.graph?.points || [0, 0, 0, 0, 0, 0],
          labels: s.graph?.labels || ["", "", "", "", "", ""],
          percentage: s.graph?.percentage || "",
        },
        order: s.order || 1,
        active: s.active !== false,
      });
    }
  }, [existingService]);

  const update = (path, value) => {
    setForm((prev) => {
      const keys = path.split(".");
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    if (errors[path]) setErrors((prev) => ({ ...prev, [path]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.id.trim()) errs.id = "ID is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const data = {
        ...form,
        features: form.features.filter((f) => f.trim()),
        howWeDo: form.howWeDo.filter((h) => h.step.trim() || h.detail.trim()),
        stats: form.stats.filter((st) => st.val.trim()),
        updatedAt: serverTimestamp(),
        createdAt: existingService?.createdAt || serverTimestamp(),
      };

      await setDoc(doc(db, COLLECTION, form.id || form.title.toLowerCase().replace(/\s+/g, "-")), data);
      emitAlert({ type: "success", message: isEdit ? "Service updated" : "Service created" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to save service" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Service" : "Add Service"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service ID *</label>
              <input value={form.id} onChange={(e) => update("id", e.target.value)}
                className={`w-full rounded-lg border ${errors.id ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500`} />
              {errors.id && <p className="mt-1 text-xs text-red-500">{errors.id}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 mt-6">Active</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Visible on site</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)}
              className={`w-full rounded-lg border ${errors.title ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500`} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="Subtitle"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none" />
            <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Tagline"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none" />
          </div>

          <ImageUpload value={form.img} onChange={(v) => update("img", v)} label="Image" folder="marketys/services" />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What Is (Description)</label>
            <textarea value={form.whatIs} onChange={(e) => update("whatIs", e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">How We Do Steps</label>
              <button type="button" onClick={() => update("howWeDo", [...form.howWeDo, { step: "", detail: "" }])}
                className="text-xs font-medium text-blue-600 hover:text-blue-700">+ Add Step</button>
            </div>
            {form.howWeDo.map((step, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={step.step} onChange={(e) => {
                  const next = [...form.howWeDo]; next[i] = { ...next[i], step: e.target.value }; update("howWeDo", next);
                }} placeholder="Step title" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                <input value={step.detail} onChange={(e) => {
                  const next = [...form.howWeDo]; next[i] = { ...next[i], detail: e.target.value }; update("howWeDo", next);
                }} placeholder="Detail" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                {form.howWeDo.length > 1 && (
                  <button type="button" onClick={() => update("howWeDo", form.howWeDo.filter((_, idx) => idx !== i))}
                    className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Features</label>
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  <input value={f} onChange={(e) => {
                    const next = [...form.features]; next[i] = e.target.value; update("features", next);
                  }} placeholder="Feature" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                  {form.features.length > 1 && (
                    <button type="button" onClick={() => update("features", form.features.filter((_, idx) => idx !== i))}
                      className="text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => update("features", [...form.features, ""])}
                className="text-xs text-blue-600 font-medium">+ Add feature</button>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Stats</label>
              {form.stats.map((st, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  <input value={st.val} onChange={(e) => {
                    const next = [...form.stats]; next[i] = { ...next[i], val: e.target.value }; update("stats", next);
                  }} placeholder="Value" className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                  <input value={st.label} onChange={(e) => {
                    const next = [...form.stats]; next[i] = { ...next[i], label: e.target.value }; update("stats", next);
                  }} placeholder="Label" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                </div>
              ))}
              <button type="button" onClick={() => update("stats", [...form.stats, { val: "", label: "" }])}
                className="text-xs text-blue-600 font-medium">+ Add stat</button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Graph Data</label>
            <div className="grid grid-cols-3 gap-3">
              <input value={form.graph.title} onChange={(e) => update("graph.title", e.target.value)} placeholder="Graph title"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
              <input value={form.graph.labelX} onChange={(e) => update("graph.labelX", e.target.value)} placeholder="X axis label"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
              <input value={form.graph.labelY} onChange={(e) => update("graph.labelY", e.target.value)} placeholder="Y axis label"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
              <input value={form.graph.percentage} onChange={(e) => update("graph.percentage", e.target.value)} placeholder="Percentage text"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
            </div>
            <p className="text-xs text-gray-400 mt-2 mb-1">Points (6 comma-separated numbers)</p>
            <input value={form.graph.points.join(",")} onChange={(e) => {
              const pts = e.target.value.split(",").map(Number).filter((n) => !isNaN(n));
              update("graph.points", pts.length === 6 ? pts : [0, 0, 0, 0, 0, 0]);
            }} placeholder="1200,2400,5800,14000,31000,68000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none mb-1" />
            <p className="text-xs text-gray-400 mb-1">Labels (6 comma-separated)</p>
            <input value={form.graph.labels.join(",")} onChange={(e) => {
              const lbls = e.target.value.split(",").map((s) => s.trim());
              update("graph.labels", lbls.length === 6 ? lbls : ["", "", "", "", "", ""]);
            }} placeholder="Month 1,Month 2,Month 3,Month 4,Month 5,Month 6"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={(e) => update("order", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
