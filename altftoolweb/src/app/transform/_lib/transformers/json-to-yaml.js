import yaml from "js-yaml";
import { ok, err, isBlank } from "../types.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "indent", label: "Indent", type: "select", default: "2", choices: [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
] }];

export const sample = `{
  "name": "altftool",
  "version": "1.0.0",
  "private": true,
  "keywords": ["tools", "converter"],
  "scripts": { "build": "next build", "dev": "next dev" }
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
    const out = yaml.dump(data, {
      indent: Number(opts.indent) === 4 ? 4 : 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
    return ok(out);
  } catch (e) {
    return err(e);
  }
}

export default transform;
