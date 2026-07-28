/**
 * XML to CSV — pure parser and table builder.
 *
 * Two independent standards are implemented here:
 *
 *  1. XML 1.0 (W3C REC-xml-20081126) parsing — elements, attributes, CDATA
 *     sections, comments, processing instructions, the DOCTYPE declaration and
 *     the five predefined entities plus numeric character references. This is a
 *     hand-written scanner rather than DOMParser so the module stays pure: no
 *     DOM, no React, works identically in a worker or in Node.
 *
 *  2. CSV output per RFC 4180 — comma-separated by default, a field is quoted
 *     with double quotes when it contains the delimiter, a double quote, CR or
 *     LF, and an embedded double quote is escaped by doubling it.
 *
 * The interesting part in between is the record detection: a CSV needs rows,
 * and XML has no notion of one. The rule used is "the deepest ancestor whose
 * element children repeat under the same name" — for a document like
 * <catalog><book/><book/></catalog> that finds <book>, which is what every
 * person converting XML to a spreadsheet actually means.
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

/** Delimiters offered for the output file. */
export const DELIMITERS = {
  comma: { label: "Comma (,) — standard CSV", value: "," },
  semicolon: { label: "Semicolon (;) — European Excel", value: ";" },
  tab: { label: "Tab — TSV", value: "\t" },
  pipe: { label: "Pipe (|)", value: "|" },
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
 * Find the repeating element that should become one CSV row.
 *
 * Walks down while a node has exactly one element child, then returns the
 * children of the first node whose element children share a repeated name.
 * Falls back to the root's element children, and finally to the root itself.
 *
 * @param {object} root
 * @returns {{records:Array, recordName:string, containerName:string}}
 */
export function detectRecords(root) {
  let node = root;
  const guard = new Set();

  for (;;) {
    if (guard.has(node)) break;
    guard.add(node);

    const kids = node.children;
    if (kids.length === 0) break;

    const counts = new Map();
    for (const kid of kids) counts.set(kid.name, (counts.get(kid.name) || 0) + 1);

    let repeatedName = null;
    let best = 1;
    for (const [name, count] of counts) {
      if (count > best) {
        best = count;
        repeatedName = name;
      }
    }

    if (repeatedName) {
      return {
        records: kids.filter((kid) => kid.name === repeatedName),
        recordName: repeatedName,
        containerName: node.name,
      };
    }

    if (kids.length === 1) {
      node = kids[0];
      continue;
    }
    break;
  }

  if (root.children.length > 0) {
    return { records: root.children, recordName: root.children[0].name, containerName: root.name };
  }
  return { records: [root], recordName: root.name, containerName: root.name };
}

/**
 * Flatten one record element into a flat path -> value map.
 * Repeated siblings are numbered from 1, e.g. `tag[1]`, `tag[2]`.
 *
 * @param {object} node
 * @param {{includeAttributes?:boolean}} [options]
 * @returns {Record<string,string>}
 */
export function flattenNode(node, options = {}) {
  const { includeAttributes = true } = options;
  const out = {};

  const visit = (current, prefix) => {
    if (includeAttributes) {
      for (const [key, value] of Object.entries(current.attributes)) {
        out[`${prefix}${ATTRIBUTE_MARKER}${key}`] = value;
      }
    }

    const seen = new Map();
    for (const kid of current.children) {
      const ordinal = (seen.get(kid.name) || 0) + 1;
      seen.set(kid.name, ordinal);
      const label = childLabel(kid.name, ordinal);
      const path = prefix ? `${prefix}${PATH_SEPARATOR}${label}` : label;
      visit(kid, path);
    }

    const text = nodeText(current);
    if (text !== "" || current.children.length === 0) {
      if (prefix) out[prefix] = text;
    }
  };

  for (const [key, value] of Object.entries(node.attributes)) {
    if (includeAttributes) out[`${ATTRIBUTE_MARKER}${key}`] = value;
  }

  const seen = new Map();
  for (const kid of node.children) {
    const ordinal = (seen.get(kid.name) || 0) + 1;
    seen.set(kid.name, ordinal);
    visit(kid, childLabel(kid.name, ordinal));
  }

  if (node.children.length === 0) {
    const text = nodeText(node);
    if (text !== "") out.value = text;
  }

  return out;
}

/**
 * Build the full table: union of every record's keys becomes the header, in
 * first-seen order so the column order follows the document.
 *
 * @param {string} xml
 * @param {{includeAttributes?:boolean}} [options]
 * @returns {{columns:string[], rows:string[][], recordName:string, recordCount:number, elementCount:number}|{error:string}}
 */
export function xmlToTable(xml, options = {}) {
  const parsed = parseXml(xml);
  if (parsed.error) return { error: parsed.error };

  const { records, recordName } = detectRecords(parsed.root);
  if (!records || records.length === 0) {
    return { error: "No repeating elements were found, so there are no rows to build." };
  }

  const maps = records.map((record) => flattenNode(record, options));

  const columns = [];
  const seen = new Set();
  for (const map of maps) {
    for (const key of Object.keys(map)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  if (columns.length === 0) {
    return { error: `Every <${recordName}> element is empty, so there is nothing to put in columns.` };
  }
  if (columns.length > MAX_COLUMNS) {
    return { error: `This document would produce ${columns.length} columns, above the ${MAX_COLUMNS} limit.` };
  }

  const rows = maps.map((map) => columns.map((column) => (map[column] === undefined ? "" : map[column])));

  return {
    columns,
    rows,
    recordName,
    recordCount: rows.length,
    elementCount: parsed.elementCount,
  };
}

/** Quote one field per RFC 4180. */
export function escapeCsvField(value, delimiter) {
  const text = value === null || value === undefined ? "" : String(value);
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r");
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Serialise a table to CSV text.
 *
 * @param {{columns:string[], rows:string[][]}} table
 * @param {{delimiter?:string, includeHeader?:boolean, lineEnding?:string}} [options]
 * @returns {{csv:string, lineCount:number}|{error:string}}
 */
export function tableToCsv(table, options = {}) {
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
    return { error: "There is no table to convert yet." };
  }
  const { delimiter = ",", includeHeader = true, lineEnding = "\n" } = options;
  if (typeof delimiter !== "string" || delimiter.length === 0) {
    return { error: "Choose a column delimiter." };
  }

  const lines = [];
  if (includeHeader) {
    lines.push(table.columns.map((column) => escapeCsvField(column, delimiter)).join(delimiter));
  }
  for (const row of table.rows) {
    lines.push(row.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter));
  }

  return { csv: lines.join(lineEnding), lineCount: lines.length };
}

/**
 * One-shot convenience: XML text in, CSV text out.
 *
 * @returns {{csv:string, columns:string[], rows:string[][], recordName:string, recordCount:number, lineCount:number}|{error:string}}
 */
export function xmlToCsv(xml, options = {}) {
  const table = xmlToTable(xml, options);
  if (table.error) return { error: table.error };
  const csv = tableToCsv(table, options);
  if (csv.error) return { error: csv.error };
  return { ...table, csv: csv.csv, lineCount: csv.lineCount };
}

/** A small, valid document used as the starting sample. */
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101" format="paperback">
    <title>XML Developer's Guide</title>
    <author>Gambardella, Matthew</author>
    <price currency="INR">1499</price>
    <published>2000-10-01</published>
  </book>
  <book id="bk102" format="hardback">
    <title>Midnight Rain</title>
    <author>Ralls, Kim</author>
    <price currency="INR">899</price>
    <published>2000-12-16</published>
  </book>
  <book id="bk103" format="ebook">
    <title><![CDATA[Maeve <Ascendant>]]></title>
    <author>Corets, Eva</author>
    <price currency="INR">449</price>
    <published>2000-11-17</published>
  </book>
</catalog>`;
