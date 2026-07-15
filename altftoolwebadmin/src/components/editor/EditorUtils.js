"use client";

import { editorToHtml, htmlToEditor } from "./extensions/PreserveExtensions";

/**
 * EditorUtils — serialization, sanitisation, paste cleanup, SEO audit.
 * Pure functions: no editor coupling, easily unit-testable.
 */

/* --------------------------------- slugify --------------------------------- */

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/* ------------------------------ HTML sanitiser ------------------------------ */

const BLOCKED_TAGS = ["script", "object", "embed", "form", "meta", "base"];

/**
 * Conservative sanitiser for editor output: strips script-capable elements,
 * inline event handlers, and javascript: URLs. Comments are preserved.
 */
export function sanitizeHtml(html) {
  if (typeof window === "undefined" || !html) return html || "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");

  BLOCKED_TAGS.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((element) => element.remove());
  });

  doc.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = String(attribute.value || "");
      if (name.startsWith("on")) element.removeAttribute(attribute.name);
      if (
        (name === "href" || name === "src" || name === "xlink:href") &&
        /^\s*javascript:/i.test(value)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
}

/* ------------------------------ paste cleanup ------------------------------ */

/**
 * Cleans HTML pasted from Word / Google Docs / Outlook:
 * mso-* styles, <o:p> tags, comment cruft, empty spans, style bloat.
 */
export function cleanPastedHtml(html) {
  if (!html) return html;
  let out = html
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<\/?o:p[^>]*>/gi, "")
    .replace(/<\/?(xml|meta|link|st1:[a-z]+)[^>]*>/gi, "")
    .replace(/class="?Mso[a-zA-Z0-9]+"?/gi, "")
    .replace(/style="[^"]*mso-[^"]*"/gi, "");

  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(`<body>${out}</body>`, "text/html");
    doc.querySelectorAll("span").forEach((span) => {
      if (!span.attributes.length) {
        span.replaceWith(...span.childNodes);
      }
    });
    out = doc.body.innerHTML;
  }
  return out;
}

/* -------------------------------- anchor ids -------------------------------- */

/** Add slug ids to any heading that doesn't have one (TOC/deep-link ready). */
export function ensureHeadingIds(html) {
  if (typeof window === "undefined" || !html) return html || "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const seen = new Set();
  doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    let id = heading.getAttribute("id") || slugify(heading.textContent);
    if (!id) return;
    let unique = id;
    let index = 2;
    while (seen.has(unique)) unique = `${id}-${index++}`;
    seen.add(unique);
    heading.setAttribute("id", unique);
  });
  return doc.body.innerHTML;
}

/* -------------------------------- exporters -------------------------------- */

/** Clean, sanitised, anchor-ready HTML — what gets saved to the DB. */
export function exportHtml(editor) {
  return ensureHeadingIds(sanitizeHtml(editorToHtml(editor.getHTML())));
}

export function exportJson(editor) {
  return editor.getJSON();
}

export function exportMarkdown(editor) {
  try {
    return editor.storage.markdown?.getMarkdown?.() ?? "";
  } catch {
    return "";
  }
}

/** Load raw stored HTML (comments intact) into the editor. */
export function importHtml(editor, html, emitUpdate = false) {
  editor.commands.setContent(htmlToEditor(html || ""), emitUpdate);
}

/** Load a markdown string (tiptap-markdown parses it transparently). */
export function importMarkdown(editor, markdown, emitUpdate = false) {
  editor.commands.setContent(markdown || "", emitUpdate);
}

/* --------------------------------- SEO audit -------------------------------- */

export function seoAudit(editor) {
  const issues = [];
  const headings = [];
  const images = { total: 0, missingAlt: 0 };
  const links = { internal: 0, external: 0 };

  editor.state.doc.descendants((node) => {
    if (node.type.name === "heading") {
      headings.push({ level: node.attrs.level, text: node.textContent });
    }
    if (node.type.name === "image") {
      images.total += 1;
      if (!node.attrs.alt) images.missingAlt += 1;
    }
    node.marks?.forEach?.(() => {});
    return true;
  });

  editor.state.doc.descendants((node) => {
    node.marks.forEach((mark) => {
      if (mark.type.name === "link") {
        const href = String(mark.attrs.href || "");
        if (/^https?:\/\//i.test(href) && typeof window !== "undefined") {
          try {
            const url = new URL(href);
            if (url.hostname === window.location.hostname || url.hostname.endsWith("altftool.com")) {
              links.internal += 1;
            } else {
              links.external += 1;
            }
          } catch {
            links.external += 1;
          }
        } else {
          links.internal += 1;
        }
      }
    });
    return true;
  });

  const h1Count = headings.filter((heading) => heading.level === 1).length;
  if (h1Count === 0) issues.push({ level: "warn", text: "No H1 heading — add one main title." });
  if (h1Count > 1) issues.push({ level: "warn", text: `${h1Count} H1 headings — use exactly one.` });

  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index].level - headings[index - 1].level > 1) {
      issues.push({
        level: "info",
        text: `Heading level jumps from H${headings[index - 1].level} to H${headings[index].level} ("${headings[index].text.slice(0, 40)}").`,
      });
      break;
    }
  }

  if (images.missingAlt > 0) {
    issues.push({
      level: "warn",
      text: `${images.missingAlt} of ${images.total} image${images.total === 1 ? "" : "s"} missing alt text.`,
    });
  }

  const words = editor.storage.characterCount?.words?.() ?? 0;
  if (words > 0 && words < 300) {
    issues.push({ level: "info", text: `Only ${words} words — most posts perform better at 600+.` });
  }

  return { issues, headings, images, links, words };
}

export function readingTime(words) {
  return Math.max(1, Math.round(words / 225));
}

export { editorToHtml, htmlToEditor };
