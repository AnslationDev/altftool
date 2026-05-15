"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Heart, MessageCircle, Share2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={liked}
            className={`inline-flex h-9 items-center gap-1.5 rounded-[6px] border px-3 font-semibold transition-colors ${
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
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-3 font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <MessageCircle size={18} />
            <span>{commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-3 font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
          <Link
            href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
            className="font-semibold transition-colors hover:text-[var(--primary)]"
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
