/**
 * XML to JSON — pure parser and object builder.
 *
 * Parsing implements XML 1.0 (W3C REC-xml-20081126): elements, attributes,
 * CDATA sections, comments, processing instructions, the DOCTYPE declaration
 * and the five predefined entities plus numeric character references. It is a
 * hand-written scanner rather than DOMParser, so the module is pure — no DOM,
 * no React — and behaves identically in a browser, a worker or Node.
 *
 * XML and JSON do not map onto each other cleanly, so the conversion follows
 * the conventions every mainstream XML-to-JSON library shares:
 *
 *   - attributes are prefixed (default "@_", as in fast-xml-parser) so they
 *     cannot collide with a child element of the same name;
 *   - mixed text alongside child elements is stored under a text key
 *     (default "#text");
 *   - an element that repeats under one parent becomes a JSON array, and a
 *     leaf element with no attributes collapses to its plain string value.
 *
 * Number and boolean coercion is optional and deliberately conservative: a
 * value only becomes a number when the whole string parses AND it has no
 * significant leading zero, so 007 and 0221 survive as strings.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** The five entities XML 1.0 predefines (spec section 4.6). */
export const PREDEFINED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** Prefix used for attribute-derived columns, e.g. `book@id`. */
export const ATTRIBUTE_MARKER = "@";

/** Separator between nested element names in a column header, e.g. `author.name`. */
export const PATH_SEPARATOR = ".";

/** Hard ceiling on input size. 8 MB of XML already yields tens of thousands of
 * rows; beyond that a browser tab converting synchronously stops feeling live. */
export const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/** Ceiling on generated columns, to stop a pathological document producing a
 * spreadsheet too wide for any tool to open. */
export const MAX_COLUMNS = 512;

const NAME_START = /[A-Za-z_:]/;
const NAME_CHAR = /[A-Za-z0-9_:.\-]/;

/**
 * Decode XML character data: the five predefined entities plus numeric
 * references (&#65; decimal and &#x41; hex). Unknown entities are left as
 * written, which is what a non-validating parser is allowed to do.
 */
export function decodeEntities(text) {
  if (typeof text !== "string" || text.indexOf("&") === -1) return text || "";
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, (match, body) => {
    if (body[0] === "#") {
      const codePoint =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }
    return Object.prototype.hasOwnProperty.call(PREDEFINED_ENTITIES, body)
      ? PREDEFINED_ENTITIES[body]
      : match;
  });
}

function makeNode(name) {
  return { name, attributes: {}, children: [], text: "" };
}

/**
 * Parse an XML document into a tree.
 *
 * @param {string} source
 * @returns {{root:object, declaration:object|null, elementCount:number}|{error:string}}
 */
export function parseXml(source) {
  if (typeof source !== "string") return { error: "Paste or upload some XML first." };
  const xml = source.trim();
  if (xml === "") return { error: "Paste or upload some XML first." };
  if (xml.length > MAX_INPUT_BYTES) {
    return { error: `That document is larger than the ${Math.round(MAX_INPUT_BYTES / 1024 / 1024)} MB limit.` };
  }
  if (xml[0] !== "<") return { error: "This does not look like XML — it must start with a tag." };

  let index = 0;
  let elementCount = 0;
  let declaration = null;
  let root = null;
  const stack = [];

  const fail = (message) => ({ error: `${message} (character ${index + 1})` });

  const readName = () => {
    if (index >= xml.length || !NAME_START.test(xml[index])) return null;
    let start = index;
    index += 1;
    while (index < xml.length && NAME_CHAR.test(xml[index])) index += 1;
    return xml.slice(start, index);
  };

  const skipSpace = () => {
    while (index < xml.length && /\s/.test(xml[index])) index += 1;
  };

  const readAttributes = () => {
    const attributes = {};
    for (;;) {
      skipSpace();
      if (index >= xml.length) return { error: "The document ends inside a tag." };
      const ch = xml[index];
      if (ch === ">" || ch === "/" || ch === "?") return { attributes };
      const name = readName();
      if (!name) return { error: `Unexpected character "${ch}" inside a tag.` };
      skipSpace();
      if (xml[index] !== "=") return { error: `Attribute "${name}" has no value.` };
      index += 1;
      skipSpace();
      const quote = xml[index];
      if (quote !== '"' && quote !== "'") return { error: `Attribute "${name}" must be quoted.` };
      index += 1;
      const end = xml.indexOf(quote, index);
      if (end === -1) return { error: `Attribute "${name}" is missing its closing quote.` };
      attributes[name] = decodeEntities(xml.slice(index, end));
      index = end + 1;
    }
  };

  while (index < xml.length) {
    const lt = xml.indexOf("<", index);

    if (lt === -1) {
      // Trailing text after the last tag.
      const tail = xml.slice(index);
      if (stack.length > 0) stack[stack.length - 1].text += decodeEntities(tail);
      else if (tail.trim() !== "") return fail("Text found outside the root element");
      break;
    }

    if (lt > index) {
      const chunk = xml.slice(index, lt);
      if (stack.length > 0) stack[stack.length - 1].text += decodeEntities(chunk);
      else if (chunk.trim() !== "") return fail("Text found outside the root element");
      index = lt;
    }

    // <!-- comment -->
    if (xml.startsWith("<!--", index)) {
      const end = xml.indexOf("-->", index + 4);
      if (end === -1) return fail("A comment is never closed");
      index = end + 3;
      continue;
    }

    // <![CDATA[ ... ]]>
    if (xml.startsWith("<![CDATA[", index)) {
      const end = xml.indexOf("]]>", index + 9);
      if (end === -1) return fail("A CDATA section is never closed");
      if (stack.length > 0) stack[stack.length - 1].text += xml.slice(index + 9, end);
      index = end + 3;
      continue;
    }

    // <!DOCTYPE ...> — may carry an internal subset in square brackets.
    if (xml.startsWith("<!", index)) {
      const bracket = xml.indexOf("[", index);
      const close = xml.indexOf(">", index);
      if (close === -1) return fail("A declaration is never closed");
      if (bracket !== -1 && bracket < close) {
        const subsetEnd = xml.indexOf("]", bracket);
        if (subsetEnd === -1) return fail("A DOCTYPE internal subset is never closed");
        const afterSubset = xml.indexOf(">", subsetEnd);
        if (afterSubset === -1) return fail("A DOCTYPE declaration is never closed");
        index = afterSubset + 1;
      } else {
        index = close + 1;
      }
      continue;
    }

    // <?xml ... ?> and other processing instructions.
    if (xml.startsWith("<?", index)) {
      const isXmlDecl = xml.startsWith("<?xml", index);
      const end = xml.indexOf("?>", index + 2);
      if (end === -1) return fail("A processing instruction is never closed");
      if (isXmlDecl) {
        const save = index;
        index += 5;
        const read = readAttributes();
        declaration = read.error ? null : read.attributes;
        index = save;
      }
      index = end + 2;
      continue;
    }

    // </name>
    if (xml.startsWith("</", index)) {
      index += 2;
      const name = readName();
      if (!name) return fail("A closing tag has no name");
      skipSpace();
      if (xml[index] !== ">") return fail(`The closing tag </${name}> is malformed`);
      index += 1;
      const open = stack.pop();
      if (!open) return fail(`Found </${name}> with no matching opening tag`);
      if (open.name !== name) return fail(`Expected </${open.name}> but found </${name}>`);
      continue;
    }

    // <name ...> or <name ... />
    index += 1;
    const name = readName();
    if (!name) return fail("A tag has no name");
    const read = readAttributes();
    if (read.error) return fail(read.error);

    const node = makeNode(name);
    node.attributes = read.attributes;
    elementCount += 1;
    if (elementCount === 1) root = node;
    else if (stack.length === 0) return fail("An XML document may have only one root element");

    if (stack.length > 0) stack[stack.length - 1].children.push(node);

    if (xml[index] === "/") {
      index += 1;
      if (xml[index] !== ">") return fail(`The self-closing tag <${name}/> is malformed`);
      index += 1;
    } else if (xml[index] === ">") {
      index += 1;
      stack.push(node);
    } else {
      return fail(`The tag <${name}> is never closed`);
    }
  }

  if (stack.length > 0) return { error: `The tag <${stack[stack.length - 1].name}> is never closed.` };
  if (!root) return { error: "No XML element was found in that text." };
  return { root, declaration, elementCount };
}

/** Direct text of a node with XML indentation removed.
 * Runs of spaces and tabs collapse to one space and the whitespace around a
 * line break is dropped, but real line breaks inside a text block survive —
 * they are then quoted correctly by the RFC 4180 writer. */
function nodeText(node) {
  return (node.text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\r?\n[ \t]*/g, "\n")
    .trim();
}

/** Column label for the nth child called `name`.
 * The first occurrence keeps the bare name and later ones are numbered from 2,
 * so a record with one <tag> and a record with three <tag>s still share the
 * same first column instead of splitting into `tag` and `tag[1]`. */
function childLabel(name, ordinal) {
  return ordinal <= 1 ? name : `${name}[${ordinal}]`;
}


/** Default JSON shape settings, matching the fast-xml-parser defaults that
 * most Node and browser codebases already produce. */
export const DEFAULT_ATTRIBUTE_PREFIX = "@_";
export const DEFAULT_TEXT_KEY = "#text";

/** Indent widths offered for the pretty-printed output. */
export const INDENT_OPTIONS = [0, 2, 4];

/** A value becomes a number only if the whole trimmed string parses and has no
 * significant leading zero, so identifiers such as 007 stay strings. */
const NUMERIC_PATTERN = /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/** Direct text of a node with XML indentation removed but real line breaks kept. */
function cleanText(node) {
  return (node.text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\r?\n[ \t]*/g, "\n")
    .trim();
}

/**
 * Optionally coerce a text value to a number or boolean.
 * @returns {string|number|boolean}
 */
export function coerceValue(raw, { parseNumbers = true, parseBooleans = true } = {}) {
  const text = raw === null || raw === undefined ? "" : String(raw);
  const trimmed = text.trim();
  if (trimmed === "") return text;

  if (parseBooleans) {
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
  }
  if (parseNumbers && NUMERIC_PATTERN.test(trimmed)) {
    const value = Number(trimmed);
    if (Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER) return value;
  }
  return text;
}

/**
 * Convert one parsed element into its JSON representation.
 *
 * @param {object} node
 * @param {{attributePrefix?:string, textKey?:string, parseNumbers?:boolean, parseBooleans?:boolean, keepAttributes?:boolean}} [options]
 * @returns {object|string|number|boolean}
 */
export function nodeToJson(node, options = {}) {
  const {
    attributePrefix = DEFAULT_ATTRIBUTE_PREFIX,
    textKey = DEFAULT_TEXT_KEY,
    keepAttributes = true,
  } = options;

  const attributeKeys = keepAttributes ? Object.keys(node.attributes) : [];
  const text = cleanText(node);

  // Leaf with no attributes -> plain scalar, which is what makes the output
  // readable instead of a forest of { "#text": … } wrappers.
  if (node.children.length === 0 && attributeKeys.length === 0) {
    return text === "" ? "" : coerceValue(text, options);
  }

  const out = {};
  for (const key of attributeKeys) {
    out[`${attributePrefix}${key}`] = coerceValue(node.attributes[key], options);
  }

  for (const child of node.children) {
    const value = nodeToJson(child, options);
    if (Object.prototype.hasOwnProperty.call(out, child.name)) {
      if (Array.isArray(out[child.name])) out[child.name].push(value);
      else out[child.name] = [out[child.name], value];
    } else {
      out[child.name] = value;
    }
  }

  if (text !== "") out[textKey] = coerceValue(text, options);
  return out;
}

/** Count elements, attributes and the deepest nesting level of a tree. */
export function describeTree(root) {
  let elements = 0;
  let attributes = 0;
  let depth = 0;

  const walk = (node, level) => {
    elements += 1;
    attributes += Object.keys(node.attributes).length;
    if (level > depth) depth = level;
    for (const child of node.children) walk(child, level + 1);
  };

  walk(root, 1);
  return { elements, attributes, depth };
}

/**
 * Full conversion: XML text in, JSON object and pretty-printed string out.
 *
 * @param {string} xml
 * @param {{indent?:number, wrapRoot?:boolean, attributePrefix?:string, textKey?:string, parseNumbers?:boolean, parseBooleans?:boolean, keepAttributes?:boolean}} [options]
 * @returns {{data:object, json:string, rootName:string, elements:number, attributes:number, depth:number, bytes:number}|{error:string}}
 */
export function xmlToJson(xml, options = {}) {
  const parsed = parseXml(xml);
  if (parsed.error) return { error: parsed.error };

  const { indent = 2, wrapRoot = true } = options;
  if (!INDENT_OPTIONS.includes(indent)) {
    return { error: "Indent must be 0, 2 or 4 spaces." };
  }

  const converted = nodeToJson(parsed.root, options);
  const data = wrapRoot ? { [parsed.root.name]: converted } : converted;

  let json;
  try {
    json = JSON.stringify(data, null, indent);
  } catch {
    return { error: "That document could not be serialised to JSON." };
  }
  if (typeof json !== "string") {
    return { error: "That document produced an empty JSON result." };
  }

  const stats = describeTree(parsed.root);
  return {
    data,
    json,
    rootName: parsed.root.name,
    declaration: parsed.declaration,
    elements: stats.elements,
    attributes: stats.attributes,
    depth: stats.depth,
    bytes: json.length,
  };
}

/** A small, valid document used as the starting sample. */
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<library branch="Bandra" open="true">
  <!-- three items on loan -->
  <book isbn="9788172234980">
    <title>The Guide</title>
    <author>R. K. Narayan</author>
    <year>1958</year>
    <copies>4</copies>
  </book>
  <book isbn="9780143416319">
    <title><![CDATA[Train to Pakistan <abridged>]]></title>
    <author>Khushwant Singh</author>
    <year>1956</year>
    <copies>2</copies>
  </book>
  <membership code="0071">
    <plan>Annual</plan>
    <fee currency="INR">750</fee>
  </membership>
</library>`;
