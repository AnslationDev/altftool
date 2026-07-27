import * as typescriptPlugin from "@graphql-codegen/typescript";
import * as resolversPlugin from "@graphql-codegen/typescript-resolvers";
import { runCodegen, SCHEMA_SAMPLE } from "./_graphql.js";

export const sample = SCHEMA_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ typescript: {} }, { typescriptResolvers: {} }],
    pluginMap: { typescript: typescriptPlugin, typescriptResolvers: resolversPlugin },
    config: {},
  });
}

export default transform;
