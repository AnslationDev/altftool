import toJsonSchema from "to-json-schema";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "required", label: "Mark all properties required", type: "boolean", default: false },
];

export const sample = `{
  "id": 101,
  "name": "Ada Lovelace",
  "active": true,
  "score": 98.6,
  "roles": ["admin", "editor"],
  "address": { "city": "London", "postcode": "SW1A 1AA" }
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste JSON to convert.");
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  try {
    const schema = toJsonSchema(data, {
      required: Boolean(opts.required),
      arrays: { mode: "first" },
      strings: { detectFormat: false },
      objects: { additionalProperties: false },
    });
    const withMeta = { $schema: "http://json-schema.org/draft-07/schema#", ...schema };
    return ok(JSON.stringify(withMeta, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
