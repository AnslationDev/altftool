import { jsonToZod } from "json-to-zod";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "name", label: "Schema name", type: "text", default: "schema" }];

export const sample = `{
  "id": 1,
  "name": "Ada",
  "active": true,
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
    const name = String(opts.name || "schema").replace(/[^A-Za-z0-9_$]/g, "") || "schema";
    const body = jsonToZod(data, name);
    const out = `import { z } from "zod";\n\n${body.trim()}\n`;
    return ok(out);
  } catch (e) {
    return err(e);
  }
}

export default transform;
