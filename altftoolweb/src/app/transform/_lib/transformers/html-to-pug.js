import { NodeType, parse } from "node-html-parser";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "fragment", label: "Fragment (no html/body wrapper)", type: "boolean", default: true },
  { key: "tabs", label: "Indent with tabs", type: "boolean", default: false },
];

export const sample = `<section class="hero">
  <h1 id="title">Hello world</h1>
  <p>Convert <a href="https://example.com">HTML</a> into <b>Pug</b>.</p>
  <ul>
    <li>First</li>
    <li>Second</li>
  </ul>
</section>`;

const SELF_CLOSING = new Set([
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

function stringifyAttrValue(value) {
  return JSON.stringify(String(value ?? ""));
}

function attrsToPug(attributes = {}) {
  const entries = Object.entries(attributes).filter(([name]) => name && !name.startsWith("_"));
  if (entries.length === 0) return "";

  return `(${entries
    .map(([name, value]) => {
      if (value === "" || value === true || value === name) return name;
      return `${name}=${stringifyAttrValue(value)}`;
    })
    .join(", ")})`;
}

function indentUnit(useTabs) {
  return useTabs ? "\t" : "  ";
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function multilineTextLines(text, level, unit) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `${unit.repeat(level)}| ${line}`);
}

function renderTextNode(node, level, unit) {
  const text = normalizeText(node.rawText || node.text);
  return text ? [`${unit.repeat(level)}| ${text}`] : [];
}

function renderCommentNode(node, level, unit) {
  const text = normalizeText(node.rawText || node.text);
  return text ? [`${unit.repeat(level)}// ${text}`] : [`${unit.repeat(level)}//`];
}

function renderElementNode(node, level, unit) {
  const tag = String(node.rawTagName || node.tagName || "").toLowerCase();
  if (!tag) return [];

  if (tag === "!doctype") {
    const value = normalizeText(node.rawText || "html");
    return [`${unit.repeat(level)}doctype ${value || "html"}`];
  }

  const childNodes = Array.from(node.childNodes || []);
  const attrs = attrsToPug(node.attributes);
  const elementPrefix = `${unit.repeat(level)}${tag}${attrs}`;

  if (SELF_CLOSING.has(tag) || childNodes.length === 0) return [elementPrefix];

  if ((tag === "script" || tag === "style") && node.rawText?.trim()) {
    return [elementPrefix + ".", ...multilineTextLines(node.rawText, level + 1, unit).map((line) => line.replace("| ", ""))];
  }

  const visibleTextChildren = childNodes.filter(
    (child) => child.nodeType === NodeType.TEXT_NODE && normalizeText(child.rawText || child.text),
  );
  const structuralChildren = childNodes.filter((child) => child.nodeType !== NodeType.TEXT_NODE);
  if (visibleTextChildren.length === 1 && structuralChildren.length === 0) {
    return [`${elementPrefix} ${normalizeText(visibleTextChildren[0].rawText || visibleTextChildren[0].text)}`];
  }

  const childLines = childNodes.flatMap((child) => renderNode(child, level + 1, unit));
  return childLines.length > 0 ? [elementPrefix, ...childLines] : [elementPrefix];
}

function renderNode(node, level, unit) {
  if (node.nodeType === NodeType.TEXT_NODE) return renderTextNode(node, level, unit);
  if (node.nodeType === NodeType.COMMENT_NODE) return renderCommentNode(node, level, unit);
  if (node.nodeType === NodeType.ELEMENT_NODE) return renderElementNode(node, level, unit);
  return [];
}

function convertHtmlToPug(input, opts = {}) {
  const unit = indentUnit(Boolean(opts.tabs));
  const root = parse(input, {
    blockTextElements: { script: true, style: true, pre: true },
    comment: true,
    lowerCaseTagName: true,
  });
  const nodes = Array.from(root.childNodes || []);
  return nodes.flatMap((node) => renderNode(node, 0, unit)).join("\n");
}

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste HTML to convert.");
  try {
    const pug = convertHtmlToPug(input, opts);
    if (!pug || !pug.trim()) return err("Could not convert this HTML to Pug.");
    return ok(pug.trim());
  } catch (e) {
    return err(e);
  }
}

export default transform;
