"use client";

import React from "react";
import { MoreVertical, Star, Trash2, Copy, Edit, Pin } from "lucide-react";
import { Badge } from "@altftool/ui";

export default function SnippetCard({ snippet, onEdit, onDelete, onToggleFavorite, onTogglePin, onCopy }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const initialFocusRef = React.useRef("first");
  const menuId = React.useId();

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
    const target = initialFocusRef.current === "last" ? items?.[items.length - 1] : items?.[0];
    target?.focus();
  }, [menuOpen]);

  const openMenu = (initialFocus = "first") => {
    initialFocusRef.current = initialFocus;
    setMenuOpen(true);
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event) => {
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
    const index = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    } else if (event.key === "Tab") {
      closeMenu();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!items.length) return;
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : event.key === "ArrowDown"
              ? (index + 1 + items.length) % items.length
              : (index - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    }
  };

  const handleCopy = () => {
    onCopy(snippet.content);
    closeMenu();
  };

  return (
    <div className={`relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md ${snippet.isPinned ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}>
      
      {snippet.isPinned && (
        <div className="absolute -top-3 -right-3 rounded-full bg-[var(--primary)] p-1.5 text-[var(--primary-foreground)] shadow-sm">
          <Pin size={14} className="fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 font-semibold text-[var(--foreground)]" title={snippet.title}>{snippet.title}</h3>

        <div className="relative" ref={menuRef}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                openMenu(event.key === "ArrowUp" ? "last" : "first");
              } else if (event.key === "Escape" && menuOpen) {
                event.preventDefault();
                closeMenu({ restoreFocus: true });
              }
            }}
            aria-label={`More options for ${snippet.title || "this snippet"}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div id={menuId} role="menu" aria-label="Snippet actions" onKeyDown={handleMenuKeyDown} className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
              <button type="button" role="menuitem" onClick={() => { onEdit(snippet); closeMenu(); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Edit size={14} /> Edit
              </button>
              <button type="button" role="menuitem" onClick={handleCopy} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Copy size={14} /> Copy Content
              </button>
              <button type="button" role="menuitem" onClick={() => { onTogglePin(snippet.id); closeMenu(); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Pin size={14} /> {snippet.isPinned ? "Unpin" : "Pin"}
              </button>
              <div className="my-1 h-px bg-[var(--border)]"></div>
              <button type="button" role="menuitem" onClick={() => { onDelete(snippet.id); closeMenu(); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-[var(--danger-text)] hover:bg-[var(--danger-soft)]">
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
            type="button"
            onClick={() => onToggleFavorite(snippet.id)} 
            className={`rounded-full p-1.5 transition-colors ${snippet.isFavorite ? 'text-[var(--warning)] hover:bg-[var(--warning-soft)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
            title={snippet.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            aria-label={snippet.isFavorite ? `Remove ${snippet.title} from favorites` : `Add ${snippet.title} to favorites`}
          >
            <Star size={16} className={snippet.isFavorite ? "fill-current" : ""} />
          </button>
          <button 
            type="button"
            onClick={handleCopy} 
            className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            title="Copy to clipboard"
            aria-label={`Copy ${snippet.title} to clipboard`}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
