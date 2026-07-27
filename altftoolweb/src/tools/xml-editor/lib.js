/**
 * XML editor — tokeniser, well-formedness check, pretty printer and minifier.
 *
 * Written as a standalone parser rather than DOMParser so the same code runs in
 * Node and the browser, and so error messages can carry line numbers. It follows
 * XML 1.0 (Fifth Edition) for the constructs it recognises: the declaration,
 * processing instructions, DOCTYPE, comments, CDATA sections and elements.
 */

/** Indent widths offered by the formatter. */
export const INDENT_OPTIONS = [
  { id: "2", label: "2 spaces", value: "  " },
  { id: "4", label: "4 spaces", value: "    " },
  { id: "tab", label: "Tab", value: "\t" },
];

/** Guard so a pasted feed cannot lock the tab up. */
export const MAX_INPUT_CHARS = 500000;

/** XML 1.0 §2.2 — a document must have exactly one root element. */
export const REQUIRED_ROOT_COUNT = 1;

/** An element whose text fits within this many characters stays on one line. */
export const INLINE_TEXT_MAX = 80;

const NAME_START = "A-Za-z_:";
const NAME_CHARS = "A-Za-z0-9_:.-";
const TAG_NAME_PATTERN = new RegExp(`^[${NAME_START}][${NAME_CHARS}]*`);

function lineOf(source, index) {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === "\n") line += 1;
  }
  return line;
}

/** Find the ">" that closes a tag, skipping any inside quoted attribute values. */
function findTagEnd(source, start) {
  let quote = null;
  for (let i = start + 1; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return i;
    }
  }
  return -1;
}

/** Split raw attribute text into name/value pairs. Values keep their original quoting. */
export function parseAttributes(raw) {
  const attributes = [];
  const pattern = new RegExp(`([${NAME_START}][${NAME_CHARS}]*)\\s*=\\s*("[^"]*"|'[^']*')`, "g");
  let match = pattern.exec(raw);
  while (match) {
    attributes.push({ name: match[1], value: match[2].slice(1, -1) });
    match = pattern.exec(raw);
  }
  return attributes;
}

/**
 * Turn XML text into a flat token list.
 * @returns {{tokens:Array}|{error:string, line:number}}
 */
export function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    if (source[index] !== "<") {
      const next = source.indexOf("<", index);
      const end = next === -1 ? source.length : next;
      tokens.push({ type: "text", value: source.slice(index, end), index });
      index = end;
      continue;
    }

    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      if (end === -1) return { error: "Unterminated comment: no matching -->", line: lineOf(source, index) };
      tokens.push({ type: "comment", value: source.slice(index, end + 3), index });
      index = end + 3;
      continue;
    }

    if (source.startsWith("<![CDATA[", index)) {
      const end = source.indexOf("]]>", index + 9);
      if (end === -1) return { error: "Unterminated CDATA section: no matching ]]>", line: lineOf(source, index) };
      tokens.push({ type: "cdata", value: source.slice(index, end + 3), index });
      index = end + 3;
      continue;
    }

    if (source.startsWith("<?", index)) {
      const end = source.indexOf("?>", index + 2);
      if (end === -1) return { error: "Unterminated processing instruction: no matching ?>", line: lineOf(source, index) };
      const value = source.slice(index, end + 2);
      tokens.push({ type: value.startsWith("<?xml") ? "declaration" : "pi", value, index });
      index = end + 2;
      continue;
    }

    if (source.startsWith("<!", index)) {
      // DOCTYPE may carry an internal subset in square brackets that contains ">".
      let depth = 0;
      let end = -1;
      for (let i = index + 2; i < source.length; i += 1) {
        if (source[i] === "[") depth += 1;
        else if (source[i] === "]") depth -= 1;
        else if (source[i] === ">" && depth <= 0) {
          end = i;
          break;
        }
      }
      if (end === -1) return { error: "Unterminated DOCTYPE declaration", line: lineOf(source, index) };
      tokens.push({ type: "doctype", value: source.slice(index, end + 1), index });
      index = end + 1;
      continue;
    }

    const end = findTagEnd(source, index);
    if (end === -1) return { error: "Unterminated tag: no closing >", line: lineOf(source, index) };

    const raw = source.slice(index, end + 1);
    const inner = raw.slice(1, -1).trim();

    if (inner.startsWith("/")) {
      const name = inner.slice(1).trim();
      if (!TAG_NAME_PATTERN.test(name)) {
        return { error: `"${name}" is not a valid element name.`, line: lineOf(source, index) };
      }
      tokens.push({ type: "close", name, index });
    } else {
      const selfClosing = inner.endsWith("/");
      const body = selfClosing ? inner.slice(0, -1).trim() : inner;
      const nameMatch = TAG_NAME_PATTERN.exec(body);
      if (!nameMatch) {
        return { error: `"<${body.slice(0, 20)}" is not a valid element name.`, line: lineOf(source, index) };
      }
      const name = nameMatch[0];
      const attributeText = body.slice(name.length).trim();
      tokens.push({
        type: selfClosing ? "selfClose" : "open",
        name,
        attributes: parseAttributes(attributeText),
        attributeText,
        index,
      });
    }

    index = end + 1;
  }

  return { tokens };
}

/**
 * Build a tree and check well-formedness.
 * @returns {{root:object, prologue:Array, stats:object}|{error:string, line?:number}}
 */
export function parseXml(source = "") {
  if (typeof source !== "string") return { error: "Input must be text." };
  if (source.trim().length === 0) return { error: "Paste some XML to work with." };
  if (source.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${source.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  const tokenised = tokenize(source);
  if (tokenised.error) return tokenised;

  const prologue = [];
  const roots = [];
  const stack = [];
  let elementCount = 0;
  let attributeCount = 0;
  let commentCount = 0;
  let cdataCount = 0;
  let maxDepth = 0;
  const tagCounts = new Map();

  const push = (node) => {
    if (stack.length > 0) stack[stack.length - 1].children.push(node);
    else if (node.type === "text" && node.value.trim() === "") prologue.push(node);
    else if (["declaration", "pi", "doctype", "comment"].includes(node.type)) {
      if (roots.length === 0) prologue.push(node);
      else roots.push(node);
    } else roots.push(node);
  };

  for (const token of tokenised.tokens) {
    switch (token.type) {
      case "open": {
        const node = {
          type: "element",
          name: token.name,
          attributes: token.attributes,
          attributeText: token.attributeText,
          selfClosing: false,
          children: [],
        };
        elementCount += 1;
        attributeCount += token.attributes.length;
        tagCounts.set(token.name, (tagCounts.get(token.name) || 0) + 1);
        push(node);
        stack.push(node);
        maxDepth = Math.max(maxDepth, stack.length);
        break;
      }
      case "selfClose": {
        const node = {
          type: "element",
          name: token.name,
          attributes: token.attributes,
          attributeText: token.attributeText,
          selfClosing: true,
          children: [],
        };
        elementCount += 1;
        attributeCount += token.attributes.length;
        tagCounts.set(token.name, (tagCounts.get(token.name) || 0) + 1);
        maxDepth = Math.max(maxDepth, stack.length + 1);
        push(node);
        break;
      }
      case "close": {
        const open = stack.pop();
        if (!open) {
          return {
            error: `Closing tag </${token.name}> has no matching opening tag.`,
            line: lineOf(source, token.index),
          };
        }
        if (open.name !== token.name) {
          return {
            error: `Expected </${open.name}> but found </${token.name}>.`,
            line: lineOf(source, token.index),
          };
        }
        break;
      }
      case "comment":
        commentCount += 1;
        push({ type: "comment", value: token.value });
        break;
      case "cdata":
        cdataCount += 1;
        push({ type: "cdata", value: token.value });
        break;
      case "text":
        if (stack.length === 0 && token.value.trim() !== "") {
          return {
            error: `Text "${token.value.trim().slice(0, 24)}" is outside the root element.`,
            line: lineOf(source, token.index),
          };
        }
        push({ type: "text", value: token.value });
        break;
      default:
        push({ type: token.type, value: token.value });
        break;
    }
  }

  if (stack.length > 0) {
    return { error: `Element <${stack[stack.length - 1].name}> is never closed.` };
  }

  const rootElements = roots.filter((node) => node.type === "element");
  if (rootElements.length !== REQUIRED_ROOT_COUNT) {
    return {
      error:
        rootElements.length === 0
          ? "No root element found."
          : `Found ${rootElements.length} root elements. An XML document must have exactly one.`,
    };
  }

  return {
    prologue,
    root: rootElements[0],
    roots,
    stats: {
      elementCount,
      attributeCount,
      commentCount,
      cdataCount,
      maxDepth,
      uniqueTags: tagCounts.size,
      tagCounts: [...tagCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      characters: source.length,
    },
  };
}

function openTagText(node) {
  const attributes = node.attributeText ? ` ${node.attributeText}` : "";
  if (node.selfClosing) return `<${node.name}${attributes}/>`;
  return `<${node.name}${attributes}>`;
}

function meaningfulChildren(node) {
  return node.children.filter((child) => !(child.type === "text" && child.value.trim() === ""));
}

function serialize(node, depth, indent, lines) {
  const pad = indent.repeat(depth);

  if (node.type === "text") {
    const text = node.value.trim();
    if (text) lines.push(pad + text);
    return;
  }
  if (node.type === "comment" || node.type === "cdata" || node.type === "declaration" || node.type === "pi" || node.type === "doctype") {
    lines.push(pad + node.value.trim());
    return;
  }

  const children = meaningfulChildren(node);

  if (node.selfClosing || children.length === 0) {
    lines.push(pad + (node.selfClosing ? openTagText(node) : `${openTagText(node)}</${node.name}>`));
    return;
  }

  // A single short text (or CDATA) child stays on the same line as its tags.
  if (children.length === 1 && (children[0].type === "text" || children[0].type === "cdata")) {
    const inner = children[0].type === "text" ? children[0].value.trim() : children[0].value;
    if (inner.length <= INLINE_TEXT_MAX && !inner.includes("\n")) {
      lines.push(`${pad}${openTagText(node)}${inner}</${node.name}>`);
      return;
    }
  }

  lines.push(pad + openTagText(node));
  for (const child of children) serialize(child, depth + 1, indent, lines);
  lines.push(`${pad}</${node.name}>`);
}

/**
 * Pretty-print XML.
 * @param {{xml:string, indent:string}} input
 * @returns {{output:string, stats:object}|{error:string, line?:number}}
 */
export function formatXml({ xml = "", indent = "  " } = {}) {
  const parsed = parseXml(xml);
  if (parsed.error) return parsed;

  const lines = [];
  for (const node of parsed.prologue) {
    if (node.type === "text") continue;
    serialize(node, 0, indent, lines);
  }
  for (const node of parsed.roots) serialize(node, 0, indent, lines);

  const output = lines.join("\n");
  return {
    output,
    stats: { ...parsed.stats, outputCharacters: output.length },
  };
}

function serializeCompact(node, parts, keepComments) {
  if (node.type === "text") {
    // Whitespace-only text between elements is not content; anything else is.
    if (node.value.trim() !== "") parts.push(node.value.trim());
    return;
  }
  if (node.type === "comment") {
    if (keepComments) parts.push(node.value.trim());
    return;
  }
  if (node.type !== "element") {
    parts.push(node.value.trim());
    return;
  }
  if (node.selfClosing) {
    parts.push(openTagText(node));
    return;
  }
  parts.push(openTagText(node));
  for (const child of node.children) serializeCompact(child, parts, keepComments);
  parts.push(`</${node.name}>`);
}

/**
 * Strip formatting whitespace, keeping declarations, comments and real text.
 * @returns {{output:string, stats:object, savedCharacters:number, savedPercent:number}|{error:string}}
 */
export function minifyXml({ xml = "", keepComments = false } = {}) {
  const parsed = parseXml(xml);
  if (parsed.error) return parsed;

  const parts = [];
  for (const node of parsed.prologue) {
    if (node.type === "text") continue;
    if (node.type === "comment" && !keepComments) continue;
    parts.push(node.value.trim());
  }
  for (const node of parsed.roots) serializeCompact(node, parts, keepComments);

  const output = parts.join("");
  const saved = xml.length - output.length;
  return {
    output,
    savedCharacters: saved,
    savedPercent: xml.length > 0 ? Number(((saved / xml.length) * 100).toFixed(1)) : 0,
    stats: { ...parsed.stats, outputCharacters: output.length },
  };
}
