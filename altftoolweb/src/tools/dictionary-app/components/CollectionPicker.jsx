import { useState } from "react";
import { FolderPlus, Check, ChevronDown, Plus, X } from "lucide-react";

export default function CollectionPicker({ word, collections, wordMap, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  // how many words in the collections
  const savedCount = collections.filter(
    (c) => wordMap[c.id]?.includes(word)
  ).length;

  const handleToggle = (collectionId) => {
    const isIn = wordMap[collectionId]?.includes(word);
    if (isIn) {
      onRemove(collectionId, word);
    } else {
      onAdd(collectionId, word);
    }
  };

  return (
    <div className="relative">

      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer border
          ${savedCount > 0
            ? "bg-(--muted) border-(--border) text-(--foreground)"
            : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
          }`}
      >
        <FolderPlus size={15} />
        <span>
          {savedCount > 0 ? `In ${savedCount} collection${savedCount > 1 ? "s" : ""}` : "Add to collection"}
        </span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-(--background) border border-(--border) rounded-xl shadow-lg z-50 overflow-hidden">

          {/* Collections list */}
          <div className="py-1">
            {collections.map((col) => {
              const isIn = wordMap[col.id]?.includes(word);
              const count = wordMap[col.id]?.length || 0;

              return (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-(--muted) transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{col.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">{col.name}</p>
                      <p className="text-xs text-(--muted-foreground)">{count} words</p>
                    </div>
                  </div>
                  {isIn && <Check size={15} className="text-(--primary) shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-(--border)"/>

          {/* New collection input */}
          {showNewInput ? (
            <div className="p-3 flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) {
                    // parent se createCollection call hoga
                    // event bubble up karo
                    const event = new CustomEvent("create-collection", {
                      detail: { name: newName.trim() },
                      bubbles: true,
                    });
                    e.target.dispatchEvent(event);
                    setNewName("");
                    setShowNewInput(false);
                  }
                  if (e.key === "Escape") {
                    setShowNewInput(false);
                    setNewName("");
                  }
                }}
                placeholder="Collection name..."
                className="flex-1 text-sm px-2 py-1 border border-(--border) rounded-md bg-(--background) text-(--foreground) outline-none"
              />
              <button
                onClick={() => { setShowNewInput(false); setNewName(""); }}
                className="text-(--muted-foreground) hover:text-red-500 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-(--primary) hover:bg-(--muted) transition cursor-pointer"
            >
              <Plus size={14} />
              New collection
            </button>
          )}

        </div>
      )}

      {/* close on outside click*/}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}