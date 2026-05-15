"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { recordBlogFeedback } from "../../context/views.service";

function getInitialChoice(feedbackKey) {
  if (typeof window === "undefined" || !feedbackKey) return "";
  return localStorage.getItem(`blog-feedback:${feedbackKey}`) || "";
}

export default function BlogFeedback({ blog }) {
  const firebaseBlogId = typeof blog?.id === "string" ? blog.id : "";
  const feedbackKey = blog?.slug || firebaseBlogId || (blog?.id ? String(blog.id) : "");
  const [choice, setChoice] = useState(() => getInitialChoice(feedbackKey));
  const [status, setStatus] = useState("");

  const counts = useMemo(() => ({
    helpful: Number(blog?.helpfulCount || 0),
    notHelpful: Number(blog?.notHelpfulCount || 0),
  }), [blog?.helpfulCount, blog?.notHelpfulCount]);

  const submitFeedback = async (sentiment) => {
    if (!feedbackKey) return;

    const previous = choice;
    setChoice(sentiment);
    setStatus("Saving...");
    localStorage.setItem(`blog-feedback:${feedbackKey}`, sentiment);

    if (!firebaseBlogId) {
      setStatus("Thanks for the feedback.");
      window.setTimeout(() => setStatus(""), 2200);
      return;
    }

    const result = await recordBlogFeedback(firebaseBlogId, sentiment);
    if (!result) {
      setChoice(previous);
      if (previous) localStorage.setItem(`blog-feedback:${feedbackKey}`, previous);
      else localStorage.removeItem(`blog-feedback:${feedbackKey}`);
      setStatus("Could not save. Try again later.");
      window.setTimeout(() => setStatus(""), 2200);
      return;
    }

    setStatus(result.changed ? "Thanks for the feedback." : "Feedback already saved.");
    window.setTimeout(() => setStatus(""), 2200);
  };

  if (!feedbackKey) return null;

  return (
    <section className="mt-5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            Reader feedback
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-normal text-(--foreground)">
            Was this guide helpful?
          </h2>
          <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">
            Your signal helps the editorial team improve stale or unclear guides faster.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => submitFeedback("helpful")}
            aria-pressed={choice === "helpful"}
            className={`inline-flex h-10 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold transition ${
              choice === "helpful"
                ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful
            {counts.helpful ? <span className="text-xs opacity-75">{counts.helpful}</span> : null}
          </button>
          <button
            type="button"
            onClick={() => submitFeedback("notHelpful")}
            aria-pressed={choice === "notHelpful"}
            className={`inline-flex h-10 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold transition ${
              choice === "notHelpful"
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-(--border) bg-(--background) text-(--foreground) hover:border-amber-500 hover:text-amber-600"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            Needs work
            {counts.notHelpful ? <span className="text-xs opacity-75">{counts.notHelpful}</span> : null}
          </button>
        </div>
      </div>

      {status ? (
        <p className="mt-3 rounded-[6px] bg-(--muted) px-3 py-2 text-xs font-medium text-(--muted-foreground)">
          {status}
        </p>
      ) : null}
    </section>
  );
}
