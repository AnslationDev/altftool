import * as typescriptPlugin from "@graphql-codegen/typescript";
import { runCodegen, SCHEMA_SAMPLE } from "./_graphql.js";

export const sample = SCHEMA_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ typescript: {} }],
    pluginMap: { typescript: typescriptPlugin },
    config: {},
  });
}

export default transform;
