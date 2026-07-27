import * as flowPlugin from "@graphql-codegen/flow";
import { runCodegen, SCHEMA_SAMPLE } from "./_graphql.js";

export const sample = SCHEMA_SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ flow: {} }],
    pluginMap: { flow: flowPlugin },
    config: {},
  });
}

export default transform;
