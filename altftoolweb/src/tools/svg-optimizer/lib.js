/**
 * SVG Optimizer — shrink an SVG source string without changing what it draws.
 *
 * WHAT THE RULES ARE, AND WHERE THEY COME FROM
 *
 * 1. Editor cruft. Inkscape writes <sodipodi:namedview> and inkscape:* attributes,
 *    Illustrator writes <metadata> with RDF/Dublin Core, and both write comments.
 *    None of these are rendered by the SVG 1.1 rendering model (W3C SVG 1.1 §3), so
 *    deleting them cannot change the picture.
 *
 * 2. Default attribute values. SVG 1.1 §11 (Painting) and §10 (Text) give every
 *    presentation attribute an initial value. Writing that initial value out is a no-op,
 *    so `stroke-width="1"` or `fill-opacity="1"` can go. The table below lists only
 *    attributes whose initial value is fixed by the spec — never inherited-dependent ones.
 *
 * 3. Coordinate precision. Path data is a list of user-space numbers (SVG 1.1 §8.3).
 *    Rounding 12.3456789 to 12.35 moves a point by at most half of 10^-precision user
 *    units, which for an icon drawn on a 24-unit viewBox is far below one device pixel.
 *    Rounding is the single biggest win on exported artwork, which routinely carries
 *    9 or more decimal places.
 *
 * 4. Path data separators. SVG 1.1 §8.3.1 says numbers may be separated by whitespace or
 *    a comma, and that a separator can be dropped entirely when the next token starts
 *    with a sign, or with "." when the previous number already contains a ".". So
 *    "M 0.5 , 0.5 L 1.5 , -2.5" is rewritten as "M.5.5L1.5-2.5" — same path, fewer bytes.
 *
 * 4b. Elliptical-arc flags. SVG 1.1 §8.3.1's elliptical-arc-argument grammar gives the
 *    "A"/"a" command seven numbers per repetition (rx, ry, x-axis-rotation, large-arc-flag,
 *    sweep-flag, x, y), but the two flags are each exactly one digit ("0" or "1") and the
 *    grammar allows zero separator between them or before the following number — "1 1" may
 *    be written "11". A generic "numbers are whitespace/comma separated" tokenizer misreads
 *    that as the single number 11, so path data is parsed command-aware for "A"/"a".
 *
 * 5. Empty containers. A <g> or <defs> with no children paints nothing (SVG 1.1 §5.2),
 *    so it is dropped.
 *
 * 6. Unused ids. An id only matters if something points at it: url(#id) in a paint or
 *    filter, or href="#id" / xlink:href="#id". Ids nothing references are dropped.
 *    Every reference in the file is collected first, so a referenced id is always kept.
 *
 * Pure module: a string goes in, a string and a byte count come out. No DOM, no clock.
 */

/** Decimal places kept in path data and coordinates when the user does not choose. */
export const DEFAULT_PRECISION = 3;

/** Widest precision the tool will accept; beyond this rounding is meaningless. */
export const MAX_PRECISION = 8;

/**
 * Namespace prefixes written by drawing applications. Attributes and elements carrying
 * these prefixes are private editor state, not part of the rendered SVG.
 */
export const EDITOR_NAMESPACE_PREFIXES = [
  "inkscape",
  "sodipodi",
  "sketch",
  "figma",
  "serif",
  "adobe",
  "illustrator",
  "graph",
  "a",
  "i",
  "x",
  "cc",
  "dc",
  "rdf",
];

/** Elements that carry only editor or licensing state and paint nothing. */
export const METADATA_ELEMENTS = ["metadata", "sodipodi:namedview", "inkscape:path-effect"];

/** Containers that are safe to delete once they hold no children (SVG 1.1 §5.2). */
export const EMPTY_CONTAINER_ELEMENTS = ["g", "defs", "symbol", "switch"];

/** Elements whose text content is significant and must never be whitespace-collapsed. */
export const TEXT_PRESERVING_ELEMENTS = [
  "text",
  "tspan",
  "textPath",
  "style",
  "script",
  "title",
  "desc",
  "foreignObject",
];

/**
 * Presentation attributes whose initial value is fixed by SVG 1.1, keyed to that value.
 * Sources: SVG 1.1 §11.3 (fill/stroke), §11.4 (stroke properties), §14.5 (opacity),
 * §10.10 (text-anchor), §11.2 (visibility).
 */
export const DEFAULT_ATTRIBUTE_VALUES = {
  "fill-opacity": "1",
  "fill-rule": "nonzero",
  "clip-rule": "nonzero",
  opacity: "1",
  "stroke-opacity": "1",
  "stroke-width": "1",
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
  "stroke-miterlimit": "4",
  "stroke-dasharray": "none",
  "stroke-dashoffset": "0",
  "font-style": "normal",
  "font-weight": "normal",
  "font-variant": "normal",
  "font-stretch": "normal",
  "letter-spacing": "normal",
  "word-spacing": "normal",
  "text-anchor": "start",
  "text-decoration": "none",
  visibility: "visible",
  "stop-opacity": "1",
  "color-interpolation": "sRGB",
  "shape-rendering": "auto",
  "image-rendering": "auto",
  "paint-order": "normal",
  "vector-effect": "none",
  "clip-path": "none",
  mask: "none",
  filter: "none",
};

/**
 * `overflow` is deliberately absent from DEFAULT_ATTRIBUTE_VALUES above: its initial value
 * is "visible" per CSS Overflow, but the UA stylesheet that ships with every SVG renderer
 * overrides that to "hidden" for exactly these six element types (the only ones `overflow`
 * has any rendering effect on). "visible" is therefore never their default — stripping an
 * explicit `overflow="visible"` on one of them silently re-enables clipping. Only an explicit
 * `overflow="hidden"` on one of these six is truly redundant and safe to drop.
 */
// Lowercase to match the `lower` (child.name.toLowerCase()) comparison used in walk() below;
// "foreignObject" is the real SVG element name, but comparisons here are case-insensitive.
export const OVERFLOW_HIDDEN_BY_DEFAULT_ELEMENTS = ["svg", "symbol", "pattern", "marker", "image", "foreignobject"];

/** Attributes holding a single user-space number that is safe to round. */
export const NUMERIC_ATTRIBUTES = [
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "fx",
  "fy",
  "width",
  "height",
  "offset",
  "stroke-width",
  "stroke-dashoffset",
  "font-size",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  "stop-opacity",
  "startOffset",
  "dx",
  "dy",
];

/** Attributes holding a whitespace/comma separated list of numbers. */
export const NUMBER_LIST_ATTRIBUTES = ["viewBox", "points", "stroke-dasharray"];

/**
 * Attributes rounded to at least `PRECISION_FLOOR` decimals no matter how low the user sets
 * the coordinate-precision slider. Unlike a coordinate, these carry visible meaning at values
 * the slider can otherwise erase: opacity/fill-opacity/stroke-opacity/stop-opacity range over
 * [0, 1], so precision 0 collapses e.g. 0.5 to 1 (fully opaque) or 0 (fully transparent), and
 * stroke-width/font-size can round to 0 (invisible) or a visibly thicker/thinner value. The
 * slider is meant to trade off sub-pixel coordinate precision for size, not to change what's
 * drawn — so these are decoupled from it.
 */
const PRECISION_FLOOR_ATTRIBUTES = ["opacity", "fill-opacity", "stroke-opacity", "stop-opacity", "stroke-width", "font-size"];
const PRECISION_FLOOR = 2;

/** The single-letter path commands of SVG 1.1 §8.3. Note there is no "e" command. */
const PATH_COMMAND_LETTERS = "MmZzLlHhVvCcSsQqTtAa";

const COMMAND_LETTER_STICKY_RE = new RegExp(`[${PATH_COMMAND_LETTERS}]`, "y");
/** Sticky (position-anchored) matchers used to hand-walk path data command-aware. */
const NUMBER_STICKY_RE = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/y;
/** An elliptical-arc flag is exactly one digit; it may abut the next token with no separator. */
const ARC_FLAG_STICKY_RE = /[01]/y;
const SEPARATOR_STICKY_RE = /[\s,]*/y;

const BARE_NUMBER_RE = /^[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?$/;

/** UTF-8 byte length of a string — what the file will actually weigh on disk. */
export function byteLength(text) {
  if (typeof text !== "string") return 0;
  if (typeof TextEncoder === "function") return new TextEncoder().encode(text).length;
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.codePointAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else {
      bytes += 4;
      i += 1;
    }
  }
  return bytes;
}

/**
 * Round a number to `precision` decimals and render it in the shortest legal SVG form:
 * trailing zeros dropped, leading "0" before a decimal point dropped, "-0" folded to "0".
 */
export function formatNumber(value, precision) {
  if (!Number.isFinite(value)) return null;
  const places = Math.max(0, Math.min(MAX_PRECISION, Math.trunc(precision)));
  const factor = Math.pow(10, places);
  let rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0)) rounded = 0;
  if (Math.abs(rounded) >= 1e21) return String(rounded);
  let out = rounded.toFixed(places);
  if (out.indexOf(".") !== -1) out = out.replace(/0+$/, "").replace(/\.$/, "");
  out = out.replace(/^(-?)0\./, "$1.");
  if (out === "" || out === "-") out = "0";
  return out;
}

/**
 * Decide whether two adjacent path tokens can be written with no separator between them
 * (SVG 1.1 §8.3.1). Safe when the next token carries its own sign, or starts with "."
 * and the previous number already spent its decimal point.
 */
function needsSeparator(previous, next) {
  if (!previous) return false;
  if (next[0] === "-" || next[0] === "+") return false;
  if (previous.indexOf("e") !== -1 || previous.indexOf("E") !== -1) return true;
  if (next[0] === "." && previous.indexOf(".") !== -1) return false;
  return true;
}

/**
 * Rewrite a path `d` attribute with rounded numbers and minimal separators.
 *
 * Command-aware specifically for "A"/"a": its argument list repeats in groups of seven
 * (rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y), and the two flag slots are
 * parsed as exactly one digit each — never merged with an adjacent digit — regardless of
 * whether a separator follows. Every other command's numbers are parsed generically, same
 * as before.
 */
export function optimizePathData(d, precision) {
  if (typeof d !== "string" || d.trim() === "") return "";
  let out = "";
  let previousNumber = null;
  let currentCommand = null;
  let argIndex = 0;
  let i = 0;
  const n = d.length;

  const emit = (rendered) => {
    if (rendered === null) return;
    if (needsSeparator(previousNumber, rendered)) out += " ";
    out += rendered;
    previousNumber = rendered;
  };

  while (i < n) {
    SEPARATOR_STICKY_RE.lastIndex = i;
    const sep = SEPARATOR_STICKY_RE.exec(d);
    if (sep && sep[0].length > 0) i = SEPARATOR_STICKY_RE.lastIndex;
    if (i >= n) break;

    COMMAND_LETTER_STICKY_RE.lastIndex = i;
    const cmd = COMMAND_LETTER_STICKY_RE.exec(d);
    if (cmd) {
      out += cmd[0];
      previousNumber = null;
      currentCommand = cmd[0];
      argIndex = 0;
      i = COMMAND_LETTER_STICKY_RE.lastIndex;
      continue;
    }

    const isArcFlagSlot =
      (currentCommand === "A" || currentCommand === "a") && (argIndex % 7 === 3 || argIndex % 7 === 4);

    if (isArcFlagSlot) {
      ARC_FLAG_STICKY_RE.lastIndex = i;
      const flag = ARC_FLAG_STICKY_RE.exec(d);
      if (flag) {
        emit(flag[0]);
        i = ARC_FLAG_STICKY_RE.lastIndex;
        argIndex += 1;
        continue;
      }
      // Malformed input (flag slot isn't "0"/"1"): fall through to generic number
      // parsing below rather than looping forever on unparseable data.
    }

    NUMBER_STICKY_RE.lastIndex = i;
    const num = NUMBER_STICKY_RE.exec(d);
    if (!num || num[0] === "") {
      // Unrecognized character (stray letter, malformed token): skip it so a bad
      // input can't hang the loop, matching parseSvg's forgiving-by-design policy.
      i += 1;
      continue;
    }
    emit(formatNumber(Number(num[0]), precision));
    i = NUMBER_STICKY_RE.lastIndex;
    if (currentCommand === "A" || currentCommand === "a") argIndex += 1;
  }

  return out;
}

/** Round every bare number inside a whitespace/comma separated list. */
export function optimizeNumberList(value, precision) {
  return String(value)
    .trim()
    .split(/[\s,]+/)
    .filter((part) => part !== "")
    .map((part) => (BARE_NUMBER_RE.test(part) ? formatNumber(Number(part), precision) : part))
    .join(" ");
}

/** Round the numbers inside a transform list, leaving the function names untouched. */
export function optimizeTransform(value, precision) {
  return String(value)
    .replace(/([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/g, (n) => {
      const rendered = formatNumber(Number(n), precision);
      return rendered === null ? n : rendered;
    })
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .replace(/\)\s+/g, ") ")
    .trim();
}

/* ------------------------------------------------------------------ parser -- */

/**
 * Parse an XML/SVG string into a shallow node tree.
 * Forgiving by design: a stray close tag is ignored rather than throwing, because
 * hand-edited SVGs are frequently a little bit wrong and still render.
 */
export function parseSvg(source) {
  const root = { type: "root", children: [] };
  const stack = [root];
  let i = 0;
  const n = source.length;

  const push = (node) => stack[stack.length - 1].children.push(node);

  while (i < n) {
    const lt = source.indexOf("<", i);
    if (lt === -1) {
      const rest = source.slice(i);
      if (rest !== "") push({ type: "text", value: rest });
      break;
    }
    if (lt > i) push({ type: "text", value: source.slice(i, lt) });

    if (source.startsWith("<!--", lt)) {
      const end = source.indexOf("-->", lt + 4);
      const stop = end === -1 ? n : end + 3;
      push({ type: "comment", value: source.slice(lt, stop) });
      i = stop;
      continue;
    }
    if (source.startsWith("<![CDATA[", lt)) {
      const end = source.indexOf("]]>", lt + 9);
      const stop = end === -1 ? n : end + 3;
      push({ type: "cdata", value: source.slice(lt, stop) });
      i = stop;
      continue;
    }
    if (source.startsWith("<!", lt)) {
      // DOCTYPE or other declaration; skip to the matching ">" allowing one [ ... ] block
      let j = lt + 2;
      let depth = 0;
      while (j < n) {
        const ch = source[j];
        if (ch === "[") depth += 1;
        else if (ch === "]") depth -= 1;
        else if (ch === ">" && depth <= 0) break;
        j += 1;
      }
      push({ type: "doctype", value: source.slice(lt, Math.min(j + 1, n)) });
      i = Math.min(j + 1, n);
      continue;
    }
    if (source.startsWith("<?", lt)) {
      const end = source.indexOf("?>", lt + 2);
      const stop = end === -1 ? n : end + 2;
      push({ type: "pi", value: source.slice(lt, stop) });
      i = stop;
      continue;
    }
    if (source.startsWith("</", lt)) {
      const end = source.indexOf(">", lt);
      const stop = end === -1 ? n : end + 1;
      const name = source.slice(lt + 2, end === -1 ? n : end).trim();
      for (let s = stack.length - 1; s > 0; s -= 1) {
        if (stack[s].name === name) {
          stack.length = s;
          break;
        }
      }
      i = stop;
      continue;
    }

    // Opening tag
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(source[j])) j += 1;
    const name = source.slice(lt + 1, j);
    const attrs = [];
    let selfClosing = false;

    while (j < n) {
      while (j < n && /\s/.test(source[j])) j += 1;
      if (j >= n) break;
      if (source[j] === "/") {
        selfClosing = true;
        j += 1;
        continue;
      }
      if (source[j] === ">") {
        j += 1;
        break;
      }
      const nameStart = j;
      while (j < n && !/[\s=/>]/.test(source[j])) j += 1;
      const attrName = source.slice(nameStart, j);
      while (j < n && /\s/.test(source[j])) j += 1;
      let attrValue = "";
      if (source[j] === "=") {
        j += 1;
        while (j < n && /\s/.test(source[j])) j += 1;
        const quote = source[j];
        if (quote === '"' || quote === "'") {
          const end = source.indexOf(quote, j + 1);
          const stop = end === -1 ? n : end;
          attrValue = source.slice(j + 1, stop);
          j = stop + 1;
        } else {
          const start = j;
          while (j < n && !/[\s>]/.test(source[j])) j += 1;
          attrValue = source.slice(start, j);
        }
      }
      if (attrName !== "") attrs.push([attrName, attrValue]);
    }

    const node = { type: "element", name, attrs, children: [], selfClosing };
    push(node);
    if (!selfClosing) stack.push(node);
    i = j;
  }

  return root;
}

/* ------------------------------------------------------- reference scanning -- */

/** Collect every id the document points at, so those ids are never removed. */
export function collectReferencedIds(source) {
  const ids = new Set();
  const urlRe = /url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)/g;
  const hrefRe = /(?:xlink:)?href\s*=\s*["']#([^"']+)["']/g;
  const beginRe = /(?:begin|end)\s*=\s*["']([A-Za-z_][\w:.-]*)\./g;
  // Inline <style> blocks can target ids with a bare CSS id selector (#logo { ... }), which
  // is a reference just like url(#id) or href="#id" — miss it and "Remove unreferenced ids"
  // deletes an id the stylesheet still needs, breaking the styling it was meant to apply.
  const styleBlockRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const cssIdSelectorRe = /#([A-Za-z_][\w-]*)/g;
  let m;
  while ((m = urlRe.exec(source)) !== null) ids.add(m[1]);
  while ((m = hrefRe.exec(source)) !== null) ids.add(m[1]);
  while ((m = beginRe.exec(source)) !== null) ids.add(m[1]);
  let styleMatch;
  while ((styleMatch = styleBlockRe.exec(source)) !== null) {
    let idMatch;
    cssIdSelectorRe.lastIndex = 0;
    while ((idMatch = cssIdSelectorRe.exec(styleMatch[1])) !== null) ids.add(idMatch[1]);
  }
  return ids;
}

/* ------------------------------------------------------------- serializer -- */

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function serializeNode(node, out) {
  if (node.type === "text") {
    out.push(node.value);
    return;
  }
  if (node.type === "comment" || node.type === "cdata" || node.type === "pi" || node.type === "doctype") {
    out.push(node.value);
    return;
  }
  if (node.type === "root") {
    for (const child of node.children) serializeNode(child, out);
    return;
  }
  out.push("<", node.name);
  for (const [name, value] of node.attrs) {
    out.push(" ", name, '="', escapeAttribute(value), '"');
  }
  if (node.children.length === 0) {
    out.push("/>");
    return;
  }
  out.push(">");
  for (const child of node.children) serializeNode(child, out);
  out.push("</", node.name, ">");
}

export function serializeSvg(root) {
  const out = [];
  serializeNode(root, out);
  return out.join("");
}

/* --------------------------------------------------------------- optimizer -- */

export const DEFAULT_OPTIONS = {
  precision: DEFAULT_PRECISION,
  removeComments: true,
  removeMetadata: true,
  removeEditorAttributes: true,
  removeDoctype: true,
  removeDefaultAttributes: true,
  removeEmptyContainers: true,
  removeUnusedIds: true,
  collapseWhitespace: true,
  removeTitleDesc: false,
};

function hasEditorPrefix(name) {
  const colon = name.indexOf(":");
  if (colon === -1) return false;
  const prefix = name.slice(0, colon);
  if (prefix === "xmlns") return EDITOR_NAMESPACE_PREFIXES.includes(name.slice(colon + 1));
  if (prefix === "xlink" || prefix === "xml") return false;
  return EDITOR_NAMESPACE_PREFIXES.includes(prefix);
}

/**
 * Optimize an SVG source string.
 *
 * @param {string} source raw SVG markup
 * @param {object} [options] see DEFAULT_OPTIONS
 * @returns {object} { output, originalBytes, optimizedBytes, savedBytes, savedPercent,
 *                     removed: { comments, elements, attributes, ids } } or { error }
 */
export function optimizeSvg(source, options = {}) {
  if (typeof source !== "string" || source.trim() === "")
    return { error: "Paste some SVG markup first." };

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const precision = Math.max(0, Math.min(MAX_PRECISION, Math.trunc(Number(opts.precision))));
  if (!Number.isFinite(precision))
    return { error: `Precision must be a whole number between 0 and ${MAX_PRECISION}.` };

  if (source.indexOf("<svg") === -1 && source.indexOf("<SVG") === -1)
    return { error: "That does not look like SVG — no <svg> element was found." };

  const originalBytes = byteLength(source);
  const referencedIds = collectReferencedIds(source);
  const root = parseSvg(source);

  const removed = { comments: 0, elements: 0, attributes: 0, ids: 0 };

  function walk(node, preserveText) {
    const kept = [];
    for (const child of node.children) {
      if (child.type === "comment") {
        if (opts.removeComments) {
          removed.comments += 1;
          continue;
        }
        kept.push(child);
        continue;
      }
      if (child.type === "doctype") {
        if (opts.removeDoctype) {
          removed.elements += 1;
          continue;
        }
        kept.push(child);
        continue;
      }
      if (child.type === "pi") {
        // The XML declaration is optional for SVG served as image/svg+xml.
        if (opts.removeDoctype) {
          removed.elements += 1;
          continue;
        }
        kept.push(child);
        continue;
      }
      if (child.type === "text") {
        if (preserveText) {
          kept.push(child);
        } else if (opts.collapseWhitespace) {
          if (child.value.trim() !== "") kept.push({ type: "text", value: child.value.trim() });
        } else {
          kept.push(child);
        }
        continue;
      }
      if (child.type === "cdata") {
        kept.push(child);
        continue;
      }

      // element
      const lower = child.name.toLowerCase();
      if (opts.removeMetadata && METADATA_ELEMENTS.includes(lower)) {
        removed.elements += 1;
        continue;
      }
      if (opts.removeEditorAttributes && hasEditorPrefix(child.name)) {
        removed.elements += 1;
        continue;
      }
      if (opts.removeTitleDesc && (lower === "title" || lower === "desc")) {
        removed.elements += 1;
        continue;
      }

      const attrs = [];
      for (const [name, value] of child.attrs) {
        if (opts.removeEditorAttributes && hasEditorPrefix(name)) {
          removed.attributes += 1;
          continue;
        }
        if (value === "" && name !== "d" && name !== "points") {
          removed.attributes += 1;
          continue;
        }
        if (
          opts.removeDefaultAttributes &&
          name === "overflow" &&
          OVERFLOW_HIDDEN_BY_DEFAULT_ELEMENTS.includes(lower) &&
          value.trim() === "hidden"
        ) {
          removed.attributes += 1;
          continue;
        }
        if (
          opts.removeDefaultAttributes &&
          Object.prototype.hasOwnProperty.call(DEFAULT_ATTRIBUTE_VALUES, name) &&
          value.trim() === DEFAULT_ATTRIBUTE_VALUES[name]
        ) {
          removed.attributes += 1;
          continue;
        }
        if (name === "id" && opts.removeUnusedIds && !referencedIds.has(value)) {
          removed.ids += 1;
          continue;
        }

        let next = value;
        if (name === "d") next = optimizePathData(value, precision);
        else if (NUMBER_LIST_ATTRIBUTES.includes(name)) next = optimizeNumberList(value, precision);
        else if (name === "transform" || name === "gradientTransform" || name === "patternTransform")
          next = optimizeTransform(value, precision);
        else if (NUMERIC_ATTRIBUTES.includes(name) && BARE_NUMBER_RE.test(value.trim())) {
          const attrPrecision = PRECISION_FLOOR_ATTRIBUTES.includes(name)
            ? Math.max(precision, PRECISION_FLOOR)
            : precision;
          next = formatNumber(Number(value.trim()), attrPrecision) ?? value;
        }
        else next = value.trim();

        attrs.push([name, next]);
      }
      child.attrs = attrs;

      walk(child, preserveText || TEXT_PRESERVING_ELEMENTS.includes(child.name));

      if (
        opts.removeEmptyContainers &&
        EMPTY_CONTAINER_ELEMENTS.includes(lower) &&
        child.children.length === 0
      ) {
        removed.elements += 1;
        continue;
      }

      kept.push(child);
    }
    node.children = kept;
  }

  walk(root, false);

  const output = serializeSvg(root).trim();
  const optimizedBytes = byteLength(output);
  const savedBytes = originalBytes - optimizedBytes;
  const savedPercent = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;

  return {
    output,
    originalBytes,
    optimizedBytes,
    savedBytes,
    savedPercent,
    precision,
    removed,
  };
}

/** Percent-encode an SVG for use in a CSS `url("data:image/svg+xml,...")` value. */
export function toDataUri(svg) {
  if (typeof svg !== "string" || svg.trim() === "") return "";
  const encoded = svg
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
  return `data:image/svg+xml,${encoded}`;
}
