import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [
  { key: "package", label: "Package", type: "text", default: "com.example" },
  {
    key: "framework",
    label: "Framework",
    type: "select",
    default: "kotlinx",
    choices: [
      { value: "kotlinx", label: "kotlinx.serialization" },
      { value: "jackson", label: "Jackson" },
      { value: "klaxon", label: "Klaxon" },
      { value: "just-types", label: "Plain classes" },
    ],
  },
];

export const sample = JSON_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  const framework = String(opts.framework || "kotlinx");
  return jsonToLanguage(input, {
    lang: "kotlin",
    topLevel: "Root",
    rendererOptions: { framework, package: String(opts.package || "com.example") },
  });
}

export default transform;
