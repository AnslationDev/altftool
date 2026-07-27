import { ok, err, isBlank } from "../types.js";

/**
 * Infer a Google BigQuery table schema from a JSON sample. Each field is
 * { name, type, mode, fields? } — RECORD for nested objects, REPEATED for
 * arrays. Types: STRING, INTEGER, FLOAT, BOOLEAN, TIMESTAMP, RECORD.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function scalarType(value) {
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number") return Number.isInteger(value) ? "INTEGER" : "FLOAT";
  if (typeof value === "string") return ISO_DATE.test(value.trim()) ? "TIMESTAMP" : "STRING";
  return "STRING";
}

/** Merge records of an array of objects into a representative field set. */
function mergeObjects(items) {
  const merged = {};
  for (const item of items) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      for (const key of Object.keys(item)) {
        if (!(key in merged) || merged[key] == null) merged[key] = item[key];
      }
    }
  }
  return merged;
}

function fieldFor(name, value) {
  // Arrays → REPEATED
  if (Array.isArray(value)) {
    const first = value.find((v) => v != null);
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return { name, type: "RECORD", mode: "REPEATED", fields: fieldsFor(mergeObjects(value)) };
    }
    return { name, type: first != null ? scalarType(first) : "STRING", mode: "REPEATED" };
  }
  // Nested object → RECORD
  if (value && typeof value === "object") {
    return { name, type: "RECORD", mode: "NULLABLE", fields: fieldsFor(value) };
  }
  // Scalar
  return { name, type: value == null ? "STRING" : scalarType(value), mode: "NULLABLE" };
}

function fieldsFor(obj) {
  return Object.keys(obj).map((key) => fieldFor(key, obj[key]));
}

export const sample = `{
  "id": 101,
  "name": "Ada Lovelace",
  "active": true,
  "score": 98.6,
  "created_at": "2023-05-01T09:30:00Z",
  "tags": ["engineer", "pioneer"],
  "address": { "city": "London", "zip": "SW1A" },
  "orders": [{ "sku": "A1", "qty": 2 }]
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JSON object or array to convert.");
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  const root = Array.isArray(data) ? mergeObjects(data) : data;
  if (!root || typeof root !== "object" || Array.isArray(root)) {
    return err("BigQuery schemas are generated from a JSON object (or an array of objects).");
  }
  try {
    const schema = fieldsFor(root);
    return ok(JSON.stringify(schema, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
