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
  if (typeof v === "boolean") return "PropTypes.bool";
  if (typeof v === "number") return "PropTypes.number";
  if (typeof v === "string") return "PropTypes.string";
  return "PropTypes.any";
}

function propType(value, depth) {
  if (Array.isArray(value)) {
    const el = value.find((v) => v != null);
    if (el === undefined) return "PropTypes.array";
    const merged = typeof el === "object" && !Array.isArray(el) ? mergeObjects(value) : el;
    return `PropTypes.arrayOf(${propType(merged, depth)})`;
  }
  if (value && typeof value === "object") {
    const pad = "  ".repeat(depth + 1);
    const close = "  ".repeat(depth);
    const entries = Object.keys(value).map((k) => `${pad}${keyOf(k)}: ${propType(value[k], depth + 1)}`);
    return `PropTypes.shape({\n${entries.join(",\n")}\n${close}})`;
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
    return err("PropTypes are generated from a JSON object (or an array of objects).");
  }
  try {
    const fields = Object.keys(root).map((k) => `  ${keyOf(k)}: ${propType(root[k], 1)}`);
    const out = [
      'import PropTypes from "prop-types";',
      "",
      `const propTypes = {\n${fields.join(",\n")}\n};`,
      "",
      "export default propTypes;",
    ].join("\n");
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
