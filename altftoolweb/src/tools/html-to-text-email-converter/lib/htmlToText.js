// HTML → plain-text email converter. Parses with the browser's DOMParser and
// walks the tree with fixed, deterministic rules (headings, links, images,
// nested lists, tables, blockquotes), stripping scripts/styles/hidden
// elements/tracking pixels. No network calls, no innerHTML injection — the
// parsed document is never attached to the live DOM.

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "TITLE", "META", "LINK", "IFRAME", "OBJECT", "SVG"]);
const BLOCK_TAGS = new Set([
  "P", "DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV",
  "FIGURE", "FIGCAPTION", "ADDRESS", "FIELDSET", "FORM", "CENTER",
]);

const MAX_TABLE_COL_WIDTH = 30;

function isHidden(el) {
  const style = (el.getAttribute("style") || "").toLowerCase();
  if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(\D|$)/.test(style)) return true;
  if (el.getAttribute("hidden") !== null) return true;
  if (el.getAttribute("aria-hidden") === "true" && !el.textContent.trim()) return true;
  return false;
}

function isTrackingPixel(img) {
  const w = parseInt(img.getAttribute("width") || "", 10);
  const h = parseInt(img.getAttribute("height") || "", 10);
  if ((w === 1 && h === 1) || (w === 0 && h === 0)) return true;
  const style = (img.getAttribute("style") || "").toLowerCase();
  return /width\s*:\s*[01]px/.test(style) && /height\s*:\s*[01]px/.test(style);
}

// Normalizes whitespace inside inline text the way HTML rendering does.
function inlineText(text) {
  return text.replace(/[\s ]+/g, " ");
}

/**
 * Recursive DOM walker. Returns the plain-text representation of a node.
 * `ctx` carries list nesting depth and quote depth.
 */
function walk(node, ctx) {
  if (node.nodeType === Node.TEXT_NODE) return inlineText(node.nodeValue);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName;
  if (SKIP_TAGS.has(tag) || isHidden(node)) return "";

  switch (tag) {
    case "BR":
      return "\n";
    case "HR":
      return "\n\n----------------------------------------\n\n";
    case "IMG": {
      if (isTrackingPixel(node)) return "";
      const alt = inlineText(node.getAttribute("alt") || "").trim();
      return alt ? `[Image: ${alt}]` : "[Image]";
    }
    case "A": {
      const inner = walkChildren(node, ctx).trim();
      const href = (node.getAttribute("href") || "").trim();
      if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) return inner;
      const cleanHref = href.replace(/^mailto:/i, "").replace(/^tel:/i, "");
      if (!inner) return href.startsWith("mailto:") || href.startsWith("tel:") ? cleanHref : href;
      // Don't duplicate when the visible text already IS the URL.
      if (inner === href || inner === cleanHref) return inner;
      return `${inner} (${href})`;
    }
    case "H1":
    case "H2": {
      const text = walkChildren(node, ctx).trim();
      if (!text) return "";
      const underline = (tag === "H1" ? "=" : "-").repeat(Math.min(text.length, 60));
      return `\n\n${text}\n${underline}\n\n`;
    }
    case "H3":
    case "H4":
    case "H5":
    case "H6": {
      const text = walkChildren(node, ctx).trim();
      return text ? `\n\n${text}\n\n` : "";
    }
    case "UL":
    case "OL":
      return `\n${listToText(node, ctx)}\n`;
    case "TABLE":
      return `\n\n${tableToText(node, ctx)}\n\n`;
    case "BLOCKQUOTE": {
      const inner = walkChildren(node, { ...ctx, quote: ctx.quote + 1 }).trim();
      if (!inner) return "";
      const prefixed = inner
        .split("\n")
        .map((line) => (line.trim() ? `> ${line}` : ">"))
        .join("\n");
      return `\n\n${prefixed}\n\n`;
    }
    case "PRE":
      return `\n\n${node.textContent.replace(/\s+$/, "")}\n\n`;
    case "TR":
    case "TD":
    case "TH":
      // Reached only for orphan cells outside a TABLE — treat as blocks.
      return `\n${walkChildren(node, ctx)}\n`;
    default: {
      const inner = walkChildren(node, ctx);
      if (BLOCK_TAGS.has(tag)) return inner.trim() ? `\n\n${inner}\n\n` : "";
      return inner; // inline elements: span, strong, em, b, i, u, code…
    }
  }
}

function walkChildren(node, ctx) {
  let out = "";
  for (const child of node.childNodes) out += walk(child, ctx);
  return out;
}

function listToText(listEl, ctx) {
  const ordered = listEl.tagName === "OL";
  const indent = "  ".repeat(ctx.listDepth);
  const start = parseInt(listEl.getAttribute("start") || "1", 10) || 1;
  const lines = [];
  let index = start;

  for (const child of listEl.children) {
    if (child.tagName !== "LI") continue;

    // Separate the item's own content from nested lists so nesting renders
    // beneath the bullet, indented one level deeper.
    let ownText = "";
    let nestedText = "";
    for (const grandchild of child.childNodes) {
      if (grandchild.nodeType === Node.ELEMENT_NODE && (grandchild.tagName === "UL" || grandchild.tagName === "OL")) {
        nestedText += listToText(grandchild, { ...ctx, listDepth: ctx.listDepth + 1 });
      } else {
        ownText += walk(grandchild, { ...ctx, listDepth: ctx.listDepth + 1 });
      }
    }

    const bullet = ordered ? `${index}. ` : "• ";
    const text = ownText.replace(/\n{2,}/g, "\n").trim();
    if (text || nestedText) {
      lines.push(`${indent}${bullet}${text}`);
      if (nestedText) lines.push(nestedText.replace(/\n+$/, ""));
    }
    index += 1;
  }
  return lines.join("\n");
}

// Email HTML uses tables two ways: as layout scaffolding (role="presentation"
// or cells full of block content) and as real data tables. Layout tables must
// be flattened with newlines preserved; only data tables get column-aligned
// cell text.
function isLayoutTable(tableEl) {
  if (tableEl.getAttribute("role") === "presentation") return true;
  for (const cell of tableEl.querySelectorAll("td, th")) {
    if (cell.closest("table") !== tableEl) continue; // nested table's cell
    if (cell.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, hr")) return true;
  }
  return false;
}

// Renders a table as aligned columns when it's small enough to align nicely,
// otherwise falls back to "cell | cell" rows.
function tableToText(tableEl, ctx) {
  if (isLayoutTable(tableEl)) {
    let out = "";
    for (const cell of tableEl.querySelectorAll("td, th")) {
      if (cell.closest("table") !== tableEl) continue;
      const text = walkChildren(cell, ctx).trim();
      if (text) out += `${text}\n\n`;
    }
    return out.trim();
  }

  const rows = [];
  for (const tr of tableEl.querySelectorAll(":scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr")) {
    const cells = [];
    for (const cell of tr.children) {
      if (cell.tagName !== "TD" && cell.tagName !== "TH") continue;
      const text = walkChildren(cell, ctx).replace(/\s+/g, " ").trim();
      cells.push(text);
    }
    if (cells.length) rows.push(cells);
  }
  if (!rows.length) {
    // Layout table with nested structure rather than data rows — flatten it.
    return walkChildren(tableEl, ctx).trim();
  }

  // Single-column "layout" tables read best flattened as paragraphs.
  if (rows.every((r) => r.length === 1)) {
    return rows.map((r) => r[0]).filter(Boolean).join("\n\n");
  }

  const colCount = Math.max(...rows.map((r) => r.length));
  const widths = [];
  for (let c = 0; c < colCount; c++) {
    widths[c] = Math.min(MAX_TABLE_COL_WIDTH, Math.max(...rows.map((r) => (r[c] || "").length)));
  }
  const alignable = widths.reduce((a, b) => a + b, 0) <= 78;

  return rows
    .map((r) => {
      const cells = [];
      for (let c = 0; c < colCount; c++) {
        const text = r[c] || "";
        cells.push(alignable && c < colCount - 1 ? text.padEnd(widths[c]) : text);
      }
      return cells.join(alignable ? "  " : " | ").replace(/\s+$/, "");
    })
    .join("\n");
}

/** Regex fallback for the rare case DOMParser itself throws. */
function regexFallback(html) {
  return html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * Convert HTML markup to a clean plain-text email body.
 * Returns { text, stats, warnings }.
 */
export function convertHtmlToText(html) {
  const warnings = [];
  const trimmed = (html || "").trim();
  if (!trimmed) {
    return { text: "", stats: { chars: 0, words: 0, lines: 0, links: 0, images: 0 }, warnings: [] };
  }

  const sizeKb = new Blob([trimmed]).size / 1024;
  if (sizeKb > 500) {
    warnings.push(`Input is ${Math.round(sizeKb)}KB — over 500KB. Conversion still runs, but consider trimming the template.`);
  }
  if (!/<[a-z!/]/i.test(trimmed)) {
    warnings.push("Input doesn't look like HTML — returning it as plain text.");
  }

  let text = "";
  let links = 0;
  let images = 0;
  try {
    const doc = new DOMParser().parseFromString(trimmed, "text/html");
    const root = doc.body || doc.documentElement;
    links = root.querySelectorAll("a[href]:not([href^='#'])").length;
    images = [...root.querySelectorAll("img")].filter((img) => !isTrackingPixel(img)).length;
    text = walk(root, { listDepth: 0, quote: 0 });
  } catch {
    warnings.push("HTML could not be parsed cleanly — a simplified fallback conversion was used.");
    text = regexFallback(trimmed);
  }

  // Whitespace cleanup: trim line ends, collapse 3+ blank lines to one blank.
  text = text
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const stats = {
    chars: text.length,
    words: text ? text.split(/\s+/).filter(Boolean).length : 0,
    lines: text ? text.split("\n").length : 0,
    links,
    images,
  };

  return { text, stats, warnings };
}

export const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<body style="margin:0;background:#f4f4f7;">
  <div style="display:none;">Your March update is here</div>
  <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0">
    <tr><td style="padding:24px;font-family:Arial,sans-serif;">
      <h1 style="color:#111;">March Product Update</h1>
      <p>Hi {FirstName},</p>
      <p>Here's everything we shipped this month — <strong>3 big improvements</strong> based on your feedback.</p>
      <h2>What's new</h2>
      <ul>
        <li>Faster exports — reports generate in <em>under 5 seconds</em></li>
        <li>New integrations:
          <ul>
            <li>Slack</li>
            <li>Notion</li>
          </ul>
        </li>
        <li>A refreshed dashboard</li>
      </ul>
      <h2>Plan comparison</h2>
      <table border="1" cellpadding="4">
        <tr><th>Plan</th><th>Price</th><th>Seats</th></tr>
        <tr><td>Starter</td><td>$9/mo</td><td>3</td></tr>
        <tr><td>Team</td><td>$29/mo</td><td>10</td></tr>
      </table>
      <p><img src="https://example.com/banner.png" alt="March update banner" width="552" height="200" /></p>
      <p><a href="https://example.com/changelog">Read the full changelog</a> or reply to this email — we read every response.</p>
      <blockquote>"The new exports saved our team hours every week." — a happy customer</blockquote>
      <hr />
      <p style="font-size:12px;color:#666;">
        Acme Inc, 221B Example Street, Gurugram 122002<br />
        <a href="https://example.com/unsubscribe">Unsubscribe</a>
      </p>
      <img src="https://example.com/track.gif" width="1" height="1" alt="" />
    </td></tr>
  </table>
</body>
</html>`;
