"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_STATS_SETTINGS,
  saveStatsSettings,
  subscribeStatsSettings,
} from "./service/stats.service";

const EMPTY_STAT = { value: "", label: "" };

function StatsPreview({ items }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#05050d] shadow-sm">
      <div className="grid grid-cols-2 gap-6 bg-[linear-gradient(115deg,#111222,#05050d_45%,#0b0c1c)] p-8 text-white sm:grid-cols-4">
        {items.length ? (
          items.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold sm:text-3xl">{item.value || "-"}</p>
              <p className="mt-1 text-xs font-medium text-white/60">{item.label || "Label"}</p>
            </div>
          ))
        ) : (
          <p className="col-span-4 text-center text-sm text-white/50">No stats yet</p>
        )}
      </div>
    </div>
  );
}

export default function CampaignastraStatsPage() {
  const [settings, setSettings] = useState(DEFAULT_STATS_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_STATS_SETTINGS.items);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeStatsSettings(
      (data) => {
        setSettings(data);
        setDraft(data.items?.length ? data.items : [{ ...EMPTY_STAT }]);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load stats settings" });
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const updateItem = (index, key, value) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    setErrors((prev) => ({ ...prev, [index]: "" }));
  };

  const addItem = () => {
    setDraft((prev) => [...prev, { ...EMPTY_STAT }]);
  };

  const removeItem = (index) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setDraft(settings.items?.length ? settings.items : [{ ...EMPTY_STAT }]);
    setErrors({});
  };

  const handleSave = async () => {
    const nextErrors = validateStats(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveStatsSettings({ items: draft });
      emitAlert({ type: "success", message: "Stats saved." });
      logAuditEvent({
        module: "stats",
        action: "STATS_UPDATE",
        entityType: "statsSettings",
        entityId: "settings",
        summary: "Updated Campaignastra stats",
        route: "/campaignastra/stats",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save stats." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Stats</h1>
              <p className="text-sm text-gray-500">
                These numbers appear on both your homepage and About page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Stats
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Stat items
                </p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Value &amp; label pairs</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {draft.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Value
                        </span>
                        <input
                          value={item.value}
                          onChange={(event) => updateItem(index, "value", event.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                          placeholder="240+"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Label
                        </span>
                        <input
                          value={item.label}
                          onChange={(event) => updateItem(index, "label", event.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                          placeholder="Growth Partners"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-5 rounded-lg p-2 text-red-500 hover:bg-red-50"
                      aria-label={`Remove stat ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {errors.items ? (
                  <p className="text-xs font-medium text-red-500">{errors.items}</p>
                ) : null}

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Stat
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Stats
                </button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-bold text-gray-900">Live preview</h2>
            </div>
            <StatsPreview items={draft} />
          </section>
        </div>
      </div>
    </div>
  );
}

function validateStats(items) {
  const errors = {};
  if (!items.length) {
    errors.items = "Add at least one stat.";
    return errors;
  }
  items.forEach((item, index) => {
    if (!item.value?.trim() || !item.label?.trim()) {
      errors[index] = "Value and label are required.";
    }
  });
  if (Object.keys(errors).some((key) => key !== "items")) {
    errors.items = "Every stat needs both a value and a label.";
  }
  return errors;
}
