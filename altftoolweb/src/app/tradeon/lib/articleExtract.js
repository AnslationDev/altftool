// src/app/tradeon/lib/articleExtract.js
// Server-side article-body extractor for the News Detail page. RSS feeds only
// carry a summary, so to show the full article we fetch the source page and pull
// out its full content. Two strategies, best-of:
//   1. Rich DOM extraction — headings/paragraphs/images/lists/quotes as safe HTML,
//      used when it clearly captured the article (validated against the summary).
//   2. JSON-LD `articleBody` — the publisher's canonical full article text (very
//      reliable, e.g. Economic Times), rendered as paragraphs.
// Dependency-free (no HTML parser); best-effort → returns null on failure so the
// caller falls back to the RSS summary. Output is also sanitised on the client
// with DOMPurify before rendering.

import http from "node:http";
import https from "node:https";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

// Fetch a URL with a browser-like identity and a generous header cap. Node's
// global fetch (undici) limits response headers to ~16 KB and throws
// (UND_ERR_HEADERS_OVERFLOW) on pages that set many cookies — e.g. Yahoo Finance,
// which dominates the feed — so we use node:http(s) directly with a large
// maxHeaderSize and follow redirects manually. Resolves to { url, text }.
function httpGet(url, { timeout = 9000, redirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const ok = (v) => { if (!settled) { settled = true; resolve(v); } };
    const no = (e) => { if (!settled) { settled = true; reject(e); } };
    let target, lib;
    try { target = new URL(url); lib = target.protocol === "http:" ? http : https; }
    catch { return no(new Error("bad url")); }
    const req = lib.get(
      target,
      { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" }, maxHeaderSize: 262144, timeout },
      (res) => {
        const status = res.statusCode || 0;
        const loc = res.headers.location;
        if (status >= 300 && status < 400 && loc && redirects > 0) {
          res.resume();
          let next;
          try { next = new URL(loc, url).href; } catch { return no(new Error("bad redirect")); }
          return httpGet(next, { timeout, redirects: redirects - 1 }).then(ok, no);
        }
        if (status < 200 || status >= 300) { res.resume(); return no(new Error(`status ${status}`)); }
        let size = 0;
        const chunks = [];
        res.on("data", (c) => {
          size += c.length;
          if (size > 6_000_000) { req.destroy(); return no(new Error("too large")); }
          chunks.push(c);
        });
        res.on("end", () => ok({ url, text: Buffer.concat(chunks).toString("utf8") }));
      }
    );
    req.on("timeout", () => { req.destroy(); no(new Error("timeout")); });
    req.on("error", no);
  });
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plainText = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

function absUrl(u, base) {
  try { const x = new URL(u, base).href; return /^https?:\/\//i.test(x) ? x : null; } catch { return null; }
}

// Reduce a block's HTML to safe tags/attributes: strip every attribute except
// a[href] and img[src|alt]; drop images we can't resolve to an absolute URL.
function cleanBlock(html, base) {
  return html.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (_m, slash, tagRaw, attrs) => {
    const tag = tagRaw.toLowerCase();
    if (slash) return `</${tag}>`;
    if (tag === "a") {
      const href = (attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1];
      const abs = absUrl(href, base);
      return abs ? `<a href="${esc(abs)}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    if (tag === "img") {
      const src = (attrs.match(/\b(?:data-src|data-original|data-lazy-src|src)\s*=\s*["']([^"']+)["']/i) || [])[1];
      const abs = absUrl((src || "").split(" ")[0], base);
      if (!abs) return "";
      const alt = (attrs.match(/\balt\s*=\s*["']([^"']*)["']/i) || [])[1] || "";
      return `<img src="${esc(abs)}" alt="${esc(alt)}" loading="lazy" />`;
    }
    return `<${tag}>`; // keep tag, drop all attributes (removes on*, style, class…)
  });
}

// Strategy 1 — pull the main content blocks out of the page HTML.
function domExtract(rawIn, base) {
  const raw = rawIn
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<(header|footer|nav|aside)\b[\s\S]*?<\/\1>/gi, " ");

  const art = raw.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const region = art && plainText(art[1]).length > 400 ? art[1] : raw;

  const blocks = [];
  // Skip h1 — the page title is rendered separately on the detail page, so
  // including it here would duplicate the headline at the top of the body.
  const re = /<(p|h2|h3|h4|h5|h6|ul|ol|blockquote|figure|table|pre)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(region)) && blocks.length < 220) {
    const full = m[0];
    const tag = (m[1] || "img").toLowerCase();
    const inner = m[2] || "";
    const text = plainText(inner);
    const hasImg = tag === "img" || /<img/i.test(full);
    if (!hasImg) {
      if (text.length < 35) continue;
      const linkLen = plainText((inner.match(/<a\b[^>]*>([\s\S]*?)<\/a>/gi) || []).join("")).length;
      if (linkLen / Math.max(1, text.length) > 0.6) continue;
      if (/^(advertisement|sponsored|read more|also read|related|you may|trending|follow us|sign up|subscribe|share this|newsletter|©|all rights reserved)/i.test(text)) continue;
    }
    const cleaned = cleanBlock(full, base).trim();
    if (cleaned && cleaned !== "<img>" && cleaned !== "<a></a>") blocks.push(cleaned);
  }
  const dedup = blocks.filter((b, i) => b !== blocks[i - 1]);
  let out = dedup.join("\n");
  if (out.length > 100000) out = out.slice(0, 100000);
  return plainText(out).length > 200 ? out : null;
}

// Strategy 2 — the publisher's full article text from JSON-LD.
function jsonLdArticleBody(html) {
  const m = html.match(/"articleBody"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!m) return null;
  let text;
  try { text = JSON.parse(`"${m[1]}"`); }
  catch { text = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\//g, "/").replace(/\\t/g, " "); }
  return text && text.length > 200 ? text : null;
}

function textToHtml(text) {
  let paras = text.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 1);
  if (paras.length <= 1 && text.length > 1200) {
    const sents = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
    paras = [];
    for (let i = 0; i < sents.length; i += 4) paras.push(sents.slice(i, i + 4).join("").trim());
  }
  return paras.map((p) => `<p>${esc(p)}</p>`).join("\n");
}

// The DOM extraction is trusted only when it actually captured the article — its
// text should contain the RSS summary (the article's lead). Requires a usable
// summary; short/empty summaries are validated by prose quality instead.
function domCaptured(html, summary) {
  const s = (summary || "").replace(/\s+/g, " ").trim().toLowerCase();
  if (s.length < 40) return false;
  return plainText(html).toLowerCase().includes(s.slice(0, 40));
}

export async function extractArticleHtml(url, summary = "") {
  let raw, base;
  try {
    const r = await httpGet(url, { timeout: 9000 });
    raw = r.text;
    base = r.url || url;
  } catch { return null; }
  if (!raw || raw.length > 6_000_000) return null;

  const dom = domExtract(raw, base);
  const body = jsonLdArticleBody(raw);
  const domLen = dom ? plainText(dom).length : 0;
  const bodyLen = body ? body.length : 0;

  // Guard against image-flooded / link-list DOM (ET-style pages stuff related &
  // trending thumbnails/titles into the body). Trust rich DOM only when it has a
  // sane img/paragraph mix AND real prose (long average paragraphs), OR when it
  // clearly contains the summary lead.
  const imgs = dom ? (dom.match(/<img/g) || []).length : 0;
  const ps = dom ? (dom.match(/<p[ >]/g) || []).length : 0;
  const avgP = ps ? domLen / ps : 0;
  const ratioOk = imgs <= 14 && imgs <= ps * 2 + 3;
  const prose = avgP >= 130 || domCaptured(dom, summary);
  const domClean = dom && ratioOk && domLen > 500 && prose;

  // Prefer clean rich DOM (headings/paragraphs/images/lists/quotes) → else the
  // publisher's canonical full-text article body from JSON-LD.
  if (domClean) return dom;
  if (bodyLen > 200) return textToHtml(body);
  return null;
}
