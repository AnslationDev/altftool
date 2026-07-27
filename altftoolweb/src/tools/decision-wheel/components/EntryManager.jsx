"use client";

import { useState } from "react";
import { Button, Input } from "@altftool/ui";
import { Plus, X, Pencil, Copy, Shuffle, Trash2, Upload } from "lucide-react";

export default function EntryManager({
  entries, onAdd, onAddMultiple, onRemove, onEdit, onDuplicate, onShuffle, onClear, onImport,
}) {
  const [newEntry, setNewEntry] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [bulkInput, setBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleAdd = () => {
    if (!newEntry.trim()) return;
    onAdd(newEntry);
    setNewEntry("");
  };

  const handleBulkAdd = () => {
    const items = bulkText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    onAddMultiple(items);
    setBulkText("");
    setBulkInput(false);
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry.id);
    setEditValue(entry.name);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingId) {
      onEdit(editingId, editValue);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) onImport(data);
      } catch {
        const lines = ev.target.result.split("\n").map((l) => l.trim()).filter(Boolean);
        onImport(lines);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--foreground)">Entries ({entries.length})</h3>
        <div className="flex gap-1">
          <button onClick={() => setBulkInput(!bulkInput)} aria-label="Bulk add entries" className="p-1.5 rounded-md hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)" title="Bulk add">
            <Upload size="16" />
          </button>
          {entries.length > 1 && (
            <button onClick={onShuffle} aria-label="Shuffle entries" className="p-1.5 rounded-md hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)" title="Shuffle">
              <Shuffle size="16" />
            </button>
          )}
          {entries.length > 0 && (
            <button onClick={onClear} aria-label="Clear all entries" className="p-1.5 rounded-md hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)" title="Clear all">
              <Trash2 size="16" />
            </button>
          )}
        </div>
      </div>

      {bulkInput ? (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste entries (one per line)..."
            aria-label="Bulk entries, one per line"
            className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) resize-none focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
          />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleBulkAdd}>Add All</Button>
            <Button variant="ghost" size="sm" onClick={() => { setBulkInput(false); setBulkText(""); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Add entry..."
            aria-label="New entry name"
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newEntry.trim()} aria-label="Add entry" className="active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)">
            <Plus size="16" />
          </Button>
        </div>
      )}

      <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {entries.length === 0 ? (
          <p className="text-xs text-(--muted-foreground) text-center py-4">No entries yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--muted) group hover:bg-(--border) transition"
            >
              {editingId === entry.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditingId(null); }}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm text-(--foreground) truncate">{entry.name}</span>
              )}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                {editingId === entry.id ? (
                  <button onClick={handleSaveEdit} aria-label="Save entry name" className="p-1 rounded hover:bg-(--card) text-(--primary)">✓</button>
                ) : (
                  <button onClick={() => handleStartEdit(entry)} aria-label={`Edit ${entry.name}`} className="p-1 rounded hover:bg-(--card) text-(--muted-foreground) hover:text-(--foreground)" title="Edit">
                    <Pencil size="13" />
                  </button>
                )}
                <button onClick={() => onDuplicate(entry.id)} aria-label={`Duplicate ${entry.name}`} className="p-1 rounded hover:bg-(--card) text-(--muted-foreground) hover:text-(--foreground)" title="Duplicate">
                  <Copy size="13" />
                </button>
                <button onClick={() => onRemove(entry.id)} aria-label={`Remove ${entry.name}`} className="p-1 rounded hover:bg-(--card) text-(--muted-foreground) hover:text-(--danger)" title="Remove">
                  <X size="13" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} className="hidden" id="wheel-file-input" />
      <label htmlFor="wheel-file-input" className="block text-center text-xs text-(--muted-foreground) cursor-pointer hover:text-(--primary) transition py-1 border border-dashed border-(--border) rounded-lg">
        Import JSON / CSV
      </label>
    </div>
  );
}
