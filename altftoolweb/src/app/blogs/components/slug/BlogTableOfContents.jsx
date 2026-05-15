"use client";

import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function getHeadingText(innerHtml) {
  return decodeHtmlEntities(innerHtml.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function createHeadingId(text, seen) {
  let base = slugify(text);
  if (!base) base = "heading";

  seen[base] = (seen[base] || 0) + 1;
  return seen[base] > 1 ? `${base}-${seen[base]}` : base;
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function extractHeadings(htmlContent) {
  const seen = {};
  const headings = [];
  const headingPattern = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;

  while ((match = headingPattern.exec(htmlContent))) {
    const text = getHeadingText(match[2]);
    if (!text) continue;

    headings.push({
      id: createHeadingId(text, seen),
      text,
      level: Number(match[1]),
    });
  }

  return headings;
}

function injectIds(htmlContent) {
  const seen = {};
  return htmlContent.replace(
    /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, innerHtml) => {
      const text = getHeadingText(innerHtml);
      if (!text) return match;

      const id = createHeadingId(text, seen);
      const attrsWithoutId = attrs.replace(/\s+id=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "");

      return `<h${level}${attrsWithoutId} id="${id}">${innerHtml}</h${level}>`;
    },
  );
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
        "rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]",
        "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto",
        className,
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-3 rounded-[6px] text-left"
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
        <ul className="flex list-none flex-col gap-1 p-0">
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
                  onClick={() => handleClick(id)}
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

/* ─────────────────────────────────────────
   Export helper so BlogContent can use it
───────────────────────────────────────── */
export { injectIds };
