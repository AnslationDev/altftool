import { runJsonld, SAMPLE } from "./_jsonld.js";

export const sample = SAMPLE;

/** @type {import("../types.js").Transformer} */
export function transform(input) {
  return runJsonld(input, (jsonld, doc) => {
    const context = doc && doc["@context"] ? doc["@context"] : null;
    return jsonld.flatten(doc, context);
  });
}

export default transform;
