/**
 * XML to JSON Converter — one parser, five documented output conventions.
 *
 * There is no single correct JSON representation of XML, which is why two
 * libraries hand you two different objects for the same file. This converter
 * makes that explicit: parse once, then emit in whichever convention the code
 * on the other side already expects.
 *
 * The conventions implemented, each matching its library's documented default:
 *
 *   fast-xml-parser   attributes prefixed "@_", text under "#text"
 *   xml2js            attributes grouped under "$", text under "_",
 *                     every child wrapped in an array (explicitArray: true)
 *   xml-js compact    attributes under "_attributes", text under "_text"
 *   BadgerFish        attributes prefixed "@", text under "$"
 *                     (BadgerFish convention, Sklar 2007)
 *   Plain             attributes merged in as ordinary keys, no markers
 *
 * Parsing itself implements XML 1.0 (W3C REC-xml-20081126): elements,
 * attributes, CDATA sections, comments, processing instructions, the DOCTYPE
 * declaration and the five predefined entities plus numeric character
 * references. It is a hand-written scanner rather than DOMParser, so this
 * module is pure — no DOM, no React — and runs the same in Node or a worker.
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


/**
 * Output conventions. Each entry is the shape spec its library documents as
 * the default, so the JSON produced here drops into code already written
 * against that library.
 *
 *  attributeMode: "prefix" | "group" | "merge" | "drop"
 *  collapseLeaf : a childless, attribute-free element becomes a bare string
 *  alwaysArray  : every child element is wrapped in an array, even when single
 */
export const PRESETS = {
  fastXmlParser: {
    id: "fastXmlParser",
    label: "fast-xml-parser (default)",
    note: 'Attributes prefixed "@_", text under "#text", repeats become arrays.',
    attributeMode: "prefix",
    attributePrefix: "@_",
    attributeGroupKey: "",
    textKey: "#text",
    collapseLeaf: true,
    alwaysArray: false,
    wrapRoot: true,
  },
  xml2js: {
    id: "xml2js",
    label: "xml2js (explicitArray)",
    note: 'Attributes under "$", text under "_", every child wrapped in an array.',
    attributeMode: "group",
    attributePrefix: "",
    attributeGroupKey: "$",
    textKey: "_",
    collapseLeaf: true,
    alwaysArray: true,
    wrapRoot: true,
  },
  xmlJsCompact: {
    id: "xmlJsCompact",
    label: "xml-js compact",
    note: 'Attributes under "_attributes", text under "_text", never collapsed.',
    attributeMode: "group",
    attributePrefix: "",
    attributeGroupKey: "_attributes",
    textKey: "_text",
    collapseLeaf: false,
    alwaysArray: false,
    wrapRoot: true,
  },
  badgerfish: {
    id: "badgerfish",
    label: "BadgerFish",
    note: 'Attributes prefixed "@", text always under "$".',
    attributeMode: "prefix",
    attributePrefix: "@",
    attributeGroupKey: "",
    textKey: "$",
    collapseLeaf: false,
    alwaysArray: false,
    wrapRoot: true,
  },
  plain: {
    id: "plain",
    label: "Plain (no markers)",
    note: "Attributes merged in as ordinary keys, root unwrapped. Smallest output, and lossy.",
    attributeMode: "merge",
    attributePrefix: "",
    attributeGroupKey: "",
    textKey: "#text",
    collapseLeaf: true,
    alwaysArray: false,
    wrapRoot: false,
  },
};

/** Preset ids in the order they should appear in a picker. */
export const PRESET_IDS = Object.keys(PRESETS);

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
export function coerceValue(raw, { parseNumbers = false, parseBooleans = false } = {}) {
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

/** Parse a comma or space separated list of tag names into a Set. */
export function parseTagList(text) {
  if (typeof text !== "string") return new Set();
  return new Set(
    text
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

/**
 * Resolve a preset id plus per-field overrides into one shape spec.
 *
 * @param {string} presetId
 * @param {object} [overrides]
 * @returns {object|{error:string}}
 */
export function resolveShape(presetId, overrides = {}) {
  const preset = PRESETS[presetId];
  if (!preset) return { error: "Choose one of the listed output conventions." };

  const shape = { ...preset, ...overrides };

  if (!["prefix", "group", "merge", "drop"].includes(shape.attributeMode)) {
    return { error: "Attributes must be prefixed, grouped, merged or dropped." };
  }
  if (shape.attributeMode === "prefix" && !shape.attributePrefix) {
    return { error: "A prefix is required when attributes are prefixed — try @_ or @." };
  }
  if (shape.attributeMode === "group" && !shape.attributeGroupKey) {
    return { error: "A group key is required when attributes are grouped — try $ or _attributes." };
  }
  if (!shape.textKey) {
    return { error: "A text key is required — try #text." };
  }
  return shape;
}

/**
 * Convert one parsed element into its JSON representation under a shape spec.
 *
 * @param {object} node
 * @param {object} shape  a spec from resolveShape
 * @param {{forceArray?:Set<string>, parseNumbers?:boolean, parseBooleans?:boolean}} [options]
 */
export function nodeToJson(node, shape, options = {}) {
  const { forceArray = new Set() } = options;
  const attributeNames = shape.attributeMode === "drop" ? [] : Object.keys(node.attributes);
  const text = cleanText(node);

  if (node.children.length === 0 && attributeNames.length === 0 && shape.collapseLeaf) {
    return text === "" ? "" : coerceValue(text, options);
  }

  const out = {};

  if (attributeNames.length > 0) {
    if (shape.attributeMode === "group") {
      const group = {};
      for (const name of attributeNames) group[name] = coerceValue(node.attributes[name], options);
      out[shape.attributeGroupKey] = group;
    } else {
      for (const name of attributeNames) {
        const key = shape.attributeMode === "prefix" ? `${shape.attributePrefix}${name}` : name;
        out[key] = coerceValue(node.attributes[name], options);
      }
    }
  }

  const repeated = new Set();
  const counts = new Map();
  for (const child of node.children) counts.set(child.name, (counts.get(child.name) || 0) + 1);
  for (const [name, count] of counts) if (count > 1) repeated.add(name);

  for (const child of node.children) {
    const value = nodeToJson(child, shape, options);
    const asArray = shape.alwaysArray || repeated.has(child.name) || forceArray.has(child.name);

    if (Object.prototype.hasOwnProperty.call(out, child.name) && Array.isArray(out[child.name])) {
      out[child.name].push(value);
    } else if (Object.prototype.hasOwnProperty.call(out, child.name)) {
      out[child.name] = [out[child.name], value];
    } else {
      out[child.name] = asArray ? [value] : value;
    }
  }

  if (text !== "" || (node.children.length === 0 && !shape.collapseLeaf)) {
    out[shape.textKey] = coerceValue(text, options);
  }

  return out;
}

/**
 * Attribute names that collide with a sibling element name somewhere in the
 * document. Only "merge" mode can lose data this way, so the UI can warn.
 *
 * @returns {string[]} sorted, de-duplicated "element/@attribute" labels
 */
export function findMergeCollisions(root) {
  const hits = new Set();
  const walk = (node) => {
    const childNames = new Set(node.children.map((child) => child.name));
    for (const name of Object.keys(node.attributes)) {
      if (childNames.has(name)) hits.add(`${node.name}/@${name}`);
    }
    for (const child of node.children) walk(child);
  };
  walk(root);
  return Array.from(hits).sort();
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
 * Full conversion.
 *
 * @param {string} xml
 * @param {{preset?:string, overrides?:object, indent?:number, forceArrayTags?:string, parseNumbers?:boolean, parseBooleans?:boolean}} [options]
 * @returns {{data:object, json:string, rootName:string, presetLabel:string, elements:number, attributes:number, depth:number, bytes:number, collisions:string[]}|{error:string}}
 */
export function convertXmlToJson(xml, options = {}) {
  const {
    preset = "fastXmlParser",
    overrides = {},
    indent = 2,
    forceArrayTags = "",
    parseNumbers = false,
    parseBooleans = false,
  } = options;

  const shape = resolveShape(preset, overrides);
  if (shape.error) return { error: shape.error };

  if (!INDENT_OPTIONS.includes(indent)) return { error: "Indent must be 0, 2 or 4 spaces." };

  const parsed = parseXml(xml);
  if (parsed.error) return { error: parsed.error };

  const forceArray = parseTagList(forceArrayTags);
  const converted = nodeToJson(parsed.root, shape, { forceArray, parseNumbers, parseBooleans });
  const data = shape.wrapRoot ? { [parsed.root.name]: converted } : converted;

  let json;
  try {
    json = JSON.stringify(data, null, indent);
  } catch {
    return { error: "That document could not be serialised to JSON." };
  }
  if (typeof json !== "string") return { error: "That document produced an empty JSON result." };

  const stats = describeTree(parsed.root);
  return {
    data,
    json,
    shape,
    rootName: parsed.root.name,
    presetLabel: PRESETS[preset].label,
    elements: stats.elements,
    attributes: stats.attributes,
    depth: stats.depth,
    bytes: json.length,
    collisions: shape.attributeMode === "merge" ? findMergeCollisions(parsed.root) : [],
  };
}

/** A small, valid document used as the starting sample. */
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<order id="SO-4471" status="dispatched">
  <customer code="0092">
    <name>Priya Menon</name>
    <city>Pune</city>
  </customer>
  <line sku="TS-100" qty="2">Cotton T-shirt</line>
  <line sku="MG-014" qty="1">Enamel mug</line>
  <total currency="INR">1849</total>
  <note>Leave with the security desk</note>
</order>`;
