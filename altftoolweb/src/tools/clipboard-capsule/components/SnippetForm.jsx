import React, { useState, useEffect } from "react";
import { Button } from "@altftool/ui";
import { X, ClipboardPaste } from "lucide-react";

export default function SnippetForm({ isOpen, onClose, onSave, categories, editingSnippet = null }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0] || "Text");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingSnippet) {
        setTitle(editingSnippet.title || "");
        setContent(editingSnippet.content || "");
        setCategory(editingSnippet.category || categories[0] || "Text");
      } else {
        setTitle("");
        setContent("");
        setCategory(categories[0] || "Text");
      }
      setIsAddingCategory(false);
      setNewCategory("");
    }
  }, [isOpen, editingSnippet, categories]);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent((prev) => prev + text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
      alert("Unable to access clipboard. Please paste manually.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content) return;
    
    let finalCategory = category;
    if (isAddingCategory && newCategory.trim()) {
      finalCategory = newCategory.trim();
    }

    onSave({
      title,
      content,
      category: finalCategory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl flex flex-col max-h-[90vh]">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {editingSnippet ? "Edit Snippet" : "Add Snippet"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden space-y-4">
          <div className="overflow-y-auto pr-1 flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Database Connection String"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]">Content *</label>
                {!editingSnippet && (
                  <button 
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    <ClipboardPaste size={14} /> Paste from Clipboard
                  </button>
                )}
              </div>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your snippet here..."
                className="w-full flex-1 resize-none font-mono rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
                Category
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  {isAddingCategory ? "Select Existing" : "Add New"}
                </button>
              </label>
              
              {isAddingCategory ? (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category Name"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 shrink-0 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSnippet ? "Save Changes" : "Save Snippet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
