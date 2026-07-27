import { ok, err, isBlank } from "../types.js";

const pascal = (s) =>
  String(s)
    .replace(/(^|[_\-\s]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "") || "Field";

const singular = (s) => (/[^s]s$/.test(s) ? s.replace(/s$/, "") : s);

function scalar(v) {
  if (typeof v === "boolean") return "Boolean";
  if (typeof v === "number") return Number.isInteger(v) ? "Int" : "Float";
  return "String";
}

function mergeObjects(items) {
  const merged = {};
  for (const it of items) {
    if (it && typeof it === "object" && !Array.isArray(it)) {
      for (const k of Object.keys(it)) if (!(k in merged) || merged[k] == null) merged[k] = it[k];
    }
  }
  return merged;
}

function fieldType(key, value, types) {
  if (Array.isArray(value)) {
    const el = value.find((v) => v != null);
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const name = pascal(singular(key));
      buildType(name, mergeObjects(value), types);
      return `[${name}]`;
    }
    return `[${el != null ? scalar(el) : "String"}]`;
  }
  if (value && typeof value === "object") {
    const name = pascal(key);
    buildType(name, value, types);
    return name;
  }
  return value != null ? scalar(value) : "String";
}

function buildType(name, obj, types) {
  const keys = Object.keys(obj);
  const fields = keys.length
    ? keys.map((k) => `  ${k}: ${fieldType(k, obj[k], types)}`)
    : ["  _empty: String"];
  types.set(name, `type ${name} {\n${fields.join("\n")}\n}`);
}

export const sample = `{
  "id": 1,
  "title": "Intro to GraphQL",
  "published": true,
  "rating": 4.5,
  "tags": ["api", "schema"],
  "author": { "name": "Ada", "verified": true },
  "comments": [{ "body": "Great!", "likes": 3 }]
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
    return err("A GraphQL type is generated from a JSON object (or an array of objects).");
  }
  try {
    const types = new Map();
    buildType("Root", root, types);
    const entries = [...types.entries()];
    const rootDef = entries.find(([n]) => n === "Root");
    const rest = entries.filter(([n]) => n !== "Root");
    const out = [rootDef, ...rest].map(([, def]) => def).join("\n\n");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
