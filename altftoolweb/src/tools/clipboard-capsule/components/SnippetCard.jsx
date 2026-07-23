"use client";

import React from "react";
import { MoreVertical, Star, Trash2, Copy, Edit, Pin } from "lucide-react";
import { Badge } from "@altftool/ui";

export default function SnippetCard({ snippet, onEdit, onDelete, onToggleFavorite, onTogglePin, onCopy }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    onCopy(snippet.content);
    setMenuOpen(false);
  };

  return (
    <div className={`relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md ${snippet.isPinned ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}>
      
      {snippet.isPinned && (
        <div className="absolute -top-3 -right-3 rounded-full bg-[var(--primary)] p-1.5 text-white shadow-sm">
          <Pin size={14} className="fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 font-semibold text-[var(--foreground)]" title={snippet.title}>{snippet.title}</h3>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
              <button onClick={() => { onEdit(snippet); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Edit size={14} /> Edit
              </button>
              <button onClick={handleCopy} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Copy size={14} /> Copy Content
              </button>
              <button onClick={() => { onTogglePin(snippet.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Pin size={14} /> {snippet.isPinned ? "Unpin" : "Pin"}
              </button>
              <div className="my-1 h-px bg-[var(--border)]"></div>
              <button onClick={() => { onDelete(snippet.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex-grow rounded bg-[var(--muted)]/50 p-2 border border-[var(--border)]">
        <pre className="line-clamp-3 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap font-mono overflow-hidden">
          {snippet.content}
        </pre>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2">
          <Badge tone="neutral" className="text-xs">{snippet.category}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleFavorite(snippet.id)} 
            className={`rounded-full p-1.5 transition-colors ${snippet.isFavorite ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
            title={snippet.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star size={16} className={snippet.isFavorite ? "fill-current" : ""} />
          </button>
          <button 
            onClick={handleCopy} 
            className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
