import { jsonToLanguage, JSON_SAMPLE } from "./_quicktype.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "package", label: "Package name", type: "text", default: "main" }];

export const sample = JSON_SAMPLE;

// Mirror each `json:"x"` struct tag with a matching `bson:"x"` tag so the
// structs work directly with the official MongoDB Go driver.
function addBsonTags(code) {
  return code.replace(/`json:"([^"]+)"`/g, (_, tag) => `\`json:"${tag}" bson:"${tag}"\``);
}

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  return jsonToLanguage(input, {
    lang: "go",
    topLevel: "Root",
    rendererOptions: { "just-types": "true", package: String(opts.package || "main") },
    post: addBsonTags,
  });
}

export default transform;
