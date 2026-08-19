/**
 * XML to Excel — pure parser, table builder and Excel cell typing.
 *
 * Parsing implements XML 1.0 (W3C REC-xml-20081126): elements, attributes,
 * CDATA sections, comments, processing instructions, the DOCTYPE declaration
 * and the five predefined entities plus numeric character references. It is a
 * hand-written scanner rather than DOMParser so the module stays pure — no DOM,
 * no React — and runs identically in a worker or in Node.
 *
 * The Excel-specific work is here too, and it is the part that matters:
 *
 *  - Cell typing. A spreadsheet cell is a number, a boolean or a string, and
 *    getting that wrong is what makes a converted sheet useless. Values are
 *    only typed as numbers when the whole trimmed string is a valid number AND
 *    it has no leading zero (so postcodes, phone numbers and account numbers
 *    such as 007 or 0221 stay text instead of silently losing their zeros).
 *
 *  - Workbook limits from the Office Open XML SpreadsheetML format (ECMA-376):
 *    1,048,576 rows and 16,384 columns per worksheet, and worksheet names of at
 *    most 31 characters that may not contain : \\ / ? * [ ].
 *
 * Pure module: no React, no DOM, no clock reads. The UI layer supplies the
 * SheetJS writer; everything decided here is plain data.
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
      // A tie means some other sibling name repeated exactly as many times as
      // the one we picked (first-encountered wins) — its elements are left
      // out of the rows entirely, so surface that instead of losing data silently.
      const tiedNames = [...counts.entries()]
        .filter(([name, count]) => name !== repeatedName && count === best)
        .map(([name]) => name);
      const warning =
        tiedNames.length > 0
          ? `<${tiedNames.join(">, <")}> repeated ${best} times too, the same as <${repeatedName}> — only <${repeatedName}> elements became rows, so the <${tiedNames.join(">, <")}> elements under <${node.name}> were left out.`
          : undefined;
      return {
        records: kids.filter((kid) => kid.name === repeatedName),
        recordName: repeatedName,
        containerName: node.name,
        ...(warning ? { warning } : {}),
      };
    }

    if (kids.length === 1) {
      node = kids[0];
      continue;
    }
    break;
  }

  // No element name repeats anywhere in the chain, so there is no natural
  // "row" — the node we drilled down to (or the root, if we never drilled)
  // is a single logical record. Treat its own attributes/children as the
  // FIELDS of that one record instead of turning each child into its own row.
  return { records: [node], recordName: node.name, containerName: node.name };
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

  const { records, recordName, warning } = detectRecords(parsed.root);
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
    ...(warning ? { warning } : {}),
  };
}


/** Worksheet limits from ECMA-376 (Office Open XML SpreadsheetML). */
export const EXCEL_MAX_ROWS = 1048576;
export const EXCEL_MAX_COLUMNS = 16384;
export const EXCEL_MAX_SHEET_NAME = 31;

/** Characters Excel forbids in a worksheet name. */
const FORBIDDEN_SHEET_CHARS = /[:\\/?*[\]]/g;

/** A value is only treated as a number when the entire trimmed string parses
 * and it carries no significant leading zero — otherwise identifiers such as
 * 007, 0221 or 00912345 would be written as 7, 221 and 912345. */
const NUMERIC_PATTERN = /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/** Strings Excel users expect to become TRUE/FALSE cells. */
const TRUE_WORDS = new Set(["true", "yes"]);
const FALSE_WORDS = new Set(["false", "no"]);

/**
 * Decide the Excel cell type for one flattened XML value.
 *
 * @param {string} raw
 * @param {{detectNumbers?:boolean, detectBooleans?:boolean}} [options]
 * @returns {{type:"n"|"b"|"s", value:number|boolean|string}}
 */
export function coerceCell(raw, options = {}) {
  const { detectNumbers = true, detectBooleans = true } = options;
  const text = raw === null || raw === undefined ? "" : String(raw);
  const trimmed = text.trim();

  if (trimmed === "") return { type: "s", value: "" };

  if (detectBooleans) {
    const lower = trimmed.toLowerCase();
    if (TRUE_WORDS.has(lower)) return { type: "b", value: true };
    if (FALSE_WORDS.has(lower)) return { type: "b", value: false };
  }

  if (detectNumbers && NUMERIC_PATTERN.test(trimmed)) {
    const value = Number(trimmed);
    // Above 2^53 a JS number can no longer represent every integer exactly, so
    // long ids stay as text rather than being silently rounded.
    if (Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER) {
      return { type: "n", value };
    }
  }

  return { type: "s", value: text };
}

/**
 * Make a worksheet name Excel will accept: forbidden characters replaced,
 * trimmed to 31 characters, never empty.
 */
export function sanitiseSheetName(name) {
  const cleaned = String(name === null || name === undefined ? "" : name)
    .replace(FORBIDDEN_SHEET_CHARS, "-")
    .replace(/^'+|'+$/g, "")
    .trim();
  if (cleaned === "") return "Sheet1";
  return cleaned.slice(0, EXCEL_MAX_SHEET_NAME);
}

/**
 * Suggest a sensible column width in characters: the longest value in the
 * column, clamped between 8 and 60 so one long description does not push every
 * other column off the screen.
 */
export const MIN_COLUMN_WIDTH = 8;
export const MAX_COLUMN_WIDTH = 60;

export function columnWidths(columns, rows) {
  if (!Array.isArray(columns)) return [];
  return columns.map((column, index) => {
    let longest = String(column).length;
    for (const row of rows) {
      const cell = row[index];
      const length = cell === undefined || cell === null ? 0 : String(cell).length;
      if (length > longest) longest = length;
    }
    return { wch: Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, longest + 2)) };
  });
}

/**
 * Build everything the spreadsheet writer needs from an XML document.
 *
 * @param {string} xml
 * @param {{includeAttributes?:boolean, includeHeader?:boolean, detectNumbers?:boolean, detectBooleans?:boolean, sheetName?:string}} [options]
 * @returns {{sheetName:string, columns:string[], rows:Array, aoa:Array, widths:Array, recordName:string, recordCount:number, elementCount:number, numberCells:number, booleanCells:number, textCells:number}|{error:string}}
 */
export function xmlToWorkbookData(xml, options = {}) {
  const table = xmlToTable(xml, options);
  if (table.error) return { error: table.error };

  const { includeHeader = true, sheetName } = options;

  const dataRowCount = table.rows.length + (includeHeader ? 1 : 0);
  if (dataRowCount > EXCEL_MAX_ROWS) {
    return {
      error: `That document produces ${dataRowCount.toLocaleString("en-IN")} rows, above the Excel limit of ${EXCEL_MAX_ROWS.toLocaleString("en-IN")}.`,
    };
  }
  if (table.columns.length > EXCEL_MAX_COLUMNS) {
    return {
      error: `That document produces ${table.columns.length.toLocaleString("en-IN")} columns, above the Excel limit of ${EXCEL_MAX_COLUMNS.toLocaleString("en-IN")}.`,
    };
  }

  let numberCells = 0;
  let booleanCells = 0;
  let textCells = 0;

  const body = table.rows.map((row) =>
    row.map((cell) => {
      const typed = coerceCell(cell, options);
      if (typed.type === "n") numberCells += 1;
      else if (typed.type === "b") booleanCells += 1;
      else textCells += 1;
      return typed.value;
    }),
  );

  const aoa = includeHeader ? [table.columns.slice(), ...body] : body;

  return {
    ...table,
    sheetName: sanitiseSheetName(sheetName || table.recordName),
    aoa,
    widths: columnWidths(table.columns, table.rows),
    numberCells,
    booleanCells,
    textCells,
  };
}

/** A small, valid document used as the starting sample. */
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<invoices>
  <invoice number="INV-0001" paid="true">
    <client>Sharma Textiles</client>
    <city>Surat</city>
    <amount>124500</amount>
    <gstin>24AAACS1234F1Z5</gstin>
    <issued>2026-04-11</issued>
  </invoice>
  <invoice number="INV-0002" paid="false">
    <client>Nair &amp; Co.</client>
    <city>Kochi</city>
    <amount>38990.50</amount>
    <gstin>32AABCN5678K1Z2</gstin>
    <issued>2026-05-02</issued>
  </invoice>
  <invoice number="INV-0003" paid="true">
    <client><![CDATA[Verma <Exports>]]></client>
    <city>Ludhiana</city>
    <amount>907000</amount>
    <gstin>03AACCV9012M1Z8</gstin>
    <issued>2026-05-19</issued>
  </invoice>
</invoices>`;
