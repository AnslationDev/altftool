import { jsonSchemaToZod } from "json-schema-to-zod";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "name", label: "Export name", type: "text", default: "schema" }];

export const sample = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "roles": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["id", "name"]
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  if (isBlank(input)) return err("Paste a JSON Schema to convert.");
  let schema;
  try {
    schema = JSON.parse(input);
  } catch (e) {
    return err(`Invalid JSON: ${e.message}`);
  }
  try {
    const name = String(opts.name || "schema").replace(/[^A-Za-z0-9_$]/g, "") || "schema";
    const out = jsonSchemaToZod(schema, { name, module: "esm" });
    return ok(out.trim() + "\n");
  } catch (e) {
    return err(e);
  }
}

export default transform;
