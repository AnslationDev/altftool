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
    <div className="mt-8 rounded-[var(--anslation-ds-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] md:p-5">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Comments</h2>

        {!showCommentBox && (
          <button
            type="button"
            onClick={() => setShowCommentBox(true)}
            className="h-9 rounded-[var(--anslation-ds-radius)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
          >
            Add Comment
          </button>
        )}
      </div>

      {showCommentBox && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--background)] p-4"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts..."
            className="w-full resize-none rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="h-9 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-9 rounded-[var(--anslation-ds-radius)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                A
              </div>

              <div className="flex-1 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--background)] p-4">
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
        <div className="rounded-[var(--anslation-ds-radius)] border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          No comments yet. Be the first to comment.
        </div>
      )}
    </div>
  );
}
