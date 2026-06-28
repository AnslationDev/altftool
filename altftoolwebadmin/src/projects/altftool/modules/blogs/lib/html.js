/** Canonical HTML/text helpers for the blog CMS (single source of truth). */

const AVG_WPM = 220;

export function stripHtml(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(value = "") {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

export function readingTimeMinutes(value = "") {
  return Math.max(1, Math.round(wordCount(value) / AVG_WPM));
}

export function excerpt(value = "", maxChars = 160) {
  const text = stripHtml(value);
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 40 ? lastSpace : maxChars).trim()}…`;
}

/** Find inline <img> tags missing meaningful alt text (SEO/a11y blocker). */
export function imagesMissingAlt(html = "") {
  const imgs = String(html || "").match(/<img\b[^>]*>/gi) || [];
  return imgs.filter((tag) => {
    const alt = tag.match(/\balt\s*=\s*"(.*?)"/i) || tag.match(/\balt\s*=\s*'(.*?)'/i);
    return !alt || !alt[1] || !alt[1].trim();
  }).length;
}
