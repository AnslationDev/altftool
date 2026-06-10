"use client";

import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { extractHeadings } from "../../utils/articleHeadings";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ─────────────────────────────────────────
   BlogTableOfContents
───────────────────────────────────────── */

export default function BlogTableOfContents({
  content,
  className = "hidden lg:block",
  collapsible = false,
  initiallyOpen = false,
}) {
  const headings = useMemo(() => {
    if (!content) return [];
    return extractHeadings(content);
  }, [content]);
  const [activeId, setActiveId] = useState(null);
  const [isOpen, setIsOpen] = useState(!collapsible || initiallyOpen);
  const observerRef = useRef(null);

  // Observe heading elements in the DOM after render
  useEffect(() => {
    if (!headings.length) return;

    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 88; // adjust for sticky nav if any
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <aside
      aria-label="Table of contents"
      className={cx(
        "rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:p-4",
        "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto",
        className,
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="flex min-h-10 w-full items-center justify-between gap-3 rounded-[6px] text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <ListTree className="h-4 w-4 shrink-0 text-(--primary)" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
              On This Page
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[10px] font-semibold text-(--muted-foreground)">
              {headings.length}
            </span>
            <ChevronDown
              className={cx(
                "h-4 w-4 text-(--muted-foreground) transition",
                isOpen && "rotate-180",
              )}
            />
          </span>
        </button>
      ) : (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
            <ListTree className="h-4 w-4 text-(--primary)" />
            On This Page
          </p>
          <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[10px] font-semibold text-(--muted-foreground)">
            {headings.length}
          </span>
        </div>
      )}

      {(!collapsible || isOpen) ? (
      <nav className={collapsible ? "mt-3" : undefined}>
        <ul className="flex max-h-[45vh] list-none flex-col gap-1 overflow-y-auto p-0 sm:max-h-none sm:overflow-visible">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            const indentClass =
              level <= 1
                ? "pl-2"
                : level === 2
                  ? "pl-5"
                  : level === 3
                    ? "pl-8"
                    : "pl-10";

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handleClick(id)}
                  aria-current={isActive ? "location" : undefined}
                  aria-label={`Jump to ${text}`}
                  title={text}
                  className={cx(
                    "line-clamp-2 w-full rounded-[6px] border-l-2 py-1.5 pr-2 text-left leading-snug transition",
                    indentClass,
                    level <= 2 ? "text-xs font-semibold" : "text-[11px] font-medium",
                    isActive
                      ? "border-(--primary) bg-(--muted) text-(--primary)"
                      : "border-transparent text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)",
                  )}
                >
                  {text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      ) : null}
    </aside>
  );
}
