import * as javaPlugin from "@graphql-codegen/java";
import { runCodegen, SCHEMA_SAMPLE } from "./_graphql.js";

/** @type {import("../types.js").ToolOption[]} */
export const options = [{ key: "package", label: "Package", type: "text", default: "com.example.generated" }];

export const sample = SCHEMA_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input, opts = {}) {
  return runCodegen(input, {
    plugins: [{ java: {} }],
    pluginMap: { java: javaPlugin },
    config: { package: String(opts.package || "com.example.generated") },
  });
}

export default transform;
