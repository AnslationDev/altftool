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

export function extractHeadings(htmlContent = "") {
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

export function injectIds(htmlContent = "") {
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
