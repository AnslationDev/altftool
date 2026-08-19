"use client";

import React from "react";
import { Modal, Button, EmptyState } from "@altftool/ui";
import { Heart, Trash2 } from "lucide-react";

export default function FavoritesModal({
  open,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectQuote
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Favorite Quotes"
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {favorites.length === 0 ? (
          <EmptyState 
            icon={<Heart size={32} className="text-muted-foreground" />}
            title="No favorites yet"
            description="Click the heart icon on any quote to save it here for later."
          />
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div 
                key={fav.id} 
                className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors group cursor-pointer"
                onClick={() => onSelectQuote(fav)}
              >
                <div>
                  <p className="font-medium text-foreground text-sm line-clamp-2">"{fav.text}"</p>
                  <p className="text-xs text-muted-foreground mt-1">— {fav.author}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Remove this quote from your favorites?")) {
                      onRemoveFavorite(fav.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                  aria-label="Remove favorite"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
