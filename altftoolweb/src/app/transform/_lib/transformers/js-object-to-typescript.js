import JSON5 from "json5";
import { jsonToLanguage } from "./_quicktype.js";
import { err, isBlank } from "../types.js";

export const sample = `{
  id: 1,
  name: 'Ada',
  active: true,
  roles: ['admin', 'editor'],
  address: { city: 'London', postcode: 'SW1A 1AA' },
}`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  if (isBlank(input)) return err("Paste a JavaScript object to convert.");
  let obj;
  try {
    obj = JSON5.parse(input);
  } catch (e) {
    return err(`Could not parse JS object: ${e.message}`);
  }
  return jsonToLanguage(JSON.stringify(obj), {
    lang: "typescript",
    topLevel: "Root",
    rendererOptions: { "just-types": "true" },
  });
}

export default transform;
