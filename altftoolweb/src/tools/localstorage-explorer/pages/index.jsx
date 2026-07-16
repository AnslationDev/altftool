"use client";

import { useState, useEffect } from "react";
import { Database, Plus, Trash2, Edit2, RotateCcw, Save, X, Copy, Check } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

export default function LocalStorageExplorer() {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ key: "", value: "" });
  const [copiedKey, setCopiedKey] = useState(null);

  const loadStorage = () => {
    try {
      const storageItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        storageItems.push({ key, value });
      }
      // Sort alphabetically by key
      storageItems.sort((a, b) => a.key.localeCompare(b.key));
      setItems(storageItems);
    } catch (e) {
      toast.error("Failed to access LocalStorage. Ensure cookies/storage are not blocked.");
    }
  };

  useEffect(() => {
    loadStorage();
  }, []);

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!editForm.key.trim()) return;

    try {
      localStorage.setItem(editForm.key.trim(), editForm.value);
      toast.success(isEditing === "new" ? "Item added!" : "Item updated!");
      setIsEditing(null);
      loadStorage();
    } catch (e) {
      toast.error("Failed to save. Storage might be full.");
    }
  };

  const handleDelete = (key) => {
    try {
      localStorage.removeItem(key);
      toast.success("Item deleted");
      loadStorage();
    } catch (e) {
      toast.error("Failed to delete item.");
    }
  };
  
  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete ALL LocalStorage data for this domain? This cannot be undone.")) {
      try {
        localStorage.clear();
        toast.success("All LocalStorage data cleared.");
        loadStorage();
      } catch (e) {
        toast.error("Failed to clear storage.");
      }
    }
  };

  const startEdit = (item) => {
    setIsEditing(item.key);
    setEditForm({ key: item.key, value: item.value });
  };

  const copyToClipboard = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Database className="h-4 w-4" />
            Developer Tools
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Database className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            LocalStorage Explorer
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Inspect, create, edit, and delete browser LocalStorage keys and values for this domain in real-time.
          </p>
        </section>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button onClick={() => { setIsEditing("new"); setEditForm({ key: "", value: "" }); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
            <Button variant="outline" onClick={loadStorage} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          {items.length > 0 && (
             <Button variant="destructive" onClick={handleClearAll} className="gap-2">
                 <Trash2 className="h-4 w-4" /> Clear All
             </Button>
          )}
        </div>

        {/* Editor Modal / Inline Form */}
        {isEditing && (
          <form onSubmit={handleSaveItem} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg relative animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setIsEditing(null)} className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">{isEditing === "new" ? "Add New Item" : "Edit Item"}</h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name</label>
                <input
                  required
                  disabled={isEditing !== "new"}
                  value={editForm.key}
                  onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 disabled:opacity-50 font-mono text-sm"
                  placeholder="e.g. user_preferences"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <textarea
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 min-h-[150px] font-mono text-sm"
                  placeholder='{"theme": "dark"}'
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
              <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Save</Button>
            </div>
          </form>
        )}

        {/* LocalStorage List */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/3">Key</th>
                  <th className="px-4 py-3 font-semibold w-1/2">Value</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-[var(--muted-foreground)]">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No LocalStorage items found for this domain.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.key} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="px-4 py-3 font-medium align-top">
                        <div className="break-all font-mono text-xs">
                          {item.key}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="break-all font-mono text-xs text-[var(--muted-foreground)] line-clamp-3">
                          {item.value}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(item.value, item.key)} 
                          className="h-8 w-8"
                          title="Copy Value"
                        >
                          {copiedKey === item.key ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8" title="Edit Item">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.key)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" title="Delete Item">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
