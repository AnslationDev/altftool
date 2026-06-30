"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function TrendingBar({ articles = [] }) {
  if (!articles.length) return null;

  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-xl bg-[var(--muted)] px-4 py-5 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--foreground)]">
        <Zap size={15} className="text-[var(--primary)]" />
        Trending Now
      </span>
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-thin">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="shrink-0 whitespace-nowrap text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            {article.headline}
          </Link>
        ))}
      </div>
      <Link
        href="/news/trending"
        className="ml-auto shrink-0 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        View All
      </Link>
    </div>
  );
}
