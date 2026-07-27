import { ok, err, isBlank } from "../types.js";

const pascal = (s) =>
  String(s)
    .replace(/(^|[_\-\s]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "") || "Field";
const singular = (s) => (/[^s]s$/.test(s) ? s.replace(/s$/, "") : s);
const isIdent = (k) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);
const keyOf = (k) => (isIdent(k) ? k : JSON.stringify(k));

function mergeObjects(items) {
  const merged = {};
  for (const it of items) {
    if (it && typeof it === "object" && !Array.isArray(it)) {
      for (const k of Object.keys(it)) if (!(k in merged) || merged[k] == null) merged[k] = it[k];
    }
  }
  return merged;
}

function scalar(v) {
  if (typeof v === "boolean") return "types.boolean";
  if (typeof v === "number") return "types.number";
  if (typeof v === "string") return "types.string";
  return "types.frozen()";
}

function typeFor(key, value, defs) {
  if (Array.isArray(value)) {
    const el = value.find((v) => v != null);
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const name = pascal(singular(key));
      build(name, mergeObjects(value), defs);
      return `types.array(${name})`;
    }
    return `types.array(${el != null ? scalar(el) : "types.frozen()"})`;
  }
  if (value && typeof value === "object") {
    const name = pascal(key);
    build(name, value, defs);
    return name;
  }
  return scalar(value);
}

function build(name, obj, defs) {
  const body = Object.keys(obj)
    .map((k) => `  ${keyOf(k)}: ${typeFor(k, obj[k], defs)}`)
    .join(",\n");
  defs.set(name, `const ${name} = types.model("${name}", {\n${body}\n});`);
}

export const sample = `{
  "id": 1,
  "name": "Ada",
  "active": true,
  "roles": ["admin", "editor"],
  "address": { "city": "London", "postcode": "SW1A 1AA" }
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JSON object to convert.");
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  const root = Array.isArray(data) ? mergeObjects(data) : data;
  if (!root || typeof root !== "object" || Array.isArray(root)) {
    return err("A MobX-State-Tree model is generated from a JSON object (or an array of objects).");
  }
  try {
    const defs = new Map();
    build("Root", root, defs);
    const out = [
      'import { types } from "mobx-state-tree";',
      "",
      [...defs.values()].join("\n\n"),
      "",
      "export default Root;",
    ].join("\n");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
