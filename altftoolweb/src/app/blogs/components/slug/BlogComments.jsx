"use client";

import { useState } from "react";

export default function BlogComments({
  comments,
  addComment,
  showCommentBox,
  setShowCommentBox,
}) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(newComment.trim());
    setNewComment("");
    setShowCommentBox(false);
  };

  return (
    <div className="mt-20 border-t border-[var(--border)] pt-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="subheading font-primary">Comments</h2>

        {!showCommentBox && (
          <button
            onClick={() => setShowCommentBox(true)}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm hover:brightness-110 transition"
          >
            Add Comment
          </button>
        )}
      </div>

      {/* Comment Box */}
      {showCommentBox && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/20 rounded-xl p-5 shadow-lg"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts..."
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm hover:brightness-110 transition"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((c, index) => (
            <div key={index} className="flex gap-4">

              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-cyan-400 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                A
              </div>

              {/* Glass Comment Card */}
              <div className="flex-1 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/20 rounded-xl p-4 shadow-lg hover:shadow-xl transition">

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Anonymous User
                  </span>

                  <span className="text-xs text-[var(--muted-foreground)]">
                    {c.createdAt?.seconds
                      ? new Date(c.createdAt.seconds * 1000).toLocaleString()
                      : c.date}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {c.text}
                </p>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)]">
          No comments yet. Be the first to comment.
        </div>
      )}
    </div>
  );
}