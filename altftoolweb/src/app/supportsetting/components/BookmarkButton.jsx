"use client";

import { Star } from "lucide-react";

/**
 * Small star toggle used on the detail page hero. Backed by useBookmarks()
 * (data/preferences.js) — purely local, same storage pattern as recently-
 * used. Powers both this button and the "Favorite Settings" row on the
 * home dashboard.
 */
const BookmarkButton = ({ active, onToggle, label = "this page" }) => (
  <button
    type="button"
    className={`support-bookmark-btn ${active ? "support-bookmark-btn-active" : ""}`}
    onClick={onToggle}
    aria-pressed={active}
    aria-label={active ? `Remove ${label} from bookmarks` : `Bookmark ${label}`}
    title={active ? "Bookmarked" : "Bookmark this page"}
  >
    <Star className="h-4 w-4" fill={active ? "currentColor" : "none"} />
  </button>
);

export default BookmarkButton;
