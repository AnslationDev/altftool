import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "package", label: "Package name", type: "text", default: "main" }];

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  return jsonToLanguage(input, {
    lang: "go",
    topLevel: "Root",
    rendererOptions: { "just-types": "true", package: String(opts.package || "main") },
  });
}

export default transform;
