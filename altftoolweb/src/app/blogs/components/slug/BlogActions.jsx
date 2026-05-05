"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";

export default function BlogActions({
  blogId,
  likes,
  setLikes,
  liked,
  setLiked,
  commentsCount,
  showCommentBox,
  setShowCommentBox,
  author,
  date
}) {

  const handleLike = async () => {
    const newLiked = !liked;
    const nextLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    setLiked(newLiked);
    setLikes(nextLikes);

    if (typeof blogId !== "string") return;

    try {
      await updateDoc(doc(db, "projects", PROJECT_ID, "blogs", blogId), {
        likesCount: increment(newLiked ? 1 : -1),
      });
    } catch (error) {
      console.error("Unable to persist blog like:", error);
      setLiked(!newLiked);
      setLikes(likes);
    }
  };

  return (
    <div className="mt-8 rounded-[var(--anslation-ds-radius-lg)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex h-9 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border px-3 transition-colors ${
              liked
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            }`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] px-3 transition-colors hover:text-[var(--primary)]"
          >
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => navigator.share?.({ url: window.location.href })}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] px-3 transition-colors hover:text-[var(--primary)]"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
          <span>Author: {author || "Admin"}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
