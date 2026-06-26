const EMPTY_PREVIEW_HTML = "<p>Start writing to preview this blog post.</p>";

export function stripHtml(html = "") {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeBlogPreviewHtml(html = "") {
  const source = String(html || "").trim() || EMPTY_PREVIEW_HTML;

  return source
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
      const src = attrs.match(/\ssrc\s*=\s*(['"])(.*?)\1/i)?.[2] || "";
      if (!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i.test(src)) {
        return "";
      }
      return `<iframe${attrs.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")}>`;
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
