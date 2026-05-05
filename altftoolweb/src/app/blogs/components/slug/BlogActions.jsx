"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BlogActions({
  blogId,
  likes,
  setLikes,
  liked,
  setLiked,
  commentsCount,
  showCommentBox,
  setShowCommentBox,
  newComment,
  setNewComment,
  onAddComment,
  author,
  date
}) {

  const handleLike = async () => {
    const newLiked = !liked;

    setLiked(newLiked);
    setLikes(newLiked ? likes + 1 : likes - 1);

    await updateDoc(doc(db, "blogs", blogId), {
      likesCount: increment(newLiked ? 1 : -1)
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(newComment.trim());
    setNewComment("");
    setShowCommentBox(false);
  };

  return (
    <div className="mt-12 pt-6 border-t border-[var(--border)]">

      {/* ACTION BAR */}

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">

        {/* LEFT ACTIONS */}

        <div className="flex items-center gap-6">

          {/* LIKE */}

          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              liked ? "text-red-500" : "text-[var(--muted-foreground)]"
            }`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
          </button>

          {/* COMMENT */}

          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center gap-1 transition-colors hover:text-[var(--primary)]"
          >
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
          </button>

          {/* SHARE */}

          <button
            onClick={() =>
              navigator.share?.({ url: window.location.href })
            }
            className="flex items-center gap-1 transition-colors hover:text-[var(--secondary)]"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>

        </div>

        {/* AUTHOR INFO */}

        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span>Author: {author || "Admin"}</span>
          <span>Published: {date}</span>
        </div>

      </div>

      {/* COMMENT BOX */}

      {showCommentBox && (
        <form
          onSubmit={handleCommentSubmit}
          className="mt-4 w-full max-w-2xl flex flex-col gap-2"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Write your comment..."
            className="w-full p-3 border rounded-md text-[var(--foreground)] bg-[var(--muted)] border-[var(--border)]"
          />

          <button
            type="submit"
            className="self-end px-4 py-2 rounded transition-colors text-[var(--primary-foreground)] bg-[var(--primary)] hover:brightness-90"
          >
            Post
          </button>

        </form>
      )}

    </div>
  );
}