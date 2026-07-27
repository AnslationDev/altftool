import * as fragmentMatcherPlugin from "@graphql-codegen/fragment-matcher";
import { runCodegen, SCHEMA_SAMPLE } from "./_graphql.js";

// A union/interface makes the fragment matcher output meaningful.
export const sample = `${SCHEMA_SAMPLE}

union SearchResult = User | Post`;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runCodegen(input, {
    plugins: [{ fragmentMatcher: {} }],
    pluginMap: { fragmentMatcher: fragmentMatcherPlugin },
    config: { apolloClientVersion: 3 },
  });
}

export default transform;
