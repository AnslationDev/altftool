import JSON5 from "json5";
import { ok, err, isBlank } from "../types.js";

export const sample = `{
  // a loose JS object literal
  name: 'AltFTool',
  version: 1.0,
  active: true,
  tags: ['dev', 'tools',],
  meta: { author: "Ada", year: 2023 },
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
  try {
    return ok(JSON.stringify(obj, null, 2));
  } catch (e) {
    return err(e);
  }
}

export default transform;
