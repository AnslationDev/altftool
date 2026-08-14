"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SECTIONS, DEFAULTS } from "../lib/schema";
import { resetSection, saveSection, subscribeSection } from "../lib/content.service";
import { ContentField } from "./ContentFields";

/**
 * Generic, schema-driven manager: renders tabs for the given section keys,
 * live-subscribes each section from Firestore, and provides draft editing
 * with Save / Reset — the same UX pattern as the other project modules.
 */
export default function SectionManager({ title, description, sectionKeys }) {
  const [activeKey, setActiveKey] = useState(sectionKeys[0]);
  const [sections, setSections] = useState({});
  const [draft, setDraft] = useState(DEFAULTS[sectionKeys[0]] || {});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const ready = new Set();
    const unsubs = sectionKeys.map((key) =>
      subscribeSection(
        key,
        (data) => {
          ready.add(key);
          setSections((prev) => ({ ...prev, [key]: data }));
          if (ready.size === sectionKeys.length) setLoading(false);
        },
        () => {
          ready.add(key);
          emitAlert({ type: "error", message: `Failed to load "${key}" section.` });
          if (ready.size === sectionKeys.length) setLoading(false);
        },
      ),
    );
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSectionData = sections[activeKey];

  useEffect(() => {
    setDraft(activeSectionData || DEFAULTS[activeKey] || {});
    setDirty(false);
  }, [activeKey, activeSectionData]);

  const schema = SECTIONS[activeKey];
  const activeLabel = useMemo(() => schema?.label || activeKey, [schema, activeKey]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  async function handleSave() {
    setSaving(true);
    try {
      const { updatedAt, ...payload } = draft;
      await saveSection(activeKey, payload);
      emitAlert({ type: "success", message: `${activeLabel} saved. Live site updates within a minute.` });
      setDirty(false);
    } catch (error) {
      emitAlert({ type: "error", message: `Could not save ${activeLabel}.` });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await resetSection(activeKey);
      emitAlert({ type: "success", message: `${activeLabel} reset to defaults.` });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: `Could not reset ${activeLabel}.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !dirty}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      {sectionKeys.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {sectionKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKey(key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeKey === key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {SECTIONS[key]?.label || key}
            </button>
          ))}
        </div>
      ) : null}

      {/* Editor */}
      {loading ? (
        <div className="grid min-h-[280px] place-items-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              {activeLabel}
            </p>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                Unsaved changes
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                Synced
              </span>
            )}
          </div>
          <div className="space-y-5">
            {(schema?.fields || []).map((field) => (
              <ContentField
                key={field.key}
                field={field}
                value={draft[field.key]}
                onChange={(next) => setField(field.key, next)}
                sectionKey={activeKey}
              />
            ))}
          </div>
        </div>
      )}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Confirm reset"
          message={`Reset "${activeLabel}" to shipped defaults? This overwrites the live section on the public site and cannot be undone.`}
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}
