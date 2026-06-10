"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Heart, MessageCircle, Share2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { blogTaxonomySlug } from "../../data";

const PROJECT_ID = "altftool";

function formatDate(date) {
  if (!date) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

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
  const [copied, setCopied] = useState(false);
  const authorName = author || "AltFTool Editorial";

  const openComments = () => {
    const nextOpen = !showCommentBox;
    setShowCommentBox(nextOpen);
    if (nextOpen) {
      window.setTimeout(() => {
        document.getElementById("comments")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    const nextLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    setLiked(newLiked);
    setLikes(nextLikes);

    if (typeof blogId !== "string" || !isFirebaseConfigured) return;

    try {
      await updateDoc(doc(db, "projects", PROJECT_ID, "blogs", blogId), {
        likesCount: increment(newLiked ? 1 : -1),
      });
    } catch (error) {
      console.warn("Unable to persist blog like; keeping local preference:", error?.message || error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-3 shadow-[var(--anslation-ds-shadow-sm)] sm:px-4">
      <div className="flex flex-col gap-3 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? `Unlike this guide (${likes} likes)` : `Like this guide (${likes} likes)`}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border px-2 font-semibold transition-colors sm:h-9 sm:px-3 ${
              liked
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
            <span className="hidden sm:inline">Like</span>
          </button>

          <button
            type="button"
            onClick={openComments}
            aria-controls="comments"
            aria-expanded={showCommentBox}
            aria-label={`${showCommentBox ? "Hide" : "Show"} comments (${commentsCount})`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-2 font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-9 sm:px-3"
          >
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-2 font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-9 sm:px-3"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] sm:flex-wrap sm:gap-3">
          <Link
            href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
            className="min-w-0 truncate font-semibold transition-colors hover:text-[var(--primary)]"
          >
            {authorName}
          </Link>
          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
          <span>{formatDate(date)}</span>
        </div>
      </div>
    </div>
  );
}
