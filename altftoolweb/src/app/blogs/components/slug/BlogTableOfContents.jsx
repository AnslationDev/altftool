"use client";

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

export default function BlogTableOfContents({ content }) {
  const headings = useMemo(() => {
    if (!content) return [];
    return extractHeadings(content);
  }, [content]);
  const [activeId, setActiveId] = useState(null);
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
      className="hidden lg:block"
      style={{ position: "sticky", top: "6rem", maxHeight: "calc(100vh - 7rem)", overflowY: "auto" }}
    >
      {/* Title */}
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: "0.85rem",
          }}
        >
          On This Page
        </p>
      {/* Card */}
      <div
       className="p-2  border-l border-[var(--border)]"
      >
        
        <nav>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            {headings.map(({ id, text, level }) => {
              const isActive = activeId === id;
              const indent = (level - 1) * 10; // px indent per level

              return (
                <li key={id}>
                  <button
                    onClick={() => handleClick(id)}
                    title={text}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      paddingLeft: `${indent + 8}px`,
                      paddingTop: "5px",
                      paddingBottom: "5px",
                      paddingRight: "8px",
                      fontSize: level === 1 ? "0.8rem" : level === 2 ? "0.775rem" : "0.73rem",
                      fontWeight: isActive ? 600 : level <= 2 ? 500 : 400,
                      color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                      background: isActive ? "var(--primary)1a" : "transparent",
                      borderLeft: isActive
                        ? "2px solid var(--primary)"
                        : "2px solid transparent",
                      borderRadius: "0 4px 4px 0",
                      cursor: "pointer",
                      transition: "color 0.18s, background 0.18s, border-color 0.18s",
                      lineHeight: 1.4,
                      // clamp to 2 lines with ellipsis
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Export helper so BlogContent can use it
───────────────────────────────────────── */
export { injectIds };
