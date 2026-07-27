import { ok, err, isBlank } from "../types.js";

const isIdent = (k) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);

function camelProp(prop) {
  const p = prop.trim();
  if (p.startsWith("--")) return p; // custom property — keep as-is
  if (p.startsWith("-")) return p.replace(/^-(ms|webkit|moz|o)-/, (m) => m.replace(/-/g, "")).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseDeclarations(block) {
  const obj = {};
  for (const decl of block.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    obj[camelProp(prop)] = value;
  }
  return obj;
}

function serialize(obj, depth) {
  const pad = "  ".repeat(depth + 1);
  const close = "  ".repeat(depth);
  const lines = Object.keys(obj).map((key) => {
    const k = isIdent(key) ? key : `'${key}'`;
    const val = obj[key];
    if (val && typeof val === "object") {
      return `${pad}${k}: ${serialize(val, depth + 1)}`;
    }
    return `${pad}${k}: '${String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  });
  return `{\n${lines.join(",\n")}\n${close}}`;
}

export const sample = `.button {
  background-color: #2563eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  -webkit-box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste CSS to convert.");
  try {
    let result;
    if (input.includes("{")) {
      result = {};
      const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
      let m;
      while ((m = ruleRe.exec(input))) {
        const selector = m[1].trim().replace(/\s+/g, " ");
        if (!selector) continue;
        result[selector] = parseDeclarations(m[2]);
      }
      if (Object.keys(result).length === 0) return err("No CSS rules found.");
    } else {
      result = parseDeclarations(input);
      if (Object.keys(result).length === 0) return err("No CSS declarations found.");
    }
    return ok(serialize(result, 0) + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
