import JSON5 from "json5";
import { extractLiteral } from "./_js.js";
import { jsonToLanguage } from "./_quicktype.js";
import { err, isBlank } from "../types.js";

export const sample = `const user = {
  id: 1,
  name: 'Ada',
  active: true,
  roles: ['admin', 'editor'],
  address: { city: 'London', postcode: 'SW1A 1AA' },
};

export default user;`;

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
  return jsonToLanguage(JSON.stringify(obj), {
    lang: "typescript",
    topLevel: "Root",
    rendererOptions: { "just-types": "true" },
  });
}

export default transform;
