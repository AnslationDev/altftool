import JSON5 from "json5";
import { extractLiteral } from "./_js.js";
import { ok, err, isBlank } from "../types.js";

export const sample = `const config = {
  // a loose JS object literal — comments, single quotes,
  // unquoted keys and trailing commas are all fine.
  name: 'AltFTool',
  version: 1.0,
  active: true,
  tags: ['dev', 'tools',],
  meta: { author: "Ada", year: 2023 },
};

export default config;`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JavaScript object to convert.");
  let obj;
  try {
    obj = JSON5.parse(extractLiteral(input));
  } catch (e) {
    return err(
      `Could not parse JS object: ${e.message}. Provide a plain object or array literal ` +
        "(optionally as `const x = { ... }`) — functions, method shorthand and expressions aren't supported.",
    );
  }
  try {
    return ok(JSON.stringify(obj, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
