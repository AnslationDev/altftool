"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, RefreshCw, CheckCircle, Settings } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  subscribeStats,
  createStat,
  updateStat,
  deleteStat,
  subscribeHeroStats,
  createHeroStat,
  updateHeroStat,
  deleteHeroStat,
  subscribeSectionHeading,
  saveSectionHeading,
} from "../service/apexboost.service";

const ICONS = ["Smile","Rocket","DollarSign","TrendingUp","Target","Handshake","Globe","Heart","BarChart3","Star","Users","Zap"];

export default function StatsPage() {
  const [statsList, setStatsList] = useState([]);
  const [heroStatsList, setHeroStatsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSection, setEditingSection] = useState("stats"); // "stats" | "heroStats"
  const [form, setForm] = useState({ value: "", prefix: "", suffix: "+", label: "", icon: "TrendingUp", decimals: 0 });
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);
  const [headingForm, setHeadingForm] = useState({ title: "Numbers that drive", highlight: "Confidence" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubStats = subscribeStats(setStatsList, () => {
      emitAlert({ type: "error", title: "Error", message: "Failed to load statistics." });
    });
    const unsubHeroStats = subscribeHeroStats(setHeroStatsList, () => {
      emitAlert({ type: "error", title: "Error", message: "Failed to load hero stats." });
    });
    const unsubHeading = subscribeSectionHeading(
      "statsHeading",
      (data) => setHeadingForm({ title: data?.title || "", highlight: data?.highlight || "" }),
      () => {
        emitAlert({ type: "error", title: "Error", message: "Failed to load section heading." });
      },
    );
    return () => {
      unsubStats?.();
      unsubHeroStats?.();
      unsubHeading?.();
    };
  }, []);

  const openAdd = (section) => {
    setEditingSection(section);
    setEditingItem(null);
    setForm({ value: "", prefix: "", suffix: "+", label: "", icon: "TrendingUp", decimals: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (item, section) => {
    setEditingSection(section);
    setEditingItem(item);
    setForm({ value: item.value ?? "", prefix: item.prefix ?? "", suffix: item.suffix ?? "", label: item.label ?? "", icon: item.icon ?? "TrendingUp", decimals: item.decimals ?? 0 });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const list = editingSection === "stats" ? statsList : heroStatsList;
    const createFn = editingSection === "stats" ? createStat : createHeroStat;
    const updateFn = editingSection === "stats" ? updateStat : updateHeroStat;
    const newItem = { value: isNaN(Number(form.value)) ? form.value : Number(form.value), prefix: form.prefix, suffix: form.suffix, label: form.label, icon: form.icon, decimals: Number(form.decimals) || 0 };
    try {
      if (editingItem) {
        await updateFn(editingItem.id, { ...editingItem, ...newItem });
      } else {
        const nextOrder = list.length ? Math.max(...list.map(s => Number(s.order) || 0)) + 1 : 0;
        await createFn({ ...newItem, order: nextOrder });
      }
      setIsModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Stat saved successfully!" });
    } catch {
      emitAlert({ type: "error", title: "Error", message: "Failed to save stat." });
    }
  };

  const handleDelete = async (item, section) => {
    const deleteFn = section === "stats" ? deleteStat : deleteHeroStat;
    try {
      await deleteFn(item.id);
    } catch {
      emitAlert({ type: "error", title: "Error", message: "Failed to delete stat." });
    }
  };

  const handleSaveHeading = async () => {
    setSaving(true);
    try {
      await saveSectionHeading("statsHeading", headingForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setIsHeadingOpen(false);
    } catch {
      emitAlert({ type: "error", title: "Error", message: "Failed to save section heading." });
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm";

  const StatCard = ({ stat, section }) => (
    <div className="border rounded-xl p-5 hover:shadow-lg transition text-center bg-white">
      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{stat.icon}</div>
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {stat.prefix}{stat.value}{stat.suffix}
      </p>
      <p className="text-gray-500 text-sm">{stat.label}</p>
      <div className="flex gap-2 mt-4 justify-center">
        <button onClick={() => openEdit(stat, section)} className="flex items-center gap-1 text-sm p-2 hover:bg-gray-100 rounded-lg">
          <Edit size={16} className="text-gray-600" />
        </button>
        <button onClick={() => handleDelete(stat, section)} className="p-2 hover:bg-red-50 rounded-lg">
          <Trash2 size={16} className="text-red-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Statistics</h1>
          <p className="text-gray-600 text-sm mt-1">Edit stats shown on the statistics section and hero</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsHeadingOpen(true)} className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            <Settings size={16} /> Section Heading
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Statistics Section Counters</h2>
            <p className="text-gray-500 text-xs mt-0.5">The big dark section with 8 animated counters</p>
          </div>
          <button onClick={() => openAdd("stats")} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Stat
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsList.map((stat, i) => <StatCard key={i} stat={stat} section="stats" />)}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Hero Mini Stats</h2>
            <p className="text-gray-500 text-xs mt-0.5">The 3 compact counters shown below the hero heading</p>
          </div>
          <button onClick={() => openAdd("heroStats")} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
            <Plus size={16} /> Add Hero Stat
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {heroStatsList.map((stat, i) => <StatCard key={i} stat={stat} section="heroStats" />)}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 my-8 p-6">
            <h2 className="text-xl font-bold mb-5">{editingItem ? "Edit" : "Add"} {editingSection === "heroStats" ? "Hero " : ""}Stat</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                  <input type="text" value={form.prefix} onChange={e => setForm({ ...form, prefix: e.target.value })} className={inp} placeholder="$" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className={inp} placeholder="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                  <input type="text" value={form.suffix} onChange={e => setForm({ ...form, suffix: e.target.value })} className={inp} placeholder="M+" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className={inp} placeholder="Revenue Generated" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decimals</label>
                  <input type="number" min="0" max="2" value={form.decimals} onChange={e => setForm({ ...form, decimals: parseInt(e.target.value) || 0 })} className={inp} />
                </div>
              </div>
              {editingSection === "stats" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className={inp}>
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSave} className="bg-(--primary) text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Heading Modal */}
      {isHeadingOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-5">Statistics Section Heading</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (normal text)</label>
                <input type="text" value={headingForm.title} onChange={e => setHeadingForm({ ...headingForm, title: e.target.value })} className={inp} placeholder="Numbers that drive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlight (colored word)</label>
                <input type="text" value={headingForm.highlight} onChange={e => setHeadingForm({ ...headingForm, highlight: e.target.value })} className={inp} placeholder="Confidence" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsHeadingOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveHeading} disabled={saving} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded disabled:opacity-60">
                {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? <><RefreshCw size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
