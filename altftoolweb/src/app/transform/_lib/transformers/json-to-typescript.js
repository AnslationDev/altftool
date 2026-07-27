import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "justTypes", label: "Interfaces only (no helpers)", type: "boolean", default: true },
];

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  return jsonToLanguage(input, {
    lang: "typescript",
    topLevel: "Root",
    rendererOptions: { "just-types": opts.justTypes === false ? "false" : "true", "prefer-unions": "true" },
  });
}

export default transform;
