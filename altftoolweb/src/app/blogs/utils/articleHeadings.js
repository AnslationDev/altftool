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

    // Authored h1s are downgraded to h2 by injectIds() so the page keeps a
    // single h1 (the article title); mirror that here so TOC levels match.
    const level = Number(match[1]);
    headings.push({
      id: createHeadingId(text, seen),
      text,
      level: level === 1 ? 2 : level,
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
      const attrsWithoutId = attrs.replace(/\s+id=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "");
      // Downgrade an authored h1 (CKEditor's "Heading 1") to h2 so it can't
      // compete with the page's own <h1> in BlogHeader — this must apply even
      // to a heading with no extractable text (e.g. one wrapping only an
      // <img>/embed), so it's computed before the id-generation early return.
      const outputLevel = level === "1" ? "2" : level;

      if (!text) return `<h${outputLevel}${attrsWithoutId}>${innerHtml}</h${outputLevel}>`;

      const id = createHeadingId(text, seen);
      return `<h${outputLevel}${attrsWithoutId} id="${id}">${innerHtml}</h${outputLevel}>`;
    },
  );
}
