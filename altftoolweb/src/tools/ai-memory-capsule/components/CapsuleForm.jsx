import React, { useState, useEffect } from "react";
import { X, Lock, Unlock } from "lucide-react";
import { MOODS, INTENSITY_LEVELS } from "../constants/index";

export default function CapsuleForm({ isOpen, onClose, onSave, categories, editingCapsule = null }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [intensity, setIntensity] = useState(3);
  const [category, setCategory] = useState(categories[0] || "Personal");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isSealed, setIsSealed] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingCapsule) {
        setTitle(editingCapsule.title || "");
        setContent(editingCapsule.content || "");
        setMood(editingCapsule.mood || "neutral");
        setIntensity(editingCapsule.intensity || 3);
        setCategory(editingCapsule.category || categories[0] || "Personal");
        setTags(editingCapsule.tags || []);
        setIsSealed(editingCapsule.isSealed || false);
        setUnlockDate(editingCapsule.unlockDate || "");
      } else {
        setTitle("");
        setContent("");
        setMood("neutral");
        setIntensity(3);
        setCategory(categories[0] || "Personal");
        setTags([]);
        setIsSealed(false);
        setUnlockDate("");
      }
      setTagInput("");
      setIsAddingCategory(false);
      setNewCategory("");
    }
  }, [isOpen, editingCapsule, categories]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "");
      if (tag && !tags.includes(tag)) setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    let finalCategory = category;
    if (isAddingCategory && newCategory.trim()) finalCategory = newCategory.trim();
    onSave({
      title: title.trim() || "Untitled Memory",
      content: content.trim(),
      mood, intensity,
      category: finalCategory,
      tags,
      isSealed,
      unlockDate: isSealed ? unlockDate : null,
    });
    onClose();
  };

  const selectedMood = MOODS.find((m) => m.id === mood);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {editingCapsule ? "Edit Memory" : "Create Memory Capsule"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Title (Optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give this memory a name..."
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Memory *</label>
            <textarea required value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write about this memory... What happened? How did it make you feel?" rows={5}
              className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            <p className="mt-1 text-right text-xs text-[var(--muted-foreground)]">{content.split(/\s+/).filter(Boolean).length} words</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">How did this make you feel?</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMood(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${mood === m.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Intensity: <span style={{ color: selectedMood?.color }}>{INTENSITY_LEVELS[intensity - 1]?.label}</span>
            </label>
            <div className="flex gap-2">
              {INTENSITY_LEVELS.map((level) => (
                <button key={level.id} type="button" onClick={() => setIntensity(level.id)}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${intensity === level.id ? "text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"}`}
                  style={intensity === level.id ? { backgroundColor: selectedMood?.color || "var(--primary)" } : {}}>
                  {level.id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
              Category
              <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="text-xs text-[var(--primary)] hover:underline">
                {isAddingCategory ? "Select Existing" : "Add New"}
              </button>
            </label>
            {isAddingCategory ? (
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category Name"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            ) : (
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Tags</label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] p-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[var(--muted-foreground)] hover:text-red-500">&times;</button>
                </span>
              ))}
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
                className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none" />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-3">
            <label className="flex cursor-pointer items-center gap-3">
              <div className={`flex h-6 w-10 items-center rounded-full transition-colors ${isSealed ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isSealed ? "translate-x-5" : "translate-x-1"}`} />
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                  {isSealed ? <Lock size={14} /> : <Unlock size={14} />} Seal this capsule
                </span>
                <span className="block text-xs text-[var(--muted-foreground)]">Capsule will be locked until the date you set</span>
              </div>
            </label>
            {isSealed && (
              <input type="datetime-local" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors">
              {editingCapsule ? "Save Changes" : "Create Capsule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
