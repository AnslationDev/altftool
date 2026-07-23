"use client";

import React from "react";
import { ExternalLink, MoreVertical, Star, Trash2, Copy, Edit } from "lucide-react";
import { Badge } from "@altftool/ui";
import { getFaviconUrl } from "../utils/linkDb";

export default function LinkCard({ link, onEdit, onDelete, onToggleFavorite }) {
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md">
      
      <div className="flex items-start justify-between gap-3">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-3 hover:opacity-80 overflow-hidden">
          <img 
            src={getFaviconUrl(link.url)} 
            alt="favicon" 
            className="h-10 w-10 shrink-0 rounded-md bg-[var(--muted)] object-contain p-1"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="flex-1 overflow-hidden">
            <h3 className="line-clamp-1 font-semibold text-[var(--foreground)]" title={link.title}>{link.title}</h3>
            <p className="line-clamp-1 text-xs text-[var(--muted-foreground)]" title={link.url}>{link.url}</p>
          </div>
        </a>

        <div className="relative shrink-0" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
              <button onClick={() => { onEdit(link); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Edit size={14} /> Edit
              </button>
              <button onClick={handleCopy} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Copy size={14} /> Copy URL
              </button>
              <div className="my-1 h-px bg-[var(--border)]"></div>
              <button onClick={() => { onDelete(link.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2">
          <Badge tone="neutral" className="text-xs">{link.group}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleFavorite(link.id)} 
            className={`rounded-full p-1.5 transition-colors ${link.isFavorite ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
          >
            <Star size={16} className={link.isFavorite ? "fill-current" : ""} />
          </button>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
