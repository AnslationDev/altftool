import { ok, err, isBlank } from "../types.js";

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
  if (typeof v === "boolean") return "is.boolean";
  if (typeof v === "number") return "is.number";
  if (typeof v === "string") return "is.string";
  return "is.maybe(is.string)";
}

function shape(value, depth) {
  if (Array.isArray(value)) {
    const el = value.find((v) => v != null);
    if (el === undefined) return "is.arrayOf(is.maybe(is.string))";
    const merged = typeof el === "object" && !Array.isArray(el) ? mergeObjects(value) : el;
    return `is.arrayOf(${shape(merged, depth)})`;
  }
  if (value && typeof value === "object") {
    const pad = "  ".repeat(depth + 1);
    const close = "  ".repeat(depth);
    const entries = Object.keys(value).map((k) => `${pad}${keyOf(k)}: ${shape(value[k], depth + 1)}`);
    return `is.shape({\n${entries.join(",\n")}\n${close}})`;
  }
  return scalar(value);
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
    return err("A sarcastic assertion is generated from a JSON object (or an array of objects).");
  }
  try {
    const body = shape(root, 0);
    const out = [
      'import is, { type AssertionType } from "sarcastic";',
      "",
      `const Root = ${body};`,
      "",
      "export type Root = AssertionType<typeof Root>;",
    ].join("\n");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
