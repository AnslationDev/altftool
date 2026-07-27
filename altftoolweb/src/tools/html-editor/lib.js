/**
 * HTML fragment editor: format (pretty print), minify, escape and unescape.
 *
 * Rules implemented
 * -----------------
 * 1. Void elements (HTML Living Standard §13.1.2) never have a closing tag and never change the
 *    indent depth: area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr.
 * 2. Raw text and escapable raw text elements (script, style, textarea, title) may not contain
 *    child elements — their content is copied through byte for byte and never re-indented.
 * 3. Whitespace inside <pre> is significant (CSS white-space: pre), so <pre> content is preserved
 *    exactly by both the formatter and the minifier.
 * 4. Minifying collapses each run of ASCII whitespace in a text node to a single space, because
 *    that is what the HTML parser and CSS "white-space: normal" already do at render time. A
 *    whitespace-only text node between two block-level elements carries no meaning and is dropped;
 *    between inline elements it is kept as one space, since removing it would join two words.
 * 5. Escaping replaces the five characters that are special in HTML markup: & < > " '. The
 *    ampersand must be replaced first or the other replacements would be double-escaped.
 * 6. Unescaping resolves named references from the table below plus numeric references in both
 *    decimal (&#169;) and hexadecimal (&#xA9;) form, in a single pass so nothing is double-decoded.
 */

/** Longest input accepted, to keep the single-pass tokenizer responsive in the browser. */
export const MAX_INPUT_LENGTH = 500000;

/** Elements with no end tag and no children — HTML Living Standard, "void elements". */
export const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/** Elements whose content is raw or escapable raw text and must never be re-indented. */
export const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea", "title", "pre"]);

/** Phrasing content where a surrounding space changes what the reader sees. */
export const INLINE_ELEMENTS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "img",
  "kbd",
  "label",
  "mark",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);

/** The five characters that must be escaped to appear literally in HTML markup. */
export const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Named character references resolved when unescaping. */
export const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "©",
  reg: "®",
  trade: "™",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  dagger: "†",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
  laquo: "«",
  raquo: "»",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  sect: "§",
  para: "¶",
  middot: "·",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  larr: "←",
  rarr: "→",
  uarr: "↑",
  darr: "↓",
  harr: "↔",
};

/** Escape the five HTML-special characters. Ampersand first, or the rest double-escape. */
export function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[&<>"']/g, (character) => ESCAPE_MAP[character]);
}

/** Resolve named and numeric character references in one pass. */
export function unescapeHtml(text) {
  if (typeof text !== "string") return "";
  return text.replace(/&(#[Xx][0-9A-Fa-f]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g, (match, reference) => {
    if (reference[0] === "#") {
      const isHex = reference[1] === "x" || reference[1] === "X";
      const code = Number.parseInt(isHex ? reference.slice(2) : reference.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    const named = NAMED_ENTITIES[reference];
    return named === undefined ? match : named;
  });
}

const WHITESPACE_RUN = /[\t\n\f\r ]+/g;

/**
 * Split HTML into tokens. Never throws: anything unparseable is emitted as text.
 * @returns {Array<{type: string, ...}>}
 */
export function tokenizeHtml(html) {
  const tokens = [];
  const source = String(html);
  let index = 0;
  let buffer = "";

  const flushText = () => {
    if (buffer !== "") {
      tokens.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  while (index < source.length) {
    if (source[index] !== "<") {
      buffer += source[index];
      index += 1;
      continue;
    }

    const rest = source.slice(index);

    if (rest.startsWith("<!--")) {
      const end = source.indexOf("-->", index + 4);
      const stop = end === -1 ? source.length : end + 3;
      flushText();
      tokens.push({ type: "comment", value: source.slice(index, stop) });
      index = stop;
      continue;
    }

    if (rest.startsWith("<![CDATA[")) {
      const end = source.indexOf("]]>", index);
      const stop = end === -1 ? source.length : end + 3;
      flushText();
      tokens.push({ type: "cdata", value: source.slice(index, stop) });
      index = stop;
      continue;
    }

    if (rest.startsWith("<!")) {
      const end = source.indexOf(">", index);
      const stop = end === -1 ? source.length : end + 1;
      flushText();
      tokens.push({ type: "doctype", value: source.slice(index, stop) });
      index = stop;
      continue;
    }

    const closeMatch = rest.match(/^<\/([A-Za-z][\w:.-]*)\s*>/);
    if (closeMatch) {
      flushText();
      tokens.push({ type: "close", name: closeMatch[1].toLowerCase(), value: closeMatch[0] });
      index += closeMatch[0].length;
      continue;
    }

    const openMatch = rest.match(/^<([A-Za-z][\w:.-]*)((?:'[^']*'|"[^"]*"|[^'">])*)(\/?)>/);
    if (openMatch) {
      const name = openMatch[1].toLowerCase();
      const selfClosing = openMatch[3] === "/" || VOID_ELEMENTS.has(name);
      flushText();
      tokens.push({
        type: "open",
        name,
        attributes: openMatch[2].trim(),
        selfClosing,
        value: openMatch[0],
      });
      index += openMatch[0].length;

      if (RAW_TEXT_ELEMENTS.has(name) && !selfClosing) {
        const closeRegex = new RegExp(`</${name}\\s*>`, "i");
        const remainder = source.slice(index);
        const found = remainder.match(closeRegex);
        const rawEnd = found ? found.index : remainder.length;
        tokens.push({ type: "raw", name, value: remainder.slice(0, rawEnd) });
        index += rawEnd;
      }
      continue;
    }

    // A stray "<" that is not the start of a tag is literal text.
    buffer += source[index];
    index += 1;
  }

  flushText();
  return tokens;
}

function renderOpenTag(token) {
  const attributes = token.attributes ? ` ${token.attributes}` : "";
  const slash = token.selfClosing && !VOID_ELEMENTS.has(token.name) ? " /" : "";
  return `<${token.name}${attributes}${slash}>`;
}

/**
 * Pretty print an HTML fragment.
 * @param {string} html
 * @param {object} [options]
 * @param {number} [options.indentSize] Spaces per level (0-8), or use tabs when useTabs is set.
 * @param {boolean} [options.useTabs]
 * @param {number} [options.inlineTextLimit] Keep an element on one line when its only child is
 *                                           text no longer than this. Set to 0 to always break.
 * @returns {{ output: string, tags: number, depth: number, unclosed: string[] }} or { error }
 */
export function formatHtml(html, options = {}) {
  const { indentSize = 2, useTabs = false, inlineTextLimit = 60 } = options;

  if (typeof html !== "string" || html.trim() === "") {
    return { error: "Paste some HTML to format." };
  }
  if (html.length > MAX_INPUT_LENGTH) {
    return { error: `That fragment is ${html.length} characters. This editor handles up to ${MAX_INPUT_LENGTH}.` };
  }
  if (!Number.isFinite(indentSize) || indentSize < 0 || indentSize > 8) {
    return { error: "Indent size must be between 0 and 8 spaces." };
  }

  const tokens = tokenizeHtml(html);
  const unit = useTabs ? "\t" : " ".repeat(indentSize);
  const lines = [];
  const stack = [];
  const implicitlyClosed = [];
  const strayClosers = [];
  let tags = 0;
  let maxDepth = 0;

  const push = (text) => lines.push(`${unit.repeat(stack.length)}${text}`);

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "text") {
      const trimmed = token.value.replace(WHITESPACE_RUN, " ").trim();
      if (trimmed !== "") push(trimmed);
      continue;
    }

    if (token.type === "comment" || token.type === "doctype" || token.type === "cdata") {
      push(token.value.trim());
      continue;
    }

    if (token.type === "raw") {
      // Content of script/style/pre/textarea is emitted verbatim, never re-indented.
      const value = token.name === "pre" || token.name === "textarea" ? token.value : token.value.trim();
      if (value !== "") lines.push(value);
      continue;
    }

    if (token.type === "open") {
      tags += 1;
      const openText = renderOpenTag(token);

      if (token.selfClosing) {
        push(openText);
        continue;
      }

      // <tag>short text</tag> stays on one line when there is no element child.
      const next = tokens[index + 1];
      const after = tokens[index + 2];
      const preservesWhitespace = token.name === "pre" || token.name === "textarea";

      // <pre> and <textarea> are emitted whole so not one byte of their content moves.
      if (preservesWhitespace && next && next.type === "raw") {
        const closed = after && after.type === "close" && after.name === token.name;
        push(`${openText}${next.value}${closed ? `</${token.name}>` : ""}`);
        index += closed ? 2 : 1;
        continue;
      }

      const nextIsText =
        !preservesWhitespace && next && (next.type === "text" || next.type === "raw");
      const collapsedText = nextIsText ? next.value.replace(WHITESPACE_RUN, " ").trim() : "";
      if (
        inlineTextLimit > 0 &&
        nextIsText &&
        after &&
        after.type === "close" &&
        after.name === token.name &&
        collapsedText.length <= inlineTextLimit &&
        !collapsedText.includes("\n")
      ) {
        push(`${openText}${collapsedText}</${token.name}>`);
        index += 2;
        continue;
      }
      if (next && next.type === "close" && next.name === token.name) {
        push(`${openText}</${token.name}>`);
        index += 1;
        continue;
      }

      push(openText);
      stack.push(token.name);
      if (stack.length > maxDepth) maxDepth = stack.length;
      continue;
    }

    if (token.type === "close") {
      const position = stack.lastIndexOf(token.name);
      if (position === -1) {
        // Closing tag with no matching open tag — keep it, do not unindent past zero.
        strayClosers.push(token.name);
        push(token.value);
        continue;
      }
      // Implicitly close anything left open inside.
      while (stack.length > position + 1) {
        const orphan = stack.pop();
        if (!implicitlyClosed.includes(orphan)) implicitlyClosed.push(orphan);
      }
      stack.pop();
      push(`</${token.name}>`);
    }
  }

  return {
    output: `${lines.join("\n")}\n`,
    tags,
    depth: maxDepth,
    unclosed: [...stack],
    implicitlyClosed,
    strayClosers,
  };
}

/**
 * Minify an HTML fragment.
 * @param {string} html
 * @param {object} [options]
 * @param {boolean} [options.removeComments]
 * @param {boolean} [options.collapseWhitespace]
 * @param {boolean} [options.removeAllWhitespaceBetweenTags] Also drop the single space that is
 *        kept between inline elements. Changes rendering — off by default.
 * @returns {{ output: string, tags: number, savedBytes: number, savedPercent: number }} or { error }
 */
export function minifyHtml(html, options = {}) {
  const {
    removeComments = true,
    collapseWhitespace = true,
    removeAllWhitespaceBetweenTags = false,
  } = options;

  if (typeof html !== "string" || html.trim() === "") {
    return { error: "Paste some HTML to minify." };
  }
  if (html.length > MAX_INPUT_LENGTH) {
    return { error: `That fragment is ${html.length} characters. This editor handles up to ${MAX_INPUT_LENGTH}.` };
  }

  const tokens = tokenizeHtml(html);
  const pieces = [];
  let tags = 0;

  const lastElementName = (position) => {
    for (let index = position - 1; index >= 0; index -= 1) {
      const token = tokens[index];
      if (token.type === "open") return token.name;
      if (token.type === "close") return token.name;
    }
    return null;
  };
  const nextElementName = (position) => {
    for (let index = position + 1; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token.type === "open") return token.name;
      if (token.type === "close") return token.name;
    }
    return null;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "comment") {
      // Downlevel-revealed conditional comments are markup, not notes, so they survive.
      if (!removeComments || token.value.startsWith("<!--[if")) pieces.push(token.value);
      continue;
    }

    if (token.type === "doctype" || token.type === "cdata") {
      pieces.push(token.value);
      continue;
    }

    if (token.type === "raw") {
      pieces.push(token.value);
      continue;
    }

    if (token.type === "open") {
      tags += 1;
      pieces.push(renderOpenTag(token));
      continue;
    }

    if (token.type === "close") {
      pieces.push(`</${token.name}>`);
      continue;
    }

    // Text node.
    if (!collapseWhitespace) {
      pieces.push(token.value);
      continue;
    }
    const collapsed = token.value.replace(WHITESPACE_RUN, " ");
    const before = lastElementName(index);
    const after = nextElementName(index);

    if (collapsed.trim() !== "") {
      // A space touching a block-level boundary is not rendered, so it can go.
      let text = collapsed;
      if (before === null || !INLINE_ELEMENTS.has(before)) text = text.replace(/^ /, "");
      if (after === null || !INLINE_ELEMENTS.has(after)) text = text.replace(/ $/, "");
      pieces.push(text);
      continue;
    }
    if (removeAllWhitespaceBetweenTags) continue;
    const inlineNeighbour =
      (before !== null && INLINE_ELEMENTS.has(before)) || (after !== null && INLINE_ELEMENTS.has(after));
    if (inlineNeighbour) pieces.push(" ");
  }

  const output = pieces.join("").trim();
  const savedBytes = html.length - output.length;
  return {
    output,
    tags,
    originalBytes: html.length,
    minifiedBytes: output.length,
    savedBytes,
    savedPercent: html.length > 0 ? Math.round((savedBytes / html.length) * 1000) / 10 : 0,
  };
}

/**
 * Single entry point used by the UI.
 * @param {string} html
 * @param {object} [options]
 * @param {"format"|"minify"|"escape"|"unescape"} [options.mode]
 * @returns {{ output: string, mode: string, stats: object }} or { error }
 */
export function processHtml(html, options = {}) {
  const { mode = "format" } = options;

  if (typeof html !== "string" || html.trim() === "") {
    return { error: "Paste some HTML to get started." };
  }
  if (html.length > MAX_INPUT_LENGTH) {
    return { error: `That fragment is ${html.length} characters. This editor handles up to ${MAX_INPUT_LENGTH}.` };
  }

  if (mode === "escape") {
    const output = escapeHtml(html);
    return {
      mode,
      output,
      stats: {
        originalBytes: html.length,
        outputBytes: output.length,
        replacements: (html.match(/[&<>"']/g) || []).length,
      },
    };
  }

  if (mode === "unescape") {
    const output = unescapeHtml(html);
    return {
      mode,
      output,
      stats: {
        originalBytes: html.length,
        outputBytes: output.length,
        replacements: (html.match(/&(#[Xx][0-9A-Fa-f]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g) || []).length,
      },
    };
  }

  if (mode === "minify") {
    const result = minifyHtml(html, options);
    if (result.error) return { error: result.error };
    return {
      mode,
      output: result.output,
      stats: {
        originalBytes: result.originalBytes,
        outputBytes: result.minifiedBytes,
        savedBytes: result.savedBytes,
        savedPercent: result.savedPercent,
        tags: result.tags,
      },
    };
  }

  if (mode === "format") {
    const result = formatHtml(html, options);
    if (result.error) return { error: result.error };
    return {
      mode,
      output: result.output,
      stats: {
        originalBytes: html.length,
        outputBytes: result.output.length,
        tags: result.tags,
        depth: result.depth,
        unclosed: result.unclosed,
        implicitlyClosed: result.implicitlyClosed,
        strayClosers: result.strayClosers,
      },
    };
  }

  return { error: "Choose format, minify, escape or unescape." };
}
