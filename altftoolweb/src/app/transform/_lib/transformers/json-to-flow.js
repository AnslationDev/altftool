import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return jsonToLanguage(input, {
    lang: "flow",
    topLevel: "Root",
    rendererOptions: { "just-types": "true" },
  });
}

export default transform;
