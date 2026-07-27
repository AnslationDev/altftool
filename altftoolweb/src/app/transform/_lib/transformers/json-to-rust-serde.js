import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return jsonToLanguage(input, {
    lang: "rust",
    topLevel: "Root",
    rendererOptions: { visibility: "public", "derive-debug": "true" },
  });
}

export default transform;
