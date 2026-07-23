"use client";

import React from "react";
import { Star, Pin, Lock, Calendar, Trash2, Edit, Eye, BarChart3 } from "lucide-react";
import { MOODS } from "../constants/index";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CapsuleCard({ capsule, onEdit, onDelete, onToggleFavorite, onTogglePin, onSelect, onAnalyze }) {
  const mood = MOODS.find((m) => m.id === capsule.mood) || MOODS[8];
  const isLocked = capsule.isSealed && capsule.unlockDate && new Date(capsule.unlockDate) > new Date();

  return (
    <div className={`relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md ${capsule.isPinned ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}>
      {capsule.isPinned && (
        <div className="absolute -top-3 -right-3 rounded-full bg-[var(--primary)] p-1.5 text-white shadow-sm">
          <Pin size={14} className="fill-current" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: mood.color + "20" }}>
            {mood.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-1 font-semibold text-[var(--foreground)]">
              {isLocked ? "Locked Capsule" : capsule.title || "Untitled Memory"}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Calendar size={12} />
              {formatDate(capsule.dateCreated)}
              {capsule.isSealed && (
                <><span className="mx-1">&middot;</span><Lock size={12} className="text-amber-500" /> Sealed</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex-grow">
        {isLocked ? (
          <p className="line-clamp-2 text-sm italic text-[var(--muted-foreground)]">
            This capsule is sealed until {formatDate(capsule.unlockDate)}
          </p>
        ) : (
          <p className="line-clamp-3 text-sm text-[var(--muted-foreground)]">{capsule.content}</p>
        )}
      </div>

      {capsule.tags && capsule.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {capsule.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted-foreground)]">
              #{tag}
            </span>
          ))}
          {capsule.tags.length > 3 && (
            <span className="text-[10px] text-[var(--muted-foreground)]">+{capsule.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted-foreground)]">{capsule.category}</span>
          <span className="text-[10px] text-[var(--muted-foreground)]">{capsule.wordCount || 0} words</span>
        </div>
        <div className="flex items-center gap-1">
          {!isLocked && (
            <button onClick={() => onAnalyze(capsule)} className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors" title="AI Analysis">
              <BarChart3 size={14} />
            </button>
          )}
          <button onClick={() => onSelect(capsule)} className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => onEdit(capsule)} className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors" title="Edit">
            <Edit size={14} />
          </button>
          <button onClick={() => onToggleFavorite(capsule.id)} className={`rounded-full p-1.5 transition-colors ${capsule.isFavorite ? "text-amber-500" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`} title="Favorite">
            <Star size={14} className={capsule.isFavorite ? "fill-current" : ""} />
          </button>
          <button onClick={() => onDelete(capsule.id)} className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
