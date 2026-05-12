"use client";

import { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { createCategories, deleteCategory, fetchCategories } from "../expert-video-services/ExpertVideoService";




export default function VideoModalCateogry({ onClose }) {
  const [existingCategories, setExistingCategories] = useState([]);
  const [newCategories, setNewCategories]           = useState([""]);
  const [loadingExisting, setLoadingExisting]       = useState(true);
  const [deletingIds, setDeletingIds]               = useState(new Set());
  const [saving, setSaving]                         = useState(false);

  /* ── Fetch existing ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setExistingCategories(data);
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load categories" });
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, []);

  /* ── Delete existing ── */
  const handleDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteCategory(id);
      setExistingCategories((prev) => prev.filter((c) => c.id !== id));
      emitAlert({ type: "success", message: "Category deleted" });
      logAuditEvent({
        module: "expertvideos",
        action: "EXPERT_VIDEO_CATEGORY_DELETE",
        entityType: "category",
        entityId: id,
        summary: `Deleted video category ${id}`,
        changes: { id },
        route: "/leadtree/expert-videos",
      });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to delete category" });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  /* ── New field handlers ── */
  const addField    = () => setNewCategories((prev) => [...prev, ""]);
  const updateField = (index, value) =>
    setNewCategories((prev) => { const u = [...prev]; u[index] = value; return u; });
  const removeField = (index) =>
    setNewCategories((prev) => prev.filter((_, i) => i !== index));

  /* ── Save new categories ── */
  const saveCategories = async () => {
    const valid = newCategories.map((c) => c.trim()).filter(Boolean);
    if (valid.length === 0) {
      emitAlert({ type: "warning", message: "Enter at least one category" });
      return;
    }
    setSaving(true);
    try {
      const added = await createCategories(valid);
      emitAlert({ type: "success", message: "Categories saved successfully" });
      logAuditEvent({
        module: "expertvideos",
        action: "EXPERT_VIDEO_CATEGORY_CREATE",
        entityType: "category",
        entityId: null,
        summary: `Created ${added.length} video category${added.length === 1 ? "y" : "ies"}`,
        changes: { names: valid },
        route: "/leadtree/expert-videos",
      });
      onClose();
        setTimeout(() => window.location.reload(), 100);

    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to save categories" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold">Manage Video Categories</h2>

        {/* ── Existing ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Existing Categories
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loadingExisting ? (
              <p className="text-sm text-gray-400 text-center py-2">Loading…</p>
            ) : existingCategories.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-2">No categories yet</p>
            ) : (
              existingCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingIds.has(cat.id)}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-40 transition-colors text-sm cursor-pointer"
                  >
                    {deletingIds.has(cat.id) ? "…" : "✕"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <hr className="border-dashed border-gray-200" />

        {/* ── Add new ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Add New Categories
          </p>
          <div className="space-y-3">
            {newCategories.map((cat, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={cat}
                  onChange={(e) => updateField(index, e.target.value)}
                  placeholder="Card Category name"
                  className="border border-gray-200 px-3 py-2 rounded w-full text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => removeField(index)}
                  className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addField} className="text-sm text-blue-600 mt-3">
            + Add Another Type
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-3">
          <button onClick={onClose} className="border px-4 py-2 rounded text-sm cursor-pointer">
            Cancel
          </button>
          <button
            onClick={saveCategories}
            disabled={saving}
            className="bg-(--primary) text-white px-4 py-2 rounded text-sm cursor-pointer"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}