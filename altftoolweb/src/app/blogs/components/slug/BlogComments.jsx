"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

function formatCommentDate(comment) {
  const value = comment.createdAt?.seconds
    ? new Date(comment.createdAt.seconds * 1000)
    : comment.date
      ? new Date(comment.date)
      : null;

  if (!value || Number.isNaN(value.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

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
    <section className="mt-8 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] md:p-5">

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[var(--muted)] text-[var(--primary)]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              Discussion
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </h2>
          </div>
        </div>

        {!showCommentBox && (
          <button
            type="button"
            onClick={() => setShowCommentBox(true)}
            className="h-9 rounded-[6px] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-active)]"
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
            className="w-full resize-none rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="h-9 rounded-[6px] border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-active)]"
            >
              <Send className="h-4 w-4" />
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
                    {formatCommentDate(c)}
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
        <div className="rounded-[var(--anslation-ds-radius)] border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[6px] bg-[var(--muted)] text-[var(--primary)]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            No comments yet
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Be the first to add a useful note.
          </p>
        </div>
      )}
    </section>
  );
}
