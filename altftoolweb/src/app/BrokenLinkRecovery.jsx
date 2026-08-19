"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Turns the broken URL itself into the recovery path.
 *
 * A 404 on this site is very often an inbound link — a blog post that
 * misspelled a tool slug, a forum comment pointing at a page that moved, an
 * old share. That visitor arrived with intent spelled out in the URL, and the
 * static 404 threw it away: "bmi-calculater" got the same four generic tiles
 * as a random typo. Every one of those visits is a backlink already earned and
 * then wasted at the last step.
 *
 * The slug is tokenised into words and offered as a prefilled /search link
 * (/search reads ?q= and searches at 2+ characters). Client-side because the
 * App Router renders not-found statically and never passes it the request URL —
 * reading it any other way would make every 404 a dynamic render.
 */
export default function BrokenLinkRecovery() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const segments = window.location.pathname
      .split("/")
      .filter(Boolean)
      // Registry namespaces say where the visitor was, not what they wanted —
      // dropping them keeps "/tools/all/bmi-calculater" focused on "bmi
      // calculater" instead of diluting the search with "tools all".
      .filter((segment) => !["tools", "all", "embed", "widget", "api"].includes(segment));

    const words = segments
      .join(" ")
      .replace(/\.[a-z0-9]{2,5}$/i, "")
      .replace(/[-_+.]+/g, " ")
      .replace(/%20/g, " ")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);

    if (words.length >= 2) setQuery(words);
  }, []);

  if (!query) return null;

  return (
    <Link
      href={`/search?q=${encodeURIComponent(query)}`}
      className="mt-6 inline-flex max-w-full items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--primary) bg-(--primary-soft) px-4 py-3 text-sm font-semibold text-(--primary-text) shadow-[var(--anslation-ds-shadow-sm)] transition duration-200 hover:shadow-[var(--anslation-ds-shadow-md)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transition-none"
    >
      <span className="truncate">
        Search for &ldquo;{query}&rdquo; instead
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}
