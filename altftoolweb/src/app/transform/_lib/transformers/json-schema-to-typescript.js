import { compile } from "json-schema-to-typescript";
import { ok, err, isBlank } from "../types.js";

export const sample = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "roles": { "type": "array", "items": { "type": "string" } },
    "address": {
      "type": "object",
      "properties": { "city": { "type": "string" } }
    }
  },
  "required": ["id", "name"]
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
    const name = typeof schema.title === "string" && schema.title.trim() ? schema.title : "Root";
    const ts = await compile(schema, name, {
      bannerComment: "",
      additionalProperties: false,
    });
    return ok(ts.trim() + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
