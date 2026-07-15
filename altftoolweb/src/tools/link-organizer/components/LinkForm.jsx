import React, { useState, useEffect } from "react";
import { Button } from "@altftool/ui";
import { X } from "lucide-react";

export default function LinkForm({ isOpen, onClose, onSave, groups, editingLink = null }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(groups[0] || "Daily Reads");
  const [newGroup, setNewGroup] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingLink) {
        setUrl(editingLink.url);
        setTitle(editingLink.title || "");
        setGroup(editingLink.group || groups[0] || "Daily Reads");
      } else {
        setUrl("");
        setTitle("");
        setGroup(groups[0] || "Daily Reads");
      }
      setIsAddingGroup(false);
      setNewGroup("");
    }
  }, [isOpen, editingLink, groups]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    let finalGroup = group;
    if (isAddingGroup && newGroup.trim()) {
      finalGroup = newGroup.trim();
    }

    onSave({
      url,
      title,
      group: finalGroup,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {editingLink ? "Edit Link" : "Add Link"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">URL *</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource Name"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
              Group / Folder
              <button 
                type="button" 
                onClick={() => setIsAddingGroup(!isAddingGroup)}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                {isAddingGroup ? "Select Existing" : "Add New Group"}
              </button>
            </label>
            
            {isAddingGroup ? (
              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                placeholder="New Group Name"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            ) : (
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingLink ? "Save Changes" : "Save Link"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
