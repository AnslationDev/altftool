export const BLOG_EXPORT_COLUMNS = [
  "id",
  "title",
  "slug",
  "author",
  "category",
  "status",
  "created_at",
  "updated_at",
  "published_at",
  "word_count",
  "content_html",
];

export function timestampToIso(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.toMillis === "function") return new Date(value.toMillis()).toISOString();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function getWordCount(html = "") {
  const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export function normalizeBlogExportRow(blog = {}) {
  const content = String(blog.description || blog.content_html || blog.content || "");

  return {
    id: blog.id || "",
    title: blog.heading || blog.title || "",
    slug: blog.slug || "",
    author: blog.author || "",
    category: blog.category || "",
    status: blog.status || "draft",
    created_at: timestampToIso(blog.createdAt || blog.created_at),
    updated_at: timestampToIso(blog.updatedAt || blog.updated_at),
    published_at: timestampToIso(blog.publishedAt || blog.published_at || (blog.status === "published" ? blog.date : "")),
    word_count: getWordCount(content),
    content_html: content,
  };
}

export function csvEscape(value) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows = []) {
  const header = BLOG_EXPORT_COLUMNS.join(",");
  const body = rows
    .map((row) => BLOG_EXPORT_COLUMNS.map((column) => csvEscape(row[column])).join(","))
    .join("\n");

  return `\uFEFF${header}${body ? `\n${body}` : "\n"}`;
}
