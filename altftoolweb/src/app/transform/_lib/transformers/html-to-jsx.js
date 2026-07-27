import { parse } from "node-html-parser";
import { ok, err, isBlank } from "../types.js";

/** HTML void elements — self-closed in JSX. */
const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** HTML attribute name → React (JSX) attribute name. */
const ATTR = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  colspan: "colSpan",
  rowspan: "rowSpan",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  autofocus: "autoFocus",
  autocomplete: "autoComplete",
  autoplay: "autoPlay",
  novalidate: "noValidate",
  enctype: "encType",
  formaction: "formAction",
  srcset: "srcSet",
  usemap: "useMap",
  spellcheck: "spellCheck",
  datetime: "dateTime",
  "accept-charset": "acceptCharset",
  "http-equiv": "httpEquiv",
  hreflang: "hrefLang",
  "accesskey": "accessKey",
};

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function renameAttr(name) {
  const lower = name.toLowerCase();
  if (ATTR[lower]) return ATTR[lower];
  if (lower.startsWith("data-") || lower.startsWith("aria-")) return lower;
  if (lower.includes("-")) return camel(lower); // svg presentation attrs, etc.
  return name;
}

function styleToObject(styleStr) {
  const entries = [];
  for (const decl of styleStr.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const rawProp = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!rawProp || !value) continue;
    const key = rawProp.startsWith("--") ? `'${rawProp}'` : camel(rawProp);
    entries.push(`${key}: '${value.replace(/'/g, "\\'")}'`);
  }
  return entries.length ? `{{ ${entries.join(", ")} }}` : "{{}}";
}

function attrsFor(node) {
  const out = [];
  const attrs = node.attributes || {};
  for (const rawName of Object.keys(attrs)) {
    const value = attrs[rawName];
    if (rawName.toLowerCase() === "style") {
      out.push(`style=${styleToObject(value)}`);
      continue;
    }
    const name = renameAttr(rawName);
    if (value === "" ) {
      out.push(name); // boolean attribute → truthy in JSX
    } else {
      out.push(`${name}="${String(value).replace(/"/g, "&quot;")}"`);
    }
  }
  return out;
}

function serialize(node, depth, lines) {
  const pad = "  ".repeat(depth);
  // Text node
  if (node.nodeType === 3) {
    const text = (node.rawText ?? node.text ?? "").replace(/\s+/g, " ");
    if (text.trim()) lines.push(pad + text.trim());
    return;
  }
  // Comment node
  if (node.nodeType === 8) {
    const text = (node.rawText ?? "").replace(/^<!--/, "").replace(/-->$/, "").trim();
    lines.push(`${pad}{/* ${text} */}`);
    return;
  }
  // Element
  if (node.nodeType !== 1) return;
  const tag = node.rawTagName || (node.tagName ? node.tagName.toLowerCase() : "div");
  const attrs = attrsFor(node);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  const children = (node.childNodes || []).filter(
    (c) => !(c.nodeType === 3 && !(c.rawText ?? c.text ?? "").trim())
  );

  if (VOID.has(tag.toLowerCase()) || children.length === 0) {
    if (children.length === 0 && !VOID.has(tag.toLowerCase())) {
      lines.push(`${pad}<${tag}${attrStr}></${tag}>`);
    } else {
      lines.push(`${pad}<${tag}${attrStr} />`);
    }
    return;
  }

  lines.push(`${pad}<${tag}${attrStr}>`);
  for (const child of children) serialize(child, depth + 1, lines);
  lines.push(`${pad}</${tag}>`);
}

export const sample = `<div class="card" style="padding: 16px; border-radius: 8px">
  <!-- greeting -->
  <img src="/logo.png" alt="Logo">
  <label for="email">Email</label>
  <input type="email" id="email" required>
  <p class="muted">Welcome <strong>back</strong>!</p>
</div>`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste HTML to convert.");
  try {
    const root = parse(input, { comment: true });
    const top = (root.childNodes || []).filter(
      (c) => !(c.nodeType === 3 && !(c.rawText ?? c.text ?? "").trim())
    );
    if (top.length === 0) return err("No HTML elements found.");

    const lines = [];
    const wrap = top.length > 1;
    if (wrap) lines.push("<>");
    for (const node of top) serialize(node, wrap ? 1 : 0, lines);
    if (wrap) lines.push("</>");

    return ok(lines.join("\n"));
  } catch (e) {
    return err(e);
  }
}

export default transform;
