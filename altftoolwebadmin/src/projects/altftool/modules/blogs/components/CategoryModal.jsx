"use client";

import { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  fetchCategories,
  createCategories,
  deleteCategory,
} from "../services/blogsService";

export default function CategoryModal({ onClose }) {
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
        module: "blogs",
        action: "BLOG_CATEGORY_DELETE",
        entityType: "category",
        entityId: id,
        summary: `Deleted blog category ${id}`,
        changes: { id },
        route: "/altftool/blogs",
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
        module: "blogs",
        action: "BLOG_CATEGORY_CREATE",
        entityType: "category",
        entityId: null,
        summary: `Created ${added.length} blog categor${added.length === 1 ? "y" : "ies"}`,
        changes: { names: valid },
        route: "/altftool/blogs",
      });
      onClose();
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
        <h2 className="text-lg font-semibold">Manage Categories</h2>

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
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingIds.has(cat.id)}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-40 transition-colors text-sm"
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
                  placeholder="Category name"
                  className="border px-3 py-2 rounded w-full text-sm"
                />
                <button
                  onClick={() => removeField(index)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addField} className="text-sm text-blue-600 mt-3">
            + Add Another
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-3">
          <button onClick={onClose} className="border px-4 py-2 rounded text-sm">
            Cancel
          </button>
          <button
            onClick={saveCategories}
            disabled={saving}
            className="bg-(--primary) text-white px-4 py-2 rounded text-sm"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}