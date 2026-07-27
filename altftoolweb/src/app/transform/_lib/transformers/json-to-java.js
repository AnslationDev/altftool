import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "package", label: "Package", type: "text", default: "com.example" }];

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  return jsonToLanguage(input, {
    lang: "java",
    topLevel: "Root",
    rendererOptions: { package: String(opts.package || "com.example"), "just-types": "true" },
  });
}

export default transform;
