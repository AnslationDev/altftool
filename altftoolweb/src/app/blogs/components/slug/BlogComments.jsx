"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";

const COMMENT_MIN_LENGTH = 3;
const COMMENT_MAX_LENGTH = 800;
const COMMENT_DRAFT_PREFIX = "blog-comment-draft";

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
  comments = [],
  commentsCount = comments.length,
  commentsLoaded = true,
  isLoading = false,
  status = "",
  addComment,
  draftKey = "",
  showCommentBox,
  setShowCommentBox,
}) {
  const [newComment, setNewComment] = useState("");
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loadedDraftKeyRef = useRef("");
  const safeDraftKey = draftKey ? `${COMMENT_DRAFT_PREFIX}:${draftKey}` : "";
  const trimmedComment = newComment.trim();
  const characterCount = newComment.length;
  const isTooShort = trimmedComment.length > 0 && trimmedComment.length < COMMENT_MIN_LENGTH;
  const isTooLong = characterCount > COMMENT_MAX_LENGTH;
  const canSubmit =
    trimmedComment.length >= COMMENT_MIN_LENGTH &&
    characterCount <= COMMENT_MAX_LENGTH &&
    !submitting;
  const validationMessage = isTooShort
    ? `Add at least ${COMMENT_MIN_LENGTH} characters.`
    : isTooLong
      ? `Keep comments under ${COMMENT_MAX_LENGTH} characters.`
      : "";

  useEffect(() => {
    if (!showCommentBox) return;

    window.requestAnimationFrame(() => {
      document.getElementById("comments")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showCommentBox]);

  useEffect(() => {
    if (!safeDraftKey) return;

    const savedDraft = localStorage.getItem(safeDraftKey) || "";
    setHasSavedDraft(Boolean(savedDraft.trim()));
  }, [safeDraftKey]);

  useEffect(() => {
    if (!safeDraftKey || !showCommentBox || loadedDraftKeyRef.current === safeDraftKey) return;

    loadedDraftKeyRef.current = safeDraftKey;
    const savedDraft = localStorage.getItem(safeDraftKey) || "";
    if (savedDraft && !newComment) {
      setNewComment(savedDraft.slice(0, COMMENT_MAX_LENGTH));
    }
  }, [newComment, safeDraftKey, showCommentBox]);

  useEffect(() => {
    if (!safeDraftKey) return;

    if (newComment.trim()) {
      localStorage.setItem(safeDraftKey, newComment.slice(0, COMMENT_MAX_LENGTH));
      setHasSavedDraft(true);
    } else {
      localStorage.removeItem(safeDraftKey);
      setHasSavedDraft(false);
    }
  }, [newComment, safeDraftKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const posted = await addComment(trimmedComment);
    setSubmitting(false);
    if (posted) {
      if (safeDraftKey) localStorage.removeItem(safeDraftKey);
      setNewComment("");
      setHasSavedDraft(false);
      setShowCommentBox(false);
    }
  };

  return (
    <section id="comments" className="mt-8 scroll-mt-24 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] md:p-5">

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
              {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
            </h2>
          </div>
        </div>

        {!showCommentBox && (
          <button
            type="button"
            onClick={() => setShowCommentBox(true)}
            aria-controls="comment-form"
            aria-expanded={showCommentBox}
            className="h-9 rounded-[6px] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-active)]"
          >
            {hasSavedDraft ? "Resume draft" : "Add Comment"}
          </button>
        )}
      </div>

      {showCommentBox && (
        <form
          id="comment-form"
          onSubmit={handleSubmit}
          className="mb-6 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--background)] p-4"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
            rows={4}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="Share your thoughts..."
            aria-label="Comment text"
            aria-describedby="comment-helper comment-counter"
            aria-invalid={Boolean(validationMessage)}
            className="w-full resize-none rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
          />

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p
              id="comment-helper"
              className={`text-xs font-medium ${
                validationMessage
                  ? "text-[var(--anslation-ds-danger)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {validationMessage || (hasSavedDraft ? "Draft autosaved locally." : "Your note stays short, useful, and respectful.")}
            </p>
            <span
              id="comment-counter"
              className={`text-xs font-semibold ${
                characterCount > COMMENT_MAX_LENGTH - 80
                  ? "text-[var(--anslation-ds-warning)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {characterCount}/{COMMENT_MAX_LENGTH}
            </span>
          </div>

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
              disabled={!canSubmit}
              className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-active)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Posting" : "Post"}
            </button>
          </div>
        </form>
      )}

      {status ? (
        <p
          role="status"
          aria-live="polite"
          className="mb-4 rounded-[6px] bg-[var(--muted)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)]"
        >
          {status}
        </p>
      ) : null}

      {isLoading ? (
        <div role="status" aria-live="polite" className="mb-4 inline-flex items-center gap-2 rounded-[6px] bg-[var(--muted)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
          Loading discussion
        </div>
      ) : null}

      {comments.length > 0 ? (
        <div className="space-y-3" aria-label="Reader comments">
          {comments.map((c, index) => (
            <article key={index} className="flex gap-4">
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

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {c.text}
                </p>
              </div>
            </article>
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
            {commentsLoaded ? "Be the first to add a useful note." : "Discussion will appear here once it loads."}
          </p>
          {hasSavedDraft ? (
            <p className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[var(--muted)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--primary)]" />
              Draft ready to resume
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
