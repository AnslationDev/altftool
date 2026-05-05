"use client";

import { useState, useEffect } from "react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
    fetchBenefitedCard,
    createBenefitedCard,
 deleteBenefitCard,
} from "../credit-card-services/CreditCardService";



export default function CreditCardBenefitModal({ onClose }) {
  const [existingCategories, setExistingCategories] = useState([]);
  const [newCategories, setNewCategories]           = useState([""]);
  const [loadingExisting, setLoadingExisting]       = useState(true);
  const [deletingIds, setDeletingIds]               = useState(new Set());
  const [saving, setSaving]                         = useState(false);

  /* ── Fetch existing ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBenefitedCard();
        setExistingCategories(data);
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load card benefit" });
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, []);

  /* ── Delete existing ── */
  const handleDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteBenefitCard(id);
      setExistingCategories((prev) => prev.filter((c) => c.id !== id));
      emitAlert({ type: "success", message: "Card Benefit deleted" });
      logAuditEvent({
        module: "creditcard",
        action: "CREDIT_BENEFIT_DELETE",
        entityType: "cardBenefit",
        entityId: id,
        summary: `Deleted benefited card ${id}`,
        changes: { id },
        route: "/leadtree/credit-cards",
      });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to delete benefited card" });
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

  /* ── Save new benefited card ── */
  const saveCategories = async () => {
    const valid = newCategories.map((c) => c.trim()).filter(Boolean);
    if (valid.length === 0) {
      emitAlert({ type: "warning", message: "Enter at least one card" });
      return;
    }
    setSaving(true);
    try {
      const added = await createBenefitedCard(valid);
      emitAlert({ type: "success", message: "Card saved successfully" });
      logAuditEvent({
        module: "creditcard",
        action: "CREDIT_BENEFIT_CREATE",
          entityType: "cardBenefit",
        
        entityId: null,
        summary: `Created ${added.length} credit card benefit${added.length === 1 ? "y" : "ies"}`,
        changes: { names: valid },
        route: "/leadtree/credit-cards",
      });
      onClose();
        window.location.reload()
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to save card benefit" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold">Manage Card Benefit</h2>

        {/* ── Existing ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Existing Card Benefit
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loadingExisting ? (
              <p className="text-sm text-gray-400 text-center py-2">Loading…</p>
            ) : existingCategories.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-2">No benefited card  yet</p>
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
            Add New Benefit Card
          </p>
          <div className="space-y-3">
            {newCategories.map((cat, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={cat}
                  onChange={(e) => updateField(index, e.target.value)}
                  placeholder="Card Name"
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