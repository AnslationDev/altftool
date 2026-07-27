import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import {
  escapeXmlValue,
  isValidSitemapUrl,
  toXmlSafeSitemap,
} from "../altftoolweb/src/platform/seo/sitemapXml.js";

// The real serializer Next runs at build time. Driving it (rather than a
// replica) is the point of this file: it is the component that broke.
const require = createRequire(import.meta.url);
const { resolveSitemap } = require(
  "next/dist/build/webpack/loaders/metadata/resolve-route-data.js",
);

// A real Firebase Storage download URL shape. The bare "&" before "token"
// is what made Search Console report `EntityRef: expecting ';'` and discover
// 0 pages across the whole sitemap.
const FIREBASE_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/blogs%2F0wKISgHx5ZQavwYVXVYH?alt=media&token=04c96b96-281f-4473-9359-7d3fbff7be9a";

/* ------------------------------------------------------------------ *
 * Minimal strict XML well-formedness checker.
 * Deliberately dependency-free — no XML parser is a direct dependency,
 * and the failure class here (entity refs, raw angle brackets, unquoted
 * attributes, unbalanced tags) is exactly what needs asserting.
 * ------------------------------------------------------------------ */

// Only the five entities XML predefines, plus numeric refs. Anything else is an
// undefined-entity error — the same class of failure Google reported.
const ENTITY = /&(?:amp|lt|gt|quot|apos|#\d+|#[xX][0-9a-fA-F]+);/g;

// Walks a tag body attribute by attribute. A regex over the whole body cannot
// do this: "p=1" inside an already-quoted value looks like an unquoted attribute.
function scanAttributes(body, name, checkChars) {
  const isSpace = (ch) => ch === undefined || /\s/.test(ch);
  let k = name.length;

  while (k < body.length) {
    while (isSpace(body[k]) && k < body.length) k += 1;
    if (k >= body.length) break;

    const nameStart = k;
    while (k < body.length && !isSpace(body[k]) && body[k] !== "=") k += 1;
    const attrName = body.slice(nameStart, k);
    if (!attrName) break;

    while (isSpace(body[k]) && k < body.length) k += 1;
    if (body[k] !== "=") return `attribute ${attrName} has no value in <${name}>`;
    k += 1;
    while (isSpace(body[k]) && k < body.length) k += 1;

    const quote = body[k];
    if (quote !== '"' && quote !== "'") {
      return `unquoted attribute value in <${name}>`;
    }
    k += 1;

    const end = body.indexOf(quote, k);
    if (end === -1) return `unterminated attribute value in <${name}>`;

    const error = checkChars(
      body.slice(k, end),
      `attribute ${attrName} of <${name}>`,
    );
    if (error) return error;
    k = end + 1;
  }
  return null;
}

function findXmlError(xml) {
  const checkChars = (chunk, where) => {
    if (chunk.includes("<")) return `raw "<" in ${where}`;
    const stripped = chunk.replace(ENTITY, "");
    if (stripped.includes("&")) return `unescaped "&" in ${where}`;
    return null;
  };

  const stack = [];
  let i = 0;

  while (i < xml.length) {
    const lt = xml.indexOf("<", i);
    if (lt === -1) return checkChars(xml.slice(i), "trailing text");

    const textError = checkChars(xml.slice(i, lt), "text content");
    if (textError) return textError;

    if (xml.startsWith("<?", lt) || xml.startsWith("<!", lt)) {
      const close = xml.indexOf(">", lt);
      if (close === -1) return "unterminated declaration";
      i = close + 1;
      continue;
    }

    // Walk to the tag's ">", skipping any ">" that sits inside a quoted value.
    let j = lt + 1;
    let quote = null;
    while (j < xml.length) {
      const ch = xml[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === ">") break;
      j += 1;
    }
    if (j >= xml.length) return "unterminated tag";

    const raw = xml.slice(lt + 1, j);
    const selfClosing = raw.endsWith("/");
    const body = selfClosing ? raw.slice(0, -1) : raw;

    if (body.startsWith("/")) {
      const name = body.slice(1).trim();
      if (stack.pop() !== name) return `mismatched closing tag </${name}>`;
    } else {
      const name = body.split(/[\s/]/, 1)[0];
      if (!name) return "empty tag name";

      const attrError = scanAttributes(body, name, checkChars);
      if (attrError) return attrError;
      if (!selfClosing) stack.push(name);
    }
    i = j + 1;
  }

  return stack.length ? `unclosed tag <${stack[stack.length - 1]}>` : null;
}

function assertWellFormed(xml) {
  const error = findXmlError(xml);
  assert.equal(error, null, `sitemap XML is not well-formed: ${error}`);
}

/* ------------------------------------------------------------------ *
 * The checker itself must be trustworthy before it can guard anything.
 * ------------------------------------------------------------------ */

test("the well-formedness checker catches the failure classes it guards", () => {
  assert.equal(findXmlError("<a><b>ok &amp; fine</b></a>"), null);
  assert.equal(findXmlError('<a href="x?p=1&amp;q=2" />'), null);
  assert.match(findXmlError("<a>x & y</a>"), /unescaped "&"/);
  assert.match(findXmlError('<a href="x&y" />'), /unescaped "&"/);
  assert.match(findXmlError("<a><b></a>"), /mismatched closing tag/);
  assert.match(findXmlError("<a>"), /unclosed tag/);
  assert.match(findXmlError("<a href=x />"), /unquoted attribute value/);
});

/* ------------------------------------------------------------------ *
 * The regression this file exists for.
 * ------------------------------------------------------------------ */

test("Next's serializer still does not escape — the helper is required", () => {
  // Canary. If Next ever starts escaping, this fails and toXmlSafeSitemap
  // must be removed rather than left in place to double-encode.
  const raw = resolveSitemap([
    { url: "https://www.altftool.com/blogs/post", images: [FIREBASE_IMAGE] },
  ]);
  assert.ok(
    raw.includes("&token="),
    "Next now escapes sitemap values; drop toXmlSafeSitemap to avoid double-encoding",
  );
  assert.match(findXmlError(raw), /unescaped "&"/);
});

test("Firebase Storage image URLs survive as well-formed XML", () => {
  const xml = resolveSitemap(
    toXmlSafeSitemap([
      { url: "https://www.altftool.com/blogs/post", images: [FIREBASE_IMAGE] },
    ]),
  );

  assertWellFormed(xml);
  assert.ok(xml.includes("?alt=media&amp;token="), "ampersand must be escaped");
  assert.ok(!/&token=/.test(xml), "no bare ampersand may remain");
});

test("every entry field Next interpolates is escaped", () => {
  const xml = resolveSitemap(
    toXmlSafeSitemap([
      {
        url: "https://www.altftool.com/search?q=a&b=c",
        images: [FIREBASE_IMAGE],
        alternates: {
          languages: { "en-GB": "https://www.altftool.com/gb?a=1&b=2" },
        },
        videos: [
          {
            title: 'Tips & "tricks" for <tools>',
            description: "Compare A & B",
            thumbnail_loc: "https://www.altftool.com/t.jpg?v=1&x=2",
            content_loc: "https://www.altftool.com/v.mp4?a=1&b=2",
            uploader: { info: "https://www.altftool.com/u?a=1&b=2", content: "AltF & Co" },
            restriction: { relationship: "allow", content: "IN & US" },
          },
        ],
      },
    ]),
  );

  assertWellFormed(xml);
});

test("escaping is idempotent, so re-running cannot double-encode", () => {
  const once = toXmlSafeSitemap([
    { url: "https://www.altftool.com/a", images: [FIREBASE_IMAGE] },
  ]);
  assert.deepEqual(toXmlSafeSitemap(once), once);
  assert.equal(escapeXmlValue("a &amp; b &lt; c"), "a &amp; b &lt; c");
  assert.equal(escapeXmlValue("a & b"), "a &amp; b");

  // Only the five predefined entities count as already-escaped. An
  // HTML-ism like "&nbsp;" is an undefined entity in XML and must be escaped.
  assert.equal(escapeXmlValue("a&nbsp;b"), "a&amp;nbsp;b");
  assert.equal(escapeXmlValue("?x=1&session;y"), "?x=1&amp;session;y");
  assert.equal(escapeXmlValue("&#169; &#x1F600;"), "&#169; &#x1F600;");
});

test("unusable URLs are dropped instead of emitted", () => {
  assert.equal(isValidSitemapUrl("https://www.altftool.com/ok"), true);
  assert.equal(isValidSitemapUrl("/relative/path"), false);
  assert.equal(isValidSitemapUrl("https://www.altftool.com/blogs/undefined"), false);
  assert.equal(isValidSitemapUrl("https://www.altftool.com/a b"), false);
  assert.equal(isValidSitemapUrl("javascript:alert(1)"), false);
  assert.equal(isValidSitemapUrl(""), false);
  assert.equal(isValidSitemapUrl(undefined), false);

  const safe = toXmlSafeSitemap([
    { url: "https://www.altftool.com/keep" },
    { url: "/drop-me" },
    { url: "https://www.altftool.com/blogs/undefined" },
    null,
  ]);
  assert.deepEqual(
    safe.map((entry) => entry.url),
    ["https://www.altftool.com/keep"],
  );
});

test("a bad image URL drops the image, not the page", () => {
  const [entry] = toXmlSafeSitemap([
    {
      url: "https://www.altftool.com/blogs/post",
      images: ["/relative.png", FIREBASE_IMAGE],
    },
  ]);

  assert.equal(entry.url, "https://www.altftool.com/blogs/post");
  assert.equal(entry.images.length, 1);
  assert.ok(entry.images[0].includes("&amp;token="));
});

test("an entry whose images are all unusable keeps no empty images key", () => {
  const [entry] = toXmlSafeSitemap([
    { url: "https://www.altftool.com/blogs/post", images: ["/relative.png"] },
  ]);

  assert.equal("images" in entry, false);
  assertWellFormed(resolveSitemap([entry]));
});
