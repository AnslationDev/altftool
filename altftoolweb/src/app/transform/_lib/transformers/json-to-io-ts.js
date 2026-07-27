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

function scalarCodec(v) {
  if (typeof v === "boolean") return "t.boolean";
  if (typeof v === "number") return "t.number";
  if (typeof v === "string") return "t.string";
  if (v === null) return "t.null";
  return "t.unknown";
}

function codecFor(key, value, defs) {
  if (Array.isArray(value)) {
    const el = value.find((v) => v != null);
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const name = pascal(singular(key));
      buildCodec(name, mergeObjects(value), defs);
      return `t.array(${name})`;
    }
    return `t.array(${el != null ? scalarCodec(el) : "t.unknown"})`;
  }
  if (value && typeof value === "object") {
    const name = pascal(key);
    buildCodec(name, value, defs);
    return name;
  }
  return scalarCodec(value);
}

function buildCodec(name, obj, defs) {
  const keys = Object.keys(obj);
  const body = keys.length
    ? keys.map((k) => `  ${keyOf(k)}: ${codecFor(k, obj[k], defs)}`).join(",\n")
    : "";
  defs.set(name, `const ${name} = t.type({\n${body}\n});`);
}

export const sample = `{
  "id": 1,
  "name": "Ada",
  "active": true,
  "roles": ["admin", "editor"],
  "profile": { "city": "London", "age": 36 }
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
    return err("An io-ts codec is generated from a JSON object (or an array of objects).");
  }
  try {
    const defs = new Map();
    buildCodec("Root", root, defs);
    const out = [
      'import * as t from "io-ts";',
      "",
      [...defs.values()].join("\n\n"),
      "",
      "export type Root = t.TypeOf<typeof Root>;",
    ].join("\n");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
