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
  overflow: "visible",
};

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

/** The single-letter path commands of SVG 1.1 §8.3. Note there is no "e" command. */
const PATH_COMMAND_LETTERS = "MmZzLlHhVvCcSsQqTtAa";

const PATH_TOKEN_RE = new RegExp(
  `([${PATH_COMMAND_LETTERS}])|([-+]?(?:\\d*\\.\\d+|\\d+)(?:[eE][-+]?\\d+)?)`,
  "g",
);

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

/** Rewrite a path `d` attribute with rounded numbers and minimal separators. */
export function optimizePathData(d, precision) {
  if (typeof d !== "string" || d.trim() === "") return "";
  let out = "";
  let previousNumber = null;
  let match;
  PATH_TOKEN_RE.lastIndex = 0;
  while ((match = PATH_TOKEN_RE.exec(d)) !== null) {
    if (match[1]) {
      out += match[1];
      previousNumber = null;
    } else {
      const rendered = formatNumber(Number(match[2]), precision);
      if (rendered === null) continue;
      if (needsSeparator(previousNumber, rendered)) out += " ";
      out += rendered;
      previousNumber = rendered;
    }
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
  let m;
  while ((m = urlRe.exec(source)) !== null) ids.add(m[1]);
  while ((m = hrefRe.exec(source)) !== null) ids.add(m[1]);
  while ((m = beginRe.exec(source)) !== null) ids.add(m[1]);
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
        else if (NUMERIC_ATTRIBUTES.includes(name) && BARE_NUMBER_RE.test(value.trim()))
          next = formatNumber(Number(value.trim()), precision) ?? value;
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
