import React, { useState, useEffect } from "react";
import {
  fetchInsights,
  saveInsight,
  deleteInsight,
} from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function InsightsTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formReadTime, setFormReadTime] = useState(6);
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchInsights();
        setItems(data || []);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load insights catalog." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormId(`insight-${Date.now()}`);
    setFormSlug("");
    setFormTitle("");
    setFormExcerpt("");
    setFormTag("Trends");
    setFormImage("");
    setFormAuthor("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormReadTime(6);
    setFormContent("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormId(item.id);
    setFormSlug(item.slug || "");
    setFormTitle(item.title || "");
    setFormExcerpt(item.excerpt || "");
    setFormTag(item.tag || "Trends");
    setFormImage(item.image || "");
    setFormAuthor(item.author || "");
    setFormDate(item.date ? item.date.split("T")[0] : "");
    setFormReadTime(item.readTime || 6);
    setFormContent(item.content || "");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: formId,
      slug: formSlug || formId,
      title: formTitle,
      excerpt: formExcerpt,
      tag: formTag,
      image: formImage,
      author: formAuthor,
      date: new Date(formDate).toISOString(),
      readTime: Number(formReadTime),
      content: formContent,
    };

    try {
      await saveInsight(formId, payload);

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
        message: editingItem ? "Insight article updated!" : "Insight article created!",
      });
      setModalOpen(false);
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save insight article." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this insight article?")) return;
    try {
      await deleteInsight(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      emitAlert({ type: "success", message: "Insight deleted successfully." });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to delete insight." });
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
          <h2 className="text-lg font-bold">Insights &amp; Guides</h2>
          <p className="text-xs text-[var(--muted)]">Manage blog posts and articles displayed on the frontend</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Article
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row h-full">
              <button
                type="button"
                onClick={() => setPreviewImg(item.image || "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg")}
                title="Click to view full image"
                className="sm:w-1/3 h-40 sm:h-auto bg-slate-200 overflow-hidden relative block hover:opacity-90 transition cursor-pointer"
              >
                <img
                  src={item.image || "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="sm:w-2/3 p-4 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">{item.readTime} min read</span>
                  </div>
                  <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-[var(--muted)] line-clamp-3">{item.excerpt}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--muted)] pt-2 border-t border-[var(--border)]">
                  <span>By {item.author}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[var(--surface-soft)] border-t border-[var(--border)] flex justify-end gap-2">
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
                {editingItem ? "Edit Insight Article" : "Create Insight Article"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-red-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Author Name</label>
                  <input
                    type="text"
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Article Tag / Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Studies"
                    className="input py-1.5 px-3 text-xs"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B2b-seo-attribution"
                    className="input py-1.5 px-3 text-xs"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Read Time (minutes)</label>
                  <input
                    type="number"
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Publish Date</label>
                  <input
                    type="date"
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Header Illustration URL</label>
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
                        <img src={formImage} alt="Insight Preview" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Article Title</label>
                  <input
                    type="text"
                    required
                    className="input py-1.5 px-3 text-xs font-semibold"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Article Excerpt Summary</label>
                  <textarea
                    rows={2}
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Article Content (Markdown / HTML)</label>
                  <textarea
                    rows={6}
                    required
                    className="input py-1.5 px-3 text-xs"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
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
                  {editingItem ? "Save Changes" : "Publish Article"}
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
