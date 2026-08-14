import React, { useState, useEffect } from "react";
import {
  fetchCaseStudies,
  saveCaseStudy,
  deleteCaseStudy,
} from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function CaseStudiesTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formSector, setFormSector] = useState("");
  const [formResults, setFormResults] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCaseStudies();
        setItems(data || []);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load case studies." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormId(`cs-${Date.now()}`);
    setFormSlug("");
    setFormTitle("");
    setFormClient("");
    setFormSector("");
    setFormResults("");
    setFormDescription("");
    setFormImage("");
    setFormDetails("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormSlug(item.slug || "");
    setFormTitle(item.title || "");
    setFormClient(item.client || "");
    setFormSector(item.sector || "");
    setFormResults(item.results || "");
    setFormDescription(item.description || "");
    setFormImage(item.image || "");
    setFormDetails(item.details || "");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: formId,
      slug: formSlug || formId,
      title: formTitle,
      client: formClient,
      sector: formSector,
      results: formResults,
      description: formDescription,
      image: formImage,
      details: formDetails,
    };

    try {
      await saveCaseStudy(formId, payload);
      
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
        message: editingItem ? "Case study updated!" : "Case study added!",
      });
      setModalOpen(false);
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save case study." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case study?")) return;
    try {
      await deleteCaseStudy(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      emitAlert({ type: "success", message: "Case study deleted." });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to delete case study." });
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
          <h2 className="text-lg font-bold">Case Studies Catalog</h2>
          <p className="text-xs text-[var(--muted)]">Manage customer case studies displayed on the website</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Case Study
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div>
              <button
                type="button"
                onClick={() => setPreviewImg(item.image || "https://images.pexels.com/photos/3182765/pexels-photo-3182765.jpeg")}
                title="Click to view full image"
                className="h-40 w-full bg-[var(--surface-soft)] overflow-hidden relative block hover:opacity-90 transition cursor-pointer"
              >
                <img
                  src={item.image || "https://images.pexels.com/photos/3182765/pexels-photo-3182765.jpeg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  {item.sector}
                </span>
                <span className="absolute bottom-2 right-2 bg-[var(--primary)] text-white font-bold text-xs px-2 py-1 rounded">
                  {item.results}
                </span>
              </button>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{item.client}</span>
                <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-1">{item.title}</h4>
                <p className="text-xs text-[var(--muted)] line-clamp-3">{item.description}</p>
              </div>
            </div>
            <div className="p-4 bg-[var(--surface-soft)] border-t border-[var(--border)] flex justify-end gap-2">
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

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden animate-slide-in">
            <div className="flex justify-between items-center bg-[var(--surface-soft)] p-4 border-b border-[var(--border)]">
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                {editingItem ? "Edit Case Study" : "Add New Case Study"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-red-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Client Name</label>
                  <input
                    type="text"
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Sector / Industry Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fintech"
                    className="input py-1.5 px-3 text-xs"
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. fintech-lead-gen"
                    className="input py-1.5 px-3 text-xs"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Results Highlight Badge</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400% Lead Growth"
                    className="input py-1.5 px-3 text-xs"
                    value={formResults}
                    onChange={(e) => setFormResults(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Headline Title</label>
                  <input
                    type="text"
                    required
                    className="input py-1.5 px-3 text-xs font-semibold"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Main Illustration Image URL</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      required
                      className="input py-1.5 px-3 text-xs flex-1"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                    />
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewImg(formImage)}
                        title="Click to view full image"
                        className="h-10 w-16 bg-slate-100 rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                      >
                        <img src={formImage} alt="Case Study Preview" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Short Summary Description</label>
                  <textarea
                    rows={2}
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Case Study Details (Detailed Narrative)</label>
                  <textarea
                    rows={4}
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                  />
                </div>
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
                  {editingItem ? "Save Changes" : "Create Case Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </div>
  );
}
