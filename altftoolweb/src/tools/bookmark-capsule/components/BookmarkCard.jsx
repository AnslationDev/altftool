import React from "react";
import { ExternalLink, MoreVertical, Star, Archive, Trash2, Copy, Edit, Pin } from "lucide-react";
import { Badge, Button } from "@altftool/ui";
import { getFaviconUrl } from "../utils/bookmarkDb";

// A simple Dropdown mock as standard @altftool/ui dropdown might require exact import
// Assuming a custom wrapper or standard HTML/CSS dropdown if not fully sure about @altftool/ui Dropdown API.
// Alternatively, we'll build an inline action menu if Dropdown is complex, but let's use absolute positioning for a simple menu.
export default function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite, onToggleArchive, onTogglePin }) {
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
      await navigator.clipboard.writeText(bookmark.url);
      setMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md ${bookmark.isPinned ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}>
      
      {bookmark.isPinned && (
        <div className="absolute -top-3 -right-3 rounded-full bg-[var(--primary)] p-1.5 text-white shadow-sm">
          <Pin size={14} className="fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80">
          <img 
            src={getFaviconUrl(bookmark.url)} 
            alt="favicon" 
            className="h-10 w-10 rounded-md bg-[var(--muted)] object-contain p-1"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h3 className="line-clamp-1 font-semibold text-[var(--foreground)]">{bookmark.title}</h3>
            <p className="line-clamp-1 text-xs text-[var(--muted-foreground)]">{new URL(bookmark.url).hostname}</p>
          </div>
        </a>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
              <button onClick={() => { onEdit(bookmark); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Edit size={14} /> Edit
              </button>
              <button onClick={handleCopy} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Copy size={14} /> Copy URL
              </button>
              <button onClick={() => { onTogglePin(bookmark.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Pin size={14} /> {bookmark.isPinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => { onToggleArchive(bookmark.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Archive size={14} /> {bookmark.isArchived ? "Unarchive" : "Archive"}
              </button>
              <div className="my-1 h-px bg-[var(--border)]"></div>
              <button onClick={() => { onDelete(bookmark.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex-grow">
        {bookmark.description && (
          <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">{bookmark.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2">
          <Badge tone="neutral" className="text-xs">{bookmark.category}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleFavorite(bookmark.id)} 
            className={`rounded-full p-1.5 transition-colors ${bookmark.isFavorite ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
          >
            <Star size={16} className={bookmark.isFavorite ? "fill-current" : ""} />
          </button>
          <a 
            href={bookmark.url} 
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
