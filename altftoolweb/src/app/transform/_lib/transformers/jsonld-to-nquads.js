import { runJsonld, SAMPLE } from "./_jsonld.js";

export const sample = SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runJsonld(input, (jsonld, doc) => jsonld.toRDF(doc, { format: "application/n-quads" }));
}

export default transform;
