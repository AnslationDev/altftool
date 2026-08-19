import React, { useState, useEffect } from "react";
import { fetchStats, saveStats } from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function StatsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await fetchStats();
        setData(statsData);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load stats." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStats(data);
      emitAlert({ type: "success", message: "Stats updated successfully!" });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save stats." });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, val) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const updateHeadline = (idx, field, val) => {
    setData((prev) => {
      const headline = [...(prev.headline || [])];
      headline[idx] = {
        ...headline[idx],
        [field]: field === "value" ? Number(val) || 0 : val,
      };
      return { ...prev, headline };
    });
  };

  const addHeadline = () => {
    setData((prev) => ({
      ...prev,
      headline: [
        ...(prev.headline || []),
        { label: "New Metric", value: 0, suffix: "", prefix: "" },
      ],
    }));
  };

  const removeHeadline = (idx) => {
    setData((prev) => ({
      ...prev,
      headline: (prev.headline || []).filter((_, i) => i !== idx),
    }));
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-slide-in">
      {/* Floating Save Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-lg">
        <div>
          <h2 className="text-lg font-bold">Stats Configuration</h2>
          <p className="text-xs text-[var(--muted)]">Configure the headline performance counters shown across the site</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary min-w-[120px] flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Summary Badges Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">1. Summary Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Impressions</label>
            <input
              type="text"
              placeholder="e.g. 500M+"
              className="input"
              value={data.impressions || ""}
              onChange={(e) => updateField("impressions", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Managed Ad Spend</label>
            <input
              type="text"
              placeholder="e.g. $50M+"
              className="input"
              value={data.adSpend || ""}
              onChange={(e) => updateField("adSpend", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Avg Client ROI</label>
            <input
              type="text"
              placeholder="e.g. 300%"
              className="input"
              value={data.avgRoi || ""}
              onChange={(e) => updateField("avgRoi", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Headline Counters Card */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
          <h3 className="text-md font-bold text-[var(--primary)]">2. Headline Animated Counters</h3>
          <button
            type="button"
            onClick={addHeadline}
            className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Counter
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.headline || []).map((item, idx) => (
            <div key={idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--muted)]">Counter #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeHeadline(idx)}
                  className="text-[var(--danger)] hover:opacity-80 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[var(--muted)]">Label</label>
                <input
                  type="text"
                  className="input py-1 px-2 text-xs"
                  value={item.label || ""}
                  onChange={(e) => updateHeadline(idx, "label", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Prefix</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={item.prefix || ""}
                    onChange={(e) => updateHeadline(idx, "prefix", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Value</label>
                  <input
                    type="number"
                    className="input py-1 px-2 text-xs"
                    value={item.value ?? 0}
                    onChange={(e) => updateHeadline(idx, "value", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Suffix</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={item.suffix || ""}
                    onChange={(e) => updateHeadline(idx, "suffix", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
