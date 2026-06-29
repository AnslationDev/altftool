import DOMPurify from "dompurify";

const EMPTY_PREVIEW_HTML = "<p>Start writing to preview this blog post.</p>";

const ALLOWED_IFRAME_SRC = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i;

export function stripHtml(html = "") {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Baseline regex scrub. Kept as the SSR / no-DOM path (and a defensive first
 * pass before DOMPurify) so this util stays synchronous and unit-testable under
 * `node --test`, where no DOM is available.
 */
function baselineSanitize(source) {
  return source
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
      const src = attrs.match(/\ssrc\s*=\s*(['"])(.*?)\1/i)?.[2] || "";
      if (!ALLOWED_IFRAME_SRC.test(src)) return "";
      return `<iframe${attrs.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")}>`;
    });
}

let purifierReady = false;
function getPurifier() {
  // DOMPurify needs a DOM; only usable in the browser (the real preview render
  // path). In Node/SSR we fall back to the regex baseline above.
  if (typeof window === "undefined") return null;
  if (typeof DOMPurify?.sanitize !== "function") return null;
  if (!purifierReady) {
    purifierReady = true;
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer nofollow");
      }
      if (node.tagName === "IFRAME" && !ALLOWED_IFRAME_SRC.test(node.getAttribute("src") || "")) {
        node.parentNode?.removeChild(node);
      }
    });
  }
  return DOMPurify;
}

/**
 * Sanitize blog HTML for preview. Runs the regex baseline first, then — when a
 * real DOM is present — a DOMPurify pass for defence-in-depth (DOM-accurate
 * parsing catches malformed/obfuscated markup that regex can miss). Preserves
 * the rich CKEditor output (tables, images, native <video>, allow-listed
 * oembed <iframe>s).
 */
export function sanitizeBlogPreviewHtml(html = "") {
  const source = String(html || "").trim() || EMPTY_PREVIEW_HTML;
  const cleaned = baselineSanitize(source);

  const purifier = getPurifier();
  if (!purifier) return cleaned;

  return purifier.sanitize(cleaned, {
    ADD_TAGS: ["iframe", "video", "source"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "controls",
      "controlslist",
      "preload",
      "target",
      "loading",
    ],
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
    ALLOW_DATA_ATTR: true,
  });
}

export function buildPreviewBlogModel({ formData = {}, imagePreview = "", imageAlt = "" } = {}) {
  const heading = String(formData.heading || "").trim() || "Untitled draft";
  const description = sanitizeBlogPreviewHtml(formData.description || "");
  const excerpt = String(formData.seoDescription || "").trim() || stripHtml(description).slice(0, 160);

  return {
    author: String(formData.author || "").trim() || "AltFTool Editorial",
    authorRole: String(formData.authorRole || "").trim(),
    category: String(formData.category || "").trim() || "Uncategorized",
    date: String(formData.date || "").trim() || new Date().toISOString().slice(0, 10),
    description,
    editorialNote: String(formData.editorialNote || "").trim(),
    excerpt,
    heading,
    image: imagePreview,
    imageAlt: imageAlt || heading,
    reviewedBy: String(formData.reviewedBy || "").trim(),
    seoDescription: excerpt,
    seoTitle: String(formData.seoTitle || "").trim() || heading,
    slug: heading.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "untitled-draft",
    status: "preview",
    tags: String(formData.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}
