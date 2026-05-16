"use client";

import { BookOpenCheck, ExternalLink } from "lucide-react";

function isHttpUrl(value = "") {
  return /^https?:\/\//i.test(String(value || ""));
}

export default function BlogSources({ blog }) {
  const sources = Array.isArray(blog?.sources) ? blog.sources.filter((source) => source?.title || source?.url) : [];

  if (!sources.length && !blog?.sourceNotes) return null;

  return (
    <section id="sources" className="mt-10 scroll-mt-24 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
          <BookOpenCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-normal text-(--foreground)">Sources and review notes</h2>
          <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">
            References used to check facts, freshness, and reader-safe recommendations in this guide.
          </p>
        </div>
      </div>

      {blog?.sourceNotes ? (
        <p className="mb-4 rounded-[6px] bg-(--muted) px-3 py-2 text-sm leading-6 text-(--muted-foreground)">
          {blog.sourceNotes}
        </p>
      ) : null}

      {sources.length ? (
        <ol className="space-y-2">
          {sources.map((source, index) => {
            const title = source.title || source.url;
            const publisher = source.publisher || "";
            const href = isHttpUrl(source.url) ? source.url : "";

            return (
              <li
                key={`${title}-${index}`}
                className="flex items-start gap-3 rounded-[6px] border border-(--border) bg-(--card) px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--muted) text-xs font-bold text-(--primary)">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--foreground) transition hover:text-(--primary)"
                    >
                      <span className="min-w-0 break-words">{title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="break-words text-sm font-semibold text-(--foreground)">{title}</p>
                  )}
                  {publisher ? (
                    <p className="mt-0.5 text-xs font-medium text-(--muted-foreground)">{publisher}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
