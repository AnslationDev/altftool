import { ok, err, isBlank } from "../types.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?/;

function mergeObjects(items) {
  const merged = {};
  for (const it of items) {
    if (it && typeof it === "object" && !Array.isArray(it)) {
      for (const k of Object.keys(it)) if (!(k in merged) || merged[k] == null) merged[k] = it[k];
    }
  }
  return merged;
}

function columnType(value) {
  if (typeof value === "boolean") return "TINYINT(1)";
  if (typeof value === "number") return Number.isInteger(value) ? "INT" : "DOUBLE";
  if (typeof value === "string") {
    if (ISO_DATE.test(value.trim())) return "DATETIME";
    return value.length > 255 ? "TEXT" : "VARCHAR(255)";
  }
  if (value && typeof value === "object") return "JSON";
  return "TEXT";
}

export const sample = `{
  "id": 101,
  "name": "Ada Lovelace",
  "active": true,
  "score": 98.6,
  "created_at": "2023-05-01T09:30:00Z",
  "metadata": { "source": "signup" }
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
    return err("A MySQL table is generated from a JSON object (or an array of objects).");
  }
  const keys = Object.keys(root);
  if (keys.length === 0) return err("The JSON object has no fields.");

  try {
    const hasId = keys.includes("id");
    const cols = keys.map((k) => {
      const type = columnType(root[k]);
      const notNull = k === "id" ? " NOT NULL AUTO_INCREMENT" : "";
      return `  \`${k}\` ${type}${notNull}`;
    });
    if (hasId) cols.push("  PRIMARY KEY (`id`)");
    const out = `CREATE TABLE \`root\` (\n${cols.join(",\n")}\n);`;
    return ok(out + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
