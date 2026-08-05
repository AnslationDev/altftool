"use client";

import { Bookmark } from "lucide-react";
import useFestivalFavorites from "../../hooks/useFestivalFavorites";

export default function BookmarkButton({ slug, className = "bookmark-btn", size = 15 }) {
  const { isFavorite, toggleFavorite } = useFestivalFavorites();
  const favorited = isFavorite(slug);

  return (
    <button
      type="button"
      className={className}
      aria-label={favorited ? "Remove bookmark" : "Bookmark this festival"}
      aria-pressed={favorited}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(slug);
      }}
    >
      <Bookmark size={size} fill={favorited ? "currentColor" : "none"} />
    </button>
  );
}
