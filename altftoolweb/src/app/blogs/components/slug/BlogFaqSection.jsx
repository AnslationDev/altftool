"use client";

import { HelpCircle, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function BlogFaqSection({ items = [] }) {
  const visibleItems = items.slice(0, 6);
  if (!visibleItems.length) return null;

  return (
    <section
      id="faq"
      className="not-prose my-8 border-y border-(--border) bg-(--background) py-5"
      aria-labelledby="blog-faq-heading"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
            Reader questions
          </p>
          <h2
            id="blog-faq-heading"
            className="mt-1 text-xl font-semibold tracking-normal text-(--foreground)"
          >
            Quick answers
          </h2>
        </div>
        <span className="inline-flex h-8 w-fit items-center gap-2 rounded-[6px] border border-(--border) px-3 text-xs font-semibold text-(--muted-foreground)">
          <HelpCircle className="h-3.5 w-3.5 text-(--primary)" />
          FAQ
        </span>
      </div>

      <div className="space-y-2">
        {visibleItems.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group rounded-[6px] border border-(--border) bg-(--card) px-4 py-3"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 text-sm font-semibold leading-6 text-(--foreground)">
              <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
              <span className="min-w-0 flex-1">{item.question}</span>
              <span className="mt-1 h-2 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-(--muted-foreground) transition group-open:rotate-[225deg]" />
            </summary>
            <p className="mt-3 pl-7 text-sm leading-6 text-(--muted-foreground)">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
