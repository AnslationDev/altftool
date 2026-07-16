"use client";
import React from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Eye,
  Award,
  Image,
  FileImage,
} from "lucide-react";

export default function DuplicateGroups({
  groups,
  selectedItems,
  onToggleSelect,
  onCompare,
  onDeleteSelected,
}) {
  const formatKB = (bytes) => {
    if (!bytes) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  if (groups.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3 shadow-sm">
        <FileImage className="w-10 h-10 text-muted-foreground mx-auto" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">No duplicate groups found</p>
        <p className="text-xs text-muted-foreground">
          Add more images or lower the similarity threshold to detect duplicates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-xl border border-border/60">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
            Selected Items
          </span>
          <span className="text-xs font-black text-foreground">
            {selectedItems.length} marked for deletion
          </span>
        </div>
        <button
          onClick={onDeleteSelected}
          disabled={selectedItems.length === 0}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          aria-label={`Delete ${selectedItems.length} selected images`}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Remove Marked ({selectedItems.length})
        </button>
      </div>

      <div className="space-y-6">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-secondary/40 border-b border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  Duplicate Group #{groupIdx + 1}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {group.items.length} files &middot; ~{group.similarity}% similarity match
                </p>
              </div>
              {group.items.length >= 2 && (
                <button
                  onClick={() => onCompare(group.items[0], group.items[1])}
                  className="px-3 py-1.5 border border-border hover:bg-secondary rounded-lg text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
                  aria-label={`Compare ${group.items[0].name} and ${group.items[1].name}`}
                >
                  <Eye className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  Visual Compare
                </button>
              )}
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.items.map((item) => {
                const isChecked = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative border rounded-xl overflow-hidden bg-secondary/10 flex flex-col transition-all ${
                      isChecked
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-border/60 hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <button
                      onClick={() => onToggleSelect(item.id)}
                      className="absolute top-2.5 left-2.5 z-10 p-1 bg-black/60 rounded-md border border-white/10 text-white hover:bg-black/80 transition-all"
                      aria-label={isChecked ? `Deselect ${item.name}` : `Select ${item.name} for deletion`}
                      aria-pressed={isChecked}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-rose-500 fill-current" aria-hidden="true" />
                      ) : (
                        <Square className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>

                    <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-3 space-y-1.5">
                      <span
                        className="text-[10px] font-bold text-foreground block truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>{formatKB(item.size)}</span>
                        <span>{item.dimensions || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
