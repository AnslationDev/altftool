"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Star, Trash2, Pencil, RotateCcw, Check, X, GitCompare } from "lucide-react";

export default function TimelineSidebar({ versions, selectedVersionId, onLoad, onDelete, onRename, onCompare }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  if (versions.length === 0) {
    return (
      <div className="p-4 text-center text-(--muted-foreground)">
        <Clock size="24" className="mx-auto mb-2 opacity-30" />
        <p className="text-xs">No saved versions</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {versions.slice(0, 20).map((v) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group p-2 rounded-lg cursor-pointer border transition ${
            selectedVersionId === v.id
              ? "bg-(--primary-soft) border-(--primary)"
              : "bg-(--card) border-(--border) hover:border-(--border-strong)"
          }`}
        >
          {editingId === v.id ? (
            <div className="flex gap-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onRename(v.id, editName); setEditingId(null); }
                  if (e.key === "Escape") setEditingId(null);
                }}
                aria-label="Version name"
                className="flex-1 min-w-0 text-xs px-1.5 py-0.5 rounded border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
                autoFocus
              />
              <button onClick={() => { onRename(v.id, editName); setEditingId(null); }} aria-label="Save version name" className="p-0.5 text-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 rounded"><Check size="12" /></button>
              <button onClick={() => setEditingId(null)} aria-label="Cancel rename" className="p-0.5 text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 rounded"><X size="12" /></button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0" onClick={() => onLoad(v)}>
                  <p className="text-xs font-medium text-(--foreground) truncate">{v.name}</p>
                  <p className="text-[10px] text-(--muted-foreground)">
                    {new Date(v.timestamp).toLocaleDateString()} {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition motion-reduce:transition-none shrink-0">
                  <button onClick={() => { setEditingId(v.id); setEditName(v.name); }} aria-label={`Rename version ${v.name}`} className="p-0.5 rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"><Pencil size="12" /></button>
                  <button onClick={() => onCompare(v)} aria-label={`Compare with version ${v.name}`} className="p-0.5 rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35" title="Compare"><GitCompare size="12" /></button>
                  <button onClick={() => onDelete(v.id)} aria-label={`Delete version ${v.name}`} className="p-0.5 rounded hover:bg-(--muted) text-(--muted-foreground) hover:text-(--danger) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"><Trash2 size="12" /></button>
                </div>
              </div>
              <div className="flex gap-2 mt-1 text-[10px] text-(--muted-foreground)">
                <span>{v.textA?.length || 0} chars</span>
                <span>→</span>
                <span>{v.textB?.length || 0} chars</span>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
