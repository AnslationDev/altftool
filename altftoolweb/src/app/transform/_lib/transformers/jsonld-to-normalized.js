import { runJsonld, SAMPLE } from "./_jsonld.js";

export const sample = SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runJsonld(input, (jsonld, doc) =>
    jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads" })
  );
}

export default transform;
