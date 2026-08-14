import React, { useState, useEffect } from "react";
import {
  fetchIndustries,
  saveIndustry,
  deleteIndustry,
} from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Pencil, Trash2, X, Building2 } from "lucide-react";

export default function IndustriesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form fields
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchIndustries();
        setItems(data || []);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load industries." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormId(`industry-${Date.now()}`);
    setFormName("");
    setFormIcon("");
    setFormDescription("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormName(item.name || "");
    setFormIcon(item.icon || "");
    setFormDescription(item.description || "");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: formId,
      name: formName,
      icon: formIcon,
      description: formDescription,
    };

    try {
      await saveIndustry(formId, payload);

      setItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.id === formId);
        if (existingIdx !== -1) {
          const list = [...prev];
          list[existingIdx] = payload;
          return list;
        }
        return [...prev, payload];
      });

      emitAlert({
        type: "success",
        message: editingItem ? "Industry updated!" : "Industry added!",
      });
      setModalOpen(false);
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save industry." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this industry?")) return;
    try {
      await deleteIndustry(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      emitAlert({ type: "success", message: "Industry deleted." });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to delete industry." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-lg">
        <div>
          <h2 className="text-lg font-bold">Industries Served</h2>
          <p className="text-xs text-[var(--muted)]">Manage the industry/vertical cards shown on the homepage &amp; about page</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Industry
        </button>
      </div>

      {/* Grid List */}
      {items.length === 0 ? (
        <div className="card p-16 text-center space-y-3">
          <Building2 className="h-10 w-10 text-[var(--muted)] mx-auto" />
          <p className="font-semibold text-[var(--foreground)]">No industries yet</p>
          <p className="text-xs text-[var(--muted)]">Add the verticals Alphobia serves to populate this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-soft)] text-[var(--primary)] border border-[var(--border)]">
                  {item.icon || "icon"}
                </span>
                <h4 className="font-bold text-sm text-[var(--foreground)]">{item.name}</h4>
                <p className="text-xs text-[var(--muted)] line-clamp-3">{item.description}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => openEditModal(item)}
                  className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-danger py-1 px-3 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden animate-slide-in">
            <div className="flex justify-between items-center bg-[var(--surface-soft)] p-4 border-b border-[var(--border)]">
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                {editingItem ? "Edit Industry" : "Add New Industry"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--danger)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Industry Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SaaS & Cloud Tech"
                  className="input py-1.5 px-3 text-xs"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Icon Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. cloud"
                  className="input py-1.5 px-3 text-xs"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                />
                <p className="text-[10px] text-[var(--muted)]">Matches the icon name used by the frontend&apos;s icon set.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  rows={3}
                  required
                  className="input py-1.5 px-3 text-xs"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline py-1.5 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary py-1.5 px-4 text-xs flex items-center gap-1"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingItem ? "Save Changes" : "Add Industry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
