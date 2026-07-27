import { runJsonld, SAMPLE } from "./_jsonld.js";

export const sample = SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runJsonld(input, (jsonld, doc) => {
    const context = doc && doc["@context"] ? doc["@context"] : {};
    return jsonld.compact(doc, context);
  });
}

export default transform;
