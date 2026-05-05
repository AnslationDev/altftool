"use client";

import { useEffect, useRef, useState } from "react";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(htmlContent) {
  if (typeof window === "undefined") return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const headingEls = doc.querySelectorAll("h1, h2, h3, h4");

  const seen = {};
  return Array.from(headingEls).map((el) => {
    const text = el.textContent.trim();
    let base = slugify(text);
    if (!base) base = "heading";

    // deduplicate slugs
    seen[base] = (seen[base] || 0) + 1;
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base;

    return {
      id,
      text,
      level: parseInt(el.tagName[1], 10), // 1–4
    };
  });
}

function injectIds(htmlContent) {
  if (typeof window === "undefined") return htmlContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const headingEls = doc.querySelectorAll("h1, h2, h3, h4");

  const seen = {};
  headingEls.forEach((el) => {
    const text = el.textContent.trim();
    let base = slugify(text);
    if (!base) base = "heading";

    seen[base] = (seen[base] || 0) + 1;
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    el.setAttribute("id", id);
  });

  return doc.body.innerHTML;
}

/* ─────────────────────────────────────────
   BlogTableOfContents
───────────────────────────────────────── */

export default function BlogTableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!content) return;
    setHeadings(extractHeadings(content));
  }, [content]);

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