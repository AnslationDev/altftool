import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import { ok, err, isBlank } from "../types.js";

const convertFn = convert && convert.default ? convert.default : convert;

export const sample = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": ["object", "null"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "roles": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["id"]
}`;

/** @type {import("../types.js").Transformer} */
export async function transform(input) {
  if (isBlank(input)) return err("Paste a JSON Schema to convert.");
  let schema;
  try {
    schema = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  try {
    const result = await convertFn(schema, { dereference: false });
    return ok(JSON.stringify(result, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
